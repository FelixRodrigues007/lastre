import { useId, type InputHTMLAttributes } from "react";
import "./lastre-primitives.css";

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({
  label,
  hint,
  error,
  id,
  className = "",
  "aria-describedby": describedBy,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const descriptionId = `${fieldId}-description`;
  const description = error || hint;
  return (
    <div className={`lastre-field ${className}`}>
      <label htmlFor={fieldId}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        {...props}
        id={fieldId}
        className="lastre-field__input"
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={
          [describedBy, description ? descriptionId : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
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
