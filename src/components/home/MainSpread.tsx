import React from "react";
import Link from "next/link";
import { Columns, SectionLabel, Rule } from "@/components/ui";

export const MainSpread: React.FC = () => {
  return (
    <section aria-labelledby="methodology-headline" style={{ marginBottom: "var(--dp-spacing-story)" }}>
      <Columns spread>
        {/* Narrow column of event types */}
        <div>
          <SectionLabel>Event Types</SectionLabel>
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "4px" }}>Wedding</h3>
              <p className="text-compact" style={{ color: "var(--dp-color-secondary)", marginBottom: "6px" }}>
                Multi-tier catering ratios, venue shifts, photography priorities, and backward scheduling.
              </p>
              <Link href="/plan?type=wedding" className="text-compact">
                Plan a wedding →
              </Link>
            </div>

            <Rule variant="hairline" />

            <div>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "4px" }}>Birthday</h3>
              <p className="text-compact" style={{ color: "var(--dp-color-secondary)", marginBottom: "6px" }}>
                Entertainment booking, custom cake budgeting, themed decor, and rapid milestones.
              </p>
              <Link href="/plan?type=birthday" className="text-compact">
                Plan a birthday →
              </Link>
            </div>

            <Rule variant="hairline" />

            <div>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "4px" }}>Community</h3>
              <p className="text-compact" style={{ color: "var(--dp-color-secondary)", marginBottom: "6px" }}>
                Municipal permits, public safety reserves, volunteer rosters, and crowd logistics.
              </p>
              <Link href="/plan?type=community" className="text-compact">
                Plan a community event →
              </Link>
            </div>
          </div>
        </div>

        {/* Larger editorial story with 4 numbered steps */}
        <div>
          <SectionLabel>Methodology</SectionLabel>
          <h2 id="methodology-headline" style={{ fontSize: "2rem", margin: "8px 0 14px 0" }}>
            How celebration planning works
          </h2>
          <p className="np-drop-cap">
            Planning any significant celebration requires disciplined orchestration. Rather than starting with
            fragmented notes or generic templates, our deterministic engine establishes your complete operational
            schedule and financial allocation backward from the date of the event.
          </p>

          <div className="np-steps-container">
            <div className="np-step-item">
              <span className="np-step-badge">
                <span className="np-step-marker" aria-hidden="true" />
                01
              </span>
              <div className="np-step-content">
                <h3 className="np-step-title">Tell us about the event</h3>
                <p className="np-step-desc">
                  Specify event type, celebration date, guest count, total budget, city tier, and venue environment.
                  Choose up to three priorities to adjust allocations automatically.
                </p>
              </div>
            </div>

            <div className="np-step-item">
              <span className="np-step-badge">
                <span className="np-step-marker" aria-hidden="true" />
                02
              </span>
              <div className="np-step-content">
                <h3 className="np-step-title">Get a budget</h3>
                <p className="np-step-desc">
                  Receive an exact mathematical breakdown with contingency reserves and per-guest catering floors.
                  Track planned targets against actual vendor quotes with variance flags.
                </p>
              </div>
            </div>

            <div className="np-step-item">
              <span className="np-step-badge">
                <span className="np-step-marker" aria-hidden="true" />
                03
              </span>
              <div className="np-step-content">
                <h3 className="np-step-title">Follow a dated timeline</h3>
                <p className="np-step-desc">
                  Review chronological milestones scheduled backward from your date. Overdue critical tasks are
                  staggered sequentially across upcoming days to avoid unorganized backlogs.
                </p>
              </div>
            </div>

            <div className="np-step-item">
              <span className="np-step-badge">
                <span className="np-step-marker" aria-hidden="true" />
                04
              </span>
              <div className="np-step-content">
                <h3 className="np-step-title">Ask the assistant</h3>
                <p className="np-step-desc">
                  Consult the built-in planning assistant for practical advice and brainstorm theme, menu, and activity
                  ideas strictly grounded in your celebration parameters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Columns>
    </section>
  );
};

