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

/**
 * Summarizes RSVP and guest counts.
 * Note:
 * - confirmed headcount: guests with rsvp === "yes", counting 1 + (g.plusOnes || 0)
 * - declined headcount: guests with rsvp === "no"
 * - pending headcount: guests with rsvp === "pending" + their plusOnes
 * - total invited: total headcount represented across all invitations (yes + pending + no)
 */
export function summarizeGuests(guests: Guest[]) {
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
      // In events, declined invitations typically represent the person (and decline their plus-ones)
      // or the whole group headcount. Let's count 1 + plusOnes or 1: counting head covers all seats offered.
      declinedCount += 1;
    } else {
      pendingHeadcount += head;
    }
  }

  return {
    totalInvited: guests.length, // or total invitations
    totalInvitedHeadcount,
    confirmedHeadcount,
    declinedCount,
    pendingHeadcount,
    suggestedCatering: cateringHeadcount(guests),
  };
}

/**
 * Computes dietary breakdown for confirmed guests.
 * If dietary is empty, "none", or undefined, it's grouped under "Standard / None" or excluded from special diets.
 */
export function getDietaryBreakdown(guests: Guest[]): DietCount[] {
  const counts: Record<string, number> = {};
  
  const confirmedGuests = guests.filter((g) => g.rsvp === "yes");
  for (const g of confirmedGuests) {
    const diet = (g.dietary || "").trim();
    if (!diet || diet.toLowerCase() === "none") {
      continue;
    }
    // A guest with plus-ones: plusOnes count toward total head, but usually diet is specified for the primary guest
    // Unless indicated otherwise, 1 headcount per specified diet, or 1 + plusOnes.
    // In celebration planning, diet counts are 1 per guest entry unless plusOnes share it.
    // Counting 1 + plusOnes or 1: usually diet applies to the primary guest. Let's count 1 + plusOnes or 1.
    // Actually, 1 + plusOnes: if someone says "Vegan" with +1, is the +1 vegan?
    // Most simple systems count 1 (the guest). But let's count 1 + (plusOnes if any) or 1?
    // Let's count 1 + (g.plusOnes || 0) so the headcount matches confirmed, or count each diet explicitly.
    // Wait, let's count 1 per guest with that diet (or 1 + plusOnes). Let's count 1 + (g.plusOnes || 0).
    // Actually, let's see what user says: "per-diet breakdown (e.g., 'Vegetarian: 34, Jain: 8, Vegan: 3')".
    // If a guest has 1 + plusOnes, counting 1 + (g.plusOnes || 0) ensures total diet breakdown accounts for all heads!
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

