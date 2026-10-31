"use client";

import React from "react";
import { TimelineTask, TaskStatus } from "@/lib/domain";
import { TimelineTaskRow } from "./TimelineTaskRow";
import { SectionLabel } from "@/components/ui/SectionLabel";

export interface TimelineGroupProps {
  groupKey: string;
  title: string;
  tasks: TimelineTask[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteCustomTask?: (taskId: string) => void;
}

export const TimelineGroup: React.FC<TimelineGroupProps> = ({
  groupKey,
  title,
  tasks,
  onStatusChange,
  onDeleteCustomTask,
}) => {
  return (
    <section
      aria-labelledby={`group-heading-${groupKey}`}
      className="np-timeline-group-section"
      data-testid={`timeline-group-${groupKey}`}
      style={{ margin: "28px 0" }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", borderBottom: "var(--dp-border-heavy) solid var(--dp-color-rule)", paddingBottom: "6px" }}>
        <SectionLabel>{groupKey.toUpperCase()}</SectionLabel>
        <h2
          id={`group-heading-${groupKey}`}
          style={{
            fontFamily: "var(--dp-typography-display)",
            fontSize: "1.4rem",
            fontWeight: "var(--dp-typography-display-weight)",
            margin: 0,
          }}
        >
          {title} ({tasks.length})
        </h2>
      </div>

      <div className="np-timeline-tasks-list">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TimelineTaskRow
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onDeleteCustomTask={onDeleteCustomTask}
            />
          ))
        ) : (
          <p
            className="text-compact"
            style={{ color: "var(--dp-color-secondary)", margin: "14px 0" }}
          >
            No scheduled milestones in this timeframe.
          </p>
        )}
      </div>
    </section>
  );
};

export default TimelineGroup;

