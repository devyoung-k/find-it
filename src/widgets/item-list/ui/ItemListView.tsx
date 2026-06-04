import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import ItemBox from '@/entities/item/ui/ItemBox';
import Skeleton from '@/entities/item/ui/Skeleton';
import QueryState from '@/shared/ui/QueryState';
import EmptyState from '@/shared/ui/EmptyState';
import FilterChip from '@/shared/ui/FilterChip';
import { formatCategoryLabel } from '@/shared/config/categoryMeta';
import useScrollRestoration from '@/shared/hooks/useScrollRestoration';
import { useProgressIndicator } from '@/shared/hooks/useProgressIndicator';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import type { AllData } from '@/types/types';

interface ItemListViewProps {
  itemType: 'get' | 'lost';
  title: string;
  searchLink: string;
  searchPlaceholder: string;
  scrollKey: string;
  emptyTitle: string;
  emptyDescription: string;
  initialCategory?: string | null;
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

const ALL = '전체';

const ItemListView = ({
  itemType,
  title,
  searchLink,
  searchPlaceholder,
  scrollKey,
  emptyTitle,
  emptyDescription,
  initialCategory,
  query
}: ItemListViewProps) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = query;
  const [selected, setSelected] = useState<string>(initialCategory || ALL);

  const items = useMemo(
    () => data?.pages?.flatMap((page) => page) ?? [],
    [data]
  );

  useScrollRestoration(scrollContainerRef, scrollKey);
  useProgressIndicator(isFetchingNextPage);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      const label = formatCategoryLabel(item.prdtClNm);
      if (label) set.add(label);
    });
    return [ALL, ...Array.from(set)];
  }, [items]);

  // URL의 ?category 변경에 칩 선택 상태를 동기화
  useEffect(() => {
    setSelected(initialCategory || ALL);
  }, [initialCategory]);

  const filtered = useMemo(() => {
    if (selected === ALL) return items;
    return items.filter((item) => {
      const label = formatCategoryLabel(item.prdtClNm);
      return label === selected || (item.prdtClNm ?? '').includes(selected);
    });
  }, [items, selected]);

  // 무한 스크롤 (필터 결과가 적을 때도 자동 로드되도록 selected/filtered도 트리거)
  useInfiniteScroll(
    scrollContainerRef,
    { hasNextPage, isFetchingNextPage, fetchNextPage },
    [items.length, filtered.length, selected]
  );

  const headerBlock = (
    <div className="bg-white pt-4 md:pt-8">
      {/* 데스크탑 제목 + 검색 */}
      <div className="hidden items-center justify-between gap-4 md:flex">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-450">
            총 {items.length}건의 정보가 있어요
          </p>
        </div>
        <Link
          to={searchLink}
          className="flex w-[280px] items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-200"
        >
          <Search size={18} />
          {searchPlaceholder}
        </Link>
      </div>

      {/* 모바일 개수 */}
      <p className="text-sm text-gray-450 md:hidden">{items.length}건 등록</p>

      {/* 카테고리 칩 */}
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:mt-5 md:px-0">
        {categories.map((cat) => (
          <FilterChip
            key={cat}
            active={selected === cat}
            onClick={() => setSelected(cat)}
            size="sm"
          >
            {cat}
          </FilterChip>
        ))}
      </div>
    </div>
  );

  const loadingFallback = (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-6">
      <div className="pt-8">
        <div className="h-7 w-32 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    </div>
  );

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      loadingFallback={loadingFallback}
    >
      <div
        ref={scrollContainerRef}
        className="h-nav-safe overflow-auto bg-white"
      >
        <div className="mx-auto w-full max-w-[1280px] px-4 pb-10 md:px-6">
          {headerBlock}

          {filtered.length > 0 ? (
            <ul className="mt-2 grid grid-cols-1 gap-0 md:mt-6 lg:grid-cols-4 lg:gap-4">
              {filtered.map((item, index) => (
                <li key={`${item.atcId}-${index}`}>
                  <ItemBox item={item} itemType={itemType} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={emptyTitle} description={emptyDescription} />
          )}

          {isFetchingNextPage && <div className="py-8" />}
        </div>
      </div>

      {/* 모바일 필터 버튼 */}
      <Link
        to={searchLink}
        className="fixed right-4 bottom-20 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 md:hidden"
        aria-label="상세 검색"
      >
        <SlidersHorizontal size={20} />
      </Link>
    </QueryState>
  );
};

export default ItemListView;
