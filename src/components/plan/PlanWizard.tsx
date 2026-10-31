"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, SectionLabel } from "@/components/ui";
import { useAnnounce } from "@/components/shell";
import {
  PlanFormData,
  INITIAL_PLAN_FORM,
  validateStepForm,
  loadDraft,
  saveDraft,
  clearDraft,
} from "./planValidation";
import { FIELD_ID_MAP, executePlanCreation } from "./createPlanService";
import { StepBasics } from "./StepBasics";
import { StepScalePlace } from "./StepScalePlace";
import { StepMoney } from "./StepMoney";
import { StepPreferences } from "./StepPreferences";

export const PlanWizard: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { announce } = useAnnounce();

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<PlanFormData>(INITIAL_PLAN_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const draft = loadDraft();
    const queryType = searchParams.get("type");
    const validQueryType = queryType === "wedding" || queryType === "birthday" || queryType === "community" ? queryType : null;

    if (draft) {
      setFormData({ ...draft, type: validQueryType || draft.type || "wedding" });
    } else if (validQueryType) {
      setFormData((prev) => ({ ...prev, type: validQueryType }));
    }
  }, [searchParams]);

  const updateField = <K extends keyof PlanFormData>(key: K, value: PlanFormData[K]) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      saveDraft(next);
      return next;
    });
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateStepForm(step, formData);
    if (!validation.success) {
      setErrors(validation.errors);
      const firstKey = Object.keys(validation.errors)[0];
      const targetId = FIELD_ID_MAP[firstKey] || `plan-${firstKey}`;
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.focus();
        else if (errorSummaryRef.current) errorSummaryRef.current.focus();
      }, 50);
      return;
    }

    setErrors({});
    if (step < 4) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0 });
    } else {
      const res = executePlanCreation(formData);
      if (!res.ok) {
        setErrors({ form: res.error.message });
        return;
      }
      clearDraft();
      announce("Plan created");
      router.push(`/events/${res.data.brief.id}`);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setErrors({});
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0 });
    }
  };

  const errorList = Object.values(errors);

  return (
    <div className="np-plan-wizard">
      <div className="np-step-header">
        <p className="np-step-indicator">Step {step} of 4</p>
      </div>

      {errorList.length > 0 && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          aria-label="Please correct the following errors"
          className="np-error-summary"
        >
          <SectionLabel>Please correct the following errors</SectionLabel>
          <ul>
            {errorList.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleNext} noValidate>
        {step === 1 && <StepBasics formData={formData} updateField={updateField} errors={errors} />}
        {step === 2 && <StepScalePlace formData={formData} updateField={updateField} errors={errors} />}
        {step === 3 && <StepMoney formData={formData} updateField={updateField} errors={errors} />}
        {step === 4 && <StepPreferences formData={formData} updateField={updateField} errors={errors} />}

        <div className="np-wizard-actions">
          {step > 1 ? (
            <Button type="button" variant="default" onClick={handleBack}>
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button type="submit">
            {step === 4 ? "Create celebration plan" : "Next"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PlanWizard;
