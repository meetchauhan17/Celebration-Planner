"use client";

import React from "react";
import { useEvent, EventNotFound } from "@/components/shell/EventContext";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { OverviewPageContent } from "@/components/overview";

export default function EventOverviewPage({
  params,
}: {
  params: { id: string };
}) {
  const { event, isLoading, isNotFound } = useEvent(params.id);

  if (isLoading) {
    return (
      <div className="page-container" style={{ padding: "40px 0" }}>
        <div className="np-event-state-container" role="status" data-testid="event-loading">
          <SectionLabel>Status</SectionLabel>
          <p className="np-event-state-desc" style={{ marginTop: "8px" }}>
            Loading celebration plan...
          </p>
        </div>
      </div>
    );
  }

  if (isNotFound || !event) {
    return (
      <div className="page-container" style={{ padding: "40px 0" }}>
        <EventNotFound />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ paddingBottom: "48px" }}>
      <OverviewPageContent event={event} />
    </div>
  );
}

