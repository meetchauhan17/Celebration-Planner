"use client";

import React, { useState } from "react";
import { VendorItem, VendorStatus } from "@/lib/domain";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

export interface AddVendorFormProps {
  onAddVendor: (vendor: VendorItem) => void;
}

export const AddVendorForm: React.FC<AddVendorFormProps> = ({ onAddVendor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState<VendorStatus>("to-contact");
  const [quoteAmount, setQuoteAmount] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!category.trim()) {
      setError("Please specify a vendor category (e.g., Photography, Florist).");
      return;
    }

    if (!label.trim()) {
      setError("Please provide a vendor or business name.");
      return;
    }

    const newVendor: VendorItem = {
      id: `custom-ven-${Date.now()}`,
      category: category.trim(),
      label: label.trim(),
      status,
      quoteAmount: quoteAmount ? Number(quoteAmount) : undefined,
      contact: contact.trim() || undefined,
      notes: notes.trim() || undefined,
      whatToAsk:
        "1. Confirm booking availability for the scheduled date. 2. Request an itemized service quote and deliverables breakdown. 3. Review payment milestones and cancellation terms.",
    };

    onAddVendor(newVendor);
    setCategory("");
    setLabel("");
    setStatus("to-contact");
    setQuoteAmount("");
    setContact("");
    setNotes("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div style={{ margin: "28px 0" }}>
        <Button variant="default" onClick={() => setIsOpen(true)} type="button">
          + Add custom vendor
        </Button>
      </div>
    );
  }

  return (
    <div
      className="np-add-vendor-box"
      style={{
        margin: "28px 0",
        padding: "24px",
        border: "1px solid var(--dp-color-surface-muted)",
        borderTop: "4px solid var(--dp-color-field)",
        borderRadius: "20px 24px 18px 22px / 22px 18px 24px 20px",
        backgroundColor: "var(--dp-color-surface, #f5eddf)",
      }}
    >
      <SectionLabel>Procurement</SectionLabel>
      <h2
        style={{
          fontFamily: "var(--dp-typography-display)",
          fontSize: "1.3rem",
          fontWeight: "var(--dp-typography-display-weight)",
          margin: "4px 0 16px 0",
        }}
      >
        Add a Custom Vendor
      </h2>

      {error && (
        <div
          role="alert"
          style={{
            color: "var(--dp-color-accent)",
            fontWeight: "var(--dp-typography-label-weight)",
            marginBottom: "12px",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px", maxWidth: "680px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label
              htmlFor="vendor-category-input"
              className="text-label"
              style={{ display: "block", marginBottom: "4px" }}
            >
              Category
            </label>
            <input
              id="vendor-category-input"
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="np-input"
              style={{ width: "100%", padding: "8px" }}
              placeholder="e.g. Catering, Florist, Transport"
            />
          </div>

          <div>
            <label
              htmlFor="vendor-label-input"
              className="text-label"
              style={{ display: "block", marginBottom: "4px" }}
            >
              Vendor or Studio Name
            </label>
            <input
              id="vendor-label-input"
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="np-input"
              style={{ width: "100%", padding: "8px" }}
              placeholder="e.g. Royal Decorators"
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label
              htmlFor="vendor-status-input"
              className="text-label"
              style={{ display: "block", marginBottom: "4px" }}
            >
              Status
            </label>
            <select
              id="vendor-status-input"
              value={status}
              onChange={(e) => setStatus(e.target.value as VendorStatus)}
              className="np-select"
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="to-contact">To Contact</option>
              <option value="quoted">Quoted</option>
              <option value="booked">Booked</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="vendor-quote-input"
              className="text-label"
              style={{ display: "block", marginBottom: "4px" }}
            >
              Quote Amount (₹, optional)
            </label>
            <input
              id="vendor-quote-input"
              type="number"
              min={0}
              step={500}
              value={quoteAmount}
              onChange={(e) => setQuoteAmount(e.target.value)}
              className="np-input"
              style={{ width: "100%", padding: "8px" }}
              placeholder="e.g. 50000"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="vendor-contact-input"
            className="text-label"
            style={{ display: "block", marginBottom: "4px" }}
          >
            Contact Information (Free Text)
          </label>
          <input
            id="vendor-contact-input"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="np-input"
            style={{ width: "100%", padding: "8px" }}
            placeholder="e.g. +91 98765 43210 or manager@vendor.com"
          />
        </div>

        <div>
          <label
            htmlFor="vendor-notes-input"
            className="text-label"
            style={{ display: "block", marginBottom: "4px" }}
          >
            Notes & Agreement Details (optional)
          </label>
          <textarea
            id="vendor-notes-input"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="np-textarea"
            style={{ width: "100%", resize: "vertical" }}
            placeholder="Key deliverables, advance deposit, or follow-up items..."
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <Button variant="default" type="submit">
            Save Vendor
          </Button>
          <Button variant="secondary" onClick={() => setIsOpen(false)} type="button">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddVendorForm;
