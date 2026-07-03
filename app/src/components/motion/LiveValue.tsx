import { useCountUp } from "../../hooks/useCountUp";

type LiveValueProps = {
  value: number;
  className?: string;
  duration?: number;
};

/** Count-up stat — gives numbers a living, earned feel on enter. */
export function LiveValue({ value, className, duration }: LiveValueProps) {
  const display = useCountUp(value, duration);
  return <span className={className}>{display}</span>;
}
