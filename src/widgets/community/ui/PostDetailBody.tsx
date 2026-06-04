import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Heart, Send, User as UserIcon } from 'lucide-react';
import { getTimeDiff } from '@/lib/utils/getTimeDiff';
import { CommunityPost, fetchCommunityPostById } from '@/lib/api/community';
import { fetchProfileById } from '@/lib/api/profile';
import { logger } from '@/lib/utils/logger';
import { useProgressIndicator } from '@/shared/hooks/useProgressIndicator';
import PostTagBadge from '@/shared/ui/PostTagBadge';

// 참고: 공감/댓글은 아직 백엔드 스키마가 없어 세션 동안만 유지되는 클라이언트 상태입니다.
interface LocalComment {
  id: number;
  text: string;
  createdAt: string;
}

const PostDetailBody: React.FC = () => {
  const { id } = useParams();
  const [thisData, setThisData] = useState<CommunityPost | null>(null);
  const [authorAvatar, setAuthorAvatar] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const commentSeq = useRef(0);
  useProgressIndicator(isLoading);

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const record = await fetchCommunityPostById(id);
        if (record) {
          setThisData(record);
          if (record.author_id) {
            const profileData = await fetchProfileById(record.author_id);
            setAuthorAvatar(profileData?.avatar_url ?? '');
          }
        } else {
          setThisData(null);
        }
      } catch (error) {
        logger.error('자유게시판 글을 불러오지 못했습니다.', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const toggleLike = () => {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  const addComment = () => {
    const text = commentInput.trim();
    if (!text) return;
    commentSeq.current += 1;
    setComments((prev) => [
      ...prev,
      { id: commentSeq.current, text, createdAt: new Date().toISOString() }
    ]);
    setCommentInput('');
  };

  if (isLoading) return null;
  if (!thisData)
    return (
      <p className="py-20 text-center text-sm text-gray-400">
        게시글이 존재하지 않습니다.
      </p>
    );

  const { title, content, tag, author_nickname, created_at } = thisData;

  return (
    <div className="mx-auto w-full max-w-[800px] px-4 pb-32 md:px-6 md:pb-12">
      {/* 본문 */}
      <div className="pt-5">
        <PostTagBadge tag={tag} />
        <h1 className="mt-3 text-[22px] leading-snug font-extrabold text-gray-900">
          {title}
        </h1>
        <div className="mt-4 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#EAF1FF]">
            {authorAvatar ? (
              <img src={authorAvatar} alt="작성자" className="h-full w-full object-cover" />
            ) : (
              <UserIcon size={18} className="text-primary" />
            )}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {author_nickname || '익명'}
            </p>
            <p className="text-xs text-gray-400">
              {getTimeDiff({ createdAt: created_at })}
            </p>
          </div>
        </div>
      </div>

      <hr className="my-5 border-gray-100" />

      <p className="text-[15px] leading-7 whitespace-pre-wrap text-gray-700">
        {content}
      </p>

      {/* 공감 */}
      <div className="mt-7 flex justify-center">
        <button
          type="button"
          onClick={toggleLike}
          className={`flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold transition-colors ${
            liked
              ? 'border-secondary bg-[#FFEDE9] text-secondary'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          공감 {likeCount}
        </button>
      </div>

      <hr className="my-6 border-gray-100" />

      {/* 댓글 */}
      <h2 className="text-base font-bold text-gray-900">댓글 {comments.length}</h2>
      <ul className="mt-3 space-y-4">
        {comments.length === 0 ? (
          <li className="py-6 text-center text-sm text-gray-400">
            첫 댓글을 남겨보세요.
          </li>
        ) : (
          comments.map((c) => (
            <li key={c.id} className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                <UserIcon size={16} className="text-gray-400" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  나{' '}
                  <span className="text-xs font-normal text-gray-400">
                    {getTimeDiff({ createdAt: c.createdAt })}
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-gray-600">{c.text}</p>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* 댓글 입력 바 */}
      <div className="fixed right-0 bottom-16 left-0 z-40 border-t border-gray-100 bg-white px-4 py-3 md:static md:mt-6 md:border-0 md:px-0 md:py-0">
        <div className="mx-auto flex max-w-[800px] items-center gap-2">
          <input
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addComment();
            }}
            placeholder="댓글을 입력하세요"
            className="min-w-0 flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:bg-gray-50"
          />
          <button
            type="button"
            onClick={addComment}
            aria-label="댓글 등록"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
            disabled={!commentInput.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetailBody;
