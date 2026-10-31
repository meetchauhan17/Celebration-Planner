"use client";

import React from "react";
import { EventBrief } from "@/lib/domain";
import { SectionLabel } from "@/components/ui/SectionLabel";

export interface IdeasLeadProps {
  brief: EventBrief;
}

export const IdeasLead: React.FC<IdeasLeadProps> = ({ brief }) => {
  return (
    <section aria-labelledby="ideas-lead-heading" className="np-ideas-lead">
      <SectionLabel>Inspiration & Brainstorming</SectionLabel>
      <h1
        id="ideas-lead-heading"
        style={{
          fontFamily: "var(--dp-typography-display)",
          fontSize: "2.6rem",
          fontWeight: "var(--dp-typography-display-weight)",
          margin: "8px 0 6px 0",
          lineHeight: "1.1",
        }}
      >
        Celebration Ideas & Creative Concepts
      </h1>

      <p
        style={{
          fontFamily: "var(--dp-typography-reading)",
          fontSize: "1.05rem",
          lineHeight: "1.5",
          margin: "0 0 16px 0",
          color: "var(--dp-color-secondary)",
          maxWidth: "800px",
        }}
      >
        Personalized suggestions are crafted using your event type ({brief.type}), budget tier (
        {brief.totalBudget.toLocaleString()} {brief.currency}), venue ({brief.venueType}), dietary
        needs ({brief.dietaryNeeds?.length ? brief.dietaryNeeds.join(", ") : "none specified"}),
        priorities ({brief.priorities?.length ? brief.priorities.join(", ") : "general"}), and
        location ({brief.city}, {brief.cityTier}).
      </p>

      {/* Privacy note */}
      <div
        role="note"
        aria-label="Privacy notice"
        style={{
          borderLeft: "var(--dp-border-rule) solid var(--dp-color-ink)",
          padding: "var(--dp-space-sm) var(--dp-space-md)",
          backgroundColor: "var(--dp-color-ground)",
          marginBottom: "var(--dp-space-lg)",
          fontStyle: "italic",
          fontSize: "0.9rem",
        }}
      >
        Guest privacy: Guest names and contact details are strictly kept in this browser and are never shared with the AI assistant.
      </div>
    </section>
  );
};

