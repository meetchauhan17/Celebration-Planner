"use client";

import React, { useState, useEffect, useRef } from "react";
import { PlannedEvent, Idea } from "@/lib/domain";
import { updateEvent } from "@/lib/storage";
import { useAnnounce } from "@/components/shell";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { IdeasLead } from "./IdeasLead";
import { IdeasControls, IdeaFocusType } from "./IdeasControls";
import { IdeaCard, GeneratedIdea } from "./IdeaCard";

export interface IdeasViewProps {
  event: PlannedEvent;
}

export const IdeasView: React.FC<IdeasViewProps> = ({ event }) => {
  const { brief, ideas = [] } = event;
  const { announce } = useAnnounce();

  const [isLoading, setIsLoading] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([]);
  const [responseSource, setResponseSource] = useState<"ai" | "fallback" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Abort controller reference for ongoing requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Abort on unmount / navigation away
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleGenerate = async (focus: IdeaFocusType, mood: string) => {
    if (isLoading) return; // Prevent double submit

    // Abort previous if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorMsg(null);
    setResponseSource(null);

    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          type: brief.type,
          eventType: brief.type,
          focus,
          mood: mood || undefined,
          guestCount: brief.guestCount,
          totalBudget: brief.totalBudget,
          currency: brief.currency,
          city: brief.city,
          cityTier: brief.cityTier,
          venueType: brief.venueType,
          priorities: brief.priorities,
          dietaryNeeds: brief.dietaryNeeds,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          setErrorMsg("We've hit a temporary rate limit. Please wait a moment and try again.");
        } else if (response.status === 400) {
          setErrorMsg("Could not process your request parameters. Please check your options and retry.");
        } else {
          setErrorMsg("Service temporarily unavailable. Please retry in a moment.");
        }
        setIsLoading(false);
        return;
      }

      const json = await response.json();
      if (json && Array.isArray(json.ideas)) {
        setGeneratedIdeas(json.ideas);
        setResponseSource(json.source === "fallback" ? "fallback" : "ai");
        announce(
          json.source === "fallback"
            ? "Generated general suggestions."
            : "Generated tailored celebration ideas.",
          "polite"
        );
      } else {
        setErrorMsg("Received unexpected response format. Please try again.");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        // Request was aborted by user or navigation
        return;
      }
      setErrorMsg("Network connection error. Please check your connection and retry.");
    } finally {
      setIsLoading(false);
    }
  };

  // Saved idea logic
  const isIdeaSaved = (ideaTitle: string) => {
    return ideas.some((i) => i.title.toLowerCase() === ideaTitle.toLowerCase() && i.saved);
  };

  const handleToggleSaveGenerated = (item: GeneratedIdea) => {
    const existing = ideas.find((i) => i.title.toLowerCase() === item.title.toLowerCase());
    let nextIdeas: Idea[];

    if (existing) {
      // Toggle saved flag
      nextIdeas = ideas.map((i) =>
        i.id === existing.id ? { ...i, saved: !i.saved } : i
      );
    } else {
      // Add as new saved idea
      const newIdea: Idea = {
        id: crypto.randomUUID ? crypto.randomUUID() : `idea-${Date.now()}`,
        title: item.title,
        description: item.description,
        tag: item.tag,
        saved: true,
      };
      nextIdeas = [newIdea, ...ideas];
    }

    const res = updateEvent(brief.id, { ideas: nextIdeas });
    if (res.ok) {
      const willBeSaved = !isIdeaSaved(item.title);
      announce(willBeSaved ? `Saved "${item.title}".` : `Removed "${item.title}".`, "polite");
    }
  };

  const handleRemoveSaved = (ideaId: string, ideaTitle: string) => {
    const nextIdeas = ideas.map((i) =>
      i.id === ideaId ? { ...i, saved: false } : i
    );
    const res = updateEvent(brief.id, { ideas: nextIdeas });
    if (res.ok) {
      announce(`Removed "${ideaTitle}" from saved ideas.`, "polite");
    }
  };

  const savedIdeas = ideas.filter((i) => i.saved);

  // Divide into lead (first idea) and supporting (rest)
  const leadIdea = generatedIdeas[0];
  const supportingIdeas = generatedIdeas.slice(1);

  return (
    <div className="np-ideas-view" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <IdeasLead brief={brief} />

      <IdeasControls
        isLoading={isLoading}
        onGenerate={handleGenerate}
      />

      {/* Error alert with retry */}
      {errorMsg && (
        <div
          role="alert"
          data-testid="ideas-error-alert"
          style={{
            border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
            borderLeft: "var(--dp-border-rule) solid var(--dp-color-accent)",
            backgroundColor: "var(--dp-color-ground)",
            padding: "var(--dp-space-md)",
            marginBottom: "var(--dp-space-xl)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <strong style={{ display: "block", color: "var(--dp-color-accent)" }}>
              Unable to generate ideas
            </strong>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.95rem" }}>{errorMsg}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => handleGenerate("theme", "")}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Honesty note on provenance */}
      {responseSource && (
        <div
          style={{
            borderLeft: "var(--dp-border-rule) solid var(--dp-color-ink)",
            padding: "var(--dp-space-sm) var(--dp-space-md)",
            backgroundColor: "var(--dp-color-ground)",
            marginBottom: "var(--dp-space-lg)",
            fontSize: "0.95rem",
          }}
        >
          {responseSource === "fallback" ? (
            <p style={{ margin: 0 }}>
              AI is unavailable right now, so these are general suggestions for your event type.
            </p>
          ) : (
            <p style={{ margin: 0 }}>
              Suggestions generated by AI. Verify costs and feasibility.
            </p>
          )}
        </div>
      )}

      {/* Results Spread: Unequal hierarchy (Lead 1st in larger column, 4 supporting entries) */}
      {generatedIdeas.length > 0 && (
        <section aria-labelledby="generated-ideas-heading" style={{ marginBottom: "var(--dp-space-xl)" }}>
          <div style={{ marginBottom: "var(--dp-space-md)" }}>
            <SectionLabel>Ideas Desk</SectionLabel>
            <h2
              id="generated-ideas-heading"
              style={{
                fontFamily: "var(--dp-typography-display)",
                fontSize: "1.6rem",
                margin: "4px 0",
              }}
            >
              Latest Suggestions
            </h2>
          </div>

          <div
            className="np-ideas-spread"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(320px, 1.4fr) minmax(280px, 1.6fr)",
              gap: "var(--dp-space-lg)",
              alignItems: "stretch",
            }}
          >
            {/* Lead entry */}
            {leadIdea && (
              <div>
                <IdeaCard
                  idea={leadIdea}
                  isLead={true}
                  isSaved={isIdeaSaved(leadIdea.title)}
                  onToggleSave={() => handleToggleSaveGenerated(leadIdea)}
                />
              </div>
            )}

            {/* Supporting 4 entries in a 2-col or stacked subgrid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "var(--dp-space-md)",
              }}
            >
              {supportingIdeas.map((idea) => (
                <IdeaCard
                  key={idea.title}
                  idea={idea}
                  isLead={false}
                  isSaved={isIdeaSaved(idea.title)}
                  onToggleSave={() => handleToggleSaveGenerated(idea)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Saved Ideas Pinned Beneath Results */}
      <section aria-labelledby="saved-ideas-heading" style={{ marginTop: "var(--dp-space-xl)" }}>
        <div
          style={{
            borderBottom: "var(--dp-border-hairline) solid var(--dp-color-rule)",
            paddingBottom: "8px",
            marginBottom: "var(--dp-space-md)",
          }}
        >
          <SectionLabel>Pinned Scrapbook</SectionLabel>
          <h2
            id="saved-ideas-heading"
            style={{
              fontFamily: "var(--dp-typography-display)",
              fontSize: "1.5rem",
              margin: "4px 0",
            }}
          >
            Saved Ideas ({savedIdeas.length})
          </h2>
        </div>

        {savedIdeas.length === 0 ? (
          <p style={{ fontStyle: "italic", color: "var(--dp-color-secondary)", padding: "12px 0" }}>
            No ideas saved yet. Click &ldquo;Save idea&rdquo; on any generated idea above to pin it to your event scrapbook.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "var(--dp-space-md)",
            }}
          >
            {savedIdeas.map((saved) => (
              <article
                key={saved.id}
                style={{
                  border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
                  padding: "var(--dp-space-md)",
                  backgroundColor: "var(--dp-color-canvas)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span
                    className="text-label"
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  >
                    {saved.tag || "Idea"}
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--dp-typography-display)",
                      fontSize: "1.2rem",
                      margin: "4px 0 8px 0",
                    }}
                  >
                    {saved.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--dp-typography-reading)",
                      fontSize: "0.95rem",
                      lineHeight: "1.5",
                      margin: "0 0 12px 0",
                    }}
                  >
                    {saved.description}
                  </p>
                </div>
                <div>
                  <Button
                    variant="secondary"
                    onClick={() => handleRemoveSaved(saved.id, saved.title)}
                    aria-label={`Remove ${saved.title} from saved`}
                    style={{ width: "100%" }}
                  >
                    Remove from saved
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
