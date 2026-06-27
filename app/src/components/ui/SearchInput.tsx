import { Icon } from "./Icon";
import "./search-input.css";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  ariaLabel = "Search",
}: SearchInputProps) {
  return (
    <label className="search-input">
      <Icon name="search" size={15} className="search-input__icon" />
      <input
        type="search"
        className="search-input__field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
    </label>
  );
}
