"use client";

import React, { useState } from "react";
import { PlannedEvent } from "@/lib/domain";
import { useEvents, deleteEvent } from "@/lib/storage";
import { useAnnounce } from "@/components/shell";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Rule } from "@/components/ui/Rule";
import { getDaysDifference } from "@/lib/utils/format";
import { EventListingItem } from "./EventListingItem";
import { DeleteEventDialog } from "./DeleteEventDialog";

export const EventsList: React.FC = () => {
  const events = useEvents();
  const { announce } = useAnnounce();
  const [deletingEvent, setDeletingEvent] = useState<PlannedEvent | null>(null);

  const handleDeleteConfirm = () => {
    if (!deletingEvent) return;
    const { name, id } = deletingEvent.brief;
    const res = deleteEvent(id);
    if (res.ok) {
      announce(`Deleted celebration: ${name}`, "polite");
    }
    setDeletingEvent(null);
  };

  if (events.length === 0) {
    return (
      <div className="np-empty-events-state" data-testid="events-empty-state">
        <SectionLabel>Index</SectionLabel>
        <h2 style={{ fontSize: "1.6rem", margin: "8px 0 12px 0" }}>
          No Celebrations Recorded
        </h2>
        <p style={{ maxWidth: "560px", color: "var(--dp-color-secondary)", marginBottom: "20px" }}>
          You have not planned any celebrations yet. Set up your date, guest count, and budget to generate a complete tailored plan.
        </p>
        <div>
          <Button href="/plan">Plan an event</Button>
        </div>
      </div>
    );
  }

  // Sort upcoming soonest first (date ascending)
  const upcomingEvents = events
    .filter((e) => getDaysDifference(e.brief.date) >= 0)
    .sort((a, b) => a.brief.date.localeCompare(b.brief.date));

  // Sort past events (date descending)
  const pastEvents = events
    .filter((e) => getDaysDifference(e.brief.date) < 0)
    .sort((a, b) => b.brief.date.localeCompare(a.brief.date));

  return (
    <div className="np-events-directory">
      {upcomingEvents.length > 0 ? (
        <section aria-label="Upcoming celebrations">
          <SectionLabel>Upcoming</SectionLabel>
          <h2 style={{ fontSize: "1.4rem", margin: "6px 0 16px 0" }}>
            Upcoming Celebrations
          </h2>
          <div className="np-listings-container">
            {upcomingEvents.map((event) => (
              <EventListingItem
                key={event.brief.id}
                event={event}
                onDelete={setDeletingEvent}
              />
            ))}
          </div>
        </section>
      ) : (
        <p style={{ color: "var(--dp-color-secondary)", margin: "16px 0" }}>
          No upcoming celebrations scheduled.
        </p>
      )}

      {pastEvents.length > 0 && (
        <section
          aria-label="Past celebrations"
          style={{ marginTop: "var(--dp-spacing-story)" }}
        >
          <Rule variant="hairline" style={{ marginBottom: "20px" }} />
          <SectionLabel>Archive</SectionLabel>
          <h2 style={{ fontSize: "1.4rem", margin: "6px 0 16px 0" }}>
            Past Celebrations
          </h2>
          <div className="np-listings-container">
            {pastEvents.map((event) => (
              <EventListingItem
                key={event.brief.id}
                event={event}
                onDelete={setDeletingEvent}
              />
            ))}
          </div>
        </section>
      )}

      <DeleteEventDialog
        isOpen={Boolean(deletingEvent)}
        eventName={deletingEvent?.brief.name || ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingEvent(null)}
      />
    </div>
  );
};

export default EventsList;
