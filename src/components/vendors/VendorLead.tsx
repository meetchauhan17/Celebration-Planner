"use client";

import React from "react";
import { VendorItem } from "@/lib/domain";
import { vendorProgress } from "@/lib/engine/vendors";
import { SectionLabel } from "@/components/ui/SectionLabel";

export interface VendorLeadProps {
  vendors: VendorItem[];
}

export const VendorLead: React.FC<VendorLeadProps> = ({ vendors }) => {
  const progress = vendorProgress(vendors);
  const { counts, booked, total, percentBooked } = progress;

  return (
    <section aria-labelledby="vendors-lead-heading" className="np-vendors-lead">
      <SectionLabel>Vendor Management</SectionLabel>
      <h1
        id="vendors-lead-heading"
        style={{
          fontFamily: "var(--dp-typography-display)",
          fontSize: "2.6rem",
          fontWeight: "var(--dp-typography-display-weight)",
          margin: "8px 0 6px 0",
          lineHeight: "1.1",
        }}
      >
        {booked} of {total} Booked
      </h1>

      {/* Flat progress bar: black fill on ruled track, no gradients, no rounding, no animation */}
      <div style={{ maxWidth: "340px", margin: "10px 0 16px 0" }}>
        <div
          className="np-vendor-progress-track"
          aria-hidden="true"
          style={{
            width: "100%",
            height: "8px",
            backgroundColor: "var(--dp-color-ground)",
            border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
            borderRadius: "0",
            position: "relative",
          }}
        >
          <div
            className="np-vendor-progress-fill"
            style={{
              width: `${percentBooked}%`,
              height: "100%",
              backgroundColor: "var(--dp-color-ink)",
              borderRadius: "0",
              transition: "none",
            }}
          />
        </div>
        <div
          className="text-label"
          aria-label={`${percentBooked}% of vendors secured`}
          style={{ color: "var(--dp-color-secondary)", marginTop: "4px" }}
        >
          {percentBooked}% of vendors secured
        </div>
      </div>

      {/* Strip of counts per status */}
      <div className="np-fact-strip np-vendor-fact-strip" data-testid="vendor-fact-strip" style={{ margin: "16px 0" }}>
        <div className="np-fact-item">
          <SectionLabel>01 · To Contact</SectionLabel>
          <div className="np-fact-number">{counts["to-contact"]}</div>
          <p className="np-fact-text text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
            Initial outreach pending
          </p>
        </div>

        <div className="np-fact-item">
          <SectionLabel>02 · Quoted</SectionLabel>
          <div className="np-fact-number">{counts.quoted}</div>
          <p className="np-fact-text text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
            Estimates under review
          </p>
        </div>

        <div className="np-fact-item">
          <SectionLabel>03 · Booked</SectionLabel>
          <div className="np-fact-number">{counts.booked}</div>
          <p className="np-fact-text text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
            Agreements confirmed
          </p>
        </div>

        <div className="np-fact-item">
          <SectionLabel>04 · Paid</SectionLabel>
          <div className="np-fact-number">{counts.paid}</div>
          <p className="np-fact-text text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
            Deposits or full settlements
          </p>
        </div>
      </div>

      {/* Visible Reminder */}
      <div
        className="text-compact"
        style={{
          borderLeft: "3px solid var(--dp-color-secondary)",
          paddingLeft: "12px",
          color: "var(--dp-color-secondary)",
          margin: "16px 0 24px 0",
        }}
      >
        Prices shown are quotes you entered. Confirm availability and terms in writing.
      </div>
    </section>
  );
};

export default VendorLead;

