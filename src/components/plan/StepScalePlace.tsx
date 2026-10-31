import React from "react";
import { Field, Select, Radio } from "@/components/ui";
import { PlanFormData } from "./planValidation";

export interface StepScalePlaceProps {
  formData: PlanFormData;
  updateField: <K extends keyof PlanFormData>(key: K, value: PlanFormData[K]) => void;
  errors: Record<string, string>;
}

const CITY_TIER_OPTIONS = [
  { value: "metro", label: "Metro (Tier 1 - High Real Estate)" },
  { value: "tier2", label: "Tier 2 City (Moderate Costs)" },
  { value: "town", label: "Town / Rural (Lower Real Estate)" },
];

export const StepScalePlace: React.FC<StepScalePlaceProps> = ({
  formData,
  updateField,
  errors,
}) => {
  return (
    <fieldset className="np-fieldset">
      <legend className="np-legend">Scale and place</legend>

      <Field
        id="plan-guests"
        type="number"
        label="Target Guest Count"
        required
        min={1}
        max={2000}
        value={formData.guestCount}
        onChange={(e) => updateField("guestCount", e.target.value === "" ? "" : Number(e.target.value))}
        error={errors.guestCount}
        description="Estimate of confirmed attendance. Used to calculate catering floors and venue capacity."
      />

      <Field
        id="plan-city"
        label="Host City"
        required
        placeholder="e.g. Udaipur, Jaipur, or Mumbai"
        value={formData.city}
        onChange={(e) => updateField("city", e.target.value)}
        error={errors.city}
        maxLength={60}
      />

      <Select
        id="plan-tier"
        label="City Classification Tier"
        required
        value={formData.cityTier}
        onChange={(e) => updateField("cityTier", e.target.value as PlanFormData["cityTier"])}
        options={CITY_TIER_OPTIONS}
        error={errors.cityTier}
        description="Metro shifts budget toward venue; towns shift budget toward catering."
      />

      <div className="np-field-wrapper">
        <span id="venue-type-label" className="np-field-label">
          Venue Environment *
        </span>
        <div
          role="radiogroup"
          aria-labelledby="venue-type-label"
          style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "4px" }}
        >
          <Radio
            id="venue-indoor"
            name="plan-venue"
            value="indoor"
            label="Indoor"
            checked={formData.venueType === "indoor"}
            onChange={() => updateField("venueType", "indoor")}
          />
          <Radio
            id="venue-outdoor"
            name="plan-venue"
            value="outdoor"
            label="Outdoor"
            checked={formData.venueType === "outdoor"}
            onChange={() => updateField("venueType", "outdoor")}
          />
          <Radio
            id="venue-hybrid"
            name="plan-venue"
            value="hybrid"
            label="Hybrid"
            checked={formData.venueType === "hybrid"}
            onChange={() => updateField("venueType", "hybrid")}
          />
        </div>
        {errors.venueType && (
          <span className="np-field-error" role="alert">
            {errors.venueType}
          </span>
        )}
      </div>
    </fieldset>
  );
};

