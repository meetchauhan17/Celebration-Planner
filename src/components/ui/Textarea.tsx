import React, { useId } from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  description?: string;
  wrapperClassName?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  description,
  id: explicitId,
  wrapperClassName = "",
  className = "",
  disabled,
  required,
  rows = 4,
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
      <textarea
        id={id}
        rows={rows}
        disabled={disabled}
        required={required}
        aria-invalid={error ? "true" : props["aria-invalid"]}
        aria-describedby={describedBy}
        className={`np-textarea ${className}`.trim()}
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

export default Textarea;

