import { BudgetItem, EventType } from "../domain";
import { generateBudget } from "./budget";

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

export function calculateBudgetSummary(totalBudget: number, items: BudgetItem[]): BudgetSummary {
  let totalAllocated = 0;
  let totalActual = 0;
  const categoryBreakdown: Record<string, { allocated: number; actual: number }> = {};
  for (const item of items) {
    totalAllocated += item.allocatedAmount;
    totalActual += item.actualAmount;
    if (!categoryBreakdown[item.category]) categoryBreakdown[item.category] = { allocated: 0, actual: 0 };
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

export function recommendCategoryAllocations(totalBudget: number, _eventType: EventType): Record<string, number> {
  const lines = generateBudget({ type: _eventType, totalBudget, guestCount: 100 }).lines;
  return lines.reduce((acc, l) => ({ ...acc, [l.category]: l.plannedAmount }), {});
}

