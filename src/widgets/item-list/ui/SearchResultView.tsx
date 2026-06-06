import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemBox from '@/entities/item/ui/ItemBox';
import Skeleton from '@/entities/item/ui/Skeleton';
import QueryState from '@/shared/ui/QueryState';
import EmptyState from '@/shared/ui/EmptyState';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { useProgressIndicator } from '@/shared/hooks/useProgressIndicator';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';
import type { AllData } from '@/types/types';

interface SearchResultViewProps {
  itemType: 'get' | 'lost';
  keyword: string;
  fallbackPath: string;
  query: {
    data?: { pages: AllData[][] };
    fetchNextPage: () => void;
    hasNextPage?: boolean;
    isFetchingNextPage: boolean;
    isLoading: boolean;
    isError: boolean;
    refetch?: () => void;
  };
}

const SearchResultView = ({
  itemType,
  keyword,
  fallbackPath,
  query
}: SearchResultViewProps) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = query;

  const items = data?.pages?.flatMap((page) => page) ?? [];
  useProgressIndicator(isFetchingNextPage);
  useInfiniteScroll(
    scrollRef,
    { hasNextPage, isFetchingNextPage, fetchNextPage },
    [items.length]
  );

  const enabled = keyword.trim() !== '';
  useEffect(() => {
    if (!enabled) navigate(fallbackPath);
  }, [enabled, fallbackPath, navigate]);

  useHeaderConfig(
    () => ({ isShowPrev: true, empty: true, children: '검색결과' }),
    []
  );

  const loadingFallback = (
    <div className="mx-auto w-full max-w-[1280px] px-4 pt-6 md:px-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  );

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      loadingFallback={loadingFallback}
    >
      <div ref={scrollRef} className="h-nav-safe overflow-auto bg-white">
        <div className="mx-auto w-full max-w-[1280px] px-4 pb-10 md:px-6">
          <div className="pt-4 md:pt-8">
            <h1 className="text-xl font-extrabold text-gray-900">검색 결과</h1>
            <p className="mt-1 text-sm text-gray-450">
              {keyword && (
                <span className="font-semibold text-primary">‘{keyword}’ </span>
              )}
              총 {items.length}건
            </p>
          </div>

          {items.length > 0 ? (
            <ul className="mt-2 grid grid-cols-1 gap-0 md:mt-6 lg:grid-cols-4 lg:gap-4">
              {items.map((item, index) => (
                <li key={`${item.atcId}-${index}`}>
                  <ItemBox item={item} itemType={itemType} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="검색 결과가 없습니다."
              description="조건을 조정해 다시 시도해 주세요."
            />
          )}
          {isFetchingNextPage && <div className="py-8" />}
        </div>
      </div>
    </QueryState>
  );
};

export default SearchResultView;
