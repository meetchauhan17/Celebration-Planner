import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("next/link", () => ({
  default: React.forwardRef<HTMLAnchorElement, any>(function MockNextLink(
    { children, href, prefetch: _prefetch, ...rest },
    ref
  ) {
    const resolvedHref = typeof href === "object" ? href?.pathname || "/" : href;
    return React.createElement("a", { ref, href: resolvedHref, ...rest }, children);
  }),
}));

if (typeof window !== "undefined") {
  window.scrollTo = vi.fn();
}

if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
}
