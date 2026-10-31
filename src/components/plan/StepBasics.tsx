import React from "react";
import { Field, Radio } from "@/components/ui";
import { PlanFormData } from "./planValidation";

export interface StepBasicsProps {
  formData: PlanFormData;
  updateField: <K extends keyof PlanFormData>(key: K, value: PlanFormData[K]) => void;
  errors: Record<string, string>;
}

export const StepBasics: React.FC<StepBasicsProps> = ({
  formData,
  updateField,
  errors,
}) => {
  const todayIso = new Date().toISOString().split("T")[0];

  return (
    <fieldset className="np-fieldset">
      <legend className="np-legend">The basics</legend>

      <div className="np-field-wrapper">
        <span id="event-type-label" className="np-field-label">
          Event Type *
        </span>
        <div
          role="radiogroup"
          aria-labelledby="event-type-label"
          style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "4px" }}
        >
          <Radio
            id="type-wedding"
            name="plan-type"
            value="wedding"
            label="Wedding"
            checked={formData.type === "wedding"}
            onChange={() => updateField("type", "wedding")}
          />
          <Radio
            id="type-birthday"
            name="plan-type"
            value="birthday"
            label="Birthday"
            checked={formData.type === "birthday"}
            onChange={() => updateField("type", "birthday")}
          />
          <Radio
            id="type-community"
            name="plan-type"
            value="community"
            label="Community"
            checked={formData.type === "community"}
            onChange={() => updateField("type", "community")}
          />
        </div>
        {errors.type && (
          <span className="np-field-error" role="alert">
            {errors.type}
          </span>
        )}
      </div>

      <Field
        id="plan-name"
        label="Event Name"
        required
        placeholder="e.g. Radhika & Aman Wedding"
        value={formData.name}
        onChange={(e) => updateField("name", e.target.value)}
        error={errors.name}
        maxLength={80}
      />

      <Field
        id="plan-date"
        type="date"
        label="Celebration Date"
        required
        min={todayIso}
        value={formData.date}
        onChange={(e) => updateField("date", e.target.value)}
        error={errors.date}
      />
    </fieldset>
  );
};

