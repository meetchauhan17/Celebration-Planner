import React, { useId } from "react";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  error?: string;
  description?: string;
  wrapperClassName?: string;
}

export const Radio: React.FC<RadioProps> = ({
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
          type="radio"
          id={id}
          disabled={disabled}
          data-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          className={`np-radio ${className}`.trim()}
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

export default Radio;
