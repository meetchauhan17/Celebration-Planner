import React from "react";
import Link from "next/link";
import { Rule } from "../ui/Rule";
import { SectionLabel } from "../ui/SectionLabel";

export interface ShellFooterProps {
  className?: string;
}

/**
 * Directory-style footer in columns linking to every page and section.
 * Responsive: 4 columns on desktop, transitioning to 2 columns under 700px.
 * Concludes with the mandatory legal and planning guidance advisory note.
 */
export const ShellFooter: React.FC<ShellFooterProps> = ({ className = "" }) => {
  return (
    <footer className={`np-shell-footer ${className}`.trim()}>
      <div className="page-container">
        <Rule variant="section" />
        <div className="np-shell-footer-directory">
          <div className="np-footer-group">
            <SectionLabel>Navigation</SectionLabel>
            <ul className="np-footer-list">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/plan">Plan an event</Link></li>
              <li><Link href="/events">My events</Link></li>
            </ul>
          </div>

          <div className="np-footer-group">
            <SectionLabel>Event Modules</SectionLabel>
            <ul className="np-footer-list">
              <li><Link href="/events">Overview</Link></li>
              <li><Link href="/events">Budget</Link></li>
              <li><Link href="/events">Timeline</Link></li>
              <li><Link href="/events">Vendors</Link></li>
            </ul>
          </div>

          <div className="np-footer-group">
            <SectionLabel>Intelligence</SectionLabel>
            <ul className="np-footer-list">
              <li><Link href="/events">Guests</Link></li>
              <li><Link href="/events">Ideas</Link></li>
              <li><Link href="/events">Assistant</Link></li>
              <li><Link href="/events">Summary</Link></li>
            </ul>
          </div>

          <div className="np-footer-group">
            <SectionLabel>Standards</SectionLabel>
            <ul className="np-footer-list">
              <li><span className="np-footer-text">Newsprint Editorial Design</span></li>
              <li><span className="np-footer-text">WCAG AA Contrast Compliant</span></li>
              <li><span className="np-footer-text">Local Schema Persistence</span></li>
            </ul>
          </div>
        </div>

        <Rule variant="hairline" />

        <div className="np-shell-footer-bottom">
          <p className="np-shell-footer-note">
            Planning guidance only. Confirm prices, availability and legal requirements with vendors and local authorities.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ShellFooter;

