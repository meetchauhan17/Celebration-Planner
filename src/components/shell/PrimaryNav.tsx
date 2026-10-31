"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
}

const PRIMARY_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Plan an event", href: "/plan" },
  { label: "My events", href: "/events" },
];

export const PrimaryNav: React.FC<{ className?: string }> = ({ className = "" }) => {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    if (href === "/events") return pathname.startsWith("/events");
    return pathname.startsWith(href);
  };

  return (
    <nav aria-label="Primary" className={`np-primary-nav ${className}`.trim()}>
      <ul className="np-primary-nav-list">
        {PRIMARY_ITEMS.map((item) => {
          const active = isLinkActive(item.href);
          return (
            <li key={item.href} className="np-primary-nav-item">
              <Link
                href={item.href}
                className={`np-primary-nav-link ${active ? "is-active" : ""}`.trim()}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default PrimaryNav;

