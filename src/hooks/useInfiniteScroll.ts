import { useEffect } from 'react';

export const useInfiniteScroll = (
  hasNextPage: boolean = false,
  isFetchingNextPage: boolean,
  fetchNextPage: () => void
) => {
  useEffect(() => {
    const onScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
      const isNearBottom = scrollHeight - scrollTop <= clientHeight * 1.5;

      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        console.log("Fetching next page...");
        void fetchNextPage();
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
};