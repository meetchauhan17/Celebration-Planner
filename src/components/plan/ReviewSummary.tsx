import React from "react";
import { PlanFormData } from "./planValidation";

export interface ReviewSummaryProps {
  formData: PlanFormData;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({ formData }) => {
  const selectedPriorities = formData.priorities || [];
  const budgetNum = Number(formData.totalBudget) || 0;
  const guestsNum = Number(formData.guestCount) || 0;
  const perGuest = guestsNum > 0 ? Math.round(budgetNum / guestsNum) : 0;
  const currencySymbol = formData.currency === "INR" ? "₹" : formData.currency;

  const allDietary = [
    ...formData.dietaryNeeds,
    ...(formData.otherDietary.trim() ? [formData.otherDietary.trim()] : []),
  ];

  return (
    <div style={{ marginTop: "16px" }}>
      <span className="np-field-label" style={{ marginBottom: "8px", display: "block" }}>
        Review your answers
      </span>
      <dl className="np-review-dl">
        <dt className="np-review-dt">Event</dt>
        <dd className="np-review-dd">{formData.name || "Untitled Celebration"} ({formData.type})</dd>

        <dt className="np-review-dt">Date</dt>
        <dd className="np-review-dd">{formData.date || "Not set"}</dd>

        <dt className="np-review-dt">Scale & Location</dt>
        <dd className="np-review-dd">
          {formData.guestCount} guests · {formData.city || "Unspecified"} ({formData.cityTier}) · {formData.venueType}
        </dd>

        <dt className="np-review-dt">Budget</dt>
        <dd className="np-review-dd">
          {currencySymbol}{budgetNum.toLocaleString()} ({currencySymbol}{perGuest.toLocaleString()} / guest)
        </dd>

        <dt className="np-review-dt">Priorities</dt>
        <dd className="np-review-dd">{selectedPriorities.join(", ") || "None selected"}</dd>

        <dt className="np-review-dt">Dietary</dt>
        <dd className="np-review-dd">{allDietary.join(", ") || "Standard menu"}</dd>

        {formData.notes.trim() && (
          <>
            <dt className="np-review-dt">Notes</dt>
            <dd className="np-review-dd">{formData.notes.trim()}</dd>
          </>
        )}
      </dl>
    </div>
  );
};

