import Link from "next/link";
import Image from "next/image";
import { PokemonListItem, getGradientColor } from "../types/pokemon.type";

const PokemonCard = ({ pokemon }: { pokemon: PokemonListItem }) => {
  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      className="relative block aspect-[3/4] w-full transform overflow-hidden rounded-lg border border-gray-200 shadow transition-all hover:scale-105 hover:shadow-lg"
    >
      <div className="absolute inset-0 p-2">
        {pokemon.name.includes("-") && (
          <Image
            src={"/images/bg.jpg"}
            alt={pokemon.name}
            fill
            objectFit="cover"
            className="absolute inset-0 h-full "
            style={{ filter: "blur(10px)", opacity: 0.4, margin: "8px" }}
          />
        )}
        {pokemon.nameJP && (
          <span className="absolute bottom-24 left-0 right-0 transform whitespace-nowrap text-center text-[150px] opacity-5">
            {pokemon.nameJP}
          </span>
        )}
        <div
          className={`bg-gradient-to-b ${getGradientColor(pokemon.types[0] ?? "")} absolute left-0 right-0 top-0 m-2 h-[100px] rounded-md to-transparent`}
        >
          <p className="text-center font-mono text-[80px] font-semibold text-gray-900/20">
            {String(pokemon.id).padStart(4, "0")}
          </p>
        </div>
        <div className="flex h-full flex-col items-center justify-between">
          <div className="relative mt-16 h-32 w-32">
            <Image
              src={pokemon.sprite || "/pokeball.svg"}
              alt={pokemon.name}
              fill
              sizes="128px"
              className="object-contain"
            />
          </div>
          {pokemon.name.includes("-") && (
            <span className="z-10 rounded-full border border-red-500 bg-white px-2 py-1 text-xs font-semibold uppercase text-red-500">
              Especial
            </span>
          )}

          <div className="flex w-full flex-col items-center">
            <h2 className="text-xl font-semibold capitalize">
              {pokemon.name.includes("-") ? (
                <>{pokemon.name.replace("-", " ")}</>
              ) : (
                pokemon.name
              )}
            </h2>
            <div className="mt-2 flex gap-2">
              {pokemon.types.map((type) => (
                <span
                  key={pokemon.id + "-" + type}
                  className="rounded-full bg-black/10 px-4 py-1 text-sm capitalize"
                >
                  {type}
                </span>
              ))}
            </div>
            <div className="mt-2 w-full border-t border-gray-200 pt-3 text-center text-sm">
              Generación {pokemon.generation}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PokemonCard;
