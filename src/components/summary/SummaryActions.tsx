"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PlannedEvent, PlannedEventSchema } from "@/lib/domain";
import { saveEvent, clearAllEvents } from "@/lib/storage";
import { buildIcs } from "@/lib/engine/ics";
import { useAnnounce } from "@/components/shell";
import { Button } from "@/components/ui/Button";

export interface SummaryActionsProps {
  event: PlannedEvent;
}

export const SummaryActions: React.FC<SummaryActionsProps> = ({ event }) => {
  const router = useRouter();
  const { announce } = useAnnounce();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importError, setImportError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 1. Print action
  const handlePrint = () => {
    window.print();
  };

  // 2. Calendar export
  const handleDownloadCalendar = () => {
    const icsContent = buildIcs(event);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.brief.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    announce("Downloaded calendar (.ics) file.", "polite");
  };

  // 3. Export JSON
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(event, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.brief.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-plan.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    announce("Exported complete plan as JSON.", "polite");
  };

  // 4. Import JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // 1 MB size limit enforcement
    const MAX_SIZE = 1 * 1024 * 1024; // 1 MB
    if (file.size > MAX_SIZE) {
      setImportError("File exceeds 1 MB size limit. Please choose a valid event plan file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (eventReader) => {
      try {
        const text = eventReader.target?.result as string;
        const parsed = JSON.parse(text);

        // Validate strictly with PlannedEventSchema (never eval or interpret)
        const validation = PlannedEventSchema.safeParse(parsed);
        if (!validation.success) {
          setImportError("Invalid plan format. The selected file does not match the event plan schema.");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        // Assign a fresh ID to avoid collisions
        const freshId = crypto.randomUUID ? crypto.randomUUID() : `plan-${Date.now()}`;
        const newEvent: PlannedEvent = {
          ...validation.data,
          brief: {
            ...validation.data.brief,
            id: freshId,
          },
        };

        const saveRes = saveEvent(newEvent);
        if (!saveRes.ok) {
          setImportError("Failed to save imported event to local storage.");
          return;
        }

        announce(`Successfully imported "${newEvent.brief.name}". Redirecting...`, "polite");
        router.push(`/events/${freshId}/summary`);
      } catch {
        setImportError("Failed to read JSON file. Please ensure the file contains valid JSON.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  // 5. Delete all data
  const handleDeleteAll = () => {
    clearAllEvents();
    announce("All event data deleted from this browser.", "polite");
    router.push("/events");
  };

  return (
    <div className="np-summary-actions-bar" style={{ marginBottom: "var(--dp-space-xl)" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
          padding: "var(--dp-space-md) 0",
          borderTop: "var(--dp-border-hairline) solid var(--dp-color-rule)",
          borderBottom: "var(--dp-border-hairline) solid var(--dp-color-rule)",
        }}
      >
        <Button variant="default" onClick={handlePrint}>
          Print this plan
        </Button>

        <Button variant="secondary" onClick={handleDownloadCalendar}>
          Download calendar (.ics)
        </Button>

        <Button variant="secondary" onClick={handleExportJson}>
          Export plan as JSON
        </Button>

        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          Import plan from JSON
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: "none" }}
          onChange={handleFileChange}
          aria-label="Import plan file input"
        />

        <div style={{ marginLeft: "auto" }}>
          {!showDeleteConfirm ? (
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(true)}
              style={{ color: "var(--dp-color-accent)" }}
            >
              Delete all my data
            </Button>
          ) : (
            <div
              role="alertdialog"
              aria-label="Confirm complete data deletion"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span className="text-label" style={{ color: "var(--dp-color-accent)", fontWeight: "bold" }}>
                Wipe all plans?
              </span>
              <Button
                variant="default"
                onClick={handleDeleteAll}
                style={{ backgroundColor: "var(--dp-color-accent)", borderColor: "var(--dp-color-accent)", color: "#fff" }}
              >
                Yes, delete all
              </Button>
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {importError && (
        <div
          role="alert"
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
            borderLeft: "var(--dp-border-rule) solid var(--dp-color-accent)",
            backgroundColor: "var(--dp-color-ground)",
            color: "var(--dp-color-accent)",
            fontSize: "0.9rem",
          }}
        >
          {importError}
        </div>
      )}
    </div>
  );
};

