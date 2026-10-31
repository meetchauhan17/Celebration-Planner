"use client";

import React from "react";
import { Guest } from "@/lib/domain";
import { summarizeGuests } from "@/lib/engine/guests";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";

export interface GuestLeadProps {
  guests: Guest[];
  plannedGuestCount: number;
  onUpdatePlannedCount?: (newCount: number) => void;
}

export const GuestLead: React.FC<GuestLeadProps> = ({
  guests,
  plannedGuestCount,
  onUpdatePlannedCount,
}) => {
  const summary = summarizeGuests(guests);
  const { totalInvited, confirmedHeadcount, declinedCount, pendingHeadcount } = summary;

  // Comparison logic
  const diff = confirmedHeadcount - plannedGuestCount;
  let comparisonText = `You planned for ${plannedGuestCount}; ${confirmedHeadcount} confirmed`;
  if (diff > 0) {
    comparisonText += `, ${diff} over`;
  } else if (diff < 0) {
    comparisonText += `, ${Math.abs(diff)} under`;
  } else {
    comparisonText += `, exactly on target`;
  }

  // Check if confirmed headcount differs from brief's guestCount by more than 10%
  const percentDiff = plannedGuestCount > 0 ? (Math.abs(diff) / plannedGuestCount) * 100 : 0;
  const isSubstantialDiff = percentDiff > 10 && confirmedHeadcount > 0;

  return (
    <section aria-labelledby="guests-lead-heading" className="np-guests-lead">
      <SectionLabel>Guest Directory & RSVPs</SectionLabel>
      <h1
        id="guests-lead-heading"
        style={{
          fontFamily: "var(--dp-typography-display)",
          fontSize: "2.6rem",
          fontWeight: "var(--dp-typography-display-weight)",
          margin: "8px 0 6px 0",
          lineHeight: "1.1",
        }}
      >
        {confirmedHeadcount} Confirmed of {totalInvited} Invited
      </h1>

      <p
        style={{
          fontFamily: "var(--dp-typography-reading)",
          fontSize: "1.1rem",
          margin: "0 0 16px 0",
          color: "var(--dp-color-secondary)",
        }}
      >
        {comparisonText}.
      </p>

      {/* Factual strip of counts */}
      <div
        className="np-guest-fact-strip"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "var(--dp-space-md)",
          padding: "var(--dp-space-md) 0",
          borderTop: "var(--dp-border-hairline) solid var(--dp-color-rule)",
          borderBottom: "var(--dp-border-hairline) solid var(--dp-color-rule)",
          marginBottom: "var(--dp-space-lg)",
        }}
      >
        <div>
          <span className="text-label" style={{ display: "block" }}>
            Total Invited
          </span>
          <strong style={{ fontSize: "1.4rem" }}>{totalInvited}</strong>
        </div>
        <div>
          <span className="text-label" style={{ display: "block" }}>
            Confirmed (w/ +1s)
          </span>
          <strong style={{ fontSize: "1.4rem" }}>{confirmedHeadcount}</strong>
        </div>
        <div>
          <span className="text-label" style={{ display: "block" }}>
            Declined
          </span>
          <strong style={{ fontSize: "1.4rem" }}>{declinedCount}</strong>
        </div>
        <div>
          <span className="text-label" style={{ display: "block" }}>
            Pending
          </span>
          <strong style={{ fontSize: "1.4rem" }}>{pendingHeadcount}</strong>
        </div>
      </div>

      {/* 10% discrepancy notice */}
      {isSubstantialDiff && onUpdatePlannedCount && (
        <div
          role="region"
          aria-label="Guest count discrepancy notice"
          style={{
            border: "var(--dp-border-thin) solid var(--dp-color-rule)",
            backgroundColor: "var(--dp-color-ground)",
            padding: "var(--dp-space-md)",
            marginBottom: "var(--dp-space-lg)",
          }}
        >
          <strong style={{ display: "block", marginBottom: "4px" }}>
            Headcount discrepancy ({Math.round(percentDiff)}% difference)
          </strong>
          <p style={{ margin: "0 0 12px 0", fontSize: "0.95rem" }}>
            Your confirmed attendance ({confirmedHeadcount}) differs from your original plan ({plannedGuestCount}) by more than 10%.
            Updating your planned guest count will recalculate your per-guest budget figures. Budget amounts will not change automatically.
          </p>
          <Button
            variant="secondary"
            onClick={() => onUpdatePlannedCount(confirmedHeadcount)}
          >
            Update planned guest count to {confirmedHeadcount}
          </Button>
        </div>
      )}

      {/* Privacy notice banner */}
      <div
        role="note"
        aria-label="Privacy note"
        style={{
          borderLeft: "var(--dp-border-rule) solid var(--dp-color-ink)",
          padding: "var(--dp-space-sm) var(--dp-space-md)",
          backgroundColor: "var(--dp-color-ground)",
          marginBottom: "var(--dp-space-xl)",
          fontStyle: "italic",
          fontSize: "0.9rem",
        }}
      >
        Privacy note: Guest names stay in this browser and are never sent to the AI assistant.
      </div>
    </section>
  );
};
