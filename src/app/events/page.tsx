import React from "react";
import { Metadata } from "next";
import { SectionLabel, Rule } from "@/components/ui";
import { EventsList } from "@/components/events";

export const metadata: Metadata = {
  title: "My Events · Celebration Planner",
  description: "Directory of all planned celebrations, budgets, and operational progress.",
};

export default function EventsPage() {
  return (
    <div className="page-container" style={{ paddingBottom: "48px" }}>
      <div style={{ maxWidth: "840px", paddingTop: "16px", marginBottom: "20px" }}>
        <SectionLabel>Directory</SectionLabel>
        <h1 style={{ fontSize: "2.4rem", margin: "8px 0 12px 0" }}>
          Saved Celebrations
        </h1>
        <p style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
          Manage your scheduled celebrations, monitor task completion, and track vendor agreements across all saved plans.
        </p>
      </div>

      <Rule variant="section" style={{ marginBottom: "24px" }} />

      <EventsList />
    </div>
  );
}
