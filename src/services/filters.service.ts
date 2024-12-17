import { FilterInput } from "../types/filter.type";
import { GenerationResponse, PokemonNameWithId, TypeResponse, PokemonDetails } from "../types/pokemon.type";
import { pokeApi } from "../utils/pokemon.api";

export const filterService = {
  async applyGenerationFilter(input: FilterInput, allPokemonNames: PokemonNameWithId[]) {
    if (!input.generation) return allPokemonNames;
    
    const genJson = await pokeApi.getGeneration(parseInt(input.generation)) as GenerationResponse;
    const genPokemonIds = new Set(
      genJson.pokemon_species.map(p => parseInt(p?.url?.split("/").slice(-2, -1)[0] || '') || -1)
    );
    return allPokemonNames.filter(p => genPokemonIds.has(p.id));
  },

  async applyTypeFilter(input: FilterInput, filteredNames: PokemonNameWithId[]) {
    if (!input.type) return filteredNames;

    const typeJson = await pokeApi.getPokemonByType(input.type) as TypeResponse;
    const typePokemonIds = new Set(
      typeJson.pokemon.map(p => parseInt(p?.pokemon?.url?.split("/").slice(-2, -1)[0] || '') || -1)
    );
    return filteredNames.filter(p => typePokemonIds.has(p.id));
  },

  applySearchFilter(input: FilterInput, filteredNames: PokemonNameWithId[]) {
    if (!input.search) return filteredNames;
    
    const searchLower = input.search.toLowerCase();
    return filteredNames.filter(p => p.name.toLowerCase().includes(searchLower));
  },

  async getEvolutionChain(pokemon: PokemonNameWithId, allPokemonNames: PokemonNameWithId[]) {
    try {
      const details = await pokeApi.getPokemonDetails(pokemon.id);
      if (!details) return [];

      const baseId = details.name.includes('-') 
        ? await this.getBaseSpeciesId(details.name.split('-')[0])
        : details.id;

      const species = await pokeApi.getPokemonSpecies(baseId);
      const evolutionChain = await fetch(species.evolution_chain.url).then(res => res.json());
      
      const evolutionIds: number[] = [];
      const processChain = (chain: any) => {
        const id = parseInt(chain.species.url.split("/").slice(-2, -1)[0]);
        if (!isNaN(id)) evolutionIds.push(id);
        chain.evolves_to.forEach((evolution: any) => processChain(evolution));
      };
      
      processChain(evolutionChain.chain);
      console.log({elevation: evolutionChain,})
      return evolutionIds;
    } catch (error) {
      console.warn(`Failed to get evolution chain for ${pokemon.name}`);
      return [];
    }
  },

  async getBaseSpeciesId(baseName: string): Promise<number> {
    const baseDetails = await pokeApi.getPokemonDetails(baseName);
    return baseDetails?.id ?? 0;
  },

  async getPokemonDetails(id: number): Promise<PokemonDetails | null> {
    try {
      const details = await pokeApi.getPokemonDetails(id);
      if (!details) return null;

      try {
        const baseId = details.name.includes('-') 
          ? await this.getBaseSpeciesId(details.name.split('-')[0])
          : details.id;
        
        const species = await pokeApi.getPokemonSpecies(baseId);

        const jpName = species.names.find((n: { language: { name: string } }) => 
          n.language.name === 'ja-Hrkt'
        );
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
          nameJP: jpName?.name ?? "",
          types: details.types.map((t: { type: { name: string } }) => t.type.name),
          sprite: details.sprites.front_default,
          generation: parseInt(species.generation.url.split("/").slice(-2, -1)[0]||"9"),
          stats: details.stats.map((s: { stat: { name: string }, base_stat: number }) => ({
            name: s.stat.name,
            value: s.base_stat
          })),
          evolution_chain: await processEvolutionChain(evolutionChain.chain)
        };
      } catch (error) {
        return {
          id: details.id,
          name: details.name,
          types: details.types.map((t: { type: { name: string } }) => t.type.name),
          sprite: details.sprites.front_default,
          generation: 9,
          stats: details.stats.map((s: { stat: { name: string }, base_stat: number }) => ({
            name: s.stat.name,
            value: s.base_stat
          })),
          evolution_chain: []
        };
      }
    } catch (error) {
      return null;
    }
  }
};
  