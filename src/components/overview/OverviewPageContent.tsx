"use client";

import React from "react";
import { PlannedEvent } from "@/lib/domain";
import { OverviewLeadSpread } from "./OverviewLeadSpread";
import { OverviewFactStrip } from "./OverviewFactStrip";
import { OverviewFeasibility } from "./OverviewFeasibility";
import { OverviewMainSpread } from "./OverviewMainSpread";

export interface OverviewPageContentProps {
  event: PlannedEvent;
}

export const OverviewPageContent: React.FC<OverviewPageContentProps> = ({ event }) => {
  return (
    <div className="np-overview-page-content">
      <OverviewLeadSpread event={event} />
      <OverviewFactStrip event={event} />
      <OverviewFeasibility event={event} />
      <OverviewMainSpread event={event} />
    </div>
  );
};

export default OverviewPageContent;

