export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  generation: number;
  evolution_chain: Evolution[];
  stats: Stat[];
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