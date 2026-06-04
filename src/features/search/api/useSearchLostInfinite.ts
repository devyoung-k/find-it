import {
  useInfiniteQuery,
  UseInfiniteQueryOptions
} from '@tanstack/react-query';
import { AllData } from '@/types/types';
import { searchLostItems } from '@/features/search/api/searchItems';

type SearchLostQueryOptions = Omit<
  UseInfiniteQueryOptions<AllData[], Error>,
  'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'select'
>;

interface UseSearchLostInfiniteOptions {
  enabled?: boolean;
  pageSize?: number;
  query?: SearchLostQueryOptions;
}

export const useSearchLostInfinite = (
  keyword: string,
  options?: UseSearchLostInfiniteOptions
) => {
  const pageSize = options?.pageSize ?? 12;

  return useInfiniteQuery<AllData[], Error>({
    queryKey: ['searchLostResult', keyword, pageSize],
    initialPageParam: 0,
    enabled: options?.enabled,
    queryFn: async ({ pageParam }) =>
      searchLostItems(keyword, typeof pageParam === 'number' ? pageParam : 0, pageSize),
    getNextPageParam: (lastPage, allPages) => {
      if (!Array.isArray(lastPage) || lastPage.length < pageSize) {
        return undefined;
      }
      return allPages.length;
    },
    ...options?.query
  });
};
