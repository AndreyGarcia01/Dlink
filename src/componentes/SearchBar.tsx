import SearchIcon from "./icons/SearchIcon";
import FilterIcon from "./icons/FilterIcon";

interface SearchBarProps {
  value?: string;
  onSearch?: (termo: string) => void;
  onFiltersClick?: () => void;
  filtersOpen?: boolean;
}

export default function SearchBar({
  value,
  onSearch,
  onFiltersClick,
  filtersOpen = false,
}: SearchBarProps) {
  return (
    <div className="search-row">
      <div className="search-box">
        <SearchIcon />
        <input
          type="text"
          aria-label="Buscar vagas"
          placeholder="Buscar vagas..."
          value={value}
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      {onFiltersClick && (
        <button
          type="button"
          className="filters-btn"
          onClick={onFiltersClick}
          aria-expanded={filtersOpen}
          aria-controls="painel-filtros"
        >
          <FilterIcon />
          Filtros
        </button>
      )}
    </div>
  );
}
