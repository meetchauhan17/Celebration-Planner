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

  return (
    <div className="np-budget-progress-container">
      <div
        className="np-budget-bar-track"
        aria-hidden="true"
        style={{
          width: "100%",
          maxWidth: "160px",
          height: "8px",
          backgroundColor: "var(--dp-color-ground)",
          border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
          borderRadius: "var(--dp-radius-control)",
          position: "relative",
          margin: "4px 0",
        }}
      >
        <div
          className="np-budget-bar-fill"
          style={{
            width: `${clampedPercent}%`,
            height: "100%",
            backgroundColor: "var(--dp-color-ink)",
            borderRadius: "0",
            transition: "none",
          }}
        />
      </div>
      <div
        className="text-label"
        aria-label={ratioText}
        style={{
          color: ratio > 110 ? "var(--dp-color-accent)" : "var(--dp-color-secondary)",
          whiteSpace: "nowrap",
        }}
      >
        {ratioText}
      </div>
    </div>
  );
};

export default BudgetProgressBar;

