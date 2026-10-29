import { BudgetItem, EventType } from "../domain";

export interface BudgetSummary {
  totalBudget: number;
  totalAllocated: number;
  totalActual: number;
  remainingAllocated: number;
  remainingActual: number;
  isOverAllocated: boolean;
  isOverActual: boolean;
  categoryBreakdown: Record<string, { allocated: number; actual: number }>;
}

export function calculateBudgetSummary(
  totalBudget: number,
  items: BudgetItem[]
): BudgetSummary {
  let totalAllocated = 0;
  let totalActual = 0;
  const categoryBreakdown: Record<string, { allocated: number; actual: number }> = {};

  for (const item of items) {
    totalAllocated += item.allocatedAmount;
    totalActual += item.actualAmount;

    if (!categoryBreakdown[item.category]) {
      categoryBreakdown[item.category] = { allocated: 0, actual: 0 };
    }
    categoryBreakdown[item.category].allocated += item.allocatedAmount;
    categoryBreakdown[item.category].actual += item.actualAmount;
  }

  return {
    totalBudget,
    totalAllocated,
    totalActual,
    remainingAllocated: totalBudget - totalAllocated,
    remainingActual: totalBudget - totalActual,
    isOverAllocated: totalAllocated > totalBudget,
    isOverActual: totalActual > totalBudget,
    categoryBreakdown,
  };
}

export function recommendCategoryAllocations(
  totalBudget: number,
  _eventType: EventType
): Record<string, number> {
  // Standard celebration benchmark breakdown
  const percentages: Record<string, number> = {
    venue_catering: 0.45,
    photography_video: 0.12,
    music_entertainment: 0.10,
    decor_flowers: 0.10,
    attire_beauty: 0.08,
    invitations_favors: 0.05,
    contingency_buffer: 0.10,
  };

  const allocations: Record<string, number> = {};
  for (const [key, pct] of Object.entries(percentages)) {
    allocations[key] = Math.round(totalBudget * pct);
  }
  return allocations;
}
