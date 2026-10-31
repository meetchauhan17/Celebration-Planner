"use client";

import React from "react";
import { PlannedEvent } from "@/lib/domain";
import { explainAllocation, generateBudget } from "@/lib/engine/budget";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Rule } from "@/components/ui/Rule";

export interface BudgetEditorialNotesProps {
  event: PlannedEvent;
}

export const BudgetEditorialNotes: React.FC<BudgetEditorialNotesProps> = ({ event }) => {
  const { brief } = event;

  // 1. Plain language rationale explaining the allocation
  const reasons = explainAllocation(brief);

  // 2. Engine warnings (e.g., catering floor adjustments)
  const budgetPlan = generateBudget({
    type: brief.type,
    totalBudget: brief.totalBudget,
    guestCount: brief.guestCount,
    priorities: brief.priorities,
    venueType: brief.venueType,
    cityTier: brief.cityTier,
  });

  return (
    <section aria-labelledby="allocation-notes-heading" style={{ margin: "24px 0" }}>
      <div className="np-editorial-notes" data-testid="budget-editorial-notes">
        <SectionLabel>Allocation Rationale & Engine Advisories</SectionLabel>
        <h2
          id="allocation-notes-heading"
          style={{
            fontFamily: "var(--dp-typography-display)",
            fontSize: "1.4rem",
            fontWeight: "var(--dp-typography-display-weight)",
            margin: "6px 0 12px 0",
          }}
        >
          Why Your Budget Is Structured This Way
        </h2>

        {/* Engine Warnings if present */}
        {budgetPlan.warnings.length > 0 && (
          <div style={{ marginBottom: "12px" }}>
            {budgetPlan.warnings.map((warn, i) => (
              <div
                key={`warn-${i}`}
                role="note"
                style={{
                  borderLeft: "3px solid var(--dp-color-accent)",
                  paddingLeft: "12px",
                  margin: "6px 0",
                  color: "var(--dp-color-accent)",
                  fontWeight: "var(--dp-typography-label-weight)",
                  fontSize: "var(--dp-typography-reading-compact)",
                }}
              >
                {warn}
              </div>
            ))}
          </div>
        )}

        {/* 3-5 Plain-language reasons */}
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            borderTop: "var(--dp-border-hairline) solid var(--dp-color-rule)",
          }}
        >
          {reasons.map((reason, idx) => (
            <li
              key={idx}
              className="text-compact"
              style={{
                padding: "8px 0",
                borderBottom: "var(--dp-border-hairline) solid var(--dp-color-rule)",
                color: "var(--dp-color-ink)",
              }}
            >
              {reason}
            </li>
          ))}
        </ul>
      </div>
      <Rule variant="hairline" style={{ marginTop: "24px" }} />
    </section>
  );
};

export default BudgetEditorialNotes;

