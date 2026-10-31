import React from "react";

export interface DisclosureProps extends React.DetailsHTMLAttributes<HTMLDetailsElement> {
  question: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const Disclosure: React.FC<DisclosureProps> = ({
  question,
  children,
  defaultOpen,
  open,
  className = "",
  ...props
}) => {
  return (
    <details
      className={`np-disclosure ${className}`.trim()}
      open={open ?? defaultOpen}
      {...props}
    >
      <summary className="np-disclosure-summary">
        <span className="np-disclosure-question">{question}</span>
        <span className="np-disclosure-indicator" aria-hidden="true" />
      </summary>
      <div className="np-disclosure-content">{children}</div>
    </details>
  );
};

export default Disclosure;
