import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { pokeApi } from "../../../utils/pokemon.api";
import { 
  PokemonListItem, 
  TypeResponse, 
  GenerationResponse, 
  PokemonNameWithId 
} from "../../../types/pokemon.type";

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
        console.log("\n\n>>>>>>>>",{input});
        // Get all Pokemon names from cache
        const allPokemonNames: PokemonNameWithId[] = await pokeApi.getAllPokemonNames();
        let filteredNames = allPokemonNames;
        // ------------------------------------------------------------

        // Apply generation filter
        if (input.generation) {
          const genJson = await pokeApi.getGeneration(parseInt(input.generation)) as GenerationResponse;
          const genPokemonIds = new Set(
            genJson.pokemon_species.map(p => {
              const id = p.url.split("/").slice(-2, -1)[0];
              return id ? parseInt(id) : -1;
            })
          );
          filteredNames = filteredNames.filter(p => genPokemonIds.has(p.id));
        }

        // Apply type filter
        if (input.type) {
          const typeJson = await pokeApi.getPokemonByType(input.type) as TypeResponse;
          const typePokemonIds = new Set(
            typeJson.pokemon.map(p => {
              const id = p.pokemon.url.split("/").slice(-2, -1)[0];
              return id ? parseInt(id) : -1;
            })
          );
          filteredNames = filteredNames.filter(p => typePokemonIds.has(p.id));
        }

        // Apply search filter
        if (input.search) {
          const searchLower = input.search.toLowerCase();
          filteredNames = filteredNames.filter(p => 
            p.name.toLowerCase().includes(searchLower)
          );
        }

        // If we have any filters, get evolution chains for filtered Pokemon
        if (input.search) { // && !input.type && !input.generation
          const evolutionSets = await Promise.all(
            filteredNames.map(async (pokemon) => {
              try {
                const details = await pokeApi.getPokemonDetails(pokemon.id);
                if (!details) return [];

                const baseId = details.name.includes('-') 
                  ? await getBaseSpeciesId(details.name.split('-')[0])
                  : details.id;

                const species = await pokeApi.getPokemonSpecies(baseId);
                const evolutionChainResponse = await fetch(species.evolution_chain.url);
                const evolutionChain = await evolutionChainResponse.json();
                
                const evolutionIds: number[] = [];
                const processChain = (chain: any) => {
                  const id = parseInt(chain.species.url.split("/").slice(-2, -1)[0]);
                  evolutionIds.push(id);
                  chain.evolves_to.forEach((evolution: any) => {
                    processChain(evolution);
                  });
                };
                
                processChain(evolutionChain.chain);
                return evolutionIds;
              } catch (error) {
                console.warn(`>> Failed to get evolution chain for ${pokemon.name}:`);
                return [];
              }
            })
          );

          // Add evolution Pokemon to filtered names
          const evolutionIds = new Set(evolutionSets.flat());
          const evolutionNames = allPokemonNames.filter(p => evolutionIds.has(p.id));
          filteredNames = Array.from(new Set([...filteredNames, ...evolutionNames]));
        }

        // Sort by ID
        filteredNames.sort((a, b) => a.id - b.id);

        // Apply pagination
        const startIndex = input.cursor ?? 0;
        const endIndex = startIndex + input.limit;
        const paginatedNames = filteredNames.slice(startIndex, endIndex);

        // Get full details for paginated Pokemon
        const pokemonDetails = await Promise.all(
          paginatedNames.map(async ({ id }): Promise<PokemonListItem | null> => {
            try {
              const details = await pokeApi.getPokemonDetails(id);
              // console.log({details});
              if (!details) return null;

              try {
                const baseId = details.name.includes('-') 
                  ? await getBaseSpeciesId(details.name.split('-')[0])
                  : details.id;
                
                const species = await pokeApi.getPokemonSpecies(baseId);
                
                const jpName = species.names.find((n: { language: { name: string } }) => n.language.name === 'ja-Hrkt');
                
                return {
                  id: details.id,
                  name: details.name,
                  nameJP: jpName?.name ?? "",
                  types: details.types.map((t: { type: { name: string } }) => t.type.name),
                  sprite: details.sprites.front_default,
                  generation: parseInt(species.generation.url.split("/").slice(-2, -1)[0]),
                };
              } catch (error) {
                console.warn(`Failed to get species for ${details.name}, using fallback values`);
                return {
                  id: details.id,
                  name: details.name,
                  types: details.types.map((t: { type: { name: string } }) => t.type.name),
                  sprite: details.sprites.front_default,
                  generation: 9,
                };
              }
            } catch (error) {
              console.warn(`Failed to get details for Pokemon ${id}:`, error);
              return null;
            }
          })
        );

        // const validPokemonDetails = pokemonDetails.filter((p): p is PokemonListItem => p !== null);
        // console.log({validPokemonDetails});

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
      try {
        const details = await pokeApi.getPokemonDetails(input);
        if (!details) throw new Error('Pokemon not found');

        try {
          // For special forms, we use the base species ID
          const baseId = details.name.includes('-') 
            ? await getBaseSpeciesId(details.name.split('-')[0])
            : details.id;

          const species = await pokeApi.getPokemonSpecies(baseId);
          
          // Get evolution chain
          const evolutionChainResponse = await fetch(species.evolution_chain.url);
          const evolutionChain = await evolutionChainResponse.json();
          
          // Process evolution chain
          const processEvolutionChain = async (chain: any) => {
            const evolutions: any[] = [];
            let current = chain;
            
            while (current) {
              const id = current.species.url.split("/").slice(-2, -1)[0];
              const pokemonDetails = await pokeApi.getPokemonDetails(parseInt(id));
              
              evolutions.push({
                species: current.species,
                sprite: pokemonDetails?.sprites.front_default
              });
              
              current = current.evolves_to[0];
            }
            
            return evolutions;
          };

          return {
            id: details.id,
            name: details.name,
            types: details.types.map((t: { type: { name: string } }) => t.type.name),
            sprite: details.sprites.front_default,
            generation: parseInt(species.generation.url.split("/").slice(-2, -1)[0]),
            stats: details.stats.map((s: { 
              stat: { name: string }, 
              base_stat: number 
            }) => ({
              name: s.stat.name,
              value: s.base_stat
            })),
            evolution_chain: await processEvolutionChain(evolutionChain.chain)
          };
        } catch (error) {
          // If it fails to get species, return without evolution chain
          console.warn(`Failed to get species for ${details.name}, returning without evolution chain`);
          return {
            id: details.id,
            name: details.name,
            types: details.types.map((t: { type: { name: string } }) => t.type.name),
            sprite: details.sprites.front_default,
            generation: 9,
            stats: details.stats.map((s: { 
              stat: { name: string }, 
              base_stat: number 
            }) => ({
              name: s.stat.name,
              value: s.base_stat
            })),
            evolution_chain: []
          };
        }
      } catch (error) {
        console.error("Error in getPokemonById:", error);
        throw new Error('Failed to fetch pokemon');
      }
    }),
}); 

// Helper function to get base species ID
async function getBaseSpeciesId(baseName: string): Promise<number> {
  const baseDetails = await pokeApi.getPokemonDetails(baseName);
  return baseDetails?.id ?? 0;
}