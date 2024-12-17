import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { pokeApi } from "../../../utils/pokemon.api";
import { filterService } from "../../../services/filters.service";

export const pokemonRouter = createTRPCRouter({
  getPokemons: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.string().optional(),
        generation: z.string().optional(),
        limit: z.number().default(25),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ input }) => {
      try {
        // Get all Pokemon names from cache
        const allPokemonNames = await pokeApi.getAllPokemonNames();
        
        // Apply filters sequentially
        let filteredNames = await filterService.applyGenerationFilter(input, allPokemonNames);
        filteredNames = await filterService.applyTypeFilter(input, filteredNames);
        filteredNames = filterService.applySearchFilter(input, filteredNames);

        // Get evolution chains if searching
        if (input.search) {
          const evolutionSets = await Promise.all(
            filteredNames.map(pokemon => filterService.getEvolutionChain(pokemon, allPokemonNames))
          );
          const evolutionIds = new Set(evolutionSets.flat());
          const evolutionNames = allPokemonNames.filter((p:any) => evolutionIds.has(p.id));
          filteredNames = Array.from(new Set([...filteredNames, ...evolutionNames]));
        }

        // Sort and paginate
        filteredNames.sort((a, b) => a.id - b.id);
        const startIndex = input.cursor ?? 0;
        const endIndex = startIndex + input.limit;
        const paginatedNames = filteredNames.slice(startIndex, endIndex);

        // Get details for paginated Pokemon
        const pokemonDetails = await Promise.all(
          paginatedNames.map(({ id }) => filterService.getPokemonDetails(id))
        );

        return {
          items: pokemonDetails,
          nextCursor: endIndex < filteredNames.length ? endIndex : undefined,
        };
      } catch (error) {
        console.error("Error in getPokemons:", error);
        throw error;
      }
    }),

  getPokemonById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const details = await filterService.getPokemonDetails(input);
      if (!details) throw new Error('Pokemon not found');
      return details;
    }),
});