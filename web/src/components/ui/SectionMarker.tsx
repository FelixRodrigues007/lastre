import "./section-marker.css";

type SectionMarkerProps = {
  /** Two-digit section index, e.g. "02". */
  index: string;
  /** Editorial section label, e.g. "BEFORE THE CALL". */
  label: string;
  /** Right-aligned keyword, e.g. "PREPARE". */
  keyword: string;
};

/**
 * Caret-style full-width editorial marker that sits on a band divider:
 *
 *   [02]  BEFORE THE CALL ───────────────────────────────────  / PREPARE
 *
 * Decorative — the surrounding section already carries the accessible heading.
 */
export function SectionMarker({ index, label, keyword }: SectionMarkerProps) {
  return (
    <div className="section-marker" aria-hidden="true">
      <span className="section-marker__head">
        <span className="section-marker__index">[{index}]</span>
        <span className="section-marker__label">{label}</span>
      </span>
      <span className="section-marker__rule" />
      <span className="section-marker__keyword">/ {keyword}</span>
    </div>
  );
}
