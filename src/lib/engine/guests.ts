import { Guest } from "../domain/plan";

export interface GuestCounts {
  invited: number; // total guest entries + sum(plusOnes) OR total guest entries? Wait, let's see
  guestEntries: number; // raw number of Guest items
  confirmed: number; // yes + plusOnes of yes guests
  declined: number; // no + plusOnes of no guests (or just 'no' guests? usually 'no' doesn't bring plus-ones, but let's check)
  pending: number; // pending + plusOnes of pending
  plusOnesConfirmed: number;
}

export interface DietCount {
  diet: string;
  count: number;
}

/**
 * Calculates catering headcount: confirmed headcount + 10% buffer rounded up (Math.ceil).
 * Confirmed headcount is sum of (1 + plusOnes) for all guests with rsvp === "yes".
 */
export function cateringHeadcount(guests: Guest[]): number {
  const confirmed = guests
    .filter((g) => g.rsvp === "yes")
    .reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);
  
  if (confirmed === 0) return 0;
  return Math.ceil(confirmed * 1.1);
}

export interface GuestSummary {
  totalInvited: number;
  totalInvitedHeadcount: number;
  confirmedHeadcount: number;
  declinedCount: number;
  pendingHeadcount: number;
  suggestedCatering: number;
}

/**
 * Summarizes RSVP and guest counts.
 * Calculates confirmed headcount (including +1s), declined count,
 * pending headcount, and recommended catering quantity with buffer.
 *
 * @param guests - Array of guest records.
 * @returns GuestSummary with aggregated attendance and catering metrics.
 */
export function summarizeGuests(guests: Guest[]): GuestSummary {
  let confirmedHeadcount = 0;
  let declinedCount = 0;
  let pendingHeadcount = 0;
  let totalInvitedHeadcount = 0;

  for (const g of guests) {
    const head = 1 + (g.plusOnes || 0);
    totalInvitedHeadcount += head;
    if (g.rsvp === "yes") {
      confirmedHeadcount += head;
    } else if (g.rsvp === "no") {
      declinedCount += 1;
    } else {
      pendingHeadcount += head;
    }
  }

  return {
    totalInvited: guests.length,
    totalInvitedHeadcount,
    confirmedHeadcount,
    declinedCount,
    pendingHeadcount,
    suggestedCatering: cateringHeadcount(guests),
  };
}

/**
 * Computes dietary breakdown for confirmed guests.
 * Groups special dietary requirements and counts total affected attendees including plus-ones.
 *
 * @param guests - Array of guest records.
 * @returns Array of DietCount sorted by popularity in descending order.
 */
export function getDietaryBreakdown(guests: Guest[]): DietCount[] {
  const counts: Record<string, number> = {};
  
  const confirmedGuests = guests.filter((g) => g.rsvp === "yes");
  for (const g of confirmedGuests) {
    const diet = (g.dietary || "").trim();
    if (!diet || diet.toLowerCase() === "none") {
      continue;
    }
    const head = 1 + (g.plusOnes || 0);
    counts[diet] = (counts[diet] || 0) + head;
  }

  return Object.entries(counts)
    .map(([diet, count]) => ({ diet, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Sanitizes a cell string against CSV formula injection (DDE attacks).
 * If a cell begins with '=', '+', '-', or '@', prefixes it with a single quote (').
 */
export function sanitizeCsvCell(cell: string | number | undefined | null): string {
  if (cell === null || cell === undefined) return "";
  let str = String(cell).trim();
  
  if (/^[=+\-@]/.test(str)) {
    str = "'" + str;
  }

  // If contains comma, quote, or newline, escape quotes and wrap in quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports guests list to CSV format with proper header and cell sanitization.
 */
export function exportGuestsToCsv(guests: Guest[]): string {
  const headers = ["Name", "Group", "RSVP", "Dietary", "Plus Ones"];
  const rows = guests.map((g) => [
    sanitizeCsvCell(g.name),
    sanitizeCsvCell(g.group),
    sanitizeCsvCell(g.rsvp),
    sanitizeCsvCell(g.dietary || "None"),
    sanitizeCsvCell(g.plusOnes),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}

