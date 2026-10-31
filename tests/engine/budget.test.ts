import { describe, it, expect } from "vitest";
import {
  BASE_ALLOCATIONS,
  CATERING_FLOOR_PER_GUEST,
  generateBudget,
  summarizeBudget,
  calculateBudgetSummary,
  recommendCategoryAllocations,
  GenerateBudgetInput,
  rebalance,
  explainAllocation,
} from "@/lib/engine";
import { EventType, Priority, VenueType, CityTier } from "@/lib/domain";

describe("Budget Engine - Base Allocations", () => {
  it("defines base allocations summing to 100 for all three event types with exact keys", () => {
    // Wedding
    expect(BASE_ALLOCATIONS.wedding).toEqual({
      venue: 25,
      catering: 30,
      decor: 10,
      photography: 10,
      attire: 8,
      entertainment: 6,
      invitations: 3,
      transport: 3,
      contingency: 5,
    });
    const weddingSum = Object.values(BASE_ALLOCATIONS.wedding).reduce((a, b) => a + b, 0);
    expect(weddingSum).toBe(100);

    // Birthday
    expect(BASE_ALLOCATIONS.birthday).toEqual({
      venue: 20,
      catering: 35,
      decor: 12,
      entertainment: 15,
      cake: 6,
      photography: 4,
      "return-gifts": 4,
      contingency: 4,
    });
    const birthdaySum = Object.values(BASE_ALLOCATIONS.birthday).reduce((a, b) => a + b, 0);
    expect(birthdaySum).toBe(100);

    // Community
    expect(BASE_ALLOCATIONS.community).toEqual({
      venue: 20,
      catering: 30,
      "sound-and-lighting": 12,
      "permits-and-safety": 8,
      promotion: 10,
      entertainment: 10,
      supplies: 5,
      contingency: 5,
    });
    const communitySum = Object.values(BASE_ALLOCATIONS.community).reduce((a, b) => a + b, 0);
    expect(communitySum).toBe(100);
  });
});

describe("Budget Engine - Property-style Invariants across Random Inputs", () => {
  const eventTypes: EventType[] = ["wedding", "birthday", "community"];
  const venueTypes: (VenueType | undefined)[] = ["indoor", "outdoor", "hybrid", undefined];
  const cityTiers: (CityTier | undefined)[] = ["metro", "tier2", "town", undefined];
  const allPriorities: Priority[] = ["food", "venue", "decor", "entertainment", "photography", "guest-comfort"];

  it("verifies sums always equal totalBudget, percentages never negative, contingency >= 4% across 100 random cases", () => {
    for (let i = 0; i < 100; i++) {
      const type = eventTypes[i % eventTypes.length];
      const venueType = venueTypes[i % venueTypes.length];
      const cityTier = cityTiers[i % cityTiers.length];

      // Pseudo-random budget from small to large numbers, including primes and odd amounts
      const budgets = [1, 13, 99, 500, 1337, 15000, 89451, 500000, 2500000, 10000000];
      const totalBudget = budgets[i % budgets.length] + (i * 7);
      const guestCount = 1 + ((i * 37) % 1500);

      // Random 0 to 3 priorities
      const priorityCount = i % 4;
      const shuffled = [...allPriorities].sort(() => 0.5 - ((i * 13) % 7) / 7);
      const priorities = shuffled.slice(0, priorityCount);

      const input: GenerateBudgetInput = {
        type,
        totalBudget,
        guestCount,
        priorities,
        venueType,
        cityTier,
      };

      const result = generateBudget(input);

      // 1. Sum of plannedAmounts MUST equal totalBudget EXACTLY
      const actualSum = result.lines.reduce((sum, line) => sum + line.plannedAmount, 0);
      expect(actualSum).toBe(totalBudget);

      // 2. All planned amounts must be integers and non-negative
      for (const line of result.lines) {
        expect(Number.isInteger(line.plannedAmount)).toBe(true);
        expect(line.plannedAmount).toBeGreaterThanOrEqual(0);
      }

      // 3. Percentages in allocations are never negative
      for (const pct of Object.values(result.allocations)) {
        expect(pct).toBeGreaterThanOrEqual(0);
      }

      // 4. Contingency is NEVER below 4%
      expect(result.allocations.contingency).toBeGreaterThanOrEqual(3.99); // floating-point tolerance

      // 5. perGuestCost is computed correctly
      expect(result.perGuestCost).toBe(Math.round((totalBudget / guestCount) * 100) / 100);
    }
  });
});

describe("Budget Engine - Specific Adjustments", () => {
  it("applies outdoor shifts (+2 to sound/decor, +1 to contingency)", () => {
    // Wedding baseline: decor 10, contingency 5
    const baseWedding = generateBudget({
      type: "wedding",
      totalBudget: 1000000,
      guestCount: 100,
      venueType: "indoor",
    });

    const outdoorWedding = generateBudget({
      type: "wedding",
      totalBudget: 1000000,
      guestCount: 100,
      venueType: "outdoor",
    });

    // Decor & contingency should be elevated
    expect(outdoorWedding.allocations.decor).toBeGreaterThan(baseWedding.allocations.decor);
    expect(outdoorWedding.allocations.contingency).toBeGreaterThan(baseWedding.allocations.contingency);

    // Community baseline: sound-and-lighting 12, contingency 5
    const baseComm = generateBudget({
      type: "community",
      totalBudget: 1000000,
      guestCount: 100,
      venueType: "indoor",
    });

    const outdoorComm = generateBudget({
      type: "community",
      totalBudget: 1000000,
      guestCount: 100,
      venueType: "outdoor",
    });

    expect(outdoorComm.allocations["sound-and-lighting"]).toBeGreaterThan(baseComm.allocations["sound-and-lighting"]);
    expect(outdoorComm.allocations.contingency).toBeGreaterThan(baseComm.allocations.contingency);
  });

  it("applies hybrid shift (+1 contingency)", () => {
    const base = generateBudget({
      type: "wedding",
      totalBudget: 1000000,
      guestCount: 100,
      venueType: "indoor",
    });

    const hybrid = generateBudget({
      type: "wedding",
      totalBudget: 1000000,
      guestCount: 100,
      venueType: "hybrid",
    });

    expect(hybrid.allocations.contingency).toBeGreaterThan(base.allocations.contingency);
  });

  it("applies city tier shifts between venue and catering", () => {
    const tier2 = generateBudget({
      type: "wedding",
      totalBudget: 1000000,
      guestCount: 100,
      cityTier: "tier2",
    });

    const metro = generateBudget({
      type: "wedding",
      totalBudget: 1000000,
      guestCount: 100,
      cityTier: "metro",
    });

    const town = generateBudget({
      type: "wedding",
      totalBudget: 1000000,
      guestCount: 100,
      cityTier: "town",
    });

    // Metro shifts +3 toward venue, -3 from catering
    expect(metro.allocations.venue).toBeGreaterThan(tier2.allocations.venue);
    expect(metro.allocations.catering).toBeLessThan(tier2.allocations.catering);

    // Town shifts -3 from venue, +3 toward catering
    expect(town.allocations.venue).toBeLessThan(tier2.allocations.venue);
    expect(town.allocations.catering).toBeGreaterThan(tier2.allocations.catering);
  });

  it("triggers catering floor warning on tiny budget with many guests for all three event types", () => {
    // 1. Wedding (floor: 600 INR/guest)
    const weddingRes = generateBudget({
      type: "wedding",
      totalBudget: 10000, // ₹10,000 for 100 guests = ₹100 total/guest (catering base ₹30/guest < 600)
      guestCount: 100,
    });
    expect(weddingRes.warnings.length).toBeGreaterThan(0);
    expect(weddingRes.warnings[0]).toContain(String(CATERING_FLOOR_PER_GUEST.wedding));
    expect(weddingRes.warnings[0]).toContain("Catering");

    // 2. Birthday (floor: 400 INR/guest)
    const birthdayRes = generateBudget({
      type: "birthday",
      totalBudget: 5000, // ₹5,000 for 50 guests = ₹100 total/guest (catering base ₹35/guest < 400)
      guestCount: 50,
    });
    expect(birthdayRes.warnings.length).toBeGreaterThan(0);
    expect(birthdayRes.warnings[0]).toContain(String(CATERING_FLOOR_PER_GUEST.birthday));

    // 3. Community (floor: 250 INR/guest)
    const communityRes = generateBudget({
      type: "community",
      totalBudget: 10000, // ₹10,000 for 200 guests = ₹50 total/guest (catering base ₹15/guest < 250)
      guestCount: 200,
    });
    expect(communityRes.warnings.length).toBeGreaterThan(0);
    expect(communityRes.warnings[0]).toContain(String(CATERING_FLOOR_PER_GUEST.community));
  });
});

