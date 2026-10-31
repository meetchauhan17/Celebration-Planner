import React, { useId } from "react";

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
  wrapperClassName?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  error,
  description,
  id: explicitId,
  wrapperClassName = "",
  className = "",
  disabled,
  required,
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
    <div className={`np-field-wrapper ${wrapperClassName}`.trim()}>
      <label htmlFor={id} className="np-field-label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {description && (
        <span id={descId} className="np-field-description">
          {description}
        </span>
      )}
      <input
        id={id}
        disabled={disabled}
        required={required}
        aria-invalid={error ? "true" : props["aria-invalid"]}
        aria-describedby={describedBy}
        className={`np-input ${className}`.trim()}
        {...props}
      />
      {error && (
        <span id={errorId} className="np-field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default Field;

