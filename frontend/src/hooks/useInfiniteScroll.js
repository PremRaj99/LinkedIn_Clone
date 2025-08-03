import { useState, useEffect, useCallback } from 'react';

export const useInfiniteScroll = (fetchMore, hasNextPage) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching) {
        return;
      }
      setIsFetching(true);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching]);

  useEffect(() => {
    if (!isFetching) return;

    const fetchMoreData = async () => {
      if (hasNextPage) {
        await fetchMore();
      }
      setIsFetching(false);
    };

    fetchMoreData();
  }, [isFetching, fetchMore, hasNextPage]);

  const resetScroll = useCallback(() => {
    setIsFetching(false);
  }, []);

  return [isFetching, resetScroll];
};

export default useInfiniteScroll;
