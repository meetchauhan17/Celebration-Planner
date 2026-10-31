"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

export type IdeaFocusType = "theme" | "menu" | "activities" | "decor" | "surprises";

export interface IdeasControlsProps {
  isLoading: boolean;
  onGenerate: (focus: IdeaFocusType, mood: string) => void;
}

export const IdeasControls: React.FC<IdeasControlsProps> = ({
  isLoading,
  onGenerate,
}) => {
  const [focus, setFocus] = useState<IdeaFocusType>("theme");
  const [mood, setMood] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onGenerate(focus, mood.trim());
  };

  return (
    <section
      aria-labelledby="ideas-controls-heading"
      style={{
        border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
        padding: "var(--dp-space-md)",
        marginBottom: "var(--dp-space-xl)",
        backgroundColor: "var(--dp-color-canvas)",
      }}
    >
      <h2
        id="ideas-controls-heading"
        style={{
          fontFamily: "var(--dp-typography-display)",
          fontSize: "1.3rem",
          margin: "0 0 12px 0",
        }}
      >
        Select Focus & Mood
      </h2>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--dp-space-md)",
            alignItems: "flex-end",
            marginBottom: "var(--dp-space-md)",
          }}
        >
          <div>
            <Select
              id="ideas-focus-select"
              label="Planning Focus"
              value={focus}
              onChange={(e) => setFocus(e.target.value as IdeaFocusType)}
              disabled={isLoading}
              options={[
                { value: "theme", label: "Theme & Concept" },
                { value: "menu", label: "Menu & Refreshments" },
                { value: "activities", label: "Activities & Entertainment" },
                { value: "decor", label: "Décor & Ambiance" },
                { value: "surprises", label: "Surprises & Special Touches" },
              ]}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label htmlFor="ideas-mood-input" className="text-label" style={{ marginBottom: "4px" }}>
                Mood / Aesthetic (Optional)
              </label>
              <span className="text-label" style={{ color: "var(--dp-color-secondary)", fontSize: "0.8rem" }}>
                {mood.length}/100
              </span>
            </div>
            <input
              id="ideas-mood-input"
              type="text"
              maxLength={100}
              placeholder="e.g. Elegant garden party, vibrant retro, minimalist"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "8px",
                border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
                backgroundColor: "var(--dp-color-ground)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
              style={{ width: "100%", padding: "10px 16px" }}
            >
              Generate ideas
            </Button>
          </div>
        </div>

        {/* Live plain status announcement during generation */}
        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            data-testid="ideas-generating-status"
            style={{
              padding: "8px 0",
              fontSize: "0.95rem",
              fontStyle: "italic",
              color: "var(--dp-color-secondary)",
            }}
          >
            Generating ideas…
          </div>
        )}
      </form>
    </section>
  );
};
