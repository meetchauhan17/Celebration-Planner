"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

export interface TimelineRegenerateModalProps {
  onRegenerate: () => void;
}

export const TimelineRegenerateModal: React.FC<TimelineRegenerateModalProps> = ({
  onRegenerate,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = () => {
    onRegenerate();
    setIsConfirming(false);
  };

  if (!isConfirming) {
    return (
      <div style={{ marginTop: "32px", borderTop: "var(--dp-border-hairline) solid var(--dp-color-rule)", paddingTop: "20px" }}>
        <Button
          variant="secondary"
          onClick={() => setIsConfirming(true)}
          type="button"
        >
          Regenerate timeline
        </Button>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="np-regenerate-confirm-box"
      style={{
        marginTop: "32px",
        padding: "20px",
        border: "1px solid var(--dp-color-field)",
        borderLeft: "5px solid var(--dp-color-field)",
        borderRadius: "var(--dp-radius-control)",
        backgroundColor: "var(--dp-color-surface, #f5eddf)",
      }}
    >
      <div
        className="text-label"
        style={{
          color: "var(--dp-color-accent)",
          fontWeight: "var(--dp-typography-label-weight)",
          marginBottom: "6px",
        }}
      >
        Notice: Algorithmic Timeline Regeneration
      </div>
      <p className="text-compact" style={{ margin: "0 0 14px 0", color: "var(--dp-color-ink)", maxWidth: "680px" }}>
        Warning: Regenerating the timeline recalculates milestone schedules based on your event date. Any completed tasks and custom milestones you created will be preserved, but uncompleted generated tasks will be replaced with fresh dates.
      </p>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Button variant="default" onClick={handleConfirm} type="button">
          Confirm Regenerate
        </Button>
        <Button variant="secondary" onClick={() => setIsConfirming(false)} type="button">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default TimelineRegenerateModal;

