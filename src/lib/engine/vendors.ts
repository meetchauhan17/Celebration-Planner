import { Vendor, VendorCategory } from "../domain";

export function filterVendorsByCategory(
  vendors: Vendor[],
  category: VendorCategory
): Vendor[] {
  return vendors.filter((v) => v.category === category);
}

export function getVendorStatusCounts(vendors: Vendor[]): Record<string, number> {
  const counts: Record<string, number> = {
    researching: 0,
    contacted: 0,
    quoted: 0,
    booked: 0,
    declined: 0,
  };

  for (const v of vendors) {
    if (counts[v.status] !== undefined) {
      counts[v.status]++;
    }
  }

  return counts;
}

export function calculateEstimatedVendorTotal(vendors: Vendor[]): number {
  return vendors
    .filter((v) => v.status === "booked" || v.status === "quoted")
    .reduce((sum, v) => sum + (v.estimatedCost ?? 0), 0);
}
