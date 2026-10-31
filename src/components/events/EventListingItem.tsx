"use client";

import React from "react";
import Link from "next/link";
import { PlannedEvent } from "@/lib/domain";
import { Listing } from "@/components/ui/Listing";
import {
  formatCurrency,
  formatDate,
  getDaysDifference,
  formatDaysRemaining,
  calculateEventProgress,
} from "@/lib/utils/format";

export interface EventListingItemProps {
  event: PlannedEvent;
  onDelete: (event: PlannedEvent) => void;
}

export const EventListingItem: React.FC<EventListingItemProps> = ({
  event,
  onDelete,
}) => {
  const { brief } = event;
  const daysDiff = getDaysDifference(brief.date);
  const progress = calculateEventProgress(event);

  const formattedType =
    brief.type.charAt(0).toUpperCase() + brief.type.slice(1);

  const identityContent = (
    <div>
      <h3 className="np-event-listing-title" style={{ margin: "0 0 4px 0" }}>
        <Link
          href={`/events/${brief.id}`}
          prefetch={false}
          className="np-event-title-link"
          style={{
            color: "var(--dp-color-ink)",
            textDecoration: "none",
            borderBottom: "1px solid transparent",
          }}
        >
          {brief.name}
        </Link>
      </h3>
      <div className="text-label" style={{ color: "var(--dp-color-secondary)" }}>
        {formattedType} · {brief.city} ({brief.venueType})
      </div>
    </div>
  );

  const termsContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <div>
        <strong>{formatDate(brief.date)}</strong>
      </div>
      <div>{formatDaysRemaining(daysDiff)}</div>
      <div>{brief.guestCount} guests</div>
    </div>
  );

  const detailsContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <strong>{formatCurrency(brief.totalBudget, brief.currency)}</strong>
        <button
          type="button"
          onClick={() => onDelete(event)}
          aria-label={`Delete ${brief.name}`}
          className="np-delete-trigger"
        >
          Delete
        </button>
      </div>
      <div className="text-compact" style={{ color: "var(--dp-color-secondary)" }}>
        {progress.taskPercent}% tasks done · {progress.vendorPercent}% vendors booked
      </div>
    </div>
  );

  return (
    <Listing
      identity={identityContent}
      terms={termsContent}
      details={detailsContent}
      data-testid={`event-listing-${brief.id}`}
    />
  );
};

export default EventListingItem;

