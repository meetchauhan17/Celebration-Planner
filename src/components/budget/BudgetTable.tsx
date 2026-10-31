"use client";

import React from "react";
import { BudgetLine } from "@/lib/domain";
import { OVER_BUDGET_RATIO } from "@/lib/engine/budget";
import { formatCurrency } from "@/lib/utils/format";
import { BudgetProgressBar } from "./BudgetProgressBar";

export interface BudgetTableProps {
  lines: BudgetLine[];
  currency: string;
  totalBudget: number;
  onUpdateActual: (category: string, newActual: number | undefined) => void;
  onAdjustPlanned: (category: string, newPlanned: number) => void;
  errorMessage?: string | null;
}

export const BudgetTable: React.FC<BudgetTableProps> = ({
  lines,
  currency,
  totalBudget,
  onUpdateActual,
  onAdjustPlanned,
  errorMessage,
}) => {
  return (
    <div className="np-budget-table-container">
      {errorMessage && (
        <div
          role="alert"
          className="np-budget-error-banner"
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            border: "2px solid var(--dp-color-accent)",
            backgroundColor: "var(--dp-color-ground)",
            color: "var(--dp-color-accent)",
            fontWeight: "var(--dp-typography-label-weight)",
            fontSize: "var(--dp-typography-control)",
          }}
        >
          {errorMessage}
        </div>
      )}

      <div className="np-table-scroll-wrapper" style={{ overflowX: "auto" }}>
        <table className="np-budget-table">
          <caption
            style={{
              fontFamily: "var(--dp-typography-display)",
              fontSize: "var(--dp-typography-label)",
              fontWeight: "var(--dp-typography-label-weight)",
              letterSpacing: "var(--dp-typography-label-tracking)",
              textTransform: "uppercase",
              color: "var(--dp-color-accent)",
              textAlign: "left",
              marginBottom: "8px",
            }}
          >
            Category Allocations & Variance Accounting
          </caption>
          <thead>
            <tr>
              <th scope="col" style={{ width: "22%" }}>Category</th>
              <th scope="col" style={{ width: "10%" }}>Share</th>
              <th scope="col" style={{ width: "20%" }}>Planned</th>
              <th scope="col" style={{ width: "20%" }}>Actual Spend</th>
              <th scope="col" style={{ width: "14%" }}>Variance</th>
              <th scope="col" style={{ width: "14%" }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const actual = line.actualAmount ?? 0;
              const variance = actual - line.plannedAmount;
              const isOver = actual > line.plannedAmount * OVER_BUDGET_RATIO;
              const share = totalBudget > 0
                ? ((line.plannedAmount / totalBudget) * 100).toFixed(1)
                : "0.0";

              const categoryKey = line.category.toLowerCase().replace(/[^a-z0-9]/g, "-");
              const categoryName =
                line.category.charAt(0).toUpperCase() + line.category.slice(1);

              return (
                <tr
                  key={line.category}
                  className={`np-budget-row ${isOver ? "is-over-budget" : ""}`}
                  data-testid={`budget-row-${categoryKey}`}
                >
                  <th scope="row" style={{ fontWeight: "normal", textAlign: "left" }}>
                    <div style={{ fontWeight: "var(--dp-typography-label-weight)" }}>
                      {categoryName}
                    </div>
                    {isOver && (
                      <div
                        className="np-over-label"
                        aria-label={`${categoryName} is Over budget`}
                        style={{
                          color: "var(--dp-color-accent)",
                          fontSize: "var(--dp-typography-label)",
                          fontWeight: "var(--dp-typography-label-weight)",
                          letterSpacing: "var(--dp-typography-label-tracking)",
                          textTransform: "uppercase",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          marginTop: "2px",
                        }}
                      >
                        <span className="np-over-marker" aria-hidden="true" />
                        <span>Over</span>
                      </div>
                    )}
                  </th>

                  <td>{share}%</td>

                  <td>
                    <div className="np-cell-input-group">
                      <label
                        htmlFor={`planned-${categoryKey}`}
                        className="text-label np-cell-label"
                      >
                        Planned
                      </label>
                      <input
                        id={`planned-${categoryKey}`}
                        type="number"
                        min={0}
                        step={100}
                        defaultValue={line.plannedAmount}
                        key={`planned-val-${line.plannedAmount}`}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val !== line.plannedAmount) {
                            onAdjustPlanned(line.category, val);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }
                        }}
                        className="np-table-input"
                        aria-label={`Planned amount for ${categoryName}`}
                      />
                    </div>
                  </td>

                  <td>
                    <div className="np-cell-input-group">
                      <label
                        htmlFor={`actual-${categoryKey}`}
                        className="text-label np-cell-label"
                      >
                        Actual Spend
                      </label>
                      <input
                        id={`actual-${categoryKey}`}
                        type="number"
                        min={0}
                        step={100}
                        value={line.actualAmount ?? ""}
                        placeholder="0"
                        onChange={(e) => {
                          const val = e.target.value.trim() === "" ? undefined : parseInt(e.target.value, 10);
                          onUpdateActual(line.category, val);
                        }}
                        className="np-table-input"
                        aria-label={`Actual spend for ${categoryName}`}
                      />
                    </div>
                  </td>

                  <td>
                    <div
                      style={{
                        fontWeight: "var(--dp-typography-label-weight)",
                        color: isOver ? "var(--dp-color-accent)" : "var(--dp-color-ink)",
                      }}
                    >
                      {variance > 0
                        ? `+${formatCurrency(variance, currency)}`
                        : variance < 0
                          ? `-${formatCurrency(Math.abs(variance), currency)}`
                          : formatCurrency(0, currency)}
                    </div>
                    {isOver && (
                      <div
                        className="text-label"
                        style={{ color: "var(--dp-color-accent)", textTransform: "uppercase" }}
                      >
                        Over limit
                      </div>
                    )}
                  </td>

                  <td>
                    <BudgetProgressBar planned={line.plannedAmount} actual={actual} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BudgetTable;

