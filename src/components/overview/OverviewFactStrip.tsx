"use client";

import React from "react";
import { PlannedEvent } from "@/lib/domain";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  formatCurrency,
  getDaysDifference,
  calculateEventProgress,
} from "@/lib/utils/format";

export interface OverviewFactStripProps {
  event: PlannedEvent;
}

export const OverviewFactStrip: React.FC<OverviewFactStripProps> = ({ event }) => {
  const { brief } = event;
  const daysDiff = getDaysDifference(brief.date);
  const progress = calculateEventProgress(event);

  const daysLabel =
    daysDiff > 0
      ? `${daysDiff} days`
      : daysDiff === 0
        ? "Today"
        : `${Math.abs(daysDiff)} days ago`;

  const perGuestAmount =
    brief.guestCount > 0
      ? Math.round(brief.totalBudget / brief.guestCount)
      : brief.totalBudget;

  const rsvpLabel =
    progress.totalGuests === 0
      ? "None yet"
      : progress.confirmedGuests === 0
        ? "0 confirmed"
        : `${progress.confirmedGuests} confirmed`;

  return (
    <section aria-label="Key Celebration Facts" className="np-overview-fact-strip" data-testid="overview-fact-strip">
      <div className="np-fact-item">
        <SectionLabel>01 · Countdown</SectionLabel>
        <div className="np-fact-number">{daysLabel}</div>
        <p className="np-fact-text text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
          Until scheduled celebration date
        </p>
      </div>

      <div className="np-fact-item">
        <SectionLabel>02 · Per Guest</SectionLabel>
        <div className="np-fact-number">
          {formatCurrency(perGuestAmount, brief.currency)}
        </div>
        <p className="np-fact-text text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
          Based on {brief.guestCount} guests
        </p>
      </div>

      <div className="np-fact-item">
        <SectionLabel>03 · Tasks Done</SectionLabel>
        <div className="np-fact-number">{progress.taskPercent}%</div>
        <p className="np-fact-text text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
          {progress.completedTasks} of {progress.totalTasks} milestones
        </p>
      </div>

      <div className="np-fact-item">
        <SectionLabel>04 · Vendors Booked</SectionLabel>
        <div className="np-fact-number">{progress.vendorPercent}%</div>
        <p className="np-fact-text text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
          {progress.bookedVendors} of {progress.totalVendors} secured
        </p>
      </div>

      <div className="np-fact-item">
        <SectionLabel>05 · RSVPs Confirmed</SectionLabel>
        <div className="np-fact-number">{rsvpLabel}</div>
        <p className="np-fact-text text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
          {progress.totalGuests > 0 ? `Across ${progress.totalGuests} invited guests` : "No guest records added"}
        </p>
      </div>
    </section>
  );
};

export default OverviewFactStrip;

