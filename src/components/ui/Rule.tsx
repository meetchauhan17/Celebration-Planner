import React from "react";

export type RuleVariant = "hairline" | "section";

export interface RuleProps extends React.HTMLAttributes<HTMLHRElement> {
  variant?: RuleVariant;
  className?: string;
}

export const Rule: React.FC<RuleProps> = ({
  variant = "hairline",
  className = "",
  style,
  ...props
}) => {
  return (
    <hr
      className={`np-rule np-rule-${variant} ${className}`.trim()}
      style={style}
      {...props}
    />
  );
};

export default Rule;

