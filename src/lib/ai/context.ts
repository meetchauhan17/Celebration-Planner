import type { PlannedEvent, BudgetLine, TimelineTask, VendorItem, Guest } from "../domain/plan";
import type { EventBrief } from "../domain/brief";

export type EventInput =
  | PlannedEvent
  | {
      brief: EventBrief;
      budgetLines?: BudgetLine[];
      tasks?: TimelineTask[];
      vendors?: VendorItem[];
      guests?: Guest[];
    }
  | (Partial<EventBrief> & {
      budgetLines?: BudgetLine[];
      tasks?: TimelineTask[];
      vendors?: VendorItem[];
      guests?: Guest[];
    });

/**
 * Builds a compact, privacy-safe text summary of an event for AI model prompts.
 * PRIVACY RULE: Never include guest names or contact details. Only aggregate counts.
 */
export function buildEventContext(event: EventInput, today: Date = new Date()): string {
  const brief = "brief" in event && event.brief ? event.brief : (event as Partial<EventBrief>);
  const budgetLines = event.budgetLines ?? [];
  const tasks = event.tasks ?? [];
  const vendors = event.vendors ?? [];
  const guests = event.guests ?? [];

  const type = brief.type ?? "celebration";
  const dateStr = brief.date ?? "unspecified";
  const eventDate = brief.date ? new Date(brief.date) : null;
  const daysRemaining = eventDate && !isNaN(eventDate.getTime())
    ? Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : "unknown";

  const guestCount = brief.guestCount ?? 0;
  const totalBudget = brief.totalBudget ?? 0;
  const currency = brief.currency ?? "INR";
  const perGuest = guestCount > 0 ? Math.round(totalBudget / guestCount) : 0;

  // Guest RSVP aggregate counts (no individual names or personal info)
  const rsvpCounts = { yes: 0, no: 0, pending: 0 };
  const dietaryCounts: Record<string, number> = {};
  for (const g of guests) {
    if (g.rsvp in rsvpCounts) rsvpCounts[g.rsvp as keyof typeof rsvpCounts]++;
    if (g.dietary) {
      const diet = g.dietary.trim().toLowerCase();
      dietaryCounts[diet] = (dietaryCounts[diet] || 0) + 1 + (g.plusOnes || 0);
    }
  }

  // Budget planned vs actual summary
  const budgetSummary = budgetLines.length > 0
    ? budgetLines
        .map((l) => `${l.category}: planned ${l.plannedAmount}${l.actualAmount !== undefined ? `, actual ${l.actualAmount}` : ""}`)
        .join("; ")
    : "No budget lines recorded";

  // Overdue / at-risk tasks
  const todayMs = today.getTime();
  const alertTasks = tasks.filter((t) => {
    if (t.status === "done") return false;
    if (t.atRisk) return true;
    const dueMs = new Date(t.dueDate).getTime();
    return !isNaN(dueMs) && dueMs < todayMs;
  });

  const taskAlertsSummary = alertTasks.length > 0
    ? alertTasks
        .map((t) => {
          const isOverdue = !isNaN(new Date(t.dueDate).getTime()) && new Date(t.dueDate).getTime() < todayMs;
          const statusLabel = t.atRisk && isOverdue ? "overdue & at-risk" : t.atRisk ? "at-risk" : "overdue";
          return `"${t.title}" (${statusLabel}, due ${t.dueDate})`;
        })
        .join("; ")
    : "None";

  // Vendor status counts (no vendor contact details or names)
  const vendorCounts = { "to-contact": 0, quoted: 0, booked: 0, paid: 0 };
  for (const v of vendors) {
    if (v.status in vendorCounts) vendorCounts[v.status as keyof typeof vendorCounts]++;
  }
  const vendorSummary = `to-contact: ${vendorCounts["to-contact"]}, quoted: ${vendorCounts.quoted}, booked: ${vendorCounts.booked}, paid: ${vendorCounts.paid}`;

  const lines = [
    `Event Type: ${type}`,
    `Date: ${dateStr} (${daysRemaining} days remaining)`,
    `Guest Count: ${guestCount} (RSVPs: ${rsvpCounts.yes} confirmed, ${rsvpCounts.pending} pending, ${rsvpCounts.no} declined)`,
    `Budget: ${totalBudget} ${currency} (Per-Guest: ${perGuest} ${currency})`,
    `City Tier: ${brief.cityTier ?? "unspecified"}`,
    `Venue Type: ${brief.venueType ?? "unspecified"}`,
    `Priorities: ${(brief.priorities ?? []).join(", ") || "none specified"}`,
    `Dietary Needs: ${(brief.dietaryNeeds ?? []).join(", ") || "none specified"}${
      Object.keys(dietaryCounts).length > 0
        ? ` (Guest reported: ${Object.entries(dietaryCounts).map(([k, v]) => `${k}: ${v}`).join(", ")})`
        : ""
    }`,
    `Budget Breakdown: ${budgetSummary}`,
    `Overdue or At-Risk Tasks: ${taskAlertsSummary}`,
    `Vendor Status Summary: ${vendorSummary}`,
  ];

  return lines.join("\n");
}

