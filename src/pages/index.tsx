import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, Fragment } from "react";
import { api } from "../utils/pokemon.api";
import PokemonCard from "../components/pokemon.item";
import { ChevronIcon } from "../components/Icons/chevron.icon";
import { SearchIcon } from "../components/Icons/search.icon";

const POKEMON_LENGTH_GENERATIONS = 9;
const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

const Home: NextPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedGen, setSelectedGen] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    error,
  } = api.pokemon.getPokemons.useInfiniteQuery(
    {
      limit: 100,
      search: debouncedSearch,
      type: selectedType,
      generation: selectedGen,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    const { q, type, gen } = router.query;
    if (typeof q === "string") setSearch(q);
    if (typeof type === "string") setSelectedType(type);
    if (typeof gen === "string") setSelectedGen(gen);
  }, [router.query]);

  const updateFilters = (
    newSearch?: string,
    newType?: string,
    newGen?: string,
  ) => {
    const query: { q?: string; type?: string; gen?: string } = {};
    if (newSearch?.trim()) query.q = newSearch;
    if (newType?.trim()) query.type = newType;
    if (newGen?.trim()) query.gen = newGen;

    void router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true },
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 1000); // 1s de espera Debounced
    return () => clearTimeout(timer);
  }, [search]);

  // Infinite Scroll
  useEffect(() => {
    const onScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } =
        document.documentElement;
      const isNearBottom = scrollHeight - scrollTop <= clientHeight * 1.5;

      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        console.log("Fetching next page...");
        void fetchNextPage();
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (error) {
    return (
      <div className="p-8 text-center text-2xl text-white">
        Error al cargar los Pokémon: {error.message}
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Pokédex T3</title>
        <meta name="description" content="Pokédex creada con T3 Stack" />
        <link rel="icon" href="./pokeball.svg" />
      </Head>
      <main className="min-h-screen bg-white px-4 py-8">
        <div className="container mx-auto">
          <h1 className="mb-8 text-center text-4xl font-bold tracking-tight text-gray-900">
            Poké<span className="text-blue-600">dex</span>
          </h1>

          <div className="sticky top-0 z-50 mb-2 flex flex-col gap-4 border-b bg-white py-4 md:flex-row md:justify-between">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar Pokémon..."
                className="h-10 rounded-md border border-gray-200 bg-white py-2 pl-12 pr-4 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  updateFilters(e.target.value, selectedType, selectedGen);
                }}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 border-r pr-2 text-gray-500">
                <SearchIcon width={18} height={18} />
              </span>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <select
                  title="Filtrar por tipo"
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    updateFilters(search, e.target.value, selectedGen);
                  }}
                  className="h-10 w-[200px] appearance-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
                >
                  <option value="">Todos los tipos</option>
                  {POKEMON_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <ChevronIcon />
                </span>
              </div>

              <div className="relative">
                <select
                  title="Filtrar por generación"
                  value={selectedGen}
                  onChange={(e) => {
                    setSelectedGen(e.target.value);
                    updateFilters(search, selectedType, e.target.value);
                  }}
                  className="h-10 w-[232px] appearance-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
                >
                  <option value="">Todas las generaciones</option>
                  {Array.from(
                    { length: POKEMON_LENGTH_GENERATIONS },
                    (_, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        Generación {i + 1}
                      </option>
                    ),
                  )}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <ChevronIcon />
                </span>
              </div>
            </div>
          </div>

          <div className="mb-2 flex h-6 justify-center">
            {isFetching && (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            )}
          </div>

          {isLoading ? (
            <div className="text-center text-2xl text-gray-800">
              Cargando Pokémon...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 px-2 md:grid-cols-3 lg:grid-cols-4">
              {data?.pages
                .flatMap((page) => page.items)
                .map((pokemon) => (
                  <Fragment key={pokemon?.id}>
                    {pokemon?.id && <PokemonCard pokemon={pokemon} />}
                  </Fragment>
                ))}
              {data?.pages[0]?.items.length === 0 && (
                <div className="col-span-full text-center text-xl text-gray-800">
                  No se encontraron Pokémon con los filtros seleccionados
                </div>
              )}
            </div>
          )}

          {isFetchingNextPage && (
            <div className="mt-8 text-center text-sm text-gray-500">
              Cargando más Pokémon...
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
