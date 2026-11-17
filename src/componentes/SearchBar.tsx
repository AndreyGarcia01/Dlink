import SearchIcon from "./icons/SearchIcon";
import FilterIcon from "./icons/FilterIcon";

interface SearchBarProps {
  onSearch?: (termo: string) => void; // Futuramente você pode usar isso para filtrar
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div className="search-row">
      <div className="search-box">
        <SearchIcon />
        <input
          type="text"
          placeholder="Buscar vagas..."
          onChange={(e) => onSearch && onSearch(e.target.value)}
        />
      </div>
      <button type="button" className="filters-btn">
        <FilterIcon />
        Filtros
      </button>
    </div>
  );
}
