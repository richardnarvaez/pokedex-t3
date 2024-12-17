import { type NextPage, type GetStaticProps } from "next";
import Head from "next/head";
import { api } from "../utils/pokemon.api";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useFilters } from "../hooks/useFilters";
import { helpers } from "../server/helpers";
import { ErrorMessage } from "../components/error.message";
import { Toolbar } from "../components/toolbar";
import { LoadingMessage } from "../components/loading.message";
import { PokemonList } from "../components/pokemon.list";

export const getStaticProps: GetStaticProps = async () => {
  // Siempre precargamos los primeros 100 Pokémon
  await helpers.pokemon.getPokemons.prefetch({
    limit: 100,
    cursor: 0,
  });

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
    revalidate: 3600 * 24, // 24 horas
  };
};

const Home: NextPage = ({ trpcState }: any) => {
  const {
    hasFilters,
    search,
    setSearch,
    selectedType,
    setSelectedType,
    selectedGen,
    setSelectedGen,
    debouncedSearch,
    updateFilters,
  } = useFilters();

  const shouldUseInitialData =
    !hasFilters && trpcState?.json?.queries?.[0]?.state?.data;

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
      staleTime: !hasFilters ? Infinity : 0,
      refetchOnWindowFocus: false,
      initialData: shouldUseInitialData
        ? {
            pages: [trpcState.json.queries[0].state.data],
            pageParams: [0],
          }
        : undefined,
    },
  );

  console.log({ data });

  // Infinite Scroll
  useInfiniteScroll(hasNextPage, isFetchingNextPage, fetchNextPage);

  if (error) {
    return <ErrorMessage message={error.message} />;
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
          <Toolbar
            search={search}
            selectedType={selectedType}
            selectedGen={selectedGen}
            onSearchChange={(value) => {
              setSearch(value);
              updateFilters(value, selectedType, selectedGen);
            }}
            onTypeChange={(value) => {
              setSelectedType(value);
              updateFilters(search, value, selectedGen);
            }}
            onGenChange={(value) => {
              setSelectedGen(value);
              updateFilters(search, selectedType, value);
            }}
          />

          <div className="mb-2 flex h-6 justify-center">
            {isFetching && (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            )}
          </div>

          {isLoading ? (
            <LoadingMessage
              message="Cargando Pokémon..."
              className="text-center text-xl text-gray-800"
            />
          ) : (
            <PokemonList pages={data?.pages ?? []} />
          )}

          {isFetchingNextPage && <LoadingMessage />}
        </div>
      </main>
    </>
  );
};

export default Home;
