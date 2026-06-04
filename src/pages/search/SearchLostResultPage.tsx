import useSearchStore from '@/features/search/model/searchStore';
import { useSearchLostInfinite } from '@/features/search/api/useSearchLostInfinite';
import SearchResultView from '@/widgets/item-list/ui/SearchResultView';

const SearchLostResult = () => {
  const { keyword } = useSearchStore();
  const query = useSearchLostInfinite(keyword, {
    enabled: keyword.trim() !== '',
    query: { retry: false, staleTime: 0, gcTime: 1000 * 60 * 5 }
  });

  return (
    <SearchResultView
      itemType="lost"
      keyword={keyword}
      fallbackPath="/searchlost"
      query={query}
    />
  );
};

export default SearchLostResult;
