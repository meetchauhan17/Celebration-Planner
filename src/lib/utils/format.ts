import { PlannedEvent } from "../domain";

/**
 * Format a number as currency, defaulting to Indian Rupee (₹).
 */
export function formatCurrency(amount: number, currency = "INR"): string {
  const rounded = Math.round(amount);
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${rounded.toLocaleString("en-IN")}`;
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into an editorial human-readable format.
 * Avoids timezone drift by parsing components directly.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  return dateStr;
}

const TIMELINE_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Formats a date into consistent, unambiguous format e.g. "12 Mar 2027".
 */
export function formatTimelineDate(dateStr: string): string {
  if (!dateStr) return "";
  const clean = dateStr.split("T")[0];
  const parts = clean.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const month = TIMELINE_MONTHS[monthIdx] || parts[1];
    return `${day} ${month} ${year}`;
  }
  return dateStr;
}

/**
 * Calculates remaining days from today to the target ISO date.
 * Positive = future, 0 = today, negative = past.
 */
export function getDaysDifference(targetDateStr: string, today = new Date()): number {
  if (!targetDateStr) return 0;
  const parts = targetDateStr.split("-");
  let targetMidnight: number;
  if (parts.length === 3) {
    targetMidnight = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    ).getTime();
  } else {
    const d = new Date(targetDateStr);
    targetMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();

  return Math.round((targetMidnight - todayMidnight) / (1000 * 60 * 60 * 24));
}

/**
 * Returns human-readable label for days remaining or elapsed.
 */
export function formatDaysRemaining(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "1 day left";
  if (days > 1) return `${days} days left`;
  if (days === -1) return "1 day ago";
  return `${Math.abs(days)} days ago`;
}

export interface EventProgressSummary {
  totalTasks: number;
  completedTasks: number;
  taskPercent: number;
  totalVendors: number;
  bookedVendors: number;
  vendorPercent: number;
  confirmedGuests: number;
  totalGuests: number;
}

/**
 * Computes progress stats across tasks, vendors, and RSVPs for an event.
 */
export function calculateEventProgress(event: PlannedEvent): EventProgressSummary {
  const totalTasks = event.tasks.length;
  const completedTasks = event.tasks.filter(
    (t) => t.status === "done" || t.completed === true
  ).length;
  const taskPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalVendors = event.vendors.length;
  const bookedVendors = event.vendors.filter(
    (v) => v.status === "booked" || v.status === "paid"
  ).length;
  const vendorPercent =
    totalVendors > 0 ? Math.round((bookedVendors / totalVendors) * 100) : 0;

  const totalGuests = event.guests.length;
  const confirmedGuests = event.guests.filter((g) => g.rsvp === "yes").length;

  return {
    totalTasks,
    completedTasks,
    taskPercent,
    totalVendors,
    bookedVendors,
    vendorPercent,
    confirmedGuests,
    totalGuests,
  };
}

