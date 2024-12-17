import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export const useFilters = () => {
  const router = useRouter();
  const { search: urlSearch, type: urlType, gen: urlGen } = router.query;
  
  const hasFilters = !!(urlSearch || urlType || urlGen);

  const [search, setSearch] = useState((urlSearch as string) || '');
  const [selectedType, setSelectedType] = useState((urlType as string) || '');
  const [selectedGen, setSelectedGen] = useState((urlGen as string) || '');
  
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setSearch((urlSearch as string) || '');
    setSelectedType((urlType as string) || '');
    setSelectedGen((urlGen as string) || '');
  }, [urlSearch, urlType, urlGen]);

  useEffect(() => {
    const query: Record<string, string> = {};
    if (search) query.search = search;
    if (selectedType) query.type = selectedType;
    if (selectedGen) query.gen = selectedGen;

    const currentQuery = router.query;
    const hasChanged = 
      query.search !== currentQuery.search ||
      query.type !== currentQuery.type ||
      query.gen !== currentQuery.gen;

    if (hasChanged) {
      router.replace({
        pathname: router.pathname,
        query
      }, undefined, { shallow: true });
    }
  }, [debouncedSearch, selectedType, selectedGen]);

  const updateFilters = (search: string, type: string, gen: string) => {
    setSearch(search);
    setSelectedType(type);
    setSelectedGen(gen);
  };

  return {
    hasFilters,
    search,
    setSearch,
    selectedType,
    setSelectedType,
    selectedGen,
    setSelectedGen,
    debouncedSearch,
    updateFilters,
  };
};