import { describe, it, expect } from "vitest";
import {
  generateVendorChecklist,
  vendorProgress,
  compareQuote,
  getNextToBookCategory,
} from "@/lib/engine";
import { EventBrief, VendorItem } from "@/lib/domain";

describe("Vendors Engine - generateVendorChecklist", () => {
  const baseBrief: EventBrief = {
    id: "v1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    name: "Celebration Gala",
    type: "wedding",
    date: "2026-12-25",
    guestCount: 150,
    totalBudget: 2000000,
    currency: "INR",
    city: "Delhi",
    cityTier: "metro",
    venueType: "indoor",
    priorities: ["venue"],
    dietaryNeeds: [],
    notes: "",
    createdAt: new Date().toISOString(),
  };

  it("generates base checklist with status 'to-contact' and questions for each vendor", () => {
    const checklist = generateVendorChecklist(baseBrief);
    expect(checklist.length).toBeGreaterThan(0);

    for (const item of checklist) {
      expect(item.status).toBe("to-contact");
      expect(item.category).toBeDefined();
      expect(item.label).toBeDefined();
      expect(item.whatToAsk).toBeDefined();
      // Verifies whatToAsk provides concrete questions
      expect(typeof item.whatToAsk).toBe("string");
      expect(item.whatToAsk).toContain("?");
    }
  });

  it("applies outdoor conditionals (tent/canopy and generator)", () => {
    const outdoorBrief = { ...baseBrief, venueType: "outdoor" as const };
    const items = generateVendorChecklist(outdoorBrief);

    const hasTent = items.some((i) => i.label.toLowerCase().includes("tent") || i.label.toLowerCase().includes("canopy"));
    const hasGenerator = items.some((i) => i.label.toLowerCase().includes("generator"));

    expect(hasTent).toBe(true);
    expect(hasGenerator).toBe(true);

    // Indoor brief should NOT have tent or generator
    const indoorItems = generateVendorChecklist(baseBrief);
    expect(indoorItems.some((i) => i.label.toLowerCase().includes("tent"))).toBe(false);
    expect(indoorItems.some((i) => i.label.toLowerCase().includes("generator"))).toBe(false);
  });

  it("applies guestCount > 300 conditionals (additional staff and crowd barriers)", () => {
    const largeBrief = { ...baseBrief, guestCount: 400 };
    const items = generateVendorChecklist(largeBrief);

    const hasExtraStaff = items.some((i) => i.label.toLowerCase().includes("staff"));
    const hasBarriers = items.some((i) => i.label.toLowerCase().includes("barrier") || i.label.toLowerCase().includes("marshal"));

    expect(hasExtraStaff).toBe(true);
    expect(hasBarriers).toBe(true);

    const normalItems = generateVendorChecklist(baseBrief);
    expect(normalItems.some((i) => i.label.toLowerCase().includes("barrier"))).toBe(false);
  });

  it("applies hybrid venue conditional (indoor & outdoor contingency)", () => {
    const hybridBrief = { ...baseBrief, venueType: "hybrid" as const };
    const items = generateVendorChecklist(hybridBrief);

    const hasHybrid = items.some((i) => i.label.toLowerCase().includes("contingency"));
    expect(hasHybrid).toBe(true);
  });

  it("applies photography priority conditional (second shooter / drone)", () => {
    const photoBrief = { ...baseBrief, priorities: ["photography" as const] };
    const items = generateVendorChecklist(photoBrief);

    const hasSecondShooter = items.some((i) => i.label.toLowerCase().includes("second shooter") || i.label.toLowerCase().includes("drone"));
    expect(hasSecondShooter).toBe(true);
  });

  it("applies dietary needs conditional (specialty caterer / labelled menu)", () => {
    const dietaryBrief = { ...baseBrief, dietaryNeeds: ["Halal", "Gluten-Free"] };
    const items = generateVendorChecklist(dietaryBrief);

    const hasSpecialty = items.some((i) => i.label.toLowerCase().includes("specialty caterer") || i.label.toLowerCase().includes("labelled menu"));
    expect(hasSpecialty).toBe(true);
  });
});

describe("Vendors Engine - vendorProgress", () => {
  it("computes counts and percent booked accurately", () => {
    const items: VendorItem[] = [
      { id: "1", category: "Venue", label: "Hall", status: "booked" },
      { id: "2", category: "Catering", label: "Food", status: "paid" },
      { id: "3", category: "Decor", label: "Flowers", status: "quoted" },
      { id: "4", category: "Music", label: "DJ", status: "to-contact" },
    ];

    const progress = vendorProgress(items);
    expect(progress.total).toBe(4);
    expect(progress.booked).toBe(2); // booked + paid = 2
    expect(progress.percentBooked).toBe(50); // 2/4 = 50%
    expect(progress.counts).toEqual({
      "to-contact": 1,
      quoted: 1,
      booked: 1,
      paid: 1,
    });
  });

  it("handles empty items safely with 0% booked", () => {
    const progress = vendorProgress([]);
    expect(progress.total).toBe(0);
    expect(progress.booked).toBe(0);
    expect(progress.percentBooked).toBe(0);
  });
});

describe("Vendors Engine - compareQuote", () => {
  const budgetLines = [
    { category: "catering", plannedAmount: 100000 },
    { category: "venue", plannedAmount: 150000 },
    { category: "photography", plannedAmount: 50000 },
  ];

  it("calculates percentage above planned budget line with accurate plain text", () => {
    // Quote is 112,000 for planned 100,000 -> 12% above planned catering
    const vendor: VendorItem = {
      id: "v1",
      category: "Catering",
      label: "Heritage Feasts",
      status: "quoted",
      quoteAmount: 112000,
    };

    const comp = compareQuote(budgetLines, vendor);
    expect(comp.hasQuote).toBe(true);
    expect(comp.isAbove).toBe(true);
    expect(comp.percentage).toBe(12);
    expect(comp.text).toBe("Quote is 12% above planned catering");
  });

  it("calculates percentage below planned budget line", () => {
    // Quote is 40,000 for planned 50,000 -> 20% below planned photography
    const vendor: VendorItem = {
      id: "v2",
      category: "Photography",
      label: "Studio Lumina",
      status: "quoted",
      quoteAmount: 40000,
    };

    const comp = compareQuote(budgetLines, vendor);
    expect(comp.hasQuote).toBe(true);
    expect(comp.isBelow).toBe(true);
    expect(comp.percentage).toBe(20);
    expect(comp.text).toBe("Quote is 20% below planned photography");
  });

  it("handles matching quote and planned amount", () => {
    const vendor: VendorItem = {
      id: "v3",
      category: "Venue",
      label: "Grand Ballroom",
      status: "quoted",
      quoteAmount: 150000,
    };

    const comp = compareQuote(budgetLines, vendor);
    expect(comp.isEqual).toBe(true);
    expect(comp.text).toBe("Quote matches planned venue");
  });

  it("handles vendor without quote amount safely", () => {
    const vendor: VendorItem = {
      id: "v4",
      category: "Catering",
      label: "Royal Caterers",
      status: "to-contact",
    };

    const comp = compareQuote(budgetLines, vendor);
    expect(comp.hasQuote).toBe(false);
    expect(comp.text).toBe("No quote entered");
  });
});

describe("Vendors Engine - getNextToBookCategory", () => {
  const vendors: VendorItem[] = [
    { id: "v1", category: "Venue", label: "Grand Ballroom", status: "to-contact" },
    { id: "v2", category: "Catering", label: "Heritage Feasts", status: "to-contact" },
    { id: "v3", category: "Photography", label: "Studio Lumina", status: "to-contact" },
  ];

  it("identifies category of earliest pending critical milestone", () => {
    const tasks = [
      { id: "t1", title: "Book venue grounds", dueDate: "2026-03-01", category: "Venue", status: "done" as const, isCritical: true },
      { id: "t2", title: "Book primary photographer", dueDate: "2026-04-10", category: "Photography", status: "todo" as const, isCritical: true },
      { id: "t3", title: "Select menu catering", dueDate: "2026-05-15", category: "Catering", status: "todo" as const, isCritical: true },
    ];

    const nextCat = getNextToBookCategory(tasks, vendors);
    expect(nextCat).toBe("Photography");
  });

  it("returns null if no pending critical tasks exist", () => {
    const tasks = [
      { id: "t1", title: "Book venue grounds", dueDate: "2026-03-01", category: "Venue", status: "done" as const, isCritical: true },
    ];

    const nextCat = getNextToBookCategory(tasks, vendors);
    expect(nextCat).toBeNull();
  });
});
