import type { ReactNode } from "react";
import "./section-head.css";

type SectionHeadProps = {
  label: string;
  aside?: ReactNode;
};

export function SectionHead({ label, aside }: SectionHeadProps) {
  return (
    <header className="section-head">
      <p className="mono-label">{label}</p>
      {aside ? <span className="section-head__aside">{aside}</span> : null}
    </header>
  );
}
