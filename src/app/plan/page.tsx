import React, { Suspense } from "react";
import { Metadata } from "next";
import { SectionLabel, Rule } from "@/components/ui";
import { PlanWizard } from "@/components/plan";

export const metadata: Metadata = {
  title: "Plan an Event · Celebration Planner",
  description: "Create a customized celebration plan with automated budget allocations, timeline milestones, and vendor checklists.",
};

export default function PlanPage() {
  return (
    <div className="page-container" style={{ paddingBottom: "48px" }}>
      <div style={{ maxWidth: "740px", margin: "0 auto", paddingTop: "16px" }}>
        <SectionLabel>Setup Wizard</SectionLabel>
        <h1 style={{ fontSize: "2.4rem", margin: "8px 0 12px 0" }}>
          Plan a Celebration
        </h1>
        <p style={{ color: "var(--dp-color-secondary)", marginBottom: "20px" }}>
          Answer a few questions regarding your date, guest count, and financial parameters. Our calculation engine
          generates your customized budget lines, backward-scheduled milestone timeline, and required vendor checklists.
        </p>
        <Rule variant="hairline" style={{ marginBottom: "24px" }} />
      </div>

      <Suspense fallback={<div className="np-plan-wizard" role="status">Loading planning wizard...</div>}>
        <PlanWizard />
      </Suspense>
    </div>
  );
}

