import { type NextPage, type GetStaticProps, type GetStaticPaths } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "../../utils/pokemon.api";
import type { Evolution, PokemonStat } from "../../types/pokemon.type";
import Image from "next/image";
import { helpers } from "../../server/helpers";

export const getStaticPaths: GetStaticPaths = async () => {
  // Get first 151 Pokemon for static generation
  return {
    // Genera los primeros 151 Pokémon en build time
    paths: Array.from({ length: 50 }, (_, i) => ({
      params: { id: String(i + 1) },
    })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params?.id;
  if (!id || Array.isArray(id)) throw new Error("Invalid id");

  // Prefetch the pokemon data
  await helpers.pokemon.getPokemonById.prefetch(parseInt(id));

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
    revalidate: 3600,
  };
};

const PokemonDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: pokemon, isLoading } = api.pokemon.getPokemonById.useQuery(
    parseInt(id as string),
  );

  return (
    <>
      <Head>
        <title>{`${!pokemon ? "Cargando..." : pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} - Pokédex`}</title>
      </Head>
      <main className="min-h-screen bg-white px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Volver al listado
          </button>

          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            {isLoading ? (
              // Skeleton loader
              <div className="animate-pulse">
                <div className="mb-8 flex flex-col items-center gap-8 md:flex-row md:items-start">
                  {/* Image skeleton */}
                  <div className="relative h-48 w-48 overflow-hidden rounded-lg bg-gray-200" />

                  <div className="w-full">
                    {/* Name skeleton */}
                    <div className="mb-4 h-8 w-48 rounded bg-gray-200" />

                    <div className="space-y-4">
                      {/* Types skeleton */}
                      <div>
                        <div className="mb-2 h-4 w-16 rounded bg-gray-200" />
                        <div className="flex gap-2">
                          <div className="h-6 w-20 rounded-full bg-gray-200" />
                          <div className="h-6 w-20 rounded-full bg-gray-200" />
                        </div>
                      </div>

                      {/* Generation skeleton */}
                      <div>
                        <div className="mb-2 h-4 w-24 rounded bg-gray-200" />
                        <div className="h-6 w-32 rounded bg-gray-200" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats skeleton */}
                <div className="mb-8">
                  <div className="mb-6 h-8 w-32 rounded bg-gray-200" />
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-8 items-center gap-4"
                      >
                        <div className="col-span-2 h-4 rounded bg-gray-200" />
                        <div className="col-span-5 h-2 rounded-full bg-gray-200" />
                        <div className="col-span-1 h-4 rounded bg-gray-200" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evolution chain skeleton */}
                <div>
                  <div className="mb-4 h-6 w-40 rounded bg-gray-200" />
                  <div className="flex flex-wrap justify-center gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="text-center">
                        <div className="mb-2 h-24 w-24 rounded bg-gray-200" />
                        <div className="mx-auto h-4 w-20 rounded bg-gray-200" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Actual content
              <>
                <div className="mb-8 flex flex-col items-center gap-8 md:flex-row md:items-start">
                  <div className="relative h-48 w-48 overflow-hidden rounded-lg border border-gray-200">
                    <Image
                      src={pokemon?.sprite || "/pokeball.svg"}
                      alt={pokemon?.name || ""}
                      fill
                      sizes="192px"
                      className="object-contain"
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold capitalize">
                      {pokemon?.name.includes("-") ? (
                        <>
                          {pokemon?.name.replace("-", " ")}
                          <span className="text-red-500">{" (Especial)"} </span>
                        </>
                      ) : (
                        pokemon?.name
                      )}
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <h2 className="text-sm font-medium text-gray-500">
                          Tipos
                        </h2>
                        <div className="mt-1 flex gap-2">
                          {pokemon?.types.map((type: any) => (
                            <span
                              key={type}
                              className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-900"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h2 className="text-sm font-medium text-gray-500">
                          Generación
                        </h2>
                        <p>Generación {pokemon?.generation}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats section */}
                <div className="mb-8">
                  <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                    Estadísticas
                  </h2>
                  <div className="space-y-4">
                    {pokemon?.stats.map((stat: PokemonStat) => (
                      <div
                        key={stat.name}
                        className="grid grid-cols-8 items-center gap-4"
                      >
                        <div className="col-span-2 text-sm font-medium capitalize text-gray-500">
                          {stat.name.replace("-", " ")}
                        </div>
                        <div className="col-span-5">
                          <div className="h-2 w-full rounded-full bg-gray-100">
                            <div
                              className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                              style={{ width: `${(stat.value / 255) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="col-span-1 text-right text-sm font-semibold text-gray-900">
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="mb-4 text-2xl font-semibold">
                    Cadena evolutiva
                  </h2>
                  <div className="flex flex-wrap justify-center gap-4">
                    {(pokemon?.evolution_chain as Evolution[]).map((evo) => (
                      <Link
                        key={evo.species.name}
                        href={`/pokemon/${evo.species.url.split("/").slice(-2, -1)[0]}`}
                        replace
                        className={`text-center ${
                          evo.species.name === pokemon?.name
                            ? "pointer-events-none opacity-50"
                            : "hover:text-gray-300"
                        }`}
                      >
                        <div className="relative h-24 w-24">
                          <Image
                            src={evo.sprite || "/pokeball.svg"}
                            alt={evo.species.name}
                            fill
                            sizes="96px"
                            className="object-contain"
                          />
                        </div>
                        <div className="capitalize">{evo.species.name}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default PokemonDetail;
