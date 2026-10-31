"use client";

import React from "react";
import { TimelineTask, TaskStatus } from "@/lib/domain";
import { formatTimelineDate } from "@/lib/utils/format";

export interface TimelineTaskRowProps {
  task: TimelineTask;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteCustomTask?: (taskId: string) => void;
}

export const TimelineTaskRow: React.FC<TimelineTaskRowProps> = ({
  task,
  onStatusChange,
  onDeleteCustomTask,
}) => {
  const isCustom = Boolean(task.isCustom || task.id.startsWith("custom-"));
  const isDone = task.status === "done" || task.completed === true;

  return (
    <article
      className={`np-timeline-row ${isDone ? "is-done" : ""}`}
      data-testid={`timeline-task-${task.id}`}
      style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 3fr 1.6fr auto",
        gap: "16px",
        alignItems: "start",
        padding: "14px 4px",
        borderBottom: "1px solid #d4cfc5",
      }}
    >
      {/* Date & Category */}
      <div>
        <div>
          <time
            dateTime={task.dueDate}
            style={{
              fontFamily: "var(--dp-typography-display)",
              fontWeight: "var(--dp-typography-label-weight)",
              color: "var(--dp-color-ink)",
              fontSize: "0.95rem",
            }}
          >
            {formatTimelineDate(task.dueDate)}
          </time>
        </div>
        <div className="text-label" style={{ color: "var(--dp-color-secondary)", marginTop: "2px" }}>
          {task.category}
        </div>
      </div>

      {/* Title & Badges */}
      <div>
        <h3
          style={{
            fontFamily: "var(--dp-typography-reading)",
            fontSize: "1.1rem",
            fontWeight: isDone ? "normal" : "var(--dp-typography-label-weight)",
            textDecoration: isDone ? "line-through" : "none",
            color: isDone ? "var(--dp-color-secondary)" : "var(--dp-color-ink)",
            margin: "0 0 6px 0",
            lineHeight: "1.3",
          }}
        >
          {task.title}
        </h3>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          {task.isCritical && (
            <span
              className="text-label np-critical-badge"
              style={{
                color: "#ffffff",
                backgroundColor: "var(--dp-color-accent)",
                border: "1px solid var(--dp-color-accent)",
                padding: "2px 8px",
                textTransform: "uppercase",
                fontWeight: "800",
              }}
            >
              Critical
            </span>
          )}

          {task.atRisk && (
            <span
              className="text-label np-at-risk-badge"
              style={{
                color: "#8a1914",
                backgroundColor: "#fce8e6",
                border: "1px solid var(--dp-color-accent)",
                padding: "2px 8px",
                fontWeight: "700",
              }}
            >
              At risk: {task.reason || "Tight deadline"}
            </span>
          )}
        </div>
      </div>

      {/* Status Control */}
      <div>
        <label
          htmlFor={`status-select-${task.id}`}
          className="text-label"
          style={{ display: "block", marginBottom: "3px", color: "var(--dp-color-secondary)" }}
        >
          Status
        </label>
        <select
          id={`status-select-${task.id}`}
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className="np-select"
          style={{ width: "100%", padding: "4px 8px", fontSize: "14px" }}
          aria-label={`Status for ${task.title}`}
        >
          <option value="todo">To Do</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Actions (Custom delete only) */}
      <div style={{ minWidth: "50px", textAlign: "right", paddingTop: "18px" }}>
        {isCustom && onDeleteCustomTask && (
          <button
            type="button"
            onClick={() => onDeleteCustomTask(task.id)}
            className="np-delete-trigger"
            aria-label={`Delete custom task ${task.title}`}
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
};

export default TimelineTaskRow;

