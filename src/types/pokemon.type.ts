export interface Pokemon {
  id: number;
  name: string;
  nameJP?: string;
  types: string[];
  generation: number;
  evolution_chain?: number;
  sprite: string;
}

export interface PokemonListResponse {
  count: number;
  results: Pokemon[];
}

export interface Evolution {
  species: {
    name: string;
    url: string;
  };
  sprite: string;
}

export interface Stat {
  name: string;
  value: number;
} 

export const TYPE_COLORS = {
  water: "from-blue-400/20",
  electric: "from-yellow-400/20",
  fire: "from-red-400/20",
  grass: "from-green-400/20",
  bug: "from-green-600/20",
  poison: "from-purple-400/20",
} as const;

export type PokemonColorType = keyof typeof TYPE_COLORS;

export const getGradientColor = (type: string) => {
  return TYPE_COLORS[type as PokemonColorType] || "from-gray-400/20";
};

export interface PokemonListItem {
  id: number;
  name: string;
  nameJP?: string;
  types: string[];
  sprite: string;
  generation: number;
}

export interface PokemonSpecies {
  url: string;
  name: string;
}

export interface TypeResponse {
  pokemon: Array<{
    pokemon: {
      url: string;
      name: string;
    };
  }>;
}

export interface GenerationResponse {
  pokemon_species: PokemonSpecies[];
}

export interface PokemonNameWithId {
  name: string;
  id: number;
}

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonDetails extends PokemonListItem {
  stats: PokemonStat[];
  evolution_chain: Evolution[];
}

export interface PokemonST {
  id: number;
  name: string;
  nameJP?: string;
  types: string[];
  sprite: string;
  generation: number;
  evolution_chain: Evolution[];
  stats: PokemonStat[];
}