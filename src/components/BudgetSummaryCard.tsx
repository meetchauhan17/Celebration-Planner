import React from "react";
import { BudgetSummary } from "../lib/engine";

export interface BudgetSummaryCardProps {
  summary: BudgetSummary;
}

export function BudgetSummaryCard({ summary }: BudgetSummaryCardProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  return (
    <section className="stats-bar" aria-label="Budget Overview">
      <div className="stat-item">
        <span className="stat-label">Total Budget</span>
        <span className="stat-val">{formatCurrency(summary.totalBudget)}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Allocated</span>
        <span className="stat-val" style={{ color: summary.isOverAllocated ? "var(--accent-rose)" : "var(--accent-indigo)" }}>
          {formatCurrency(summary.totalAllocated)}
        </span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Actual Spent</span>
        <span className="stat-val" style={{ color: summary.isOverActual ? "var(--accent-rose)" : "var(--accent-emerald)" }}>
          {formatCurrency(summary.totalActual)}
        </span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Remaining</span>
        <span className="stat-val" style={{ color: summary.remainingActual < 0 ? "var(--accent-rose)" : "var(--accent-gold)" }}>
          {formatCurrency(summary.remainingActual)}
        </span>
      </div>
    </section>
  );
}
