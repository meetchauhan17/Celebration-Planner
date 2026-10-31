"use client";

import React, { useState, useMemo } from "react";
import { PlannedEvent, Guest } from "@/lib/domain";
import { updateEvent } from "@/lib/storage";
import { useAnnounce } from "@/components/shell";
import { exportGuestsToCsv } from "@/lib/engine/guests";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { GuestLead } from "./GuestLead";
import { CateringSummary } from "./CateringSummary";
import { AddGuestForm } from "./AddGuestForm";
import { GuestListingRow } from "./GuestListingRow";

export interface GuestListViewProps {
  event: PlannedEvent;
}

export const GuestListView: React.FC<GuestListViewProps> = ({ event }) => {
  const { brief, guests } = event;
  const { announce } = useAnnounce();

  // Search and group filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 50;

  // Persist state updates to store
  const syncEvent = (patch: Partial<PlannedEvent>, announcementMsg?: string) => {
    const res = updateEvent(brief.id, patch);
    if (res.ok && announcementMsg) {
      announce(announcementMsg, "polite");
    }
  };

  // Distinct groups for filtering
  const distinctGroups = useMemo(() => {
    const set = new Set<string>();
    guests.forEach((g) => {
      if (g.group) set.add(g.group);
    });
    return Array.from(set).sort();
  }, [guests]);

  // Filtered guests
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchesSearch =
        searchQuery === "" ||
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.group.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup =
        selectedGroup === "all" || g.group.toLowerCase() === selectedGroup.toLowerCase();
      return matchesSearch && matchesGroup;
    });
  }, [guests, searchQuery, selectedGroup]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredGuests.length / PAGE_SIZE) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedGuests = useMemo(() => {
    const start = (validCurrentPage - 1) * PAGE_SIZE;
    return filteredGuests.slice(start, start + PAGE_SIZE);
  }, [filteredGuests, validCurrentPage]);

  // Range text: "Showing 1-50 of 212"
  const rangeStart = filteredGuests.length === 0 ? 0 : (validCurrentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(validCurrentPage * PAGE_SIZE, filteredGuests.length);

  // Guest actions
  const handleAddGuest = (newGuest: Guest) => {
    const nextGuests = [newGuest, ...guests];
    syncEvent({ guests: nextGuests }, `Added guest ${newGuest.name}.`);
  };

  const handleBulkAddGuests = (newGuests: Guest[]) => {
    const nextGuests = [...newGuests, ...guests];
    syncEvent({ guests: nextGuests }, `Added ${newGuests.length} guests in bulk.`);
  };

  const handleUpdateGuest = (updatedGuest: Guest) => {
    const nextGuests = guests.map((g) => (g.id === updatedGuest.id ? updatedGuest : g));
    syncEvent({ guests: nextGuests }, `Updated guest ${updatedGuest.name}.`);
  };

  const handleDeleteGuest = (id: string) => {
    const target = guests.find((g) => g.id === id);
    const nextGuests = guests.filter((g) => g.id !== id);
    syncEvent({ guests: nextGuests }, target ? `Deleted guest ${target.name}.` : "Deleted guest.");
  };

  const handleUpdatePlannedCount = (newCount: number) => {
    const res = updateEvent(brief.id, {
      brief: { ...brief, guestCount: newCount },
    });
    if (res.ok) {
      announce(`Updated planned headcount to ${newCount}.`, "polite");
    }
  };

  // CSV Export action
  const handleExportCsv = () => {
    const csvContent = exportGuestsToCsv(guests);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${brief.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-guests.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    announce("Exported guest list as CSV.", "polite");
  };

  return (
    <div className="np-guests-view" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <GuestLead
        guests={guests}
        plannedGuestCount={brief.guestCount}
        onUpdatePlannedCount={handleUpdatePlannedCount}
      />

      <CateringSummary guests={guests} />

      <AddGuestForm
        dietaryOptions={brief.dietaryNeeds || []}
        onAddGuest={handleAddGuest}
        onBulkAddGuests={handleBulkAddGuests}
      />

      {/* Directory listing header, filters & CSV export */}
      <section aria-labelledby="guest-directory-heading" style={{ marginTop: "var(--dp-space-xl)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "var(--dp-space-md)",
            borderBottom: "var(--dp-border-hairline) solid var(--dp-color-rule)",
            paddingBottom: "8px",
          }}
        >
          <div>
            <SectionLabel>All Attendees</SectionLabel>
            <h2 id="guest-directory-heading" style={{ fontFamily: "var(--dp-typography-display)", fontSize: "1.6rem", margin: "4px 0" }}>
              Guest Directory
            </h2>
          </div>
          <div>
            <Button variant="secondary" onClick={handleExportCsv} disabled={guests.length === 0}>
              Export List as CSV
            </Button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            marginBottom: "var(--dp-space-md)",
            padding: "8px 0",
          }}
        >
          <div style={{ flex: "1 1 200px" }}>
            <input
              type="search"
              aria-label="Search guests by name or group"
              placeholder="Search by name or group..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                padding: "6px 10px",
                border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
                backgroundColor: "var(--dp-color-ground)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label htmlFor="group-filter-select" className="text-label">
              Filter by group:
            </label>
            <select
              id="group-filter-select"
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "6px 10px",
                border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
                backgroundColor: "var(--dp-color-ground)",
                fontSize: "0.95rem",
              }}
            >
              <option value="all">All Groups</option>
              {distinctGroups.map((grp) => (
                <option key={grp} value={grp}>
                  {grp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Pagination Counter */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
            fontSize: "0.9rem",
            color: "var(--dp-color-secondary)",
          }}
        >
          <span aria-live="polite">
            Showing {rangeStart}-{rangeEnd} of {filteredGuests.length}
          </span>

          {totalPages > 1 && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Button
                variant="secondary"
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                Previous
              </Button>
              <span className="text-label">
                Page {validCurrentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Guest Rows */}
        {filteredGuests.length === 0 ? (
          <p style={{ padding: "var(--dp-space-md) 0", fontStyle: "italic", color: "var(--dp-color-secondary)" }}>
            {guests.length === 0
              ? "No guests added yet. Use the form above to add individuals or bulk import names."
              : "No guests match your search or filter."}
          </p>
        ) : (
          <div role="list" aria-label="Guest list">
            {paginatedGuests.map((guest) => (
              <div role="listitem" key={guest.id}>
                <GuestListingRow
                  guest={guest}
                  dietaryOptions={brief.dietaryNeeds || []}
                  onUpdateGuest={handleUpdateGuest}
                  onDeleteGuest={handleDeleteGuest}
                />
              </div>
            ))}
          </div>
        )}

        {/* Bottom pagination if more than 1 page */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              marginTop: "var(--dp-space-md)",
            }}
          >
            <Button
              variant="secondary"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};
