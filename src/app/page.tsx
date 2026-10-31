import React from "react";
import { Rule } from "@/components/ui";
import { LeadSpread, FactStrip, MainSpread, FaqSpread } from "@/components/home";

export default function Home() {
  return (
    <div className="page-container" style={{ paddingBottom: "48px" }}>
      <LeadSpread />
      <FactStrip />
      <MainSpread />
      <Rule variant="section" style={{ margin: "var(--dp-spacing-story) 0" }} />
      <FaqSpread />
    </div>
  );
}
