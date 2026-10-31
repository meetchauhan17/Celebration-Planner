"use client";

import React from "react";
import { VendorItem, VendorStatus, BudgetLine } from "@/lib/domain";
import { compareQuote } from "@/lib/engine/vendors";
import { Listing } from "@/components/ui/Listing";
import { Disclosure } from "@/components/ui/Disclosure";
import { Button } from "@/components/ui/Button";

export interface VendorListingRowProps {
  vendor: VendorItem;
  budgetLines: BudgetLine[];
  isNextToBook: boolean;
  onUpdateVendor: (updated: VendorItem) => void;
  onUseQuoteAsActual: (vendor: VendorItem) => void;
}

export function parsePhoneLink(contact?: string): string | null {
  if (!contact) return null;
  const trimmed = contact.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= 7 && digits.length <= 15) {
    const isPurePhone = /^[+\s()0-9-]+$/.test(trimmed);
    if (isPurePhone) {
      return digits.startsWith("+") ? digits : `+${digits.replace(/^0+/, "")}`;
    }
  }
  return null;
}

export function parseWhatToAsk(whatToAsk?: string | string[]): string[] {
  if (!whatToAsk) return [];
  if (Array.isArray(whatToAsk)) return whatToAsk;

  const items = whatToAsk
    .split(/(?:^|\s+)(?=\d+\.\s*)/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (items.length > 0) return items;
  return [whatToAsk.trim()];
}

export const VendorListingRow: React.FC<VendorListingRowProps> = ({
  vendor,
  budgetLines,
  isNextToBook,
  onUpdateVendor,
  onUseQuoteAsActual,
}) => {
  const quoteComparison = compareQuote(budgetLines, vendor);
  const questions = parseWhatToAsk(vendor.whatToAsk);
  const phoneLink = parsePhoneLink(vendor.contact);
  const canUseQuote =
    (vendor.status === "booked" || vendor.status === "paid") &&
    Boolean(vendor.quoteAmount && vendor.quoteAmount > 0);

  // Identity Column: Category + Label
  const identityContent = (
    <div>
      <div
        className="text-label"
        style={{ color: "var(--dp-color-secondary)", textTransform: "uppercase" }}
      >
        {vendor.category}
      </div>
      <h3
        style={{
          fontFamily: "var(--dp-typography-display)",
          fontSize: "1.2rem",
          fontWeight: "var(--dp-typography-label-weight)",
          color: "var(--dp-color-ink)",
          margin: "4px 0 0 0",
        }}
      >
        {vendor.label}
      </h3>
    </div>
  );

  // Terms Column: Status select, Quote amount input & comparison, Contact
  const termsContent = (
    <div style={{ display: "grid", gap: "10px", width: "100%" }}>
      {/* Status select */}
      <div>
        <label
          htmlFor={`status-${vendor.id}`}
          className="text-label"
          style={{ display: "block", marginBottom: "3px", color: "var(--dp-color-secondary)" }}
        >
          Status for {vendor.label}
        </label>
        <select
          id={`status-${vendor.id}`}
          value={vendor.status}
          onChange={(e) =>
            onUpdateVendor({ ...vendor, status: e.target.value as VendorStatus })
          }
          className="np-select"
          style={{ width: "100%" }}
        >
          <option value="to-contact">To Contact</option>
          <option value="quoted">Quoted</option>
          <option value="booked">Booked</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Quote amount input */}
      <div>
        <label
          htmlFor={`quote-${vendor.id}`}
          className="text-label"
          style={{ display: "block", marginBottom: "3px", color: "var(--dp-color-secondary)" }}
        >
          Quote Amount (₹)
        </label>
        <input
          id={`quote-${vendor.id}`}
          type="number"
          min={0}
          step={500}
          value={vendor.quoteAmount ?? ""}
          placeholder="Enter quote"
          onChange={(e) => {
            const val = e.target.value.trim() === "" ? undefined : Number(e.target.value);
            onUpdateVendor({ ...vendor, quoteAmount: val });
          }}
          className="np-table-input"
          style={{ width: "100%" }}
        />
        {/* Quote Comparison Text */}
        {vendor.quoteAmount !== undefined && vendor.quoteAmount > 0 && (
          <div
            className="text-label"
            style={{
              color: quoteComparison.isAbove ? "var(--dp-color-accent)" : "var(--dp-color-secondary)",
              marginTop: "4px",
            }}
          >
            {quoteComparison.text}
          </div>
        )}
      </div>

      {/* Button to feed budget */}
      {canUseQuote && (
        <div style={{ marginTop: "2px" }}>
          <Button
            variant="secondary"
            onClick={() => onUseQuoteAsActual(vendor)}
            type="button"
            style={{ width: "100%", fontSize: "12px", padding: "6px" }}
          >
            Use quote as actual spend
          </Button>
        </div>
      )}

      {/* Contact Text */}
      <div>
        <label
          htmlFor={`contact-${vendor.id}`}
          className="text-label"
          style={{ display: "block", marginBottom: "3px", color: "var(--dp-color-secondary)" }}
        >
          Contact Information
        </label>
        <input
          id={`contact-${vendor.id}`}
          type="text"
          value={vendor.contact ?? ""}
          placeholder="Phone, email, or manager name"
          onChange={(e) =>
            onUpdateVendor({ ...vendor, contact: e.target.value || undefined })
          }
          className="np-field-input"
          style={{ width: "100%", padding: "4px 6px", fontSize: "14px" }}
        />
        {/* Render telephone link if valid phone pattern detected, otherwise plain text */}
        {vendor.contact && (
          <div style={{ marginTop: "4px" }}>
            {phoneLink ? (
              <a
                href={`tel:${phoneLink}`}
                className="np-button-link text-compact"
                style={{ fontSize: "12px" }}
              >
                Call {vendor.contact}
              </a>
            ) : (
              <span className="text-compact" style={{ color: "var(--dp-color-secondary)", fontSize: "12px" }}>
                {vendor.contact}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Details Column: whatToAsk hints in Disclosure + Notes textarea
  const detailsContent = (
    <div style={{ display: "grid", gap: "12px", width: "100%" }}>
      {questions.length > 0 && (
        <Disclosure question="Questions to ask vendor" className="np-vendor-disclosure">
          <ul style={{ paddingLeft: "16px", margin: "6px 0 0 0" }}>
            {questions.map((q, idx) => (
              <li key={idx} className="text-compact" style={{ marginBottom: "4px" }}>
                {q}
              </li>
            ))}
          </ul>
        </Disclosure>
      )}

      <div>
        <label
          htmlFor={`notes-${vendor.id}`}
          className="text-label"
          style={{ display: "block", marginBottom: "3px", color: "var(--dp-color-secondary)" }}
        >
          Notes & Agreement Terms
        </label>
        <textarea
          id={`notes-${vendor.id}`}
          rows={3}
          value={vendor.notes ?? ""}
          placeholder="Add terms, deposit status, deliverables, or review points..."
          onChange={(e) =>
            onUpdateVendor({ ...vendor, notes: e.target.value || undefined })
          }
          className="np-textarea"
          style={{ width: "100%", fontSize: "14px", resize: "vertical" }}
        />
      </div>
    </div>
  );

  return (
    <Listing
      identity={identityContent}
      terms={termsContent}
      details={detailsContent}
      featured={isNextToBook}
      featuredLabel="Next to book"
      data-testid={`vendor-row-${vendor.id}`}
    />
  );
};

export default VendorListingRow;
