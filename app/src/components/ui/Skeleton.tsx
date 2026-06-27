import "./skeleton.css";

type SkeletonBlockProps = {
  width?: string;
  height?: string;
  className?: string;
};

export function SkeletonBlock({ width = "100%", height = "1rem", className = "" }: SkeletonBlockProps) {
  return (
    <span
      className={`skeleton-block ${className}`.trim()}
      style={{ width, height, display: "block" }}
      aria-hidden="true"
    />
  );
}

export function SkeletonDashboard() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Loading">
      <div className="skeleton-page__head">
        <SkeletonBlock width="5rem" height="0.625rem" />
        <SkeletonBlock width="14rem" height="1.75rem" />
        <SkeletonBlock width="28rem" height="0.875rem" />
      </div>
      <div className="skeleton-page__grid">
        <SkeletonBlock height="5rem" />
        <SkeletonBlock height="5rem" />
        <SkeletonBlock height="5rem" />
        <SkeletonBlock height="5rem" />
      </div>
      <div className="skeleton-page__panel">
        <SkeletonBlock width="40%" height="1.25rem" />
        <SkeletonBlock height="6px" />
        <SkeletonBlock width="60%" height="0.75rem" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-page skeleton-table" aria-busy="true" aria-label="Loading">
      <SkeletonBlock width="8rem" height="0.625rem" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton-table__row">
          <SkeletonBlock height="0.75rem" />
          <SkeletonBlock height="0.75rem" />
          <SkeletonBlock height="1.25rem" />
          <SkeletonBlock height="1.25rem" />
          <SkeletonBlock height="1.25rem" />
          <SkeletonBlock height="0.75rem" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonSplit() {
  return (
    <div className="skeleton-page skeleton-split" aria-busy="true" aria-label="Loading">
      <div className="skeleton-page__panel">
        <SkeletonBlock width="50%" height="1rem" />
        <SkeletonBlock height="2.5rem" />
        <SkeletonBlock height="2.5rem" />
        <SkeletonBlock height="2.5rem" />
      </div>
      <div className="skeleton-page__panel">
        <SkeletonBlock width="40%" height="1rem" />
        <SkeletonBlock height="8rem" />
        <SkeletonBlock height="8rem" />
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Loading">
      <div className="skeleton-page__grid">
        <SkeletonBlock height="4.5rem" />
        <SkeletonBlock height="4.5rem" />
        <SkeletonBlock height="4.5rem" />
        <SkeletonBlock height="4.5rem" />
      </div>
      <div className="skeleton-page__panel">
        <SkeletonBlock width="30%" height="0.75rem" />
        <SkeletonBlock height="4rem" />
      </div>
      <div className="skeleton-page__panel">
        <SkeletonBlock width="25%" height="0.75rem" />
        <SkeletonBlock height="6rem" />
      </div>
    </div>
  );
}
