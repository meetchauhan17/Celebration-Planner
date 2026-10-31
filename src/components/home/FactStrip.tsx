import React from "react";
import { SectionLabel } from "@/components/ui";

export const FactStrip: React.FC = () => {
  return (
    <section aria-label="Key Facts" className="np-fact-strip">
      <div className="np-fact-item">
        <SectionLabel>01 · Formats</SectionLabel>
        <p className="np-fact-text">
          <strong>3 event types:</strong> Dedicated engines for weddings, milestone birthdays, and community festivals.
        </p>
      </div>
      <div className="np-fact-item">
        <SectionLabel>02 · Automation</SectionLabel>
        <p className="np-fact-text">
          <strong>Custom generation:</strong> Budget, timeline and vendors generated deterministically from your answers.
        </p>
      </div>
      <div className="np-fact-item">
        <SectionLabel>03 · Privacy</SectionLabel>
        <p className="np-fact-text">
          <strong>Local storage:</strong> Works in your browser; data stays on your device with zero cloud tracking.
        </p>
      </div>
    </section>
  );
};

