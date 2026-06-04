import { RefObject, useCallback, useEffect } from 'react';

interface Options {
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

/**
 * 스크롤 컨테이너 기반 무한 스크롤.
 * - 컨테이너 끝 근처에 도달하면 다음 페이지 로드
 * - 콘텐츠가 화면보다 짧으면(필터 결과가 적을 때 포함) 자동으로 더 로드
 * @param deps 자동 로드 재평가를 트리거할 의존성(예: items.length, 필터 상태)
 */
export const useInfiniteScroll = (
  ref: RefObject<HTMLElement>,
  { hasNextPage, isFetchingNextPage, fetchNextPage }: Options,
  deps: unknown[] = []
) => {
  // 콘텐츠가 짧으면 자동 로드
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const t = setTimeout(() => {
      if (el.scrollHeight <= el.clientHeight + 100) fetchNextPage();
    }, 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, hasNextPage, isFetchingNextPage, fetchNextPage, ...deps]);

  // 스크롤 끝 감지
  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - 50) fetchNextPage();
  }, [ref, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [ref, onScroll]);
};
