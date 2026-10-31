"use client";

import React from "react";
import Link from "next/link";
import { PlannedEvent } from "@/lib/domain";
import { Columns } from "@/components/ui/Columns";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { formatDate } from "@/lib/utils/format";

export interface OverviewMainSpreadProps {
  event: PlannedEvent;
}

const SECTION_LINKS = [
  { id: "budget", label: "Budget", desc: "Category allocations & variance tracking" },
  { id: "timeline", label: "Timeline", desc: "Backward-scheduled milestone dates" },
  { id: "vendors", label: "Vendors", desc: "Checklists, quotes & contract statuses" },
  { id: "guests", label: "Guests", desc: "RSVP tracking, groupings & dietary needs" },
  { id: "ideas", label: "Ideas", desc: "Structured creative inspiration" },
  { id: "assistant", label: "Assistant", desc: "AI planning advice & contingency solutions" },
  { id: "summary", label: "Summary", desc: "Consolidated event briefing & export" },
];

export const OverviewMainSpread: React.FC<OverviewMainSpreadProps> = ({ event }) => {
  const { brief, tasks } = event;

  // Next 5 upcoming incomplete tasks sorted by due date
  const upcomingTasks = tasks
    .filter((t) => t.status !== "done" && !t.completed)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  return (
    <section aria-labelledby="overview-sections-heading" style={{ marginBottom: "var(--dp-spacing-story)" }}>
      <Columns spread>
        {/* Narrow column of links to each section */}
        <nav aria-label="Event sections navigation" style={{ borderRight: "var(--dp-border-hairline) solid var(--dp-color-rule)", paddingRight: "var(--dp-spacing-column)" }}>
          <SectionLabel>Event Sections</SectionLabel>
          <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0 0" }}>
            {SECTION_LINKS.map((sec) => (
              <li
                key={sec.id}
                style={{
                  padding: "10px 0",
                  borderBottom: "var(--dp-border-hairline) solid var(--dp-color-rule)",
                }}
              >
                <Link
                  href={`/events/${brief.id}/${sec.id}`}
                  className="np-button-link"
                  style={{
                    display: "block",
                    fontWeight: "var(--dp-typography-label-weight)",
                    fontSize: "var(--dp-typography-control)",
                  }}
                >
                  {sec.label} →
                </Link>
                <div className="text-compact" style={{ color: "var(--dp-color-secondary)", marginTop: "2px" }}>
                  {sec.desc}
                </div>
              </li>
            ))}
          </ul>
        </nav>

        {/* Coming up story listing next 5 tasks */}
        <div data-testid="overview-coming-up">
          <SectionLabel>Milestones</SectionLabel>
          <h2
            id="overview-sections-heading"
            style={{
              fontFamily: "var(--dp-typography-display)",
              fontSize: "1.8rem",
              fontWeight: "var(--dp-typography-display-weight)",
              margin: "6px 0 16px 0",
            }}
          >
            Coming Up
          </h2>

          {upcomingTasks.length > 0 ? (
            <div className="np-upcoming-tasks-list">
              {upcomingTasks.map((task) => (
                <article
                  key={task.id}
                  style={{
                    padding: "14px 0",
                    borderBottom: "var(--dp-border-hairline) solid var(--dp-color-rule)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <h3
                      style={{
                        fontFamily: "var(--dp-typography-display)",
                        fontSize: "1.1rem",
                        fontWeight: "var(--dp-typography-label-weight)",
                        margin: 0,
                      }}
                    >
                      {task.title}
                    </h3>
                    <div
                      className="text-label"
                      style={{
                        color: task.atRisk ? "var(--dp-color-accent)" : "var(--dp-color-secondary)",
                      }}
                    >
                      Due {formatDate(task.dueDate)}
                    </div>
                  </div>

                  <div
                    className="text-compact"
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginTop: "4px",
                      color: "var(--dp-color-secondary)",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>{task.category}</span>
                    {task.isCritical && (
                      <span
                        style={{
                          color: "var(--dp-color-accent)",
                          fontWeight: "var(--dp-typography-label-weight)",
                        }}
                      >
                        Critical milestone
                      </span>
                    )}
                    {task.atRisk && (
                      <span style={{ color: "var(--dp-color-accent)" }}>
                        At risk: {task.reason || "Tight deadline"}
                      </span>
                    )}
                  </div>
                </article>
              ))}

              <div style={{ marginTop: "16px" }}>
                <Link
                  href={`/events/${brief.id}/timeline`}
                  className="np-button-link text-compact"
                  style={{ fontWeight: "var(--dp-typography-label-weight)" }}
                >
                  View full timeline ({tasks.length} total milestones) →
                </Link>
              </div>
            </div>
          ) : (
            <p style={{ color: "var(--dp-color-secondary)", margin: "16px 0" }}>
              No upcoming tasks remaining. All milestones for this celebration have been completed.
            </p>
          )}
        </div>
      </Columns>
    </section>
  );
};

export default OverviewMainSpread;
