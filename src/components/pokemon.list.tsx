import { Fragment } from "react";
import PokemonCard from "./pokemon.item";
import type { PokemonListItem } from "../types/pokemon.type";

interface PokemonListProps {
  pages: Array<{
    items: (PokemonListItem | null)[];
    nextCursor?: number;
  }>;
}

export const PokemonList = ({ pages }: PokemonListProps) => {
  const items = pages.flatMap((page) => page.items);
  const isEmpty = pages[0]?.items?.length === 0;

  if (isEmpty) {
    return (
      <div className="col-span-full text-center text-xl text-gray-800">
        No se encontraron Pokémon con los filtros seleccionados
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 px-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((pokemon) => (
        <Fragment key={pokemon?.id}>
          {pokemon?.id && <PokemonCard pokemon={pokemon} />}
        </Fragment>
      ))}
    </div>
  );
};
