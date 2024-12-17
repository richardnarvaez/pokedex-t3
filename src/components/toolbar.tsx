import { SearchIcon } from "./Icons/search.icon";
import { ChevronIcon } from "./Icons/chevron.icon";

interface ToolbarProps {
  search: string;
  selectedType: string;
  selectedGen: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onGenChange: (value: string) => void;
}

const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

const POKEMON_LENGTH_GENERATIONS = 9;

export const Toolbar = ({
  search,
  selectedType,
  selectedGen,
  onSearchChange,
  onTypeChange,
  onGenChange,
}: ToolbarProps) => {
  return (
    <>
      <h1 className="mb-8 text-center text-4xl font-bold tracking-tight text-gray-900">
        Poké<span className="text-blue-600">dex</span>
      </h1>
      <div className="sticky top-0 z-50 mb-2 flex flex-col gap-4 border-b bg-white py-4 md:flex-row md:justify-between">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar Pokémon..."
            className="h-10 rounded-md border border-gray-200 bg-white py-2 pl-12 pr-4 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 border-r pr-2 text-gray-500">
            <SearchIcon width={18} height={18} />
          </span>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <select
              title="Filtrar por tipo"
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="h-10 w-[200px] appearance-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
            >
              <option value="">Todos los tipos</option>
              {POKEMON_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <ChevronIcon />
            </span>
          </div>

          <div className="relative">
            <select
              title="Filtrar por generación"
              value={selectedGen}
              onChange={(e) => onGenChange(e.target.value)}
              className="h-10 w-[232px] appearance-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
            >
              <option value="">Todas las generaciones</option>
              {Array.from({ length: POKEMON_LENGTH_GENERATIONS }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  Generación {i + 1}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <ChevronIcon />
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
