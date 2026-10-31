import { BudgetLine, EventType, Priority, VenueType, CityTier, EventBrief } from "../domain";

/**
 * Base allocation percentages per celebration event type.
 * Industry-standard allocations summing to exactly 100%.
 */
export const BASE_ALLOCATIONS = {
  wedding: { venue: 25, catering: 30, decor: 10, photography: 10, attire: 8, entertainment: 6, invitations: 3, transport: 3, contingency: 5 },
  birthday: { venue: 20, catering: 35, decor: 12, entertainment: 15, cake: 6, photography: 4, "return-gifts": 4, contingency: 4 },
  community: { venue: 20, catering: 30, "sound-and-lighting": 12, "permits-and-safety": 8, promotion: 10, entertainment: 10, supplies: 5, contingency: 5 },
} as const;

export const PRIORITY_BOOST_POINTS = 3; // Points added per selected priority
export const MIN_CONTINGENCY_PERCENT = 4; // Non-negotiable contingency floor
export const OUTDOOR_PRODUCTION_POINTS = 2; // Extra decor/sound-and-lighting for outdoor weather resilience
export const OUTDOOR_CONTINGENCY_POINTS = 1; // Weather risk buffer for outdoor venues
export const HYBRID_CONTINGENCY_POINTS = 1; // Weather buffer for hybrid indoor/outdoor setups
export const METRO_VENUE_SHIFT = 3; // Shift towards venue due to high real-estate rates
export const TOWN_VENUE_SHIFT = -3; // Shift towards hospitality/catering in lower-cost venue towns
export const OVER_BUDGET_RATIO = 1.1; // 10% threshold to flag actual expenditure as "over"

export const CATERING_FLOOR_PER_GUEST: Record<EventType, number> = {
  wedding: 600,
  birthday: 400,
  community: 250,
};

export interface GenerateBudgetInput {
  type: EventType;
  totalBudget: number;
  guestCount: number;
  priorities?: Priority[];
  venueType?: VenueType;
  cityTier?: CityTier;
}

export interface BudgetPlanResult {
  lines: BudgetLine[];
  warnings: string[];
  perGuestCost: number;
  allocations: Record<string, number>;
}

