import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import superjson from "superjson";
import type { AppRouter } from "../server/api/root";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

const BASE_URL = "https://pokeapi.co/api/v2";

interface PokemonNameCache {
  names: { name: string; id: number }[];
  lastUpdated: number;
}

let pokemonNamesCache: PokemonNameCache | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

export const pokeApi = {
  async getAllPokemonNames() {
    // Check if we have valid cached data
    if (
      pokemonNamesCache && 
      Date.now() - pokemonNamesCache.lastUpdated < CACHE_DURATION
    ) {
      return pokemonNamesCache.names;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/pokemon?limit=100000&offset=0`
      );
      const data = await response.json();
      
      // Process and cache the data
      const names = data.results.map((p: any) => ({
        name: p.name,
        id: parseInt(p.url.split("/").slice(-2, -1)[0])
      }));

      pokemonNamesCache = {
        names,
        lastUpdated: Date.now()
      };

      return names;
    } catch (error) {
      console.error("Failed to fetch all Pokemon names:", error);
      // Return cached data if available, even if expired
      return pokemonNamesCache?.names ?? [];
    }
  },

  async getPokemonList(limit: number, offset: number) {
    const response = await fetch(
      `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
    );
    if (!response.ok) throw new Error(`Failed to fetch pokemon list: ${response.statusText}`);
    return await response.json();
  },

  async getPokemonDetails(nameOrId: string | number) {
    try {
      const response = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
      if (!response.ok) {
        console.warn(`Pokemon not found: ${nameOrId}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.warn(`Error fetching pokemon ${nameOrId}:`, error);
      return null;
    }
  },

  async getPokemonSpecies(id: number) {
    const response = await fetch(`${BASE_URL}/pokemon-species/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch pokemon species: ${response.statusText}`);
    return await response.json();
  },

  async getEvolutionChain(id: number) {
    const response = await fetch(`${BASE_URL}/evolution-chain/${id}`);
    const data = await response.json();
    
    const evoChain: any[] = [];
    let evoData = data.chain;

    do {
      const speciesName = evoData.species.name;
      const pokemonDetails = await this.getPokemonDetails(speciesName);
      
      evoChain.push({
        species: evoData.species,
        sprite: pokemonDetails.sprites.front_default,
      });

      evoData = evoData.evolves_to[0];
    } while (evoData && evoData.hasOwnProperty("evolves_to"));

    return evoChain;
  },

  async getGeneration(id: number) {
    const response = await fetch(`${BASE_URL}/generation/${id}`);
    if (!response.ok) throw new Error(`Generation not found: ${response.statusText}`);
    return await response.json();
  },

  async getPokemonByType(type: string) {
    const response = await fetch(`${BASE_URL}/type/${type}`);
    if (!response.ok) throw new Error(`Failed to fetch pokemon by type: ${response.statusText}`);
    return await response.json();
  },
};


export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          // Opcional: añadir headers si es necesario
          headers() {
            return {};
          },
        }),
      ],
    };
  },
  ssr: false,
});