import { describe, it, expect } from "vitest";
import {
  explainAllocation,
  summarizeBudget,
} from "../../src/lib/engine/budget";
import {
  filterVendorsByCategory,
  getVendorStatusCounts,
  calculateEstimatedVendorTotal,
  getNextToBookCategory,
} from "../../src/lib/engine/vendors";
import { EventBrief, Vendor } from "../../src/lib/domain";

describe("Engine extra coverage tests", () => {
  it("covers explanation branches for diverse priorities and catering floor check", () => {
    const brief: EventBrief = {
      id: "12345678-1234-4234-8234-123456789012",
      name: "Floor check wedding",
      type: "wedding",
      date: "2026-12-01",
      guestCount: 500,
      totalBudget: 100000, // Very low total budget so catering per guest < floor
      currency: "INR",
      city: "Indore",
      cityTier: "tier2",
      venueType: "indoor",
      priorities: ["food"],
      dietaryNeeds: [],
    };

    const reasons = explainAllocation(brief);
    expect(reasons.length).toBeGreaterThanOrEqual(3);
    expect(reasons.some((r) => r.includes("safeguarded"))).toBe(true);

    const decorBrief: EventBrief = { ...brief, priorities: ["decor"] };
    expect(explainAllocation(decorBrief).some((r) => r.includes("Decor"))).toBe(true);

    const entBrief: EventBrief = { ...brief, priorities: ["entertainment"] };
    expect(explainAllocation(entBrief).some((r) => r.includes("Entertainment"))).toBe(true);

    const photoBrief: EventBrief = { ...brief, priorities: ["photography"] };
    expect(explainAllocation(photoBrief).some((r) => r.includes("Photography"))).toBe(true);

    const guestBrief: EventBrief = { ...brief, priorities: ["guest-comfort"] };
    expect(explainAllocation(guestBrief).some((r) => r.includes("comfort"))).toBe(true);

    const venueBrief: EventBrief = { ...brief, priorities: ["venue"] };
    expect(explainAllocation(venueBrief).some((r) => r.includes("Venue allocation"))).toBe(true);
  });

  it("covers getNextToBookCategory keyword fallbacks", () => {
    const vendors = [
      { id: "v1", category: "decor", label: "Florals", status: "to-contact" as const },
      { id: "v2", category: "entertainment", label: "Sound", status: "to-contact" as const },
      { id: "v3", category: "venue", label: "Palace", status: "to-contact" as const },
    ];
    const tasks = [
      { id: "t1", title: "Arrange canopy flowers", category: "general", dueDate: "2026-06-01", isCritical: true, status: "todo" as const },
      { id: "t2", title: "Hire wedding DJ band", category: "general", dueDate: "2026-07-01", isCritical: true, status: "todo" as const },
      { id: "t3", title: "Book palace grounds", category: "general", dueDate: "2026-05-01", isCritical: true, status: "todo" as const },
    ];

    // Earliest is t3 (2026-05-01: grounds -> venue)
    expect(getNextToBookCategory(tasks, vendors)).toBe("venue");

    // Without t3, next earliest is t1 (2026-06-01: canopy -> decor)
    expect(getNextToBookCategory([tasks[0], tasks[1]], vendors)).toBe("decor");

    // Without t1/t3, next is t2 (2026-07-01: dj -> entertainment)
    expect(getNextToBookCategory([tasks[1]], vendors)).toBe("entertainment");

    // If no tasks match
    expect(getNextToBookCategory([{ id: "t4", title: "Random unknown", category: "other", dueDate: "2026-01-01", isCritical: true, status: "todo" }], vendors)).toBeNull();
  });

  it("covers legacy vendor functions", () => {
    const legacyVendors: Vendor[] = [
      { id: "1", name: "V1", category: "catering", status: "booked", estimatedCost: 1000 },
      { id: "2", name: "V2", category: "venue", status: "quoted", estimatedCost: 2000 },
      { id: "3", name: "V3", category: "catering", status: "researching", estimatedCost: 500 },
    ];

    expect(filterVendorsByCategory(legacyVendors, "catering")).toHaveLength(2);
    const counts = getVendorStatusCounts(legacyVendors);
    expect(counts.booked).toBe(1);
    expect(counts.quoted).toBe(1);
    expect(counts.researching).toBe(1);
    expect(calculateEstimatedVendorTotal(legacyVendors)).toBe(3000);
  });
});
