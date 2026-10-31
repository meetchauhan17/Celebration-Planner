"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

export interface BudgetResetConfirmProps {
  onReset: () => void;
}

export const BudgetResetConfirm: React.FC<BudgetResetConfirmProps> = ({ onReset }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = () => {
    onReset();
    setIsConfirming(false);
  };

  if (!isConfirming) {
    return (
      <div style={{ marginTop: "16px" }}>
        <Button
          variant="secondary"
          onClick={() => setIsConfirming(true)}
          type="button"
        >
          Reset to suggested budget
        </Button>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="np-reset-confirm-box"
      style={{
        marginTop: "16px",
        padding: "18px",
        border: "1px solid var(--dp-color-field)",
        borderLeft: "5px solid var(--dp-color-field)",
        borderRadius: "var(--dp-radius-control)",
        backgroundColor: "var(--dp-color-surface, #f5eddf)",
      }}
    >
      <div
        className="text-label"
        style={{
          color: "var(--dp-color-accent)",
          fontWeight: "var(--dp-typography-label-weight)",
          marginBottom: "6px",
        }}
      >
        Confirmation Required
      </div>
      <p className="text-compact" style={{ margin: "0 0 12px 0", color: "var(--dp-color-ink)" }}>
        Reset all categories to original suggested allocations? This will recalculate all planned lines based on your event parameters. Existing actual spend records will be retained.
      </p>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Button variant="default" onClick={handleConfirm} type="button">
          Confirm Reset
        </Button>
        <Button variant="secondary" onClick={() => setIsConfirming(false)} type="button">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default BudgetResetConfirm;