export function generateBudget(input: GenerateBudgetInput): BudgetPlanResult {
  const { type, totalBudget, guestCount, priorities = [], venueType, cityTier } = input;
  const warnings: string[] = [];
  const alloc: Record<string, number> = { ...BASE_ALLOCATIONS[type] };

  // 1. Priorities Adjustment (+3 per priority taken proportionally from non-priority categories, contingency >= 4%)
  const boosted = new Set<string>();
  for (const p of priorities) {
    if (p === "food") {
      if ("cake" in alloc) { alloc.catering += 2; alloc.cake += 1; boosted.add("catering"); boosted.add("cake"); }
      else { alloc.catering += PRIORITY_BOOST_POINTS; boosted.add("catering"); }
    } else if (p === "venue") { alloc.venue += PRIORITY_BOOST_POINTS; boosted.add("venue"); }
    else if (p === "decor") {
      const target = "decor" in alloc ? "decor" : "sound-and-lighting";
      if (target in alloc) { alloc[target] += PRIORITY_BOOST_POINTS; boosted.add(target); }
    } else if (p === "entertainment") {
      if ("entertainment" in alloc) { alloc.entertainment += PRIORITY_BOOST_POINTS; boosted.add("entertainment"); }
    } else if (p === "photography") {
      if ("photography" in alloc) { alloc.photography += PRIORITY_BOOST_POINTS; boosted.add("photography"); }
    } else if (p === "guest-comfort") {
      if ("transport" in alloc) { alloc.transport += 2; alloc.venue += 1; boosted.add("transport"); boosted.add("venue"); }
      else { alloc.venue += PRIORITY_BOOST_POINTS; boosted.add("venue"); }
    }
    const nonPriority = Object.keys(alloc).filter((c) => !boosted.has(c));
    const avail = nonPriority.reduce((sum, c) => sum + (c === "contingency" ? Math.max(0, alloc[c] - MIN_CONTINGENCY_PERCENT) : Math.max(0, alloc[c])), 0);
    if (avail > 0) {
      for (const c of nonPriority) {
        const pool = c === "contingency" ? Math.max(0, alloc[c] - MIN_CONTINGENCY_PERCENT) : Math.max(0, alloc[c]);
        alloc[c] -= PRIORITY_BOOST_POINTS * (pool / avail);
      }
    }
  }

  // 2. Venue Type Adjustment
  if (venueType === "outdoor") {
    const target = "sound-and-lighting" in alloc ? "sound-and-lighting" : "decor";
    if (target in alloc) alloc[target] += OUTDOOR_PRODUCTION_POINTS;
    alloc.contingency += OUTDOOR_CONTINGENCY_POINTS;
  } else if (venueType === "hybrid") {
    alloc.contingency += HYBRID_CONTINGENCY_POINTS;
  }

  // 3. City Tier Adjustment
  if (cityTier === "metro") { alloc.venue += METRO_VENUE_SHIFT; alloc.catering -= METRO_VENUE_SHIFT; }
  else if (cityTier === "town") { alloc.venue += TOWN_VENUE_SHIFT; alloc.catering -= TOWN_VENUE_SHIFT; }

  // Renormalize to exactly 100% & maintain contingency floor >= 4%
  const sumBefore = Object.values(alloc).reduce((a, b) => a + b, 0);
  if (sumBefore > 0) for (const k of Object.keys(alloc)) alloc[k] = (alloc[k] / sumBefore) * 100;
  if (alloc.contingency < MIN_CONTINGENCY_PERCENT) {
    const def = MIN_CONTINGENCY_PERCENT - alloc.contingency;
    alloc.contingency = MIN_CONTINGENCY_PERCENT;
    const largestNonContingency = Object.keys(alloc).filter((k) => k !== "contingency").sort((a, b) => alloc[b] - alloc[a])[0];
    if (largestNonContingency) alloc[largestNonContingency] -= def;
  }

  // 4. Per-guest Sanity Check (Catering Floor)
  const floor = CATERING_FLOOR_PER_GUEST[type];
  const currentCateringPerGuest = guestCount > 0 ? ((alloc.catering / 100) * totalBudget) / guestCount : 0;
  if (currentCateringPerGuest < floor && guestCount > 0) {
    let defPct = (((floor * guestCount) - ((alloc.catering / 100) * totalBudget)) / totalBudget) * 100;
    let pulled = 0;
    for (const donor of ["decor", "entertainment"]) {
      if (donor in alloc && alloc[donor] > 0 && defPct > 0) {
        const pull = Math.min(alloc[donor], defPct);
        alloc[donor] -= pull;
        defPct -= pull;
        pulled += pull;
      }
    }
    alloc.catering += pulled;
    warnings.push(`Catering allocation (₹${Math.round(currentCateringPerGuest)}/guest) is below the minimum floor of ₹${floor}/guest for ${type}. Reallocated budget from decor/entertainment.`);
  }

  // Whole currency unit rounding summing EXACTLY to totalBudget
  const lines: BudgetLine[] = [];
  let totalAllocated = 0;
  let largestCat = Object.keys(alloc)[0];
  let maxAlloc = -1;
  for (const [category, pct] of Object.entries(alloc)) {
    const plannedAmount = Math.round((pct / 100) * totalBudget);
    totalAllocated += plannedAmount;
    if (plannedAmount > maxAlloc) { maxAlloc = plannedAmount; largestCat = category; }
    lines.push({ category, plannedAmount, note: `Planned ${pct.toFixed(1)}% allocation` });
  }
  const remainder = totalBudget - totalAllocated;
  if (remainder !== 0) {
    const line = lines.find((l) => l.category === largestCat);
    if (line) line.plannedAmount += remainder;
  }

  const perGuestCost = guestCount > 0 ? Math.round((totalBudget / guestCount) * 100) / 100 : totalBudget;
  return { lines, warnings, perGuestCost, allocations: alloc };
}

