"use client";

import React, { useState, useRef, useEffect } from "react";
import { PlannedEvent } from "@/lib/domain";
import { buildEventContext } from "@/lib/ai/context";
import { useAnnounce } from "@/components/shell";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { AssistantSuggestions } from "./AssistantSuggestions";
import { AssistantMessages, ChatMessage } from "./AssistantMessages";
import { AssistantComposer } from "./AssistantComposer";

export interface AssistantViewProps {
  event: PlannedEvent;
}

export const AssistantView: React.FC<AssistantViewProps> = ({ event }) => {
  const { brief } = event;
  const { announce } = useAnnounce();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Abort in-flight requests when navigating away
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setErrorMsg(null);

    // Call buildEventContext on the client-safe event (aggregates only, no guest names)
    const eventSummary = buildEventContext(event);

    // Send the last 12 messages plus the summary
    const payloadMessages = nextMessages.slice(-12).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: payloadMessages,
          eventSummary,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          setErrorMsg("We've hit a temporary rate limit. Please wait a moment and try again.");
        } else if (response.status === 400) {
          setErrorMsg("Could not process your question parameters. Please rephrase and try again.");
        } else {
          setErrorMsg("Service temporarily unavailable. Please retry in a moment.");
        }
        setIsLoading(false);
        return;
      }

      const json = await response.json();
      if (json && typeof json.message === "string") {
        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          role: "assistant",
          content: json.message,
          source: json.source === "fallback" ? "fallback" : "ai",
        };
        setMessages((prev) => [...prev, assistantMsg]);
        announce(
          json.source === "fallback"
            ? "Assistant replied from your event data."
            : "Assistant replied with AI guidance.",
          "polite"
        );
      } else {
        setErrorMsg("Received unexpected response format. Please try again.");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        return;
      }
      setErrorMsg("Network connection error. Please check your connection and retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInput("");
    setErrorMsg(null);
    announce("Conversation cleared.", "polite");
  };

  return (
    <div className="np-assistant-view" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <section aria-labelledby="assistant-page-heading" style={{ marginBottom: "var(--dp-space-lg)" }}>
        <SectionLabel>Planning Concierge</SectionLabel>
        <h1
          id="assistant-page-heading"
          style={{
            fontFamily: "var(--dp-typography-display)",
            fontSize: "2.6rem",
            fontWeight: "var(--dp-typography-display-weight)",
            margin: "8px 0 6px 0",
            lineHeight: "1.1",
          }}
        >
          Event Planning Assistant
        </h1>
        <p
          style={{
            fontFamily: "var(--dp-typography-reading)",
            fontSize: "1.05rem",
            color: "var(--dp-color-secondary)",
            margin: "0 0 12px 0",
            maxWidth: "750px",
          }}
        >
          Consult directly on your budget allocations, upcoming deadlines, vendor confirmations,
          and planning strategies.
        </p>

        {/* Privacy notice banner */}
        <div
          role="note"
          aria-label="Privacy notice"
          style={{
            border: "1px solid var(--dp-color-surface-muted)",
            borderLeft: "4px solid var(--dp-color-primary)",
            borderRadius: "var(--dp-radius-control)",
            padding: "var(--dp-space-sm) var(--dp-space-md)",
            backgroundColor: "var(--dp-color-surface, #f5eddf)",
            fontSize: "0.9rem",
          }}
        >
          Privacy note: Only aggregate event statistics and anonymous summaries are shared. Guest names, personal details, and conversation histories are never stored or exposed.
        </div>
      </section>

      {/* Error alert with retry */}
      {errorMsg && (
        <div
          role="alert"
          data-testid="assistant-error-alert"
          style={{
            border: "1px solid var(--dp-color-field)",
            borderLeft: "5px solid var(--dp-color-field)",
            borderRadius: "var(--dp-radius-control)",
            backgroundColor: "var(--dp-color-surface, #f5eddf)",
            padding: "var(--dp-space-md)",
            marginBottom: "var(--dp-space-lg)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <strong style={{ display: "block", color: "var(--dp-color-field)" }}>
              Unable to complete request
            </strong>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.95rem" }}>{errorMsg}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              const lastUser = [...messages].reverse().find((m) => m.role === "user");
              if (lastUser) handleSend(lastUser.content);
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Newsprint two-column spread: Narrow column (Try asking) + Wide column (Conversation) */}
      <div className="np-assistant-spread">
        {/* Narrow column */}
        <div>
          <AssistantSuggestions
            onSelectSuggestion={(prompt) => handleSend(prompt)}
            disabled={isLoading}
          />
        </div>

        {/* Wide column: Ordered conversation list in document flow + Composer */}
        <section aria-labelledby="assistant-dialogue-heading">
          <h2 id="assistant-dialogue-heading" className="sr-only">
            Conversation History
          </h2>

          <AssistantMessages messages={messages} isLoading={isLoading} />

          <AssistantComposer
            input={input}
            onChange={setInput}
            onSend={handleSend}
            isLoading={isLoading}
            onClear={handleClear}
            hasMessages={messages.length > 0}
          />
        </section>
      </div>
    </div>
  );
};

