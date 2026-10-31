import React from "react";

export interface SectionLabelProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: "div" | "span" | "h2" | "h3" | "h4" | "p";
  className?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({
  children,
  as: Component = "div",
  className = "",
  ...props
}) => {
  return (
    <Component className={`np-section-label ${className}`.trim()} {...props}>
      <span className="np-section-label-marker" aria-hidden="true" />
      <span className="np-section-label-text">{children}</span>
    </Component>
  );
};

export default SectionLabel;

