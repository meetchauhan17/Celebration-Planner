import React, { useId } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  description?: string;
  options?: SelectOption[];
  wrapperClassName?: string;
  children?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  description,
  options,
  children,
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
      <select
        id={id}
        disabled={disabled}
        required={required}
        aria-invalid={error ? "true" : props["aria-invalid"]}
        aria-describedby={describedBy}
        className={`np-select ${className}`.trim()}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && (
        <span id={errorId} className="np-field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default Select;

