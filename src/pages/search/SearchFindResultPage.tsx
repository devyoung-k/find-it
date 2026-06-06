import useSearchStore from '@/features/search/model/searchStore';
import { useSearchFindInfinite } from '@/features/search/api/useSearchFindInfinite';
import SearchResultView from '@/widgets/item-list/ui/SearchResultView';

const SearchFindResult = () => {
  const { keyword } = useSearchStore();
  const query = useSearchFindInfinite(keyword, {
    enabled: keyword.trim() !== '',
    query: { retry: false, staleTime: 0, gcTime: 1000 * 60 * 5 }
  });

  return (
    <SearchResultView
      itemType="get"
      keyword={keyword}
      fallbackPath="/searchfind"
      query={query}
    />
  );
};

export default SearchFindResult;
