"use client";

import React from "react";
import { Guest } from "@/lib/domain";
import { cateringHeadcount, getDietaryBreakdown } from "@/lib/engine/guests";
import { SectionLabel } from "@/components/ui/SectionLabel";

export interface CateringSummaryProps {
  guests: Guest[];
}

export const CateringSummary: React.FC<CateringSummaryProps> = ({ guests }) => {
  const confirmed = guests
    .filter((g) => g.rsvp === "yes")
    .reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);
  const suggested = cateringHeadcount(guests);
  const dietaryList = getDietaryBreakdown(guests);

  return (
    <section
      aria-labelledby="catering-counts-heading"
      style={{
        border: "1px solid var(--dp-color-surface-muted)",
        borderTop: "4px solid var(--dp-color-primary)",
        borderRadius: "20px 24px 18px 22px / 22px 18px 24px 20px",
        padding: "var(--dp-space-md)",
        marginBottom: "var(--dp-space-xl)",
        backgroundColor: "var(--dp-color-surface, #f5eddf)",
      }}
    >
      <SectionLabel>Catering Planning</SectionLabel>
      <h2
        id="catering-counts-heading"
        style={{
          fontFamily: "var(--dp-typography-display)",
          fontSize: "1.4rem",
          margin: "4px 0 12px 0",
        }}
      >
        Catering Headcount & Dietary Breakdown
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--dp-space-md)",
          marginBottom: "var(--dp-space-md)",
        }}
      >
        <div>
          <span className="text-label" style={{ display: "block" }}>
            Confirmed Headcount
          </span>
          <span style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
            {confirmed} guests
          </span>
        </div>
        <div>
          <span className="text-label" style={{ display: "block" }}>
            Suggested Catering Headcount (with 10% buffer)
          </span>
          <span style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
            {suggested} servings
          </span>
        </div>
      </div>

      <div>
        <span className="text-label" style={{ display: "block", marginBottom: "4px" }}>
          Dietary Requirements (Confirmed Guests):
        </span>
        {dietaryList.length === 0 ? (
          <p style={{ margin: "4px 0", fontSize: "0.95rem", color: "var(--dp-color-secondary)" }}>
            No special dietary requirements recorded among confirmed guests.
          </p>
        ) : (
          <ul
            aria-label="Dietary breakdown"
            style={{
              margin: "4px 0 0 0",
              paddingLeft: "20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            {dietaryList.map(({ diet, count }) => (
              <li key={diet} style={{ fontSize: "0.95rem" }}>
                <strong>{diet}:</strong> {count}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

