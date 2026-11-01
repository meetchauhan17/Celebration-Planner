import { EventBrief, TimelineTask, EventType } from "../domain";
import { TIMELINE_TEMPLATES, TaskTemplate } from "./timelineTemplates";

export interface FeasibilityReport {
  status: "comfortable" | "tight" | "very-tight";
  atRiskCount: number;
  compressedCount: number;
  remainingDays: number;
  summary: string;
  toString(): string;
  valueOf(): string;
}

export interface GeneratedTimeline {
  tasks: TimelineTask[];
  feasibility: FeasibilityReport;
}

const toMidnight = (d: Date | string): number => {
  const date = new Date(d);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

/**
 * Generates an event timeline backwards from the target event date.
 * Incorporates conditional tasks based on venue environment, dietary needs, and guest scale.
 * If the event is short-notice, dynamically applies compressed lead-time scaling.
 *
 * @param brief - The event brief containing date, event type, guest scale, and preferences.
 * @param today - Current reference date for timeline calculations (defaults to today).
 * @returns GeneratedTimeline containing scheduled milestone tasks and feasibility diagnostic report.
 */
export function generateTimeline(brief: EventBrief, today: Date | string = new Date()): GeneratedTimeline {
  const todayMs = toMidnight(today);
  const eventMs = toMidnight(brief.date);
  const remainingDays = Math.max(0, Math.round((eventMs - todayMs) / 86400000));

  // 1. Base task templates
  const templates: TaskTemplate[] = [...(TIMELINE_TEMPLATES[brief.type] || TIMELINE_TEMPLATES.wedding)];

  // 2. Conditional tasks
  if (brief.venueType === "outdoor") {
    templates.push({ title: "Arrange weather backup / tent", category: "Venue", leadTimeDays: 30, isCritical: true, minimumLeadDays: 7 });
  }
  if (brief.dietaryNeeds && brief.dietaryNeeds.length > 0) {
    templates.push({ title: `Plan separate menu for ${brief.dietaryNeeds.join(", ")}`, category: "Catering", leadTimeDays: 21, isCritical: true, minimumLeadDays: 7 });
  }
  if (brief.type === "community" && brief.guestCount > 200) {
    templates.push({ title: "Arrange crowd management and first-aid", category: "Safety", leadTimeDays: 20, isCritical: true, minimumLeadDays: 7 });
  }
  if (brief.guestCount > 150) {
    templates.push({ title: "Arrange parking or transport", category: "Operations", leadTimeDays: 25, isCritical: false, minimumLeadDays: 7 });
  }

  // 3. Classify overdue tasks vs normal tasks
  const overdueCritical: TaskTemplate[] = [];
  const overdueNormal: TaskTemplate[] = [];
  const scheduled: Array<{ template: TaskTemplate; dueMs: number }> = [];

  for (const t of templates) {
    const idealDueMs = eventMs - t.leadTimeDays * 86400000;
    if (idealDueMs < todayMs) {
      if (t.isCritical) overdueCritical.push(t);
      else overdueNormal.push(t);
    } else {
      scheduled.push({ template: t, dueMs: idealDueMs });
    }
  }

  // 4. Stagger overdue tasks across upcoming days (critical first, capped at eventDate)
  const allTasks: TimelineTask[] = [];
  let atRiskCount = 0;
  let compressedCount = overdueCritical.length + overdueNormal.length;

  const processTask = (t: TaskTemplate, dueMs: number, idx: number): TimelineTask => {
    const atRisk = remainingDays < t.minimumLeadDays;
    if (atRisk) atRiskCount++;
    const reason = atRisk ? `Requires at least ${t.minimumLeadDays} days, but only ${remainingDays} days remain.` : undefined;
    return {
      id: `task-${idx + 1}`,
      title: t.title,
      category: t.category,
      dueDate: new Date(dueMs).toISOString().split("T")[0],
      status: "todo",
      isCritical: t.isCritical,
      atRisk,
      reason,
    };
  };

  let counter = 0;
  // Overdue critical spread on day 0, 1, 2...
  overdueCritical.forEach((t, i) => {
    const staggerOffset = Math.min(i, remainingDays);
    const dueMs = Math.min(eventMs, todayMs + staggerOffset * 86400000);
    allTasks.push(processTask(t, dueMs, counter++));
  });

  // Overdue normal spread after critical
  overdueNormal.forEach((t, i) => {
    const staggerOffset = Math.min(overdueCritical.length + i, remainingDays);
    const dueMs = Math.min(eventMs, todayMs + staggerOffset * 86400000);
    allTasks.push(processTask(t, dueMs, counter++));
  });

  // Normal scheduled
  scheduled.forEach(({ template, dueMs }) => {
    allTasks.push(processTask(template, dueMs, counter++));
  });

  // 5. Sort all tasks by dueDate ascending
  allTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // 6. Feasibility computation
  let status: "comfortable" | "tight" | "very-tight" = "comfortable";
  if (atRiskCount >= 3 || remainingDays <= 14) {
    status = "very-tight";
  } else if (atRiskCount > 0 || compressedCount >= 2 || remainingDays <= 90) {
    status = "tight";
  }

  const summary = `Timeline is ${status} with ${remainingDays} days remaining (${atRiskCount} at risk, ${compressedCount} compressed).`;
  const feasibility: FeasibilityReport = {
    status,
    atRiskCount,
    compressedCount,
    remainingDays,
    summary,
    toString: () => status,
    valueOf: () => status,
  };

  return { tasks: allTasks, feasibility };
}

// Backward compatibility
export interface TimelineProgress {
  totalTasks: number;
  completedTasks: number;
  percentage: number;
  pendingTasks: number;
}

/**
 * Calculates aggregate task progress metrics across a collection of timeline tasks.
 *
 * @param tasks - Array of timeline tasks or partial task items.
 * @returns TimelineProgress with total, completed, percentage, and pending counts.
 */
export function calculateTaskProgress(tasks: Array<Partial<TimelineTask> & { status?: string; completed?: boolean }>): TimelineProgress {
  if (tasks.length === 0) return { totalTasks: 0, completedTasks: 0, percentage: 0, pendingTasks: 0 };
  const completed = tasks.filter((t) => t.status === "done" || t.completed === true).length;
  return { totalTasks: tasks.length, completedTasks: completed, percentage: Math.round((completed / tasks.length) * 100), pendingTasks: tasks.length - completed };
}

/**
 * Sorts timeline tasks chronologically by due date in ascending order.
 *
 * @param tasks - Array of timeline tasks to sort.
 * @returns A new array of tasks ordered by dueDate.
 */
export function sortTasksByDueDate(tasks: TimelineTask[]): TimelineTask[] {
  return [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

/**
 * Generates default planning milestone tasks for a given event date and event type.
 *
 * @param eventDateString - ISO date string of the event.
 * @param eventType - The celebration event type.
 * @returns Array of task milestone templates without system IDs.
 */
export function generateDefaultMilestones(eventDateString: string, eventType: EventType): Omit<TimelineTask, "id">[] {
  const dummyBrief: EventBrief = {
    id: "00000000-0000-0000-0000-000000000000",
    name: "Milestone Plan",
    type: eventType,
    date: eventDateString,
    guestCount: 100,
    totalBudget: 500000,
    currency: "INR",
    city: "Mumbai",
    cityTier: "metro",
    venueType: "indoor",
    priorities: [],
    dietaryNeeds: [],
    notes: "",
    createdAt: new Date().toISOString(),
  };
  return generateTimeline(dummyBrief, new Date("2026-01-01")).tasks.map(({ id: _, ...rest }) => rest);
}

/**
 * Merges existing timeline tasks with a newly regenerated set of tasks.
 * Preserves completed tasks (status === 'done' or completed === true)
 * and custom tasks (isCustom === true or custom ID), while replacing
 * uncompleted generated tasks with the newly regenerated ones.
 */
export function mergeTimeline(
  existing: TimelineTask[],
  regenerated: TimelineTask[]
): TimelineTask[] {
  // 1. Identify completed tasks and custom tasks to preserve
  const preservedCompleted = existing.filter(
    (t) => t.status === "done" || t.completed === true
  );
  const preservedCustom = existing.filter(
    (t) => (t.isCustom || t.id.startsWith("custom-")) && t.status !== "done" && !t.completed
  );

  // Set of identifiers for completed tasks (by title or ID) so regenerated tasks don't duplicate them
  const completedTitles = new Set(
    preservedCompleted.map((t) => t.title.toLowerCase().trim())
  );
  const completedIds = new Set(preservedCompleted.map((t) => t.id));

  // 2. Filter regenerated tasks to exclude any that duplicate already-completed tasks
  const newGenerated = regenerated.filter(
    (t) => !completedTitles.has(t.title.toLowerCase().trim()) && !completedIds.has(t.id)
  );

  // 3. Combine and sort chronologically by dueDate
  const combined = [...preservedCompleted, ...preservedCustom, ...newGenerated];
  return combined.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

