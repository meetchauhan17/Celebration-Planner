"use client";

import React, { useState } from "react";
import { PlannedEvent, BudgetLine } from "@/lib/domain";
import { updateEvent } from "@/lib/storage";
import { useAnnounce } from "@/components/shell";
import { rebalance, generateBudget } from "@/lib/engine/budget";
import { BudgetLead } from "./BudgetLead";
import { BudgetEditorialNotes } from "./BudgetEditorialNotes";
import { BudgetTable } from "./BudgetTable";
import { BudgetResetConfirm } from "./BudgetResetConfirm";

export interface BudgetViewProps {
  event: PlannedEvent;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ event }) => {
  const { brief, budgetLines } = event;
  const { announce } = useAnnounce();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Update actual spend for a category
  const handleUpdateActual = (category: string, newActual: number | undefined) => {
    const nextLines: BudgetLine[] = budgetLines.map((line) => {
      if (line.category.toLowerCase() === category.toLowerCase()) {
        return { ...line, actualAmount: newActual };
      }
      return line;
    });

    const res = updateEvent(brief.id, { budgetLines: nextLines });
    if (res.ok) {
      announce("Budget saved", "polite");
    }
  };

  // 2. Adjust planned amount for a category with algorithmic rebalancing
  const handleAdjustPlanned = (category: string, newPlanned: number) => {
    setErrorMessage(null);
    const result = rebalance(budgetLines, category, newPlanned);

    if (!result.success) {
      setErrorMessage(result.error || "Unable to rebalance category allocation.");
      return;
    }

    const res = updateEvent(brief.id, { budgetLines: result.lines });
    if (res.ok) {
      announce("Budget saved", "polite");
    }
  };

  // 3. Reset to suggested budget
  const handleResetBudget = () => {
    setErrorMessage(null);
    const suggested = generateBudget({
      type: brief.type,
      totalBudget: brief.totalBudget,
      guestCount: brief.guestCount,
      priorities: brief.priorities,
      venueType: brief.venueType,
      cityTier: brief.cityTier,
    });

    // Merge existing actual spend records
    const mergedLines: BudgetLine[] = suggested.lines.map((sl) => {
      const existing = budgetLines.find(
        (cl) => cl.category.toLowerCase() === sl.category.toLowerCase()
      );
      return {
        ...sl,
        actualAmount: existing?.actualAmount,
      };
    });

    const res = updateEvent(brief.id, { budgetLines: mergedLines });
    if (res.ok) {
      announce("Budget reset to suggested allocations", "polite");
    }
  };

  return (
    <div className="np-budget-view-container">
      <BudgetLead event={event} />
      <BudgetEditorialNotes event={event} />
      <BudgetTable
        lines={budgetLines}
        currency={brief.currency}
        totalBudget={brief.totalBudget}
        onUpdateActual={handleUpdateActual}
        onAdjustPlanned={handleAdjustPlanned}
        errorMessage={errorMessage}
      />
      <BudgetResetConfirm onReset={handleResetBudget} />
    </div>
  );
};

export default BudgetView;

