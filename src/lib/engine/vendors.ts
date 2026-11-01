import {
  EventBrief,
  VendorItem,
  VendorStatus,
  Vendor,
  VendorCategory,
  BudgetLine,
  TimelineTask,
} from "../domain";
import { BASE_VENDORS, VendorTemplate } from "./vendorTemplates";

export interface VendorProgress {
  total: number;
  counts: Record<VendorStatus, number>;
  booked: number;
  percentBooked: number;
}

/**
 * Generates initial vendor checklist items based on event type, venue setting, and scale.
 *
 * @param brief - The event brief configuration.
 * @returns Array of VendorItem ready to be tracked in the event store.
 */
export function generateVendorChecklist(brief: EventBrief): VendorItem[] {
  const templates: VendorTemplate[] = [...(BASE_VENDORS[brief.type] || BASE_VENDORS.wedding)];

  // Conditionals
  if (brief.venueType === "outdoor") {
    templates.push(
      {
        category: "Infrastructure",
        label: "Weatherproof Tent & Canopy Rental",
        whatToAsk: "1. Are waterproof side-walls included in case of sudden rain? 2. What wind speeds can the canopy endure? 3. Does the quote include staking and weights?",
      },
      {
        category: "Power",
        label: "Heavy-Duty Power Generator Rental",
        whatToAsk: "1. Is a backup generator included on standby? 2. What is the total kVA rating? 3. Is a certified technician stationed on-site throughout?",
      }
    );
  }

  if (brief.guestCount > 300) {
    templates.push(
      {
        category: "Staffing",
        label: "Additional Catering & Hospitality Staff",
        whatToAsk: "1. What is your server-to-guest ratio for 300+ guests? 2. Are uniform dress codes standardized? 3. Who coordinates table water refills?",
      },
      {
        category: "Safety",
        label: "Crowd Barriers & Security Marshals",
        whatToAsk: "1. How many linear meters of barricades are provided? 2. Are licensed security personnel included? 3. Can you manage queue ingress flow?",
      }
    );
  }

  if (brief.venueType === "hybrid") {
    templates.push({
      category: "Operations",
      label: "Indoor & Outdoor Contingency Logistics",
      whatToAsk: "1. What is the transition time to move guests indoors if weather turns? 2. Is duplicate PA equipment available? 3. Who makes the weather call?",
    });
  }

  if (brief.priorities?.includes("photography")) {
    templates.push({
      category: "Photography",
      label: "Second Shooter & Drone Cinematographer",
      whatToAsk: "1. Do you possess licensed drone flight clearance? 2. How many hours of second-shooter coverage are included? 3. Are raw cinematic files supplied?",
    });
  }

  if (brief.dietaryNeeds && brief.dietaryNeeds.length > 0) {
    templates.push({
      category: "Catering",
      label: "Specialty Caterer & Labelled Menu Consultant",
      whatToAsk: `1. Can you prepare dedicated, isolated stations for ${brief.dietaryNeeds.join(", ")}? 2. Are dishes labelled with clear dietary allergen placards? 3. Do chefs use separate kitchen utensils?`,
    });
  }

  return templates.map((t, idx) => ({
    id: `ven-${idx + 1}`,
    category: t.category,
    label: t.label,
    status: "to-contact" as const,
    whatToAsk: t.whatToAsk,
  }));
}

/**
 * Calculates aggregate vendor booking progress.
 *
 * @param items - Array of vendor items.
 * @returns VendorProgress with counts per status and percent booked.
 */
export function vendorProgress(items: VendorItem[]): VendorProgress {
  const counts: Record<VendorStatus, number> = {
    "to-contact": 0,
    quoted: 0,
    booked: 0,
    paid: 0,
  };

  for (const item of items) {
    if (counts[item.status] !== undefined) {
      counts[item.status]++;
    }
  }

  const booked = counts.booked + counts.paid;
  const percentBooked = items.length > 0 ? Math.round((booked / items.length) * 100) : 0;

  return {
    total: items.length,
    counts,
    booked,
    percentBooked,
  };
}

export interface QuoteComparison {
  hasQuote: boolean;
  plannedAmount: number;
  difference: number;
  percentage: number;
  text: string;
  isAbove: boolean;
  isBelow: boolean;
  isEqual: boolean;
  toString(): string;
}

/**
 * Compares a vendor's entered quote amount with the corresponding category's planned budget.
 * Formats plain text e.g. "Quote is 12% above planned catering".
 */
