import type { ReactNode } from "react";
import "./state-panel.css";

type StatePanelProps = {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: ReactNode;
};

export function StatePanel({ loading, error, onRetry, children }: StatePanelProps) {
  if (loading) {
    return (
      <div className="panel state-panel">
        <p className="state-panel__text">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel state-panel state-panel--error">
        <p className="state-panel__text">{error}</p>
        {onRetry ? (
          <button type="button" className="route-cta" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    );
  }

  return <>{children}</>;
}
