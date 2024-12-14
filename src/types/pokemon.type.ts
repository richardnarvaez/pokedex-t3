export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  generation: number;
  evolution_chain?: number;
  sprite: string;
}

export interface PokemonListResponse {
  count: number;
  results: Pokemon[];
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