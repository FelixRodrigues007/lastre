import { Button } from "../ui/Button";
import { InlineNotice } from "../ui/InlineNotice";
import type { ReactNode } from "react";
import { useLocaleContext } from "../../context/LocaleContext";
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
  const { t } = useLocaleContext();

  if (loading) {
    return <SkeletonForVariant variant={skeleton} />;
  }

  if (error) {
    return (
      <InlineNotice
        tone="danger"
        live
        title={t("common.loadError")}
        action={
          onRetry ? (
            <Button variant="secondary" onClick={onRetry}>
              {t("common.retry")}
            </Button>
          ) : undefined
        }
      >
        {error}
      </InlineNotice>
    );
  }

  return <>{children}</>;
}
