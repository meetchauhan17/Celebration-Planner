import React from "react";
import { Field, Select } from "@/components/ui";
import { CATERING_FLOOR_PER_GUEST } from "@/lib/engine/budget";
import { PlanFormData } from "./planValidation";

export interface StepMoneyProps {
  formData: PlanFormData;
  updateField: <K extends keyof PlanFormData>(key: K, value: PlanFormData[K]) => void;
  errors: Record<string, string>;
}

const CURRENCY_OPTIONS = [
  { value: "INR", label: "INR (₹) - Indian Rupee" },
  { value: "USD", label: "USD ($) - US Dollar" },
  { value: "EUR", label: "EUR (€) - Euro" },
  { value: "GBP", label: "GBP (£) - British Pound" },
];

export const StepMoney: React.FC<StepMoneyProps> = ({
  formData,
  updateField,
  errors,
}) => {
  const budgetNum = Number(formData.totalBudget) || 0;
  const guestsNum = Number(formData.guestCount) || 0;
  const perGuest = guestsNum > 0 ? Math.round(budgetNum / guestsNum) : 0;
  const floor = CATERING_FLOOR_PER_GUEST[formData.type];
  const isBelowFloor = perGuest > 0 && perGuest < floor;

  const currencySymbol = formData.currency === "INR" ? "₹" : formData.currency;

  return (
    <fieldset className="np-fieldset">
      <legend className="np-legend">Money</legend>

      <Field
        id="plan-budget"
        type="number"
        label="Total Celebration Budget"
        required
        min={1}
        value={formData.totalBudget}
        onChange={(e) => updateField("totalBudget", e.target.value === "" ? "" : Number(e.target.value))}
        error={errors.totalBudget}
        description="Total allocated capital to cover all venues, catering, logistics, and contingencies."
      />

      <Select
        id="plan-currency"
        label="Currency"
        required
        value={formData.currency}
        onChange={(e) => updateField("currency", e.target.value)}
        options={CURRENCY_OPTIONS}
        error={errors.currency}
      />

      {/* Live per-guest calculation & gentle warning */}
      <div
        className="np-field-wrapper"
        style={{
          padding: "16px 18px",
          border: isBelowFloor
            ? "1px solid var(--dp-color-field)"
            : "1px solid var(--dp-color-surface-muted)",
          borderLeft: isBelowFloor
            ? "5px solid var(--dp-color-field)"
            : "5px solid var(--dp-color-primary)",
          borderRadius: "var(--dp-radius-control)",
          backgroundColor: "var(--dp-color-surface, #f5eddf)",
        }}
      >
        <span className="np-field-label">Per-Guest Estimate</span>
        <p style={{ margin: "4px 0 0 0", fontSize: "1.1rem", fontFamily: "var(--dp-typography-display)" }}>
          {guestsNum > 0
            ? `About ${currencySymbol}${perGuest.toLocaleString()} per guest`
            : "Enter guest count to compute per-guest figure"}
        </p>

        {isBelowFloor && (
          <p
            role="status"
            style={{
              marginTop: "8px",
              marginBottom: 0,
              fontSize: "14px",
              color: "var(--dp-color-accent)",
              fontFamily: "var(--dp-typography-reading)",
            }}
          >
            Budget notice: At {currencySymbol}{perGuest} per guest, total funds are below the typical catering floor
            of {currencySymbol}{floor} for a {formData.type}. The engine will adjust decor and entertainment lines to
            maintain basic catering standards.
          </p>
        )}
      </div>
    </fieldset>
  );
};