describe("Budget Engine - summarizeBudget", () => {
  it("correctly computes planned total, actual total, variance, and flags categories over by >10%", () => {
    const lines = [
      { category: "venue", plannedAmount: 10000, actualAmount: 10500 }, // +5% (not over)
      { category: "catering", plannedAmount: 12000, actualAmount: 14000 }, // +16.7% (OVER > 10%)
      { category: "decor", plannedAmount: 4000, actualAmount: 4000 }, // 0% (not over)
      { category: "entertainment", plannedAmount: 3000, actualAmount: 3500 }, // +16.7% (OVER > 10%)
      { category: "contingency", plannedAmount: 2000 }, // actual is undefined (0)
    ];

    const summary = summarizeBudget(lines);

    expect(summary.plannedTotal).toBe(31000);
    expect(summary.actualTotal).toBe(32000);
    expect(summary.variance).toBe(1000);
    expect(summary.overCategories).toEqual(["catering", "entertainment"]);
  });

  it("handles case where all categories are within budget or under 10%", () => {
    const lines = [
      { category: "venue", plannedAmount: 10000, actualAmount: 9500 },
      { category: "catering", plannedAmount: 12000, actualAmount: 12000 },
    ];

    const summary = summarizeBudget(lines);
    expect(summary.overCategories).toEqual([]);
    expect(summary.variance).toBe(-500);
  });
});

describe("Budget Engine - Backward Compatibility", () => {
  it("calculates budget summary for legacy budget items", () => {
    const summary = calculateBudgetSummary(5000, [
      { id: "123e4567-e89b-12d3-a456-426614174000", category: "Venue", title: "Deposit", allocatedAmount: 2000, actualAmount: 1900, isPaid: true },
      { id: "123e4567-e89b-12d3-a456-426614174001", category: "Catering", title: "Buffet", allocatedAmount: 2500, actualAmount: 2800, isPaid: false },
    ]);

    expect(summary.totalAllocated).toBe(4500);
    expect(summary.totalActual).toBe(4700);
    expect(summary.remainingAllocated).toBe(500);
    expect(summary.remainingActual).toBe(300);
  });

  it("generates recommendCategoryAllocations mapping", () => {
    const recs = recommendCategoryAllocations(10000, "wedding");
    expect(Object.keys(recs).length).toBeGreaterThan(0);
    const sum = Object.values(recs).reduce((a, b) => a + b, 0);
    expect(sum).toBe(10000);
  });
});

