import { RefObject, useCallback, useEffect } from 'react';

interface Options {
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

const THRESHOLD_PX = 80;

/**
 * 스크롤 컨테이너 기반 무한 스크롤.
 * - 컨테이너 끝 근처에 도달하면 다음 페이지 로드
 * - 콘텐츠가 화면보다 짧으면(필터 결과가 적을 때 포함) 자동으로 더 로드
 * - **페치 완료/아이템 변경 시 바닥 위치를 재평가**한다. (바닥에 멈춰 있는 동안
 *   직전 페치가 끝나도 새 scroll 이벤트가 안 생겨 다음 페이지가 안 불러와지던
 *   문제 — "끝까지 내렸는데 안 되고 다시 올렸다 내려야 되는" 증상 — 을 해소)
 *
 * @param deps 자동 로드 재평가를 트리거할 의존성(예: items.length, 필터 상태)
 */
export const useInfiniteScroll = (
  ref: RefObject<HTMLElement>,
  { hasNextPage, isFetchingNextPage, fetchNextPage }: Options,
  deps: unknown[] = []
) => {
  // 바닥 근처거나 콘텐츠가 뷰포트보다 짧으면 다음 페이지 로드.
  const maybeLoadMore = useCallback(() => {
    const el = ref.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const shorterThanViewport = scrollHeight <= clientHeight + THRESHOLD_PX;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - THRESHOLD_PX;
    if (shorterThanViewport || nearBottom) {
      fetchNextPage();
    }
  }, [ref, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 스크롤 이벤트로 감지
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', maybeLoadMore, { passive: true });
    return () => el.removeEventListener('scroll', maybeLoadMore);
  }, [ref, maybeLoadMore]);

  // 페치 완료(isFetchingNextPage 변화)·아이템/필터 변경 시 재평가.
  // 사용자가 바닥에 멈춰 있어 새 scroll 이벤트가 없어도 다음 페이지를 이어 로드한다.
  // setTimeout: 새로 추가된 콘텐츠가 DOM 에 반영된 뒤 높이를 측정하기 위함.
  useEffect(() => {
    const t = setTimeout(maybeLoadMore, 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maybeLoadMore, ...deps]);
};
