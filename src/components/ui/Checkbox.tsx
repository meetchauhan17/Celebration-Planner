import React, { useId } from "react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  error?: string;
  description?: string;
  wrapperClassName?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  description,
  id: explicitId,
  wrapperClassName = "",
  className = "",
  disabled,
  ...props
}) => {
  const generatedId = useId();
  const id = explicitId || generatedId;
  const errorId = `${id}-error`;
  const descId = `${id}-desc`;

  const describedBy = [
    error ? errorId : null,
    description ? descId : null,
    props["aria-describedby"],
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={`np-choice-wrapper ${wrapperClassName}`.trim()}>
      <label htmlFor={id} className="np-choice-label">
        <input
          type="checkbox"
          id={id}
          disabled={disabled}
          aria-invalid={error ? "true" : props["aria-invalid"]}
          aria-describedby={describedBy}
          className={`np-checkbox ${className}`.trim()}
          {...props}
        />
        <span className="np-choice-text">{label}</span>
      </label>
      {description && (
        <span id={descId} className="np-field-description" style={{ marginLeft: 24 }}>
          {description}
        </span>
      )}
      {error && (
        <span id={errorId} className="np-field-error" role="alert" style={{ marginLeft: 24 }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Checkbox;