describe("Budget Engine - rebalance", () => {
  const baseLines = [
    { category: "venue", plannedAmount: 250000 },
    { category: "catering", plannedAmount: 300000 },
    { category: "decor", plannedAmount: 100000 },
    { category: "contingency", plannedAmount: 50000 }, // Total = 700,000. 4% = 28,000. Buffer in contingency = 22,000.
  ];

  it("adjusts category by taking difference from contingency first when contingency has buffer", () => {
    // Increase venue by 10,000 (well within 22,000 buffer)
    const result = rebalance(baseLines, "venue", 260000);
    expect(result.success).toBe(true);

    const venue = result.lines.find((l) => l.category === "venue")!;
    const contingency = result.lines.find((l) => l.category === "contingency")!;
    const catering = result.lines.find((l) => l.category === "catering")!;

    expect(venue.plannedAmount).toBe(260000);
    expect(contingency.plannedAmount).toBe(40000); // 50,000 - 10,000
    expect(catering.plannedAmount).toBe(300000); // Unchanged

    const total = result.lines.reduce((sum, l) => sum + l.plannedAmount, 0);
    expect(total).toBe(700000);
  });

  it("takes from contingency down to 4% and then from largest other category", () => {
    // Increase venue by 30,000.
    // 22,000 from contingency (leaves 28,000 = exactly 4%).
    // Remaining 8,000 from largest other category: catering (300,000 -> 292,000).
    const result = rebalance(baseLines, "venue", 280000);
    expect(result.success).toBe(true);

    const venue = result.lines.find((l) => l.category === "venue")!;
    const contingency = result.lines.find((l) => l.category === "contingency")!;
    const catering = result.lines.find((l) => l.category === "catering")!;

    expect(venue.plannedAmount).toBe(280000);
    expect(contingency.plannedAmount).toBe(28000); // Floor reached
    expect(catering.plannedAmount).toBe(292000); // 300,000 - 8,000

    const total = result.lines.reduce((sum, l) => sum + l.plannedAmount, 0);
    expect(total).toBe(700000);
  });

  it("adds difference to contingency first when a category amount is decreased", () => {
    // Decrease venue by 20,000
    const result = rebalance(baseLines, "venue", 230000);
    expect(result.success).toBe(true);

    const venue = result.lines.find((l) => l.category === "venue")!;
    const contingency = result.lines.find((l) => l.category === "contingency")!;

    expect(venue.plannedAmount).toBe(230000);
    expect(contingency.plannedAmount).toBe(70000); // 50,000 + 20,000

    const total = result.lines.reduce((sum, l) => sum + l.plannedAmount, 0);
    expect(total).toBe(700000);
  });

  it("refuses any change with a negative planned amount", () => {
    const result = rebalance(baseLines, "decor", -5000);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/cannot be negative/i);
  });

  it("refuses any change that would cause contingency to fall below 4%", () => {
    // Direct edit of contingency below 28,000
    const result = rebalance(baseLines, "contingency", 10000);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/contingency cannot be reduced below 4%/i);
  });

  it("refuses an excessive increase that exceeds all available contingency and largest category funds", () => {
    // Trying to increase venue to 800,000 (delta = +550,000, total budget is only 700,000)
    const result = rebalance(baseLines, "venue", 800000);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/insufficient funds/i);
  });
});

describe("Budget Engine - explainAllocation", () => {
  it("returns 3-5 plain-language reasons explaining the allocation for a metro wedding", () => {
    const brief = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Metro Wedding",
      type: "wedding" as const,
      date: "2026-12-15",
      guestCount: 200,
      totalBudget: 1500000,
      currency: "INR",
      city: "Mumbai",
      cityTier: "metro" as const,
      venueType: "hybrid" as const,
      priorities: ["food", "venue"] as ("food" | "venue")[],
      dietaryNeeds: ["jain"],
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    const reasons = explainAllocation(brief);
    expect(reasons.length).toBeGreaterThanOrEqual(3);
    expect(reasons.length).toBeLessThanOrEqual(5);

    // Checks key expected editorial explanations
    expect(reasons.some((r) => r.includes("metro city"))).toBe(true);
    expect(reasons.some((r) => r.toLowerCase().includes("food") || r.toLowerCase().includes("catering"))).toBe(true);
  });

  it("explains outdoor venue and town city adjustments", () => {
    const brief = {
      id: "123e4567-e89b-12d3-a456-426614174001",
      name: "Town Birthday",
      type: "birthday" as const,
      date: "2026-11-20",
      guestCount: 50,
      totalBudget: 200000,
      currency: "INR",
      city: "Udaipur",
      cityTier: "town" as const,
      venueType: "outdoor" as const,
      priorities: ["entertainment"] as ("entertainment")[],
      dietaryNeeds: [],
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    const reasons = explainAllocation(brief);
    expect(reasons.length).toBeGreaterThanOrEqual(3);
    expect(reasons.length).toBeLessThanOrEqual(5);

    expect(reasons.some((r) => r.includes("town locations"))).toBe(true);
    expect(reasons.some((r) => r.includes("Outdoor venue"))).toBe(true);
  });
});
