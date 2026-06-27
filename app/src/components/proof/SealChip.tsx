import { shortHash } from "../../lib/format";
import "./seal-chip.css";

type SealChipProps = {
  hash: string;
  label?: string;
};

export function SealChip({ hash, label = "seal" }: SealChipProps) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(hash);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="seal-chip">
      <span className="seal-chip__label">{label}</span>
      <code className="seal-chip__value">{shortHash(hash, 10, 6)}</code>
      <button type="button" className="seal-chip__copy" onClick={copy} aria-label={`Copy ${label}`}>
        Copy
      </button>
    </div>
  );
}
