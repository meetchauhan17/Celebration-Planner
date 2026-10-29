import { describe, it, expect } from "vitest";
import { calculateBudgetSummary, recommendCategoryAllocations } from "@/lib/engine";

describe("Budget Engine", () => {
  it("calculates totals, variance, and categories accurately", () => {
    const summary = calculateBudgetSummary(5000, [
      {
        id: "1",
        category: "Venue",
        title: "Deposit",
        allocatedAmount: 2000,
        actualAmount: 1800,
        isPaid: true,
      },
      {
        id: "2",
        category: "Venue",
        title: "Cleaning Fee",
        allocatedAmount: 500,
        actualAmount: 500,
        isPaid: true,
      },
      {
        id: "3",
        category: "Music",
        title: "Acoustic Duo",
        allocatedAmount: 1000,
        actualAmount: 1200,
        isPaid: false,
      },
    ]);

    expect(summary.totalBudget).toBe(5000);
    expect(summary.totalAllocated).toBe(3500);
    expect(summary.totalActual).toBe(3500);
    expect(summary.remainingAllocated).toBe(1500);
    expect(summary.remainingActual).toBe(1500);
    expect(summary.isOverAllocated).toBe(false);
    expect(summary.isOverActual).toBe(false);
    expect(summary.categoryBreakdown["Venue"].allocated).toBe(2500);
    expect(summary.categoryBreakdown["Venue"].actual).toBe(2300);
  });

  it("detects over-budget conditions", () => {
    const summary = calculateBudgetSummary(1000, [
      {
        id: "1",
        category: "Decor",
        title: "Balloons",
        allocatedAmount: 1500,
        actualAmount: 1200,
        isPaid: false,
      },
    ]);

    expect(summary.isOverAllocated).toBe(true);
    expect(summary.isOverActual).toBe(true);
    expect(summary.remainingAllocated).toBe(-500);
  });

  it("returns recommended allocations adding up near total budget", () => {
    const recommendations = recommendCategoryAllocations(10000, "birthday");
    const totalRecommended = Object.values(recommendations).reduce((a, b) => a + b, 0);
    expect(totalRecommended).toBe(10000);
    expect(recommendations.venue_catering).toBe(4500);
  });
});
