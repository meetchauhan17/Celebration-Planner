import React from "react";

export interface BudgetProgressBarProps {
  planned: number;
  actual: number;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  planned,
  actual,
}) => {
  const ratio = planned > 0 ? (actual / planned) * 100 : 0;
  const clampedPercent = Math.min(100, Math.max(0, ratio));
  const roundedRatio = Math.round(ratio);
  const ratioText = `${roundedRatio}% of planned`;

  const isOver = ratio > 110;

  return (
    <div className="np-budget-progress-container">
      <div
        className="np-budget-bar-track"
        aria-hidden="true"
        style={{
          width: "100%",
          maxWidth: "160px",
          height: "9px",
          backgroundColor: "var(--dp-color-surface-muted, #ddd5c3)",
          border: "1px solid var(--dp-color-highlight, #b9b28b)",
          borderRadius: "var(--dp-radius-control)",
          position: "relative",
          margin: "4px 0",
          overflow: "hidden",
        }}
      >
        <div
          className="np-budget-bar-fill"
          style={{
            width: `${clampedPercent}%`,
            height: "100%",
            backgroundColor: isOver ? "var(--dp-color-field, #694737)" : "var(--dp-color-primary, #35422d)",
            borderRadius: "var(--dp-radius-control)",
            transition: "width var(--dp-motion-interaction)",
          }}
        />
      </div>
      <div
        className="text-label"
        aria-label={ratioText}
        style={{
          color: isOver ? "var(--dp-color-accent)" : "var(--dp-color-secondary)",
          fontWeight: isOver ? "800" : "var(--dp-typography-label-weight)",
          whiteSpace: "nowrap",
        }}
      >
        {ratioText}
      </div>
    </div>
  );
};

export default BudgetProgressBar;

