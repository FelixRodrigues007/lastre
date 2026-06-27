import type { ReactNode } from "react";
import {
  SkeletonDashboard,
  SkeletonDetail,
  SkeletonSplit,
  SkeletonTable,
} from "../ui/Skeleton";
import "./state-panel.css";

export type SkeletonVariant = "dashboard" | "table" | "split" | "detail";

type StatePanelProps = {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  skeleton?: SkeletonVariant;
  children: ReactNode;
};

function SkeletonForVariant({ variant }: { variant: SkeletonVariant }) {
  switch (variant) {
    case "table":
      return <SkeletonTable />;
    case "split":
      return <SkeletonSplit />;
    case "detail":
      return <SkeletonDetail />;
    default:
      return <SkeletonDashboard />;
  }
}

export function StatePanel({
  loading,
  error,
  onRetry,
  skeleton = "dashboard",
  children,
}: StatePanelProps) {
  if (loading) {
    return <SkeletonForVariant variant={skeleton} />;
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
