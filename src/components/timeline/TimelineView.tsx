"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { PlannedEvent, TimelineTask, TaskStatus } from "@/lib/domain";
import { updateEvent } from "@/lib/storage";
import { useAnnounce } from "@/components/shell";
import { generateTimeline, mergeTimeline } from "@/lib/engine/timeline";
import { getDaysDifference } from "@/lib/utils/format";
import { TimelineLead } from "./TimelineLead";
import { TimelineFilters } from "./TimelineFilters";
import { TimelineGroup } from "./TimelineGroup";
import { TimelineAddTaskForm } from "./TimelineAddTaskForm";
import { TimelineRegenerateModal } from "./TimelineRegenerateModal";

export interface TimelineViewProps {
  event: PlannedEvent;
}

export type TimelineGroupKey = "overdue" | "this-week" | "this-month" | "later" | "done";

export const TimelineView: React.FC<TimelineViewProps> = ({ event }) => {
  const { brief, tasks } = event;
  const { announce } = useAnnounce();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const lastUpdatedTaskIdRef = useRef<string | null>(null);

  // Focus management: preserve focus on status control when task moves between groups
  useEffect(() => {
    if (lastUpdatedTaskIdRef.current) {
      const targetId = lastUpdatedTaskIdRef.current;
      requestAnimationFrame(() => {
        const el = document.getElementById(`status-select-${targetId}`);
        if (el) {
          el.focus();
        }
      });
      lastUpdatedTaskIdRef.current = null;
    }
  }, [tasks]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [tasks]);

  // Status Change
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    lastUpdatedTaskIdRef.current = taskId;
    const targetTask = tasks.find((t) => t.id === taskId);
    const nextTasks: TimelineTask[] = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus, completed: newStatus === "done" } : t
    );

    const res = updateEvent(brief.id, { tasks: nextTasks });
    if (res.ok) {
      announce(`Task "${targetTask?.title || taskId}" updated to ${newStatus}`, "polite");
    }
  };

  // Add Task
  const handleAddTask = (newTask: TimelineTask) => {
    const nextTasks = [...tasks, newTask].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const res = updateEvent(brief.id, { tasks: nextTasks });
    if (res.ok) {
      announce(`Task added: ${newTask.title}`, "polite");
    }
  };

  // Delete Custom Task
  const handleDeleteCustomTask = (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    const nextTasks = tasks.filter((t) => t.id !== taskId);
    const res = updateEvent(brief.id, { tasks: nextTasks });
    if (res.ok) {
      announce(`Task deleted: ${targetTask?.title || taskId}`, "polite");
    }
  };

  // Regenerate Timeline
  const handleRegenerate = () => {
    const generated = generateTimeline(brief).tasks;
    const merged = mergeTimeline(tasks, generated);
    const res = updateEvent(brief.id, { tasks: merged });
    if (res.ok) {
      announce("Timeline regenerated with backward-scheduled milestones", "polite");
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (selectedCategory !== "all" && task.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (selectedStatus !== "all" && task.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [tasks, selectedCategory, selectedStatus]);

  // Group tasks
  const groups = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const partitioned: Record<TimelineGroupKey, TimelineTask[]> = {
      overdue: [],
      "this-week": [],
      "this-month": [],
      later: [],
      done: [],
    };

    for (const task of filteredTasks) {
      if (task.status === "done" || task.completed === true) {
        partitioned.done.push(task);
      } else {
        const diff = getDaysDifference(task.dueDate, today);
        if (diff < 0) {
          partitioned.overdue.push(task);
        } else if (diff <= 7) {
          partitioned["this-week"].push(task);
        } else if (diff <= 30) {
          partitioned["this-month"].push(task);
        } else {
          partitioned.later.push(task);
        }
      }
    }

    // Sort within each group by due date (critical tasks first on same day)
    for (const key of Object.keys(partitioned) as TimelineGroupKey[]) {
      partitioned[key].sort((a, b) => {
        const dateDiff = a.dueDate.localeCompare(b.dueDate);
        if (dateDiff !== 0) return dateDiff;
        if (a.isCritical && !b.isCritical) return -1;
        if (!a.isCritical && b.isCritical) return 1;
        return a.title.localeCompare(b.title);
      });
    }

    return partitioned;
  }, [filteredTasks]);

  return (
    <div className="np-timeline-view-container">
      <TimelineLead brief={brief} tasks={tasks} />

      <TimelineFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
      />

      <TimelineGroup
        groupKey="overdue"
        title="Overdue"
        tasks={groups.overdue}
        onStatusChange={handleStatusChange}
        onDeleteCustomTask={handleDeleteCustomTask}
      />

      <TimelineGroup
        groupKey="this-week"
        title="This Week"
        tasks={groups["this-week"]}
        onStatusChange={handleStatusChange}
        onDeleteCustomTask={handleDeleteCustomTask}
      />

      <TimelineGroup
        groupKey="this-month"
        title="This Month"
        tasks={groups["this-month"]}
        onStatusChange={handleStatusChange}
        onDeleteCustomTask={handleDeleteCustomTask}
      />

      <TimelineGroup
        groupKey="later"
        title="Later"
        tasks={groups.later}
        onStatusChange={handleStatusChange}
        onDeleteCustomTask={handleDeleteCustomTask}
      />

      <TimelineGroup
        groupKey="done"
        title="Done"
        tasks={groups.done}
        onStatusChange={handleStatusChange}
        onDeleteCustomTask={handleDeleteCustomTask}
      />

      <TimelineAddTaskForm onAddTask={handleAddTask} />

      <TimelineRegenerateModal onRegenerate={handleRegenerate} />
    </div>
  );
};

export default TimelineView;