export function compareQuote(
  budgetLines: BudgetLine[],
  vendor: VendorItem
): QuoteComparison {
  if (vendor.quoteAmount === undefined || vendor.quoteAmount === null || vendor.quoteAmount <= 0) {
    return {
      hasQuote: false,
      plannedAmount: 0,
      difference: 0,
      percentage: 0,
      text: "No quote entered",
      isAbove: false,
      isBelow: false,
      isEqual: false,
      toString() {
        return this.text;
      },
    };
  }

  const quote = vendor.quoteAmount;
  const vendorCat = vendor.category.toLowerCase().trim();

  // Match corresponding budget line
  const line = budgetLines.find(
    (l) => l.category.toLowerCase().trim() === vendorCat
  );

  if (!line || line.plannedAmount <= 0) {
    return {
      hasQuote: true,
      plannedAmount: line?.plannedAmount ?? 0,
      difference: quote,
      percentage: 100,
      text: `Quote entered (no planned allocation for ${vendor.category.toLowerCase()})`,
      isAbove: true,
      isBelow: false,
      isEqual: false,
      toString() {
        return this.text;
      },
    };
  }

  const planned = line.plannedAmount;
  const difference = quote - planned;
  const percentage = Math.round(Math.abs(difference / planned) * 100);
  const catName = line.category.toLowerCase();

  let text = "";
  if (difference === 0) {
    text = `Quote matches planned ${catName}`;
  } else if (difference > 0) {
    text = `Quote is ${percentage}% above planned ${catName}`;
  } else {
    text = `Quote is ${percentage}% below planned ${catName}`;
  }

  return {
    hasQuote: true,
    plannedAmount: planned,
    difference,
    percentage,
    text,
    isAbove: difference > 0,
    isBelow: difference < 0,
    isEqual: difference === 0,
    toString() {
      return this.text;
    },
  };
}

/**
 * Derives the single vendor category with the earliest related critical milestone
 * from timeline data to flag with a 'Next to book' label.
 */
export function getNextToBookCategory(
  tasks: TimelineTask[],
  vendors: VendorItem[]
): string | null {
  const pendingCritical = tasks.filter(
    (t) => t.isCritical && t.status !== "done" && !t.completed
  );

  if (pendingCritical.length === 0) return null;

  // Earliest deadline first
  pendingCritical.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const vendorCategories = new Map<string, string>();
  vendors.forEach((v) => {
    vendorCategories.set(v.category.toLowerCase().trim(), v.category);
  });

  for (const task of pendingCritical) {
    const taskCat = task.category.toLowerCase().trim();
    if (vendorCategories.has(taskCat)) {
      return vendorCategories.get(taskCat)!;
    }

    const titleLower = task.title.toLowerCase();
    const entries = Array.from(vendorCategories.entries());
    for (const [normCat, originalCat] of entries) {
      if (titleLower.includes(normCat)) {
        return originalCat;
      }
    }

    // Keyword heuristics
    if (titleLower.includes("photograph") || titleLower.includes("camera") || taskCat === "media") {
      if (vendorCategories.has("photography")) return vendorCategories.get("photography")!;
    }
    if (titleLower.includes("cater") || titleLower.includes("food") || titleLower.includes("menu") || titleLower.includes("chef")) {
      if (vendorCategories.has("catering")) return vendorCategories.get("catering")!;
    }
    if (titleLower.includes("venue") || titleLower.includes("hall") || titleLower.includes("grounds")) {
      if (vendorCategories.has("venue")) return vendorCategories.get("venue")!;
    }
    if (titleLower.includes("decor") || titleLower.includes("flower") || titleLower.includes("canopy")) {
      if (vendorCategories.has("decor")) return vendorCategories.get("decor")!;
      if (vendorCategories.has("infrastructure")) return vendorCategories.get("infrastructure")!;
    }
    if (titleLower.includes("dj") || titleLower.includes("band") || titleLower.includes("music") || titleLower.includes("entertain")) {
      if (vendorCategories.has("entertainment")) return vendorCategories.get("entertainment")!;
    }
  }

  return null;
}


/**
 * @deprecated Legacy vendor filter utility. Use VendorItem category filtering instead.
 */
export function filterVendorsByCategory(vendors: Vendor[], category: VendorCategory): Vendor[] {
  return vendors.filter((v) => v.category === category);
}

/**
 * @deprecated Legacy status counter. Use vendorProgress() instead.
 */
export function getVendorStatusCounts(vendors: Vendor[]): Record<string, number> {
  const counts: Record<string, number> = { researching: 0, contacted: 0, quoted: 0, booked: 0, declined: 0 };
  for (const v of vendors) {
    if (counts[v.status] !== undefined) counts[v.status]++;
  }
  return counts;
}

/**
 * @deprecated Legacy vendor cost estimator. Use quote tracking on VendorItem instead.
 */
export function calculateEstimatedVendorTotal(vendors: Vendor[]): number {
  return vendors.filter((v) => v.status === "booked" || v.status === "quoted").reduce((sum, v) => sum + (v.estimatedCost ?? 0), 0);
}
