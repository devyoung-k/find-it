import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getTimeDiff } from '@/lib/utils/getTimeDiff';
import { fetchCommunityPage, CommunityPost } from '@/lib/api/community';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';
import { useAuthStore } from '@/features/auth/model/authStore';
import FilterChip from '@/shared/ui/FilterChip';
import PostTagBadge from '@/shared/ui/PostTagBadge';

const TAG_FILTERS = ['전체', '습득', '분실', '후기', '질문'];
const PAGE_SIZES = [20, 50];

const PostRow = ({ post }: { post: CommunityPost }) => (
  <Link
    to={`/postdetail/${post.id}`}
    className="block border-b border-gray-100 py-4 active:bg-gray-50"
  >
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <PostTagBadge tag={post.tag} />
      <span className="font-medium text-gray-600">
        {post.author_nickname || '익명'}
      </span>
      <span>· {getTimeDiff({ createdAt: post.created_at })}</span>
    </div>
    <div className="mt-1.5 flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[16px] font-bold text-gray-900">
          {post.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-500">
          {post.content}
        </p>
      </div>
      {post.image_urls.length > 0 && (
        <img
          src={post.image_urls[0]}
          alt=""
          loading="lazy"
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
      )}
    </div>
  </Link>
);

const PostList = () => {
  const isLoggedIn = useAuthStore((s) => !!s.user);
  const [selected, setSelected] = useState('전체');
  const [size, setSize] = useState(20);
  const [page, setPage] = useState(0);

  // 태그/페이지크기 변경 시 첫 페이지로
  useEffect(() => {
    setPage(0);
  }, [selected, size]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['communityPage', page, size, selected],
    queryFn: () => fetchCommunityPage(page, size, selected),
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData
  });

  const posts = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  useHeaderConfig(
    () => ({
      children: '자유게시판',
      isShowSearch: true,
      link: '/searchpost'
    }),
    []
  );

  return (
    <div className="min-h-nav-safe bg-white">
      <div className="mx-auto w-full max-w-[800px] px-4 pb-24 md:px-6">
        {/* 데스크탑 헤더 */}
        <div className="hidden items-center justify-between pt-8 md:flex">
          <h1 className="text-2xl font-extrabold text-gray-900">자유게시판</h1>
          {isLoggedIn && (
            <Link
              to="/createpost"
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <Pencil size={16} />
              글쓰기
            </Link>
          )}
        </div>

        {/* 필터 칩 */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pt-4 pb-1 md:mx-0 md:px-0 md:pt-5">
          {TAG_FILTERS.map((tag) => (
            <FilterChip
              key={tag}
              size="sm"
              active={selected === tag}
              onClick={() => setSelected(tag)}
            >
              {tag}
            </FilterChip>
          ))}
        </div>

        {/* 개수/페이지크기 선택 */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            총 {totalElements}건
          </span>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-gray-400">페이지당</span>
            {PAGE_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`rounded-md px-2 py-1 font-medium transition-colors ${
                  size === s
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {s}개
              </button>
            ))}
          </div>
        </div>

        {/* 목록 */}
        <div className="mt-1">
          {isLoading ? (
            <p className="py-16 text-center text-sm text-gray-400">
              게시물을 불러오는 중입니다...
            </p>
          ) : posts.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-400">
              아직 게시물이 없습니다.
            </p>
          ) : (
            posts.map((post) => <PostRow key={post.id} post={post} />)
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0 || isFetching}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 disabled:opacity-30"
              aria-label="이전 페이지"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-gray-600">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isFetching}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 disabled:opacity-30"
              aria-label="다음 페이지"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* 모바일 플로팅 글쓰기 */}
      {isLoggedIn && (
        <Link
          to="/createpost"
          aria-label="글쓰기"
          className="fixed right-4 bottom-20 z-30 flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105 md:hidden"
        >
          <Pencil size={18} />
          글쓰기
        </Link>
      )}
    </div>
  );
};

export default PostList;
