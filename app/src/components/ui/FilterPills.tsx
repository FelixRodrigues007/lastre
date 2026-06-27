import "./filter-pills.css";

export type FilterOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

type FilterPillsProps<T extends string> = {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
};

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  ariaLabel = "Filter",
}: FilterPillsProps<T>) {
  return (
    <div className="filter-pills" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`filter-pill${value === option.value ? " filter-pill--active" : ""}`}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.count !== undefined ? (
            <span className="filter-pill__count">{option.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
