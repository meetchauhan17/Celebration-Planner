"use client";

import React from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: "ai" | "fallback";
}

export interface AssistantMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export const AssistantMessages: React.FC<AssistantMessagesProps> = ({
  messages,
  isLoading,
}) => {
  if (messages.length === 0 && !isLoading) {
    return (
      <div
        style={{
          padding: "var(--dp-space-xl) var(--dp-space-md)",
          border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
          backgroundColor: "var(--dp-color-canvas)",
          textAlign: "center",
          color: "var(--dp-color-secondary)",
          fontStyle: "italic",
        }}
      >
        No messages yet. Ask a question or select one of the suggestions from the left column.
      </div>
    );
  }

  return (
    <ol
      aria-label="Planning conversation"
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: "var(--dp-space-md)",
      }}
    >
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        const speaker = isUser ? "YOU" : "ASSISTANT";

        let sourceLabel: string | null = null;
        if (!isUser) {
          sourceLabel =
            msg.source === "fallback"
              ? "Answered from your plan data (AI unavailable)"
              : "Answered by AI";
        }

        return (
          <li
            key={msg.id}
            style={{
              border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
              padding: "var(--dp-space-md)",
              backgroundColor: isUser ? "var(--dp-color-ground)" : "var(--dp-color-canvas)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "6px",
                borderBottom: "var(--dp-border-hairline) solid var(--dp-color-rule)",
                paddingBottom: "4px",
              }}
            >
              <span
                className="text-label"
                style={{
                  fontWeight: "bold",
                  letterSpacing: "0.08em",
                  fontSize: "0.75rem",
                  color: isUser ? "var(--dp-color-ink)" : "var(--dp-color-secondary)",
                }}
              >
                {speaker}
              </span>

              {sourceLabel && (
                <span
                  className="text-label"
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--dp-color-secondary)",
                  }}
                >
                  {sourceLabel}
                </span>
              )}
            </div>

            {/* Plain text with line breaks preserved (no HTML/markdown injection) */}
            <p
              style={{
                fontFamily: "var(--dp-typography-reading)",
                fontSize: "1rem",
                lineHeight: "1.6",
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: "var(--dp-color-ink)",
              }}
            >
              {msg.content}
            </p>
          </li>
        );
      })}

      {isLoading && (
        <li
          role="status"
          aria-live="polite"
          data-testid="assistant-thinking-status"
          style={{
            border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
            padding: "var(--dp-space-md)",
            backgroundColor: "var(--dp-color-ground)",
            fontStyle: "italic",
            color: "var(--dp-color-secondary)",
          }}
        >
          Assistant is reviewing your plan and composing an answer…
        </li>
      )}
    </ol>
  );
};

