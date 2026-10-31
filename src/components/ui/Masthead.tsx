import React from "react";
import { Rule } from "./Rule";

export interface MastheadProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  kicker?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  titleTag?: "h1" | "div" | "p";
}

export const Masthead: React.FC<MastheadProps> = ({
  title,
  subtitle,
  kicker,
  children,
  className = "",
  titleTag: TitleTag = "h1",
  ...props
}) => {
  return (
    <header className={`np-masthead ${className}`.trim()} {...props}>
      <Rule variant="hairline" />
      <div className="np-masthead-content">
        {kicker && <div className="np-masthead-kicker">{kicker}</div>}
        <TitleTag className="np-masthead-title">{title}</TitleTag>
        {subtitle && <p className="np-masthead-subtitle">{subtitle}</p>}
        {children}
      </div>
      <Rule variant="section" />
    </header>
  );
};

export default Masthead;