export const generateBudgetPlan = generateBudget;

export interface BudgetSummaryReport {
  plannedTotal: number;
  actualTotal: number;
  variance: number;
  overCategories: string[];
}

export function summarizeBudget(lines: BudgetLine[]): BudgetSummaryReport {
  let plannedTotal = 0;
  let actualTotal = 0;
  const overCategories: string[] = [];
  for (const line of lines) {
    plannedTotal += line.plannedAmount;
    const actual = line.actualAmount ?? 0;
    actualTotal += actual;
    if (actual > line.plannedAmount * OVER_BUDGET_RATIO) overCategories.push(line.category);
  }
  return { plannedTotal, actualTotal, variance: actualTotal - plannedTotal, overCategories };
}

export interface RebalanceResult {
  success: boolean;
  lines: BudgetLine[];
  error?: string;
}

/**
 * Rebalances planned category amounts when a user adjusts a category.
 * Takes/adds the difference from contingency first (enforcing >= 4% floor),
 * then from the largest other category. Refuses negative values or 4% floor violations.
 */
export function rebalance(
  lines: BudgetLine[],
  category: string,
  newAmount: number
): RebalanceResult {
  if (newAmount < 0) {
    return {
      success: false,
      lines,
      error: "Planned amount cannot be negative.",
    };
  }

  const roundedNewAmount = Math.round(newAmount);
  const targetIndex = lines.findIndex(
    (l) => l.category.toLowerCase() === category.toLowerCase()
  );

  if (targetIndex === -1) {
    return {
      success: false,
      lines,
      error: `Category "${category}" not found.`,
    };
  }

  const currentAmount = lines[targetIndex].plannedAmount;
  const delta = roundedNewAmount - currentAmount;

  if (delta === 0) {
    return { success: true, lines: lines.map((l) => ({ ...l })) };
  }

  const totalBudget = lines.reduce((sum, l) => sum + l.plannedAmount, 0);
  const minContingency = Math.round(totalBudget * (MIN_CONTINGENCY_PERCENT / 100));

  // Deep clone lines
  const updatedLines = lines.map((l) => ({ ...l }));
  const targetLine = updatedLines[targetIndex];
  const isContingency = targetLine.category.toLowerCase() === "contingency";

  const contingencyLine = updatedLines.find(
    (l) => l.category.toLowerCase() === "contingency"
  );

  if (isContingency) {
    if (roundedNewAmount < minContingency) {
      return {
        success: false,
        lines,
        error: `Contingency cannot be reduced below 4% of total budget (₹${minContingency.toLocaleString()}).`,
      };
    }

    const otherCandidates = updatedLines
      .filter((l) => l.category.toLowerCase() !== "contingency")
      .sort((a, b) => b.plannedAmount - a.plannedAmount);

    if (otherCandidates.length === 0) {
      return { success: false, lines, error: "No other categories available to rebalance." };
    }

    const largestOther = otherCandidates[0];
    if (delta > 0 && largestOther.plannedAmount < delta) {
      return {
        success: false,
        lines,
        error: `Cannot increase contingency: category "${largestOther.category}" has insufficient funds.`,
      };
    }

    targetLine.plannedAmount = roundedNewAmount;
    largestOther.plannedAmount -= delta;
    return { success: true, lines: updatedLines };
  }

  if (!contingencyLine) {
    return { success: false, lines, error: "Contingency line not found in budget." };
  }

  if (delta > 0) {
    const availFromContingency = Math.max(0, contingencyLine.plannedAmount - minContingency);
    const takeFromContingency = Math.min(delta, availFromContingency);
    const remainingDelta = delta - takeFromContingency;

    if (remainingDelta > 0) {
      const otherCandidates = updatedLines
        .filter(
          (l) =>
            l.category.toLowerCase() !== targetLine.category.toLowerCase() &&
            l.category.toLowerCase() !== "contingency"
        )
        .sort((a, b) => b.plannedAmount - a.plannedAmount);

      if (otherCandidates.length === 0 || otherCandidates[0].plannedAmount < remainingDelta) {
        return {
          success: false,
          lines,
          error: "Cannot increase allocation: insufficient funds in contingency and other categories without causing negative values or violating the 4% contingency floor.",
        };
      }

      otherCandidates[0].plannedAmount -= remainingDelta;
    }

    contingencyLine.plannedAmount -= takeFromContingency;
    targetLine.plannedAmount = roundedNewAmount;
  } else {
    const surplus = Math.abs(delta);
    contingencyLine.plannedAmount += surplus;
    targetLine.plannedAmount = roundedNewAmount;
  }

  return { success: true, lines: updatedLines };
}

