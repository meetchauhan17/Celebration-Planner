import type { EventType } from "../domain/types";
import { FALLBACK_IDEAS, type IdeaFocus, type IdeaItem } from "./fallbackIdeas";

export { type IdeaFocus, type IdeaItem };

/**
 * Returns deterministic template ideas for an event type and focus category.
 */
export function getFallbackIdeas(
  eventType?: EventType | string,
  focus?: IdeaFocus | string
): IdeaItem[] {
  const safeType: EventType =
    eventType === "wedding" || eventType === "birthday" || eventType === "community"
      ? eventType
      : "wedding";

  const safeFocus: IdeaFocus =
    focus === "theme" || focus === "menu" || focus === "activities" || focus === "decor" || focus === "surprises"
      ? focus
      : "theme";

  return FALLBACK_IDEAS[safeType][safeFocus];
}

/**
 * Generates a concise, deterministic rule-based response summarizing next due
 * tasks, over-budget lines, and concrete planning actions (under 180 words).
 */
export function getFallbackAssistantReply(
  eventSummary?: string,
  query?: string
): string {
  const parts: string[] = [];

  if (query && query.trim().length > 0) {
    const qLower = query.toLowerCase();
    if (qLower.includes("budget") || qLower.includes("cost") || qLower.includes("money")) {
      parts.push("Focus on finalizing your major expenditure categories first (venue and catering).");
    } else if (qLower.includes("vendor") || qLower.includes("book")) {
      parts.push("Lock in critical vendors with deposits before confirming secondary services.");
    } else if (qLower.includes("timeline") || qLower.includes("when") || qLower.includes("task")) {
      parts.push("Tackle at-risk and overdue tasks sequentially to avoid last-minute crunches.");
    }
  }

  if (eventSummary && eventSummary.trim().length > 0) {
    // Check for alerts in eventSummary
    const lines = eventSummary.split("\n");
    const taskAlertLine = lines.find((l) => l.startsWith("Overdue or At-Risk Tasks:"));
    const budgetAlertLine = lines.find((l) => l.startsWith("Budget Breakdown:"));

    if (taskAlertLine && !taskAlertLine.includes("None")) {
      const taskContent = taskAlertLine.replace("Overdue or At-Risk Tasks:", "").trim();
      parts.push(`Action required on priority tasks: ${taskContent}.`);
    }

    if (budgetAlertLine) {
      // Find any categories where actual exceeds planned
      const items = budgetAlertLine.replace("Budget Breakdown:", "").split(";");
      const overBudget: string[] = [];
      for (const item of items) {
        const match = item.match(/([a-zA-Z-]+):\s*planned\s*(\d+)(?:,\s*actual\s*(\d+))?/);
        if (match && match[3]) {
          const planned = parseInt(match[2], 10);
          const actual = parseInt(match[3], 10);
          if (actual > planned) {
            overBudget.push(`${match[1]} (+${actual - planned})`);
          }
        }
      }
      if (overBudget.length > 0) {
        parts.push(`Budget alert: actual spending exceeds planned in ${overBudget.join(", ")}.`);
      }
    }
  }

  if (parts.length === 0) {
    parts.push(
      "All systems are currently on track. Review your vendor checklist, confirm guest RSVPs, and tackle your next scheduled tasks to maintain steady progress."
    );
  } else {
    parts.push("Review vendor quotes and timeline milestones to maintain steady planning progress.");
  }

  return parts.join(" ");
}

