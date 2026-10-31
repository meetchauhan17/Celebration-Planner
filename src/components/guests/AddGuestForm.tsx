"use client";

import React, { useState } from "react";
import { Guest, GuestSchema } from "@/lib/domain";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { SectionLabel } from "@/components/ui/SectionLabel";

export interface AddGuestFormProps {
  dietaryOptions: string[];
  onAddGuest: (guest: Guest) => void;
  onBulkAddGuests: (newGuests: Guest[]) => void;
}

export const AddGuestForm: React.FC<AddGuestFormProps> = ({
  dietaryOptions,
  onAddGuest,
  onBulkAddGuests,
}) => {
  const [mode, setMode] = useState<"single" | "bulk">("single");

  // Single guest form state
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [rsvp, setRsvp] = useState<"pending" | "yes" | "no">("pending");
  const [dietary, setDietary] = useState("none");
  const [plusOnes, setPlusOnes] = useState(0);
  const [singleErrors, setSingleErrors] = useState<Record<string, string>>({});

  // Bulk guest state
  const [bulkText, setBulkText] = useState("");
  const [bulkGroup, setBulkGroup] = useState("Friends");
  const [bulkError, setBulkError] = useState("");

  // Process bulk lines
  const parsedBulkNames = React.useMemo(() => {
    if (!bulkText.trim()) return [];
    const lines = bulkText.split("\n");
    const seen = new Set<string>();
    const names: string[] = [];
    for (const raw of lines) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const lower = trimmed.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        names.push(trimmed);
      }
      if (names.length >= 100) break;
    }
    return names;
  }, [bulkText]);

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSingleErrors({});

    const newGuest: Guest = {
      id: crypto.randomUUID ? crypto.randomUUID() : `g-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      group: group.trim() || "General",
      rsvp,
      dietary: dietary === "none" ? undefined : dietary,
      plusOnes: Number(plusOnes) || 0,
    };

    const validation = GuestSchema.safeParse(newGuest);
    if (!validation.success) {
      const errMap: Record<string, string> = {};
      for (const err of validation.error.errors) {
        errMap[err.path.join(".")] = err.message;
      }
      setSingleErrors(errMap);
      return;
    }

    onAddGuest(newGuest);
    setName("");
    setGroup("");
    setRsvp("pending");
    setDietary("none");
    setPlusOnes(0);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBulkError("");
    if (parsedBulkNames.length === 0) {
      setBulkError("Please enter at least one guest name.");
      return;
    }

    const created: Guest[] = parsedBulkNames.map((nameStr) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : `g-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: nameStr,
      group: bulkGroup.trim() || "General",
      rsvp: "pending",
      dietary: undefined,
      plusOnes: 0,
    }));

    onBulkAddGuests(created);
    setBulkText("");
  };

  return (
    <section
      aria-labelledby="add-guest-heading"
      style={{
        border: "1px solid var(--dp-color-surface-muted)",
        borderTop: "4px solid var(--dp-color-primary)",
        borderRadius: "20px 24px 18px 22px / 22px 18px 24px 20px",
        padding: "var(--dp-space-md)",
        marginBottom: "var(--dp-space-xl)",
        backgroundColor: "var(--dp-color-surface, #f5eddf)",
      }}
    >
      <SectionLabel>Add to Directory</SectionLabel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "8px" }}>
        <h2 id="add-guest-heading" style={{ fontFamily: "var(--dp-typography-display)", fontSize: "1.4rem", margin: "4px 0" }}>
          {mode === "single" ? "Add an Individual Guest" : "Bulk Add Guests"}
        </h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="button"
            variant={mode === "single" ? "default" : "secondary"}
            onClick={() => setMode("single")}
          >
            Single Guest
          </Button>
          <Button
            type="button"
            variant={mode === "bulk" ? "default" : "secondary"}
            onClick={() => setMode("bulk")}
          >
            Bulk Add
          </Button>
        </div>
      </div>

      {mode === "single" ? (
        <form onSubmit={handleSingleSubmit} style={{ marginTop: "var(--dp-space-md)" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--dp-space-md)",
              marginBottom: "var(--dp-space-md)",
            }}
          >
            <div>
              <label htmlFor="guest-name-input" className="text-label" style={{ display: "block", marginBottom: "4px" }}>
                Guest Name *
              </label>
              <input
                id="guest-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                required
                aria-describedby={singleErrors.name ? "guest-name-error" : undefined}
                className="np-input"
                style={{ width: "100%", padding: "8px" }}
              />
              {singleErrors.name && (
                <span id="guest-name-error" role="alert" style={{ color: "var(--dp-color-accent)", fontSize: "0.85rem" }}>
                  {singleErrors.name}
                </span>
              )}
            </div>

            <div>
              <label htmlFor="guest-group-input" className="text-label" style={{ display: "block", marginBottom: "4px" }}>
                Group / Circle
              </label>
              <input
                id="guest-group-input"
                type="text"
                list="guest-group-suggestions"
                value={group}
                placeholder="e.g. Friends"
                onChange={(e) => setGroup(e.target.value)}
                className="np-input"
                style={{ width: "100%", padding: "8px" }}
              />
              <datalist id="guest-group-suggestions">
                <option value="Family" />
                <option value="Friends" />
                <option value="Colleagues" />
                <option value="Neighbours" />
                <option value="Volunteers" />
              </datalist>
            </div>

            <div>
              <Select
                id="guest-rsvp-select"
                label="RSVP Status"
                value={rsvp}
                onChange={(e) => setRsvp(e.target.value as "pending" | "yes" | "no")}
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "yes", label: "Yes (Confirmed)" },
                  { value: "no", label: "No (Declined)" },
                ]}
              />
            </div>

            <div>
              <Select
                id="guest-dietary-select"
                label="Dietary Requirement"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                options={[
                  { value: "none", label: "None / Standard" },
                  ...dietaryOptions.map((opt) => ({ value: opt, label: opt })),
                ]}
              />
            </div>

            <div>
              <label htmlFor="guest-plus-ones-input" className="text-label" style={{ display: "block", marginBottom: "4px" }}>
                Plus-Ones (0-5)
              </label>
              <input
                id="guest-plus-ones-input"
                type="number"
                min={0}
                max={5}
                value={plusOnes}
                onChange={(e) => setPlusOnes(Math.max(0, Math.min(5, parseInt(e.target.value, 10) || 0)))}
                className="np-input"
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
          </div>

          <Button type="submit" variant="default">
            Add Guest
          </Button>
        </form>
      ) : (
        <form onSubmit={handleBulkSubmit} style={{ marginTop: "var(--dp-space-md)" }}>
          <p style={{ margin: "0 0 12px 0", fontSize: "0.95rem", color: "var(--dp-color-secondary)" }}>
            Enter one name per line (up to 100 lines). Duplicate entries will be filtered out.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr minmax(200px, 250px)",
              gap: "var(--dp-space-md)",
              marginBottom: "var(--dp-space-md)",
            }}
          >
            <div>
              <label htmlFor="bulk-names-textarea" className="text-label" style={{ display: "block", marginBottom: "4px" }}>
                Names (one per line)
              </label>
              <textarea
                id="bulk-names-textarea"
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Rohan Sharma&#10;Priya Patel&#10;Amit Verma"
                className="np-textarea"
                style={{
                  width: "100%",
                  padding: "8px",
                  fontSize: "0.95rem",
                  fontFamily: "var(--dp-typography-mono)",
                }}
              />
              {bulkError && (
                <span role="alert" style={{ color: "var(--dp-color-accent)", fontSize: "0.85rem" }}>
                  {bulkError}
                </span>
              )}
            </div>

            <div>
              <div>
                <label htmlFor="bulk-group-input" className="text-label" style={{ display: "block", marginBottom: "4px" }}>
                  Assign Group
                </label>
                <input
                  id="bulk-group-input"
                  type="text"
                  list="bulk-guest-group-suggestions"
                  value={bulkGroup}
                  onChange={(e) => setBulkGroup(e.target.value)}
                  className="np-input"
                  style={{ width: "100%", padding: "8px" }}
                />
                <datalist id="bulk-guest-group-suggestions">
                  <option value="Family" />
                  <option value="Friends" />
                  <option value="Colleagues" />
                  <option value="Neighbours" />
                  <option value="Volunteers" />
                </datalist>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  border: "1.5px solid var(--dp-color-ink)",
                  backgroundColor: "var(--dp-color-canvas, #ffffff)",
                  fontSize: "0.9rem",
                }}
              >
                <span className="text-label" style={{ display: "block" }}>
                  Preview
                </span>
                <strong>{parsedBulkNames.length} valid unique names ready to add.</strong>
              </div>
            </div>
          </div>

          <Button type="submit" variant="default" disabled={parsedBulkNames.length === 0}>
            Add {parsedBulkNames.length} Guests
          </Button>
        </form>
      )}
    </section>
  );
};
