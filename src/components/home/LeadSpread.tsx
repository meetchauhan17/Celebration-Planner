import React from "react";
import Link from "next/link";
import { Columns, SectionLabel, Button } from "@/components/ui";

export const LeadSpread: React.FC = () => {
  return (
    <section aria-labelledby="lead-headline" style={{ marginBottom: "var(--dp-spacing-story)" }}>
      <Columns lead>
        <div>
          <SectionLabel>Overview</SectionLabel>
          <h2 id="lead-headline" className="np-lead-headline" style={{ marginTop: "8px" }}>
            Plan the whole celebration, not just the guest list.
          </h2>
          <p style={{ maxWidth: "720px" }}>
            Celebration Planner coordinates your budget allocations, backward-scheduled milestone timeline, and
            critical vendor checklists from day one. Built with pure mathematical formulas and local persistence so
            your arrangements remain private, structured, and immediately actionable.
          </p>
        </div>

        <div>
          <div className="np-lead-box">
            <SectionLabel>Start Here</SectionLabel>
            <p className="text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
              Set your date, guest count, and budget to generate a complete tailored plan in seconds.
            </p>
            <div style={{ marginTop: "6px" }}>
              <Button href="/plan" style={{ width: "100%" }}>
                Plan an event
              </Button>
            </div>
            <div style={{ textAlign: "center" }}>
              <Link href="/events" className="np-button-link text-compact">
                View saved events
              </Link>
            </div>
          </div>
        </div>
      </Columns>
    </section>
  );
};
