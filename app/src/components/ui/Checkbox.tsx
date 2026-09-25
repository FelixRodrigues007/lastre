import { useEffect, useRef, type InputHTMLAttributes } from "react";
import "./checkbox.css";

/**
 * Native checkbox with the Lastre look and an `indeterminate` state for
 * "some selected". Keyboard, forms and assistive technology keep native behavior.
 */
export function Checkbox({
  indeterminate = false,
  className = "",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  indeterminate?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      {...props}
      ref={ref}
      type="checkbox"
      aria-checked={indeterminate ? "mixed" : undefined}
      className={`lastre-checkbox ${className}`.trim()}
    />
  );
}
