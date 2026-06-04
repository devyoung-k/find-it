import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin } from 'lucide-react';
import { createCommunityPost } from '@/lib/api/community';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';
import { logger } from '@/lib/utils/logger';
import FilterChip from '@/shared/ui/FilterChip';

const CATEGORIES = ['습득', '분실', '후기', '질문'];

const CreatePost = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [category, setCategory] = useState('습득');
  const [titleValue, setTitleValue] = useState('');
  const [bodyValue, setBodyValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isReady = titleValue.trim() !== '' && bodyValue.trim() !== '';

  const handleSubmit = useCallback(async () => {
    if (!isReady || submitting) return;
    if (!user) {
      alert('로그인 후 이용해주세요.');
      navigate('/signin');
      return;
    }
    setSubmitting(true);
    try {
      await createCommunityPost({
        title: titleValue.trim(),
        content: bodyValue.trim(),
        tag: category,
        author_nickname: user.nickname || user.email?.split('@')[0] || '익명'
      });
      navigate('/postlist');
    } catch (error) {
      logger.error('게시글 등록 실패', error);
      alert('게시글 등록에 실패했습니다. 다시 시도해 주세요.');
      setSubmitting(false);
    }
  }, [isReady, submitting, user, titleValue, bodyValue, category, navigate]);

  useHeaderConfig(
    () => ({
      isShowPrev: true,
      children: '글쓰기',
      isShowSubmit: isReady && !submitting,
      onSubmitClick: handleSubmit,
      submitLabel: '완료'
    }),
    [isReady, submitting, handleSubmit]
  );

  const notReady = () => alert('준비 중인 기능입니다.');

  return (
    <div className="min-h-nav-safe bg-white">
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
          className="mt-4 min-h-[280px] w-full resize-none text-[15px] leading-7 text-gray-700 outline-none placeholder:text-gray-350 md:min-h-[360px]"
        />

        {/* 데스크탑 제출 */}
        <div className="hidden justify-end md:flex">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isReady || submitting}
            className={`rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-colors ${
              isReady && !submitting
                ? 'bg-primary hover:bg-primary/90'
                : 'bg-gray-300'
            }`}
          >
            게시하기
          </button>
        </div>
      </div>

      {/* 하단 툴바 (모바일 고정) */}
      <div className="fixed right-0 bottom-16 left-0 z-40 border-t border-gray-100 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-5 text-sm text-gray-600">
          <button
            type="button"
            onClick={notReady}
            className="flex items-center gap-1.5"
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
