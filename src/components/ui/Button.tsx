import React, { forwardRef } from "react";
import Link from "next/link";

export type ButtonVariant = "default" | "link" | "secondary";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  selected?: boolean;
  pressed?: boolean;
  className?: string;
  children: React.ReactNode;
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = "default",
      selected = false,
      pressed,
      className = "",
      children,
      type = "button",
      disabled,
      role,
      href,
      ...props
    },
    ref
  ) => {
    const isPressed =
      pressed ??
      (props["aria-pressed"]
        ? props["aria-pressed"] === "true" || props["aria-pressed"] === true
        : selected);
    const isSelected =
      selected ??
      (props["aria-selected"]
        ? props["aria-selected"] === "true" || props["aria-selected"] === true
        : false);

    const shouldIncludeAriaSelected =
      role === "tab" || role === "option" || props["aria-selected"] !== undefined;

    const variantClass = variant === "secondary" ? "np-button-secondary" : `np-button-${variant}`;
    const combinedClass =
      `np-button ${variantClass} ${isPressed || isSelected ? "is-active" : ""} ${className}`.trim();

    if (href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          role={role ?? "button"}
          className={combinedClass}
          aria-pressed={
            !shouldIncludeAriaSelected
              ? isPressed
                ? "true"
                : (props["aria-pressed"] as any)
              : undefined
          }
          {...(shouldIncludeAriaSelected
            ? { "aria-selected": isSelected ? "true" : props["aria-selected"] }
            : {})}
          data-selected={isSelected || isPressed ? "true" : undefined}
          style={props.style}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        role={role}
        disabled={disabled}
        aria-pressed={
          !shouldIncludeAriaSelected ? (isPressed ? "true" : props["aria-pressed"]) : undefined
        }
        {...(shouldIncludeAriaSelected
          ? { "aria-selected": isSelected ? "true" : props["aria-selected"] }
          : {})}
        data-selected={isSelected || isPressed ? "true" : undefined}
        className={combinedClass}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