/**
 * Generates 3-5 editorial, plain-language notes explaining why the allocation
 * looks the way it does based on the event brief parameters.
 */
export function explainAllocation(brief: EventBrief): string[] {
  const reasons: string[] = [];

  // 1. Base Event Type Allocation
  if (brief.type === "wedding") {
    reasons.push("Weddings designate hospitality (catering 30%) and venue (25%) as primary anchors.");
  } else if (brief.type === "birthday") {
    reasons.push("Birthdays prioritize guest dining (catering 35%) and entertainment (15%) alongside dedicated cake provisions.");
  } else if (brief.type === "community") {
    reasons.push("Community gatherings allocate funds across venue (20%), catering (30%), sound and lighting (12%), and permits/safety (8%).");
  }

  // 2. City Tier
  if (brief.cityTier === "metro") {
    reasons.push("Venue gets a larger share because you chose a metro city where property rates are elevated.");
  } else if (brief.cityTier === "town") {
    reasons.push("Catering receives a larger share because venue rental rates in town locations are lower.");
  }

  // 3. Venue Type
  if (brief.venueType === "outdoor") {
    reasons.push("Outdoor venue selection introduces extra budget for weather resilience and contingency.");
  } else if (brief.venueType === "hybrid") {
    reasons.push("Hybrid venue selection reserves contingency for indoor and outdoor logistical transitions.");
  }

  // 4. Priorities
  if (brief.priorities && brief.priorities.length > 0) {
    const p = brief.priorities[0];
    if (p === "food") {
      reasons.push("Catering allocation received a boost based on your stated priority for food.");
    } else if (p === "venue") {
      reasons.push("Venue allocation received priority funding to secure preferred booking options.");
    } else if (p === "decor") {
      reasons.push("Decor and atmosphere allocations received priority funding.");
    } else if (p === "entertainment") {
      reasons.push("Entertainment was augmented to support dedicated performance programming.");
    } else if (p === "photography") {
      reasons.push("Photography allocation was expanded for comprehensive coverage.");
    } else if (p === "guest-comfort") {
      reasons.push("Allocations were shifted towards guest comfort, transport, and facility support.");
    }
  }

  // 5. Catering Floor Check
  const floor = CATERING_FLOOR_PER_GUEST[brief.type];
  const alloc = BASE_ALLOCATIONS[brief.type];
  const cateringPct = alloc.catering;
  const currentCateringPerGuest =
    brief.guestCount > 0 ? ((cateringPct / 100) * brief.totalBudget) / brief.guestCount : 0;
  if (currentCateringPerGuest < floor && brief.guestCount > 0) {
    reasons.push(`Catering allocation was safeguarded to maintain the minimum threshold of ₹${floor}/guest.`);
  }

  // 6. Guarantee at least 3 reasons
  if (reasons.length < 3) {
    reasons.push("A mandatory 4% contingency reserve is maintained to absorb unforeseen expenses.");
  }

  return reasons.slice(0, 5);
}

export { calculateBudgetSummary, recommendCategoryAllocations } from "./legacyBudget";
export type { BudgetSummary } from "./legacyBudget";
