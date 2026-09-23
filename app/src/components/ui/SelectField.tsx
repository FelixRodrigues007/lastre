import { useId, type SelectHTMLAttributes } from "react";
import "./lastre-primitives.css";

export type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  error?: string;
  hideLabel?: boolean;
};

export function SelectField({
  label,
  hint,
  error,
  hideLabel = false,
  id,
  className = "",
  children,
  "aria-describedby": describedBy,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const description = error || hint;
  const descriptionId = `${fieldId}-description`;
  return (
    <div
      className={`lastre-field ${hideLabel ? "lastre-field--label-hidden" : ""} ${className}`}
    >
      <label htmlFor={fieldId}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <select
        {...props}
        id={fieldId}
        className="lastre-field__input"
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={
          [describedBy, description ? descriptionId : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
      >
        {children}
      </select>
      {description && (
        <p
          id={descriptionId}
          className={error ? "lastre-field__error" : "lastre-field__hint"}
        >
          {description}
        </p>
      )}
    </div>
  );
}
