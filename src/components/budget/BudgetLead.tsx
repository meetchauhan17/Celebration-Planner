"use client";

import React from "react";
import { PlannedEvent } from "@/lib/domain";
import { summarizeBudget } from "@/lib/engine/budget";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { formatCurrency } from "@/lib/utils/format";

export interface BudgetLeadProps {
  event: PlannedEvent;
}

export const BudgetLead: React.FC<BudgetLeadProps> = ({ event }) => {
  const { brief, budgetLines } = event;
  const summary = summarizeBudget(budgetLines);

  const perGuestCost =
    brief.guestCount > 0
      ? Math.round(brief.totalBudget / brief.guestCount)
      : brief.totalBudget;

  const varianceText =
    summary.variance > 0
      ? `+${formatCurrency(summary.variance, brief.currency)} (Over)`
      : summary.variance < 0
        ? `-${formatCurrency(Math.abs(summary.variance), brief.currency)} (Under)`
        : `${formatCurrency(0, brief.currency)} (On target)`;

  return (
    <section aria-labelledby="budget-lead-heading" className="np-budget-lead">
      <SectionLabel>Financial Plan</SectionLabel>
      <h1
        id="budget-lead-heading"
        style={{
          fontFamily: "var(--dp-typography-display)",
          fontSize: "2.8rem",
          fontWeight: "var(--dp-typography-display-weight)",
          margin: "8px 0 6px 0",
          lineHeight: "1.1",
        }}
      >
        {formatCurrency(brief.totalBudget, brief.currency)}
      </h1>
      <p
        className="text-compact"
        style={{ color: "var(--dp-color-secondary)", margin: "0 0 20px 0" }}
      >
        Total Planned Expenditure · {formatCurrency(perGuestCost, brief.currency)} per guest ({brief.guestCount} guests)
      </p>

      {/* Ruled Factual Strip: Planned vs Actual vs Variance */}
      <div className="np-fact-strip" data-testid="budget-fact-strip" style={{ margin: "16px 0" }}>
        <div className="np-fact-item">
          <SectionLabel>01 · Planned</SectionLabel>
          <div className="np-fact-number">
            {formatCurrency(summary.plannedTotal, brief.currency)}
          </div>
          <p className="np-fact-text text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
            Allocated across {budgetLines.length} categories
          </p>
        </div>

        <div className="np-fact-item">
          <SectionLabel>02 · Actual Spend</SectionLabel>
          <div className="np-fact-number">
            {formatCurrency(summary.actualTotal, brief.currency)}
          </div>
          <p className="np-fact-text text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
            Committed and paid accounts
          </p>
        </div>

        <div className="np-fact-item">
          <SectionLabel>03 · Variance</SectionLabel>
          <div
            className="np-fact-number"
            style={{
              color: summary.variance > 0 ? "var(--dp-color-accent)" : "var(--dp-color-ink)",
            }}
          >
            {varianceText}
          </div>
          <p className="np-fact-text text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
            {summary.variance > 0
              ? "Actual spend exceeds current planned allocation"
              : "Financial commitments remain within bounds"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default BudgetLead;

