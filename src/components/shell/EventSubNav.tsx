"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface EventSubNavItem {
  id: string;
  label: string;
  segment: string;
}

const EVENT_SECTIONS: EventSubNavItem[] = [
  { id: "overview", label: "Overview", segment: "" },
  { id: "budget", label: "Budget", segment: "budget" },
  { id: "timeline", label: "Timeline", segment: "timeline" },
  { id: "vendors", label: "Vendors", segment: "vendors" },
  { id: "guests", label: "Guests", segment: "guests" },
  { id: "ideas", label: "Ideas", segment: "ideas" },
  { id: "assistant", label: "Assistant", segment: "assistant" },
  { id: "summary", label: "Summary", segment: "summary" },
];

export interface EventSubNavProps {
  eventId?: string;
  className?: string;
}

export const EventSubNav: React.FC<EventSubNavProps> = ({
  eventId: propEventId,
  className = "",
}) => {
  const pathname = usePathname();

  // Extract eventId from pathname if not directly passed: /events/[id]/...
  let resolvedEventId = propEventId;
  if (!resolvedEventId && pathname) {
    const match = pathname.match(/^\/events\/([^/]+)/);
    if (match && match[1] && match[1] !== "new" && match[1] !== "plan") {
      resolvedEventId = match[1];
    }
  }

  // Only render on /events/[id]/* pages
  if (!resolvedEventId) {
    return null;
  }

  const baseEventPath = `/events/${resolvedEventId}`;

  return (
    <nav
      aria-label="Event sections"
      className={`np-event-subnav ${className}`.trim()}
    >
      <ul className="np-event-subnav-list">
        {EVENT_SECTIONS.map((section) => {
          const targetHref = section.segment
            ? `${baseEventPath}/${section.segment}`
            : baseEventPath;

          const isActive = section.segment === ""
            ? pathname === baseEventPath || pathname === `${baseEventPath}/overview`
            : pathname === targetHref || pathname?.startsWith(`${targetHref}/`);

          return (
            <li key={section.id} className="np-event-subnav-item">
              <Link
                href={targetHref}
                className={`np-event-subnav-link ${isActive ? "is-active" : ""}`.trim()}
                aria-current={isActive ? "page" : undefined}
              >
                {section.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default EventSubNav;

