import { useState } from "react";
import "./copy-block.css";

type CopyBlockProps = {
  label: string;
  value: string;
};

export function CopyBlock({ label, value }: CopyBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="copy-block">
      <span className="copy-block__label">{label}</span>
      <div className="copy-block__row">
        <code className="copy-block__value">{value}</code>
        <button
          type="button"
          className={`copy-block__btn${copied ? " copy-block__btn--done" : ""}`}
          onClick={copy}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
