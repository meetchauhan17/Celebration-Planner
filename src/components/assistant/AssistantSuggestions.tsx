"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

export interface AssistantSuggestionsProps {
  onSelectSuggestion: (question: string) => void;
  disabled?: boolean;
}

export const SUGGESTIONS = [
  "What should I do this week?",
  "Am I over budget anywhere?",
  "Which vendors should I book first?",
  "How can I cut costs without cutting the food?",
  "Draft a message asking a caterer for a quote",
];

export const AssistantSuggestions: React.FC<AssistantSuggestionsProps> = ({
  onSelectSuggestion,
  disabled = false,
}) => {
  return (
    <aside
      aria-labelledby="assistant-suggestions-heading"
      className="np-assistant-suggestions"
      style={{
        border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
        padding: "var(--dp-space-md)",
        backgroundColor: "var(--dp-color-canvas)",
      }}
    >
      <SectionLabel>Quick Inquiries</SectionLabel>
      <h2
        id="assistant-suggestions-heading"
        style={{
          fontFamily: "var(--dp-typography-display)",
          fontSize: "1.3rem",
          margin: "4px 0 12px 0",
        }}
      >
        Try Asking
      </h2>
      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--dp-color-secondary)",
          margin: "0 0 16px 0",
          lineHeight: "1.4",
        }}
      >
        Click any prompt to instantly draft or ask about your plan:
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {SUGGESTIONS.map((prompt) => (
          <Button
            key={prompt}
            variant="secondary"
            disabled={disabled}
            onClick={() => onSelectSuggestion(prompt)}
            style={{
              textAlign: "left",
              whiteSpace: "normal",
              height: "auto",
              padding: "8px 10px",
              fontSize: "0.85rem",
              lineHeight: "1.3",
            }}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </aside>
  );
};

