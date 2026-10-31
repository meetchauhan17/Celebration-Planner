"use client";

import React from "react";
import { EventBrief, TimelineTask } from "@/lib/domain";
import { generateTimeline } from "@/lib/engine/timeline";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getDaysDifference } from "@/lib/utils/format";

export interface TimelineLeadProps {
  brief: EventBrief;
  tasks: TimelineTask[];
}

export const TimelineLead: React.FC<TimelineLeadProps> = ({ brief, tasks }) => {
  const timelineResult = generateTimeline(brief);
  const { status, summary } = timelineResult.feasibility;
  const isNotComfortable = status !== "comfortable";
  const displayStatus =
    status === "very-tight"
      ? "Very Tight"
      : status === "tight"
        ? "Tight"
        : "Comfortable";

  // Task status counts
  const doneCount = tasks.filter((t) => t.status === "done" || t.completed === true).length;
  const doingCount = tasks.filter((t) => t.status === "doing").length;
  const todoCount = tasks.filter((t) => t.status === "todo" && !t.completed).length;
  const overdueCount = tasks.filter(
    (t) => (t.status !== "done" && !t.completed) && getDaysDifference(t.dueDate) < 0
  ).length;

  return (
    <section aria-labelledby="timeline-lead-heading" className="np-timeline-lead">
      <SectionLabel>Milestones & Schedule</SectionLabel>
      <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap", margin: "8px 0 4px 0" }}>
        <h1
          id="timeline-lead-heading"
          style={{
            fontFamily: "var(--dp-typography-display)",
            fontSize: "2.6rem",
            fontWeight: "var(--dp-typography-display-weight)",
            margin: 0,
            lineHeight: "1.1",
          }}
        >
          Feasibility:{" "}
          <span
            style={{
              color: isNotComfortable ? "var(--dp-color-accent)" : "var(--dp-color-ink)",
            }}
          >
            {displayStatus}
          </span>
        </h1>
        {isNotComfortable && (
          <span
            className="np-feasibility-dot"
            aria-label="High schedule pressure"
            role="img"
          />
        )}
      </div>

      <p
        className="text-compact"
        style={{ color: "var(--dp-color-secondary)", margin: "4px 0 20px 0", maxWidth: "720px" }}
      >
        {summary}
      </p>

      {/* Counts Factual Strip: Done, Doing, To do, Overdue */}
      <div className="np-fact-strip np-timeline-fact-strip" data-testid="timeline-fact-strip" style={{ margin: "16px 0" }}>
        <div className="np-fact-item">
          <SectionLabel>01 · Done</SectionLabel>
          <div className="np-fact-number">{doneCount}</div>
          <p className="np-fact-text text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
            Milestones resolved
          </p>
        </div>

        <div className="np-fact-item">
          <SectionLabel>02 · Doing</SectionLabel>
          <div className="np-fact-number">{doingCount}</div>
          <p className="np-fact-text text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
            Active in progress
          </p>
        </div>

        <div className="np-fact-item">
          <SectionLabel>03 · To Do</SectionLabel>
          <div className="np-fact-number">{todoCount}</div>
          <p className="np-fact-text text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
            Upcoming scheduled
          </p>
        </div>

        <div className="np-fact-item">
          <SectionLabel>04 · Overdue</SectionLabel>
          <div
            className="np-fact-number"
            style={{ color: overdueCount > 0 ? "var(--dp-color-accent)" : "var(--dp-color-ink)" }}
          >
            {overdueCount}
          </div>
          <p className="np-fact-text text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
            Past target deadline
          </p>
        </div>
      </div>
    </section>
  );
};

export default TimelineLead;

