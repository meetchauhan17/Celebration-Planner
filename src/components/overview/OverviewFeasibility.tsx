"use client";

import React from "react";
import { PlannedEvent } from "@/lib/domain";
import { generateTimeline } from "@/lib/engine/timeline";
import { generateBudget, summarizeBudget } from "@/lib/engine/budget";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Rule } from "@/components/ui/Rule";

export interface OverviewFeasibilityProps {
  event: PlannedEvent;
}

export const OverviewFeasibility: React.FC<OverviewFeasibilityProps> = ({ event }) => {
  const { brief, budgetLines } = event;

  // 1. Feasibility from timeline engine
  const timelineResult = generateTimeline(brief);
  const { status, summary: timelineSummary } = timelineResult.feasibility;
  const isNotComfortable = status !== "comfortable";
  const displayStatus = status === "very-tight" ? "very tight" : status;

  // 2. Budget warnings from engine & actual expenditure
  const budgetPlan = generateBudget({
    type: brief.type,
    totalBudget: brief.totalBudget,
    guestCount: brief.guestCount,
    priorities: brief.priorities,
    venueType: brief.venueType,
    cityTier: brief.cityTier,
  });

  const budgetSummary = summarizeBudget(budgetLines);
  const actualOverruns = budgetSummary.overCategories.map(
    (cat) => `Category "${cat}" expenditures exceed planned allocation by more than 10%.`
  );

  const warnings = [...budgetPlan.warnings, ...actualOverruns];

  return (
    <section aria-labelledby="feasibility-heading" style={{ margin: "var(--dp-spacing-story) 0" }}>
      <div className="np-feasibility-container" data-testid="overview-feasibility">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <SectionLabel>Feasibility Assessment</SectionLabel>
          {isNotComfortable && (
            <span
              className="np-feasibility-dot is-alert"
              aria-label="High schedule pressure alert"
              role="img"
            />
          )}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
          <h2
            id="feasibility-heading"
            style={{
              fontFamily: "var(--dp-typography-display)",
              fontSize: "1.4rem",
              fontWeight: "var(--dp-typography-display-weight)",
              margin: 0,
            }}
          >
            Schedule Assessment:{" "}
            <span
              style={{
                color: isNotComfortable ? "var(--dp-color-accent)" : "var(--dp-color-ink)",
                textTransform: "capitalize",
              }}
            >
              {displayStatus}
            </span>
          </h2>
        </div>

        <p
          className="text-compact"
          style={{
            color: "var(--dp-color-secondary)",
            marginTop: "6px",
            marginBottom: warnings.length > 0 ? "16px" : "0",
          }}
        >
          {timelineSummary}
        </p>

        {warnings.length > 0 && (
          <div className="np-budget-warnings" style={{ marginTop: "12px" }}>
            <div
              className="text-label"
              style={{
                color: "var(--dp-color-accent)",
                fontWeight: "var(--dp-typography-label-weight)",
                marginBottom: "6px",
              }}
            >
              Budget Advisories & Notices
            </div>
            <ul className="np-budget-warning-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {warnings.map((warn, idx) => (
                <li
                  key={idx}
                  className="np-budget-warning-item text-compact"
                  style={{
                    padding: "6px 0",
                    borderTop: "var(--dp-border-hairline) solid var(--dp-color-rule)",
                    color: "var(--dp-color-ink)",
                  }}
                >
                  {warn}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Rule variant="hairline" style={{ marginTop: "24px" }} />
    </section>
  );
};

export default OverviewFeasibility;

