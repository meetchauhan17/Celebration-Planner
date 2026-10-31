import React from "react";

export interface SkipLinkProps {
  targetId?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Accessible skip link component.
 * Placed as the first focusable element in the DOM to allow keyboard
 * users to bypass top-level masthead and navigation directly to main content.
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = "main-content",
  children = "Skip to main content",
  className = "",
}) => {
  return (
    <a
      href={`#${targetId}`}
      className={`np-skip-link ${className}`.trim()}
    >
      {children}
    </a>
  );
};

export default SkipLink;

