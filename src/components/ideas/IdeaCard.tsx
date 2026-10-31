"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export interface GeneratedIdea {
  title: string;
  description: string;
  tag: string;
  estimatedCost: "low" | "medium" | "high";
}

export interface IdeaCardProps {
  idea: GeneratedIdea;
  isLead?: boolean;
  isSaved: boolean;
  onToggleSave: () => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  isLead = false,
  isSaved,
  onToggleSave,
}) => {
  const costLabel =
    idea.estimatedCost === "low"
      ? "Cost: Low"
      : idea.estimatedCost === "high"
      ? "Cost: High"
      : "Cost: Medium";

  return (
    <article
      className={`np-idea-entry ${isLead ? "np-idea-lead" : "np-idea-supporting"}`}
      style={{
        border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
        padding: isLead ? "var(--dp-space-lg)" : "var(--dp-space-md)",
        backgroundColor: "var(--dp-color-canvas)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "8px",
            borderBottom: "var(--dp-border-hairline) solid var(--dp-color-rule)",
            paddingBottom: "4px",
          }}
        >
          <span
            className="text-label"
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: "0.75rem",
              fontWeight: "bold",
            }}
          >
            {idea.tag}
          </span>
          <span
            className="text-label"
            style={{
              fontSize: "0.8rem",
              color: "var(--dp-color-secondary)",
            }}
          >
            {costLabel}
          </span>
        </div>

        <h3
          style={{
            fontFamily: "var(--dp-typography-display)",
            fontSize: isLead ? "1.6rem" : "1.2rem",
            fontWeight: "var(--dp-typography-display-weight)",
            lineHeight: "1.2",
            margin: "0 0 10px 0",
          }}
        >
          {idea.title}
        </h3>

        <p
          style={{
            fontFamily: "var(--dp-typography-reading)",
            fontSize: isLead ? "1.05rem" : "0.95rem",
            lineHeight: "1.5",
            margin: "0 0 16px 0",
            color: "var(--dp-color-ink)",
          }}
        >
          {idea.description}
        </p>
      </div>

      <div style={{ marginTop: "12px", borderTop: "var(--dp-border-hairline) solid var(--dp-color-rule)", paddingTop: "8px" }}>
        <Button
          variant={isSaved ? "secondary" : "default"}
          aria-pressed={isSaved}
          onClick={onToggleSave}
          style={{ width: "100%" }}
        >
          {isSaved ? "Remove from saved" : "Save idea"}
        </Button>
      </div>
    </article>
  );
};

