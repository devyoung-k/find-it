import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTimeDiff } from '@/lib/utils/getTimeDiff';
import { fetchMyComments, fetchMyPosts } from '@/lib/api/community';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';
import PostTagBadge from '@/shared/ui/PostTagBadge';

type Tab = 'posts' | 'comments';

const MyActivity = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const [tab, setTab] = useState<Tab>('posts');

  useHeaderConfig(
    () => ({ isShowPrev: true, children: '내 활동', empty: true }),
    []
  );

  const postsQuery = useQuery({
    queryKey: ['myPosts', userId],
    queryFn: () => fetchMyPosts(0, 50),
    enabled: !!userId,
    staleTime: 1000 * 30
  });

  const commentsQuery = useQuery({
    queryKey: ['myComments', userId],
    queryFn: () => fetchMyComments(),
    enabled: !!userId,
    staleTime: 1000 * 30
  });

  const posts = postsQuery.data?.items ?? [];
  const comments = commentsQuery.data ?? [];

  const TabBtn = ({ value, label, count }: { value: Tab; label: string; count: number }) => (
    <button
      type="button"
      onClick={() => setTab(value)}
      className={`flex-1 border-b-2 pb-3 text-[15px] font-semibold transition-colors ${
        tab === value
          ? 'border-primary text-primary'
          : 'border-transparent text-gray-400'
      }`}
    >
      {label} {count > 0 && <span>{count}</span>}
    </button>
  );

  return (
    <div className="min-h-nav-safe bg-white">
      <div className="mx-auto w-full max-w-[800px] px-4 pb-24 md:px-6 md:pt-4">
        {/* 탭 */}
        <div className="flex border-b border-gray-100 pt-3">
          <TabBtn value="posts" label="내 글" count={postsQuery.data?.totalElements ?? 0} />
          <TabBtn value="comments" label="내 댓글" count={comments.length} />
        </div>

        {/* 내 글 */}
        {tab === 'posts' && (
          <div>
            {postsQuery.isLoading ? (
              <p className="py-16 text-center text-sm text-gray-400">불러오는 중...</p>
            ) : posts.length === 0 ? (
              <p className="py-16 text-center text-sm text-gray-400">
                아직 작성한 글이 없어요.
              </p>
            ) : (
              posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/postdetail/${post.id}`}
                  className="block border-b border-gray-100 py-4 active:bg-gray-50"
                >
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <PostTagBadge tag={post.tag} />
                    <span>· {getTimeDiff({ createdAt: post.created_at })}</span>
                  </div>
                  <h3 className="mt-1.5 truncate text-[16px] font-bold text-gray-900">
                    {post.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-500">
                    {post.content}
                  </p>
                </Link>
              ))
            )}
          </div>
        )}

        {/* 내 댓글 */}
        {tab === 'comments' && (
          <div>
            {commentsQuery.isLoading ? (
              <p className="py-16 text-center text-sm text-gray-400">불러오는 중...</p>
            ) : comments.length === 0 ? (
              <p className="py-16 text-center text-sm text-gray-400">
                아직 작성한 댓글이 없어요.
              </p>
            ) : (
              comments.map((c) => (
                <Link
                  key={c.id}
                  to={`/postdetail/${c.post_id}`}
                  className="block border-b border-gray-100 py-4 active:bg-gray-50"
                >
                  <p className="text-[15px] text-gray-800">{c.content}</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="truncate text-gray-500">원문: {c.post_title}</span>
                    <span>· {getTimeDiff({ createdAt: c.created_at })}</span>
                  </p>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyActivity;
