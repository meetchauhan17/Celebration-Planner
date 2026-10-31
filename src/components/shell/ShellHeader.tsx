"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Masthead } from "../ui/Masthead";
import { PrimaryNav } from "./PrimaryNav";
import { EventSubNav } from "./EventSubNav";

export interface ShellHeaderProps {
  className?: string;
}

/**
 * Top-level Masthead and Navigation Header for all pages.
 * Displays "Celebration Planner" with a thin line of primary navigation
 * beneath a 4px section rule, and renders event sub-navigation on /events/[id]/* routes.
 * Kept strictly in normal document flow (no sticky or overlapping elements).
 */
export const ShellHeader: React.FC<ShellHeaderProps> = ({ className = "" }) => {
  const pathname = usePathname();
  // Ensure exactly one <h1> per page: if on home page, Masthead can be <h1>, otherwise <div>
  const isHomePage = pathname === "/";

  return (
    <div className={`np-shell-header ${className}`.trim()}>
      <div className="page-container">
        <Masthead
          title="Celebration Planner"
          kicker="Event Coordination & Decision Engine"
          subtitle="Editorial planning architecture with deterministic budget, milestone, and vendor sequencing"
          titleTag={isHomePage ? "h1" : "div"}
        />
        <div className="np-shell-nav-row">
          <PrimaryNav />
        </div>
        <EventSubNav />
      </div>
    </div>
  );
};

export default ShellHeader;

