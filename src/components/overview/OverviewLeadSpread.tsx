"use client";

import React from "react";
import Link from "next/link";
import { PlannedEvent, TimelineTask } from "@/lib/domain";
import { Columns } from "@/components/ui/Columns";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  formatCurrency,
  formatDate,
  formatDaysRemaining,
  getDaysDifference,
} from "@/lib/utils/format";

export interface OverviewLeadSpreadProps {
  event: PlannedEvent;
}

export function generateEventSummary(event: PlannedEvent): string {
  const { brief } = event;
  const daysDiff = getDaysDifference(brief.date);
  const formattedDate = formatDate(brief.date);
  const daysText = formatDaysRemaining(daysDiff);
  const perGuest = Math.round(
    brief.guestCount > 0 ? brief.totalBudget / brief.guestCount : brief.totalBudget
  );

  const prioritiesText =
    brief.priorities && brief.priorities.length > 0
      ? ` Key priorities focus on ${brief.priorities.join(", ")}.`
      : "";

  const dietaryText =
    brief.dietaryNeeds && brief.dietaryNeeds.length > 0
      ? ` Menu accommodations specified for ${brief.dietaryNeeds.join(", ")}.`
      : "";

  return `A ${brief.type} celebration organized for ${brief.guestCount} guests in ${brief.city} (${brief.cityTier}), hosted at an ${brief.venueType} venue. Scheduled for ${formattedDate} (${daysText}). Total planned budget is ${formatCurrency(brief.totalBudget, brief.currency)} (${formatCurrency(perGuest, brief.currency)} per guest).${prioritiesText}${dietaryText}`;
}

export function getMostImportantNextAction(tasks: TimelineTask[]) {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const todayMs = todayMidnight.getTime();

  const incomplete = tasks.filter((t) => t.status !== "done" && !t.completed);
  if (incomplete.length === 0) {
    return { task: null, note: "All scheduled milestones are complete." };
  }

  const overdueOrAtRiskCritical = incomplete.filter((t) => {
    const dueMs = new Date(t.dueDate).getTime();
    return t.isCritical && (t.atRisk || dueMs < todayMs);
  });

  if (overdueOrAtRiskCritical.length > 0) {
    overdueOrAtRiskCritical.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const target = overdueOrAtRiskCritical[0];
    return {
      task: target,
      note: target.reason || "Urgent critical item requires immediate attention.",
    };
  }

  const criticalTasks = incomplete.filter((t) => t.isCritical);
  if (criticalTasks.length > 0) {
    criticalTasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return {
      task: criticalTasks[0],
      note: "Primary upcoming milestone on schedule.",
    };
  }

  incomplete.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return {
    task: incomplete[0],
    note: "Next chronological task on schedule.",
  };
}

export const OverviewLeadSpread: React.FC<OverviewLeadSpreadProps> = ({ event }) => {
  const { brief, tasks } = event;
  const summaryParagraph = generateEventSummary(event);
  const { task: nextTask, note: actionNote } = getMostImportantNextAction(tasks);
  const timelineHref = `/events/${brief.id}/timeline`;

  return (
    <section aria-labelledby="overview-headline" style={{ marginBottom: "var(--dp-spacing-story)" }}>
      <Columns lead>
        <div>
          <SectionLabel>Overview</SectionLabel>
          <h1
            id="overview-headline"
            className="np-lead-headline"
            style={{ fontSize: "2.8rem", margin: "8px 0 16px 0", lineHeight: "1.1" }}
          >
            {brief.name}
          </h1>
          <p
            className="np-overview-summary"
            style={{
              fontFamily: "var(--dp-typography-reading)",
              fontSize: "var(--dp-typography-body)",
              lineHeight: "var(--dp-typography-body-leading)",
              color: "var(--dp-color-ink)",
              maxWidth: "760px",
            }}
          >
            {summaryParagraph}
          </p>
        </div>

        <div>
          <div className="np-lead-box" data-testid="overview-next-action">
            <SectionLabel>Next Action</SectionLabel>
            {nextTask ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontWeight: "var(--dp-typography-label-weight)" }}>
                  {nextTask.title}
                </div>
                <div className="text-compact" style={{ color: "var(--dp-color-secondary)" }}>
                  Due: {formatDate(nextTask.dueDate)} · {nextTask.category}
                </div>
                <p className="text-compact" style={{ margin: "4px 0", color: "var(--dp-color-ink)" }}>
                  {actionNote}
                </p>
                <div style={{ marginTop: "4px" }}>
                  <Link
                    href={timelineHref}
                    prefetch={false}
                    className="np-button-link text-compact"
                    style={{ fontWeight: "var(--dp-typography-label-weight)" }}
                  >
                    Go to timeline →
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
                All scheduled tasks are complete. Review your vendor agreements and guest list.
              </p>
            )}
          </div>
        </div>
      </Columns>
    </section>
  );
};

export default OverviewLeadSpread;

