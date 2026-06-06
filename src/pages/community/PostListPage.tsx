import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getTimeDiff } from '@/lib/utils/getTimeDiff';
import {
  fetchRecentCommunityPosts,
  CommunityPost
} from '@/lib/api/community';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';
import { useAuthStore } from '@/features/auth/model/authStore';
import FilterChip from '@/shared/ui/FilterChip';
import PostTagBadge, { primaryTagOf } from '@/shared/ui/PostTagBadge';

const TAG_FILTERS = ['전체', '습득', '분실', '후기', '질문'];

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
    <h3 className="mt-1.5 truncate text-[16px] font-bold text-gray-900">
      {post.title}
    </h3>
    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-500">
      {post.content}
    </p>
  </Link>
);

const PostList = () => {
  const isLoggedIn = useAuthStore((s) => !!s.user);
  const [selected, setSelected] = useState('전체');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['communityPosts'],
    queryFn: () => fetchRecentCommunityPosts(100),
    staleTime: 1000 * 60
  });

  const filtered = useMemo(() => {
    if (selected === '전체') return posts;
    return posts.filter((p) => primaryTagOf(p.tag) === selected);
  }, [posts, selected]);

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

        {/* 목록 */}
        <div className="mt-2">
          {isLoading ? (
            <p className="py-16 text-center text-sm text-gray-400">
              게시물을 불러오는 중입니다...
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-400">
              아직 게시물이 없습니다.
            </p>
          ) : (
            filtered.map((post) => <PostRow key={post.id} post={post} />)
          )}
        </div>
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
