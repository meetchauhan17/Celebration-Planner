import React from "react";
import { Checkbox, Textarea, Field } from "@/components/ui";
import { PlanFormData, PRIORITY_OPTIONS, STANDARD_DIETARY } from "./planValidation";
import { ReviewSummary } from "./ReviewSummary";

export interface StepPreferencesProps {
  formData: PlanFormData;
  updateField: <K extends keyof PlanFormData>(key: K, value: PlanFormData[K]) => void;
  errors: Record<string, string>;
}

export const StepPreferences: React.FC<StepPreferencesProps> = ({
  formData,
  updateField,
  errors,
}) => {
  const selectedPriorities = formData.priorities || [];
  const maxPrioritiesReached = selectedPriorities.length >= 3;

  const handlePriorityToggle = (priority: PlanFormData["priorities"][number]) => {
    if (selectedPriorities.includes(priority)) {
      updateField("priorities", selectedPriorities.filter((p) => p !== priority));
    } else if (!maxPrioritiesReached) {
      updateField("priorities", [...selectedPriorities, priority]);
    }
  };

  const handleDietaryToggle = (item: string) => {
    const current = formData.dietaryNeeds || [];
    if (current.includes(item)) {
      updateField("dietaryNeeds", current.filter((d) => d !== item));
    } else {
      updateField("dietaryNeeds", [...current, item]);
    }
  };

  return (
    <fieldset className="np-fieldset">
      <legend className="np-legend">Preferences</legend>

      <div className="np-field-wrapper">
        <span id="priorities-label" className="np-field-label">
          Planning Priorities (Choose up to 3)
        </span>
        <p
          className="text-compact"
          style={{
            margin: "0 0 8px 0",
            color: maxPrioritiesReached ? "var(--dp-color-accent)" : "var(--dp-color-secondary)",
          }}
        >
          {maxPrioritiesReached
            ? "Maximum of 3 priorities selected. Uncheck one to change."
            : `Selected ${selectedPriorities.length} of 3 maximum.`}
        </p>

        <div
          role="group"
          aria-labelledby="priorities-label"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}
        >
          {PRIORITY_OPTIONS.map((opt) => {
            const checked = selectedPriorities.includes(opt.id as any);
            return (
              <Checkbox
                key={opt.id}
                id={`priority-${opt.id}`}
                label={opt.label}
                checked={checked}
                disabled={!checked && maxPrioritiesReached}
                onChange={() => handlePriorityToggle(opt.id as any)}
              />
            );
          })}
        </div>
        {errors.priorities && (
          <span className="np-field-error" role="alert">
            {errors.priorities}
          </span>
        )}
      </div>

      <div className="np-field-wrapper">
        <span id="dietary-label" className="np-field-label">
          Dietary Requirements
        </span>
        <div
          role="group"
          aria-labelledby="dietary-label"
          style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "4px" }}
        >
          {STANDARD_DIETARY.map((item) => (
            <Checkbox
              key={item}
              id={`dietary-${item.toLowerCase()}`}
              label={item}
              checked={formData.dietaryNeeds.includes(item)}
              onChange={() => handleDietaryToggle(item)}
            />
          ))}
        </div>

        <div style={{ marginTop: "10px" }}>
          <Field
            id="plan-other-dietary"
            label="Other Dietary Needs"
            placeholder="e.g. Nut allergy, Dairy-free"
            value={formData.otherDietary}
            onChange={(e) => updateField("otherDietary", e.target.value)}
            maxLength={50}
          />
        </div>
      </div>

      <div className="np-field-wrapper">
        <Textarea
          id="plan-notes"
          label="Logistical Notes & Vision"
          placeholder="Special customs, key timeline constraints, or aesthetic direction..."
          value={formData.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          maxLength={500}
          rows={3}
          error={errors.notes}
        />
        <div style={{ textAlign: "right", marginTop: "4px" }}>
          <span
            className="text-compact"
            style={{
              fontFamily: "var(--dp-typography-display)",
              fontSize: "12px",
              color: "var(--dp-color-secondary)",
            }}
          >
            {formData.notes.length} / 500 characters
          </span>
        </div>
      </div>

      <ReviewSummary formData={formData} />
    </fieldset>
  );
};
