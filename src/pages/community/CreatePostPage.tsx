import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, ImagePlus, MapPin, X } from 'lucide-react';
import {
  createCommunityPost,
  fetchCommunityPostById,
  updateCommunityPost,
  uploadCommunityImage
} from '@/lib/api/community';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';
import { logger } from '@/lib/utils/logger';
import FilterChip from '@/shared/ui/FilterChip';

const CATEGORIES = ['습득', '분실', '후기', '질문'];
const MAX_IMAGES = 5;

const CreatePost = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 있으면 수정 모드
  const isEdit = Boolean(id);
  const user = useAuthStore((s) => s.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState('습득');
  const [titleValue, setTitleValue] = useState('');
  const [bodyValue, setBodyValue] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  // 수정 모드: 기존 글 로드 + 본인 글인지 확인
  useEffect(() => {
    if (!isEdit || !id) return;
    let canceled = false;
    (async () => {
      try {
        const post = await fetchCommunityPostById(id);
        if (canceled) return;
        if (!post) {
          alert('게시글을 찾을 수 없습니다.');
          navigate('/postlist', { replace: true });
          return;
        }
        if (user && post.author_id && post.author_id !== user.id) {
          alert('본인이 작성한 글만 수정할 수 있습니다.');
          navigate(`/postdetail/${id}`, { replace: true });
          return;
        }
        setTitleValue(post.title);
        setBodyValue(post.content);
        setCategory(post.tag ?? '습득');
        setImageUrls(post.image_urls ?? []);
      } catch (error) {
        logger.error('게시글 로드 실패', error);
        alert('게시글을 불러오지 못했습니다.');
        navigate('/postlist', { replace: true });
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [isEdit, id, user, navigate]);

  const pickImages = () => fileInputRef.current?.click();

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // 같은 파일 다시 선택 가능하도록 초기화
    if (files.length === 0) return;
    const room = MAX_IMAGES - imageUrls.length;
    if (room <= 0) {
      alert(`이미지는 최대 ${MAX_IMAGES}장까지 첨부할 수 있어요.`);
      return;
    }
    setUploading(true);
    try {
      const picked = files.slice(0, room);
      const urls = await Promise.all(picked.map((f) => uploadCommunityImage(f)));
      setImageUrls((prev) => [...prev, ...urls]);
    } catch (error) {
      logger.error('이미지 업로드 실패', error);
      alert('이미지 업로드에 실패했습니다. (이미지 파일 5MB 이하)');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const isReady = titleValue.trim() !== '' && bodyValue.trim() !== '';

  const handleSubmit = useCallback(async () => {
    if (!isReady || submitting || uploading) return;
    if (!user) {
      alert('로그인 후 이용해주세요.');
      navigate('/signin');
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateCommunityPost(id, {
          title: titleValue.trim(),
          content: bodyValue.trim(),
          tag: category,
          image_urls: imageUrls
        });
        navigate(`/postdetail/${id}`);
      } else {
        await createCommunityPost({
          title: titleValue.trim(),
          content: bodyValue.trim(),
          tag: category,
          author_nickname: user.nickname || user.email?.split('@')[0] || '익명',
          image_urls: imageUrls
        });
        navigate('/postlist');
      }
    } catch (error) {
      logger.error(isEdit ? '게시글 수정 실패' : '게시글 등록 실패', error);
      alert(
        isEdit
          ? '게시글 수정에 실패했습니다. 다시 시도해 주세요.'
          : '게시글 등록에 실패했습니다. 다시 시도해 주세요.'
      );
      setSubmitting(false);
    }
  }, [
    isReady,
    submitting,
    uploading,
    user,
    isEdit,
    id,
    titleValue,
    bodyValue,
    category,
    imageUrls,
    navigate
  ]);

  useHeaderConfig(
    () => ({
      isShowPrev: true,
      children: isEdit ? '글 수정' : '글쓰기',
      isShowSubmit: isReady && !submitting && !uploading,
      onSubmitClick: handleSubmit,
      submitLabel: '완료'
    }),
    [isEdit, isReady, submitting, uploading, handleSubmit]
  );

  const notReady = () => alert('준비 중인 기능입니다.');

  if (loading) return null;

  return (
    <div className="min-h-nav-safe bg-white">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleFiles}
      />
      <div className="mx-auto w-full max-w-[800px] px-4 pb-28 md:px-6 md:pb-12">
        {/* 카테고리 칩 */}
        <div className="flex gap-2 pt-4 md:pt-6">
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              size="sm"
              active={category === cat}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </FilterChip>
          ))}
        </div>

        {/* 제목 */}
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          className="mt-5 w-full border-b border-gray-100 pb-3 text-xl font-bold text-gray-900 outline-none placeholder:text-gray-350"
        />

        {/* 내용 */}
        <textarea
          placeholder="내용을 입력하세요. 분실/습득 장소와 특징을 적으면 찾을 확률이 높아져요."
          value={bodyValue}
          onChange={(e) => setBodyValue(e.target.value)}
          className="mt-4 min-h-[220px] w-full resize-none text-[15px] leading-7 text-gray-700 outline-none placeholder:text-gray-350 md:min-h-[300px]"
        />

        {/* 이미지 첨부 */}
        <div className="mt-2 flex flex-wrap gap-2">
          {imageUrls.map((url) => (
            <div key={url} className="relative h-20 w-20">
              <img
                src={url}
                alt="첨부 이미지"
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                aria-label="이미지 삭제"
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900/70 text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {imageUrls.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={pickImages}
              disabled={uploading}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-primary hover:text-primary disabled:opacity-50"
            >
              <ImagePlus size={20} />
              <span className="text-[11px]">
                {uploading ? '업로드중' : `${imageUrls.length}/${MAX_IMAGES}`}
              </span>
            </button>
          )}
        </div>

        {/* 데스크탑 제출 */}
        <div className="mt-4 hidden justify-end md:flex">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isReady || submitting || uploading}
            className={`rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-colors ${
              isReady && !submitting && !uploading
                ? 'bg-primary hover:bg-primary/90'
                : 'bg-gray-300'
            }`}
          >
            {isEdit ? '수정 완료' : '게시하기'}
          </button>
        </div>
      </div>

      {/* 하단 툴바 (모바일 고정) */}
      <div className="fixed right-0 bottom-16 left-0 z-40 border-t border-gray-100 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-5 text-sm text-gray-600">
          <button
            type="button"
            onClick={pickImages}
            disabled={uploading}
            className="flex items-center gap-1.5 disabled:opacity-50"
          >
            <Camera size={18} /> 사진
          </button>
          <button
            type="button"
            onClick={notReady}
            className="flex items-center gap-1.5"
          >
            <MapPin size={18} /> 위치
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
