"use client";

import React, { useMemo } from "react";
import { PlannedEvent, VendorItem, BudgetLine } from "@/lib/domain";
import { updateEvent } from "@/lib/storage";
import { useAnnounce } from "@/components/shell";
import { getNextToBookCategory } from "@/lib/engine/vendors";
import { formatCurrency } from "@/lib/utils/format";
import { VendorLead } from "./VendorLead";
import { VendorListingRow } from "./VendorListingRow";
import { AddVendorForm } from "./AddVendorForm";
import { Rule } from "@/components/ui/Rule";

export interface VendorListViewProps {
  event: PlannedEvent;
}

export const VendorListView: React.FC<VendorListViewProps> = ({ event }) => {
  const { brief, vendors, tasks, budgetLines } = event;
  const { announce } = useAnnounce();

  // Determine category with earliest critical task
  const nextToBookCategory = useMemo(() => {
    return getNextToBookCategory(tasks, vendors);
  }, [tasks, vendors]);

  // Update existing vendor
  const handleUpdateVendor = (updated: VendorItem) => {
    const nextVendors = vendors.map((v) => (v.id === updated.id ? updated : v));
    const res = updateEvent(brief.id, { vendors: nextVendors });
    if (res.ok) {
      announce(`Vendor updated: ${updated.label}`, "polite");
    }
  };

  // Add custom vendor
  const handleAddVendor = (newVendor: VendorItem) => {
    const nextVendors = [...vendors, newVendor];
    const res = updateEvent(brief.id, { vendors: nextVendors });
    if (res.ok) {
      announce(`Vendor added: ${newVendor.label}`, "polite");
    }
  };

  // Feed quote amount to budget actual spend
  const handleUseQuoteAsActual = (vendor: VendorItem) => {
    if (!vendor.quoteAmount) return;

    const vendorCat = vendor.category.toLowerCase().trim();
    let matched = false;

    const nextBudgetLines: BudgetLine[] = budgetLines.map((line) => {
      if (line.category.toLowerCase().trim() === vendorCat) {
        matched = true;
        return {
          ...line,
          actualAmount: vendor.quoteAmount,
        };
      }
      return line;
    });

    // If no exact category matched, we can still append or update
    if (!matched) {
      nextBudgetLines.push({
        category: vendor.category,
        plannedAmount: 0,
        actualAmount: vendor.quoteAmount,
        note: `Direct vendor quote for ${vendor.label}`,
      });
    }

    const res = updateEvent(brief.id, { budgetLines: nextBudgetLines });
    if (res.ok) {
      announce(
        `Applied quote of ${formatCurrency(vendor.quoteAmount, brief.currency)} as actual spend for ${vendor.category}`,
        "polite"
      );
    }
  };

  return (
    <div className="np-vendor-list-view">
      <VendorLead vendors={vendors} />

      <Rule variant="hairline" style={{ margin: "24px 0" }} />

      <section aria-label="Vendor directory" className="np-vendor-directory">
        <h2
          style={{
            fontFamily: "var(--dp-typography-display)",
            fontSize: "1.4rem",
            fontWeight: "var(--dp-typography-display-weight)",
            margin: "0 0 16px 0",
          }}
        >
          Vendor Directory ({vendors.length})
        </h2>
        {vendors.length > 0 ? (
          vendors.map((vendor) => {
            const isNextToBook = Boolean(
              nextToBookCategory &&
                vendor.category.toLowerCase().trim() === nextToBookCategory.toLowerCase().trim()
            );

            return (
              <VendorListingRow
                key={vendor.id}
                vendor={vendor}
                budgetLines={budgetLines}
                isNextToBook={isNextToBook}
                onUpdateVendor={handleUpdateVendor}
                onUseQuoteAsActual={handleUseQuoteAsActual}
              />
            );
          })
        ) : (
          <p className="text-compact" style={{ color: "var(--dp-color-secondary)", margin: "24px 0" }}>
            No vendors registered in your checklist yet.
          </p>
        )}
      </section>

      <AddVendorForm onAddVendor={handleAddVendor} />
    </div>
  );
};

export default VendorListView;
