"use client";

import React, { useMemo } from "react";
import { PlannedEvent, TimelineTask } from "@/lib/domain";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { OverviewLeadSpread } from "@/components/overview/OverviewLeadSpread";
import { OverviewFactStrip } from "@/components/overview/OverviewFactStrip";
import { BudgetTable } from "@/components/budget/BudgetTable";
import { CateringSummary } from "@/components/guests/CateringSummary";
import { SummaryActions } from "./SummaryActions";
import { formatDate } from "@/lib/utils/format";

export interface SummarySheetProps {
  event: PlannedEvent;
}

export const SummarySheet: React.FC<SummarySheetProps> = ({ event }) => {
  const { brief, budgetLines = [], tasks = [], vendors = [], guests = [], ideas = [] } = event;

  // Filter tasks: next 10 tasks plus all critical tasks (sorted by due date, de-duplicated)
  const summaryTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const critical = sorted.filter((t) => t.isCritical);
    const nextTen = sorted.slice(0, 10);

    const map = new Map<string, TimelineTask>();
    [...nextTen, ...critical].forEach((t) => map.set(t.id, t));

    return Array.from(map.values()).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks]);

  const savedIdeas = ideas.filter((i) => i.saved);

  return (
    <div className="np-summary-sheet" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Interactive actions bar (Hidden on print via media query) */}
      <SummaryActions event={event} />

      {/* Main Single Continuous Newspaper Sheet */}
      <article className="np-summary-document">
        {/* Section 1: Event Headline and Facts */}
        <section className="np-summary-section np-print-page-one">
          <OverviewLeadSpread event={event} />
          <div style={{ marginTop: "var(--dp-space-md)" }}>
            <OverviewFactStrip event={event} />
          </div>
        </section>

        {/* Section 2: Budget Table */}
        <section
          className="np-summary-section np-avoid-break"
          aria-labelledby="summary-budget-heading"
          style={{ marginTop: "var(--dp-space-xl)" }}
        >
          <SectionLabel>Financial Ledger</SectionLabel>
          <h2
            id="summary-budget-heading"
            style={{
              fontFamily: "var(--dp-typography-display)",
              fontSize: "1.6rem",
              margin: "4px 0 16px 0",
            }}
          >
            Budget Allocation & Expenditure
          </h2>
          <BudgetTable
            lines={budgetLines}
            currency={brief.currency}
            totalBudget={brief.totalBudget}
            onUpdateActual={() => {}}
            onAdjustPlanned={() => {}}
          />
        </section>

        {/* Section 3: Next 10 Tasks + All Critical Tasks */}
        <section
          className="np-summary-section np-avoid-break"
          aria-labelledby="summary-timeline-heading"
          style={{ marginTop: "var(--dp-space-xl)" }}
        >
          <SectionLabel>Operational Schedule</SectionLabel>
          <h2
            id="summary-timeline-heading"
            style={{
              fontFamily: "var(--dp-typography-display)",
              fontSize: "1.6rem",
              margin: "4px 0 16px 0",
            }}
          >
            Milestone Schedule ({summaryTasks.length} Key Tasks)
          </h2>

          <div className="np-table-scroll-wrapper" style={{ overflowX: "auto" }}>
            <table className="np-budget-table" style={{ width: "100%" }}>
              <caption className="sr-only">Priority Timeline Milestones</caption>
              <thead>
                <tr>
                  <th scope="col" style={{ width: "130px" }}>Due Date</th>
                  <th scope="col">Task Description</th>
                  <th scope="col" style={{ width: "120px" }}>Category</th>
                  <th scope="col" style={{ width: "100px" }}>Priority</th>
                  <th scope="col" style={{ width: "100px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {summaryTasks.map((t) => (
                  <tr key={t.id} className={t.isCritical ? "np-critical-row" : ""}>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(t.dueDate)}</td>
                    <td>
                      <strong>{t.title}</strong>
                      {t.reason && (
                        <span style={{ display: "block", fontSize: "0.85rem", color: "var(--dp-color-secondary)" }}>
                          {t.reason}
                        </span>
                      )}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{t.category}</td>
                    <td>
                      {t.isCritical ? (
                        <span
                          style={{
                            color: "var(--dp-color-accent)",
                            fontWeight: "bold",
                            fontSize: "0.85rem",
                            textTransform: "uppercase",
                          }}
                        >
                          Critical
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.85rem", color: "var(--dp-color-secondary)" }}>
                          Standard
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          textTransform: "uppercase",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                        }}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Vendor Status Table */}
        <section
          className="np-summary-section np-avoid-break"
          aria-labelledby="summary-vendors-heading"
          style={{ marginTop: "var(--dp-space-xl)" }}
        >
          <SectionLabel>Vendor Procurement</SectionLabel>
          <h2
            id="summary-vendors-heading"
            style={{
              fontFamily: "var(--dp-typography-display)",
              fontSize: "1.6rem",
              margin: "4px 0 16px 0",
            }}
          >
            Vendor Roster & Commitments
          </h2>

          <div className="np-table-scroll-wrapper" style={{ overflowX: "auto" }}>
            <table className="np-budget-table" style={{ width: "100%" }}>
              <caption className="sr-only">Vendor Commitments Table</caption>
              <thead>
                <tr>
                  <th scope="col">Category</th>
                  <th scope="col">Vendor / Provider</th>
                  <th scope="col" style={{ width: "110px" }}>Status</th>
                  <th scope="col" style={{ width: "130px" }}>Quote</th>
                  <th scope="col">Notes / Contact</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: "bold", textTransform: "capitalize" }}>{v.category}</td>
                    <td>{v.label}</td>
                    <td style={{ textTransform: "uppercase", fontSize: "0.85rem", fontWeight: "bold" }}>
                      {v.status}
                    </td>
                    <td>
                      {v.quoteAmount !== undefined
                        ? `${v.quoteAmount.toLocaleString()} ${brief.currency}`
                        : "—"}
                    </td>
                    <td style={{ fontSize: "0.9rem" }}>
                      {v.contact && <span>{v.contact} </span>}
                      {v.notes && <span style={{ color: "var(--dp-color-secondary)" }}>({v.notes})</span>}
                      {!v.contact && !v.notes && "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Confirmed Headcount & Dietary Breakdown */}
        <section
          className="np-summary-section np-avoid-break"
          style={{ marginTop: "var(--dp-space-xl)" }}
        >
          <CateringSummary guests={guests} />
        </section>

        {/* Section 6: Saved Ideas */}
        {savedIdeas.length > 0 && (
          <section
            className="np-summary-section np-avoid-break"
            aria-labelledby="summary-ideas-heading"
            style={{ marginTop: "var(--dp-space-xl)" }}
          >
            <SectionLabel>Pinned Concepts</SectionLabel>
            <h2
              id="summary-ideas-heading"
              style={{
                fontFamily: "var(--dp-typography-display)",
                fontSize: "1.6rem",
                margin: "4px 0 16px 0",
              }}
            >
              Curated Event Concepts ({savedIdeas.length})
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "var(--dp-space-md)",
              }}
            >
              {savedIdeas.map((idea) => (
                <div
                  key={idea.id}
                  style={{
                    border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
                    padding: "var(--dp-space-md)",
                    backgroundColor: "var(--dp-color-canvas)",
                  }}
                >
                  <span
                    className="text-label"
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  >
                    {idea.tag || "Idea"}
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--dp-typography-display)",
                      fontSize: "1.2rem",
                      margin: "4px 0 8px 0",
                    }}
                  >
                    {idea.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--dp-typography-reading)",
                      fontSize: "0.95rem",
                      lineHeight: "1.5",
                      margin: 0,
                    }}
                  >
                    {idea.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 7: Print-only URL-free Footer Disclaimer */}
        <footer
          className="np-summary-print-disclaimer"
          style={{
            marginTop: "var(--dp-space-xl)",
            paddingTop: "var(--dp-space-md)",
            borderTop: "var(--dp-border-hairline) solid var(--dp-color-rule)",
            fontSize: "0.85rem",
            color: "var(--dp-color-secondary)",
            fontStyle: "italic",
          }}
        >
          Planning guidance only. Confirm prices, availability and legal requirements with vendors and local authorities.
        </footer>
      </article>
    </div>
  );
};

