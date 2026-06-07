import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Heart, Pencil, Send, Trash2, User as UserIcon } from 'lucide-react';
import { getTimeDiff } from '@/lib/utils/getTimeDiff';
import {
  CommunityComment,
  CommunityPost,
  createComment,
  deleteComment,
  deleteCommunityPost,
  fetchComments,
  fetchCommunityPostById
} from '@/lib/api/community';
import { fetchProfileById } from '@/lib/api/profile';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useAuthGuard } from '@/features/auth/model/useAuthGuard';
import { logger } from '@/lib/utils/logger';
import { useProgressIndicator } from '@/shared/hooks/useProgressIndicator';
import PostTagBadge from '@/shared/ui/PostTagBadge';

const PostDetailBody: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const ensureAuth = useAuthGuard();

  const [thisData, setThisData] = useState<CommunityPost | null>(null);
  const [authorAvatar, setAuthorAvatar] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  useProgressIndicator(isLoading);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        if (!id) return;
        const [record, commentList] = await Promise.all([
          fetchCommunityPostById(id),
          fetchComments(id).catch(() => [])
        ]);
        if (canceled) return;
        setThisData(record);
        setComments(commentList);
        if (record?.author_id) {
          const profileData = await fetchProfileById(record.author_id);
          if (!canceled) setAuthorAvatar(profileData?.avatar_url ?? '');
        }
      } catch (error) {
        logger.error('자유게시판 글을 불러오지 못했습니다.', error);
      } finally {
        if (!canceled) setIsLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [id]);

  const toggleLike = () => {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  const handleAddComment = async () => {
    const text = commentInput.trim();
    if (!text || commentSubmitting || !id) return;
    if (!ensureAuth()) return; // 게스트면 로그인 페이지로
    setCommentSubmitting(true);
    try {
      const nickname = user?.nickname || user?.email?.split('@')[0] || '익명';
      const created = await createComment(id, text, nickname);
      setComments((prev) => [...prev, created]);
      setCommentInput('');
    } catch (error) {
      logger.error('댓글 등록 실패', error);
      alert('댓글 등록에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('댓글을 삭제할까요?')) return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      logger.error('댓글 삭제 실패', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const handleEditPost = () => {
    if (id) navigate(`/createpost/${id}`);
  };

  const handleDeletePost = async () => {
    if (!id || deletingPost) return;
    if (!window.confirm('이 게시글을 삭제할까요? 되돌릴 수 없습니다.')) return;
    setDeletingPost(true);
    try {
      await deleteCommunityPost(id);
      navigate('/postlist', { replace: true });
    } catch (error) {
      logger.error('게시글 삭제 실패', error);
      alert('게시글 삭제에 실패했습니다.');
      setDeletingPost(false);
    }
  };

  if (isLoading) return null;
  if (!thisData)
    return (
      <p className="py-20 text-center text-sm text-gray-400">
        게시글이 존재하지 않습니다.
      </p>
    );

  const { title, content, tag, author_id, author_nickname, created_at, image_urls } =
    thisData;
  const isPostOwner = Boolean(user?.id && author_id && user.id === author_id);

  return (
    <div className="mx-auto w-full max-w-[800px] px-4 pb-32 md:px-6 md:pb-12">
      {/* 본문 */}
      <div className="pt-5">
        <div className="flex items-start justify-between gap-2">
          <PostTagBadge tag={tag} />
          {isPostOwner && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleEditPost}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
              >
                <Pencil size={14} /> 수정
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={deletingPost}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-secondary hover:bg-[#FFEDE9] disabled:opacity-40"
              >
                <Trash2 size={14} /> 삭제
              </button>
            </div>
          )}
        </div>
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

      {/* 첨부 이미지 */}
      {image_urls.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {image_urls.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-xl border border-gray-100"
            >
              <img
                src={url}
                alt="첨부 이미지"
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform hover:scale-[1.03]"
              />
            </a>
          ))}
        </div>
      )}

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
          comments.map((c) => {
            const isMine = Boolean(user?.id && c.author_id && user.id === c.author_id);
            return (
              <li key={c.id} className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <UserIcon size={16} className="text-gray-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                    {c.author_nickname || '익명'}
                    <span className="text-xs font-normal text-gray-400">
                      {getTimeDiff({ createdAt: c.created_at })}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm whitespace-pre-wrap text-gray-600">
                    {c.content}
                  </p>
                </div>
                {isMine && (
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(c.id)}
                    aria-label="댓글 삭제"
                    className="shrink-0 rounded p-1 text-gray-300 hover:text-secondary"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </li>
            );
          })
        )}
      </ul>

      {/* 댓글 입력 바 */}
      <div className="fixed right-0 bottom-16 left-0 z-40 border-t border-gray-100 bg-white px-4 py-3 md:static md:mt-6 md:border-0 md:px-0 md:py-0">
        <div className="mx-auto flex max-w-[800px] items-center gap-2">
          <input
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddComment();
            }}
            placeholder="댓글을 입력하세요"
            className="min-w-0 flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:bg-gray-50"
          />
          <button
            type="button"
            onClick={handleAddComment}
            aria-label="댓글 등록"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
            disabled={!commentInput.trim() || commentSubmitting}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetailBody;
