import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { getTimeDiff } from '@/lib/utils/getTimeDiff';
import { searchCommunityPosts, CommunityPost } from '@/lib/api/community';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';
import { logger } from '@/lib/utils/logger';
import PostTagBadge from '@/shared/ui/PostTagBadge';

const SearchPost = () => {
  const [inputValue, setInputValue] = useState('');
  const [data, setData] = useState<CommunityPost[]>([]);
  const [showNoResult, setShowNoResult] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submitInput = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (inputValue.trim() !== '') {
        const sanitized = inputValue.trim().replace(/"/g, '\\"');
        const result = await searchCommunityPosts(sanitized);
        setData(result);
        setShowNoResult(result.length === 0);
      } else {
        setData([]);
        setShowNoResult(false);
      }
    } catch (error) {
      logger.error('게시물 검색 통신 에러', error);
    }
  };

  useHeaderConfig(
    () => ({ isShowPrev: true, children: '게시물 검색', empty: true }),
    []
  );

  return (
    <div className="min-h-nav-safe bg-white">
      <div className="mx-auto w-full max-w-[800px] px-4 pt-4 pb-24 md:px-6 md:pt-6">
        <form onSubmit={submitInput}>
          <div className="flex items-center gap-2.5 rounded-full bg-gray-100 px-4 py-3">
            <Search size={20} className="shrink-0 text-gray-400" />
            <input
              ref={inputRef}
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="게시물 검색"
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
            />
          </div>
        </form>

        <div className="mt-2">
          {data.length > 0 ? (
            data.map((post) => (
              <Link
                key={post.id}
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
            ))
          ) : showNoResult ? (
            <p className="py-16 text-center text-sm text-gray-400">
              검색 결과가 없습니다.
            </p>
          ) : (
            <p className="py-16 text-center text-sm text-gray-400">
              검색어를 입력해 주세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPost;
