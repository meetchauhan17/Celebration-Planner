"use client";

import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";

export interface AssistantComposerProps {
  input: string;
  onChange: (val: string) => void;
  onSend: (text: string) => void;
  isLoading: boolean;
  onClear: () => void;
  hasMessages: boolean;
}

export const AssistantComposer: React.FC<AssistantComposerProps> = ({
  input,
  onChange,
  onSend,
  isLoading,
  onClear,
  hasMessages,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_CHARS = 800;

  // Handle Enter to submit, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSend(input);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && input.trim()) {
      onSend(input);
    }
  };

  // Expose focus helper or maintain focus
  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "var(--dp-space-lg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
        <label htmlFor="assistant-input-textarea" className="text-label">
          Ask your planning question
        </label>
        <span
          className="text-label"
          style={{
            fontSize: "0.8rem",
            color: input.length >= MAX_CHARS ? "var(--dp-color-accent)" : "var(--dp-color-secondary)",
          }}
        >
          {input.length}/{MAX_CHARS}
        </span>
      </div>

      <textarea
        ref={textareaRef}
        id="assistant-input-textarea"
        rows={3}
        maxLength={MAX_CHARS}
        disabled={isLoading}
        value={input}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your question or request here..."
        style={{
          width: "100%",
          padding: "10px",
          border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
          backgroundColor: "var(--dp-color-ground)",
          fontSize: "1rem",
          fontFamily: "var(--dp-typography-reading)",
          lineHeight: "1.4",
          resize: "vertical",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "6px",
        }}
      >
        <span
          className="text-label"
          style={{ fontSize: "0.8rem", color: "var(--dp-color-secondary)" }}
        >
          Press Enter to send, Shift + Enter for new line.
        </span>

        <div style={{ display: "flex", gap: "8px" }}>
          {hasMessages && (
            <Button
              type="button"
              variant="secondary"
              disabled={isLoading}
              onClick={onClear}
            >
              Clear conversation
            </Button>
          )}

          <Button
            type="submit"
            variant="default"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? "Consulting..." : "Send"}
          </Button>
        </div>
      </div>
    </form>
  );
};

