import Link from "next/link";
import Image from "next/image";
import { getGradientColor } from "../types/pokemon.type";

interface PokemonCardProps {
  pokemon: {
    id: number;
    name: string;
    types: string[];
    sprite: string;
    generation: number;
  };
}

const PokemonCard = ({ pokemon }: PokemonCardProps) => {
  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      className="relative block w-full aspect-[3/4] transform rounded-lg border border-gray-200 shadow transition-all hover:scale-105 hover:shadow-lg"
    >
      <div className="absolute inset-0 p-4">
        <div className={`bg-gradient-to-b ${getGradientColor(pokemon.types[0] ?? '')} to-transparent absolute top-0 right-0 left-0 h-[100px] rounded-md m-2`}>
          <p className="text-black/10 text-[80px] font-semibold font-mono text-center">
            {String(pokemon.id).padStart(4, "0")}
          </p>
        </div>
        <div className="flex h-full flex-col items-center justify-between">
          <div className="relative h-32 w-32 mt-16">
            <Image
              src={pokemon.sprite}
              alt={pokemon.name}
              fill
              sizes="128px"
              className="object-contain"
            />
          </div>
          {pokemon.name.includes('-') && <span className="text-red-500 font-semibold text-xs border border-red-500 rounded-full px-2 py-1 uppercase">Especial</span>}
                 
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold capitalize">
              {pokemon.name.includes('-') ? (
                <>
                  {pokemon.name.replace('-', ' ')}
                </>
              ) : (
                pokemon.name
              )}
            </h2>
            <div className="mt-2 flex gap-2">
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  className="rounded-full bg-black/10 px-2 py-1 px-4 text-sm capitalize"
                >
                  {type}
                </span>
              ))}
            </div>
            <div className="mt-2 text-sm border-t border-gray-200 pt-2 w-full text-center mt-2">Generación {pokemon.generation}</div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PokemonCard; 