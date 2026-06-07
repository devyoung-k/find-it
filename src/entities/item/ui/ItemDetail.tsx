import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Share2, Bookmark, ChevronLeft } from 'lucide-react';
import KakaoMap from '@/shared/ui/KakaoMap';
import { DetailData } from '@/types/types';
import { logger } from '@/lib/utils/logger';
import formatDisplayDate from '@/lib/utils/formatDisplayDate';
import CategoryThumb from '@/shared/ui/item/CategoryThumb';
import TypeBadge from '@/shared/ui/item/TypeBadge';
import { useAuthGuard } from '@/features/auth/model/useAuthGuard';
import { useBookmarkStore } from '@/features/bookmark/model/bookmarkStore';
import {
  formatCategoryLabel,
  getCategoryMeta
} from '@/shared/config/categoryMeta';

interface ItemDetailProps {
  detail: DetailData;
  kind?: 'get' | 'lost';
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start gap-4 border-b border-gray-50 py-3">
    <span className="w-20 shrink-0 text-sm text-gray-450">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value || '-'}</span>
  </div>
);

const ItemDetail = ({ detail, kind = 'get' }: ItemDetailProps) => {
  const navigate = useNavigate();
  const ensureAuth = useAuthGuard();
  const bookmarked = useBookmarkStore((s) => s.ids.has(detail.id));
  const toggleBookmark = useBookmarkStore((s) => s.toggle);

  const handleBookmark = () => {
    if (!ensureAuth()) return; // 게스트면 로그인 페이지로
    void toggleBookmark({
      itemId: detail.id,
      itemType: kind,
      name: detail.item_name,
      place: detail.place,
      imageUrl: detail.image,
      category: detail.item_type,
      itemDate: detail.date
    });
  };

  const isGet = kind === 'get';
  const placeLabel = isGet ? '습득장소' : '분실장소';
  const dateLabel = isGet ? '습득일자' : '분실일자';
  const ctaLabel = isGet ? '내 물건이에요 · 문의하기' : '제가 습득했어요';
  const category = formatCategoryLabel(detail.item_type);
  const { fg } = getCategoryMeta(detail.item_type);

  const handleShare = async () => {
    const sharePayload = {
      title: '찾아줘! 분실물 안내',
      text: detail.item_name || detail.storage || '찾아줘! 분실물 안내',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(sharePayload);
        return;
      } catch (error) {
        logger.warn('Native share failed, fallback to clipboard', error);
      }
    }

    try {
      await navigator.clipboard.writeText(sharePayload.url);
      alert('링크를 클립보드에 복사했어요.');
    } catch (clipboardError) {
      logger.error('Clipboard write failed', clipboardError);
      alert('링크 복사에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const titleBlock = (
    <>
      <div className="flex items-center gap-1.5">
        <TypeBadge type={isGet ? 'get' : 'lost'} label={isGet ? '습득물' : '분실물'} />
        <span className="text-[13px] font-semibold" style={{ color: fg }}>
          {category}
        </span>
      </div>
      <h1 className="mt-2.5 text-[22px] leading-snug font-extrabold text-gray-900">
        {detail.item_name}
      </h1>
      <div className="mt-4">
        <InfoRow label={placeLabel} value={detail.place} />
        <InfoRow label={dateLabel} value={formatDisplayDate(detail.date)} />
        <InfoRow label="물품분류" value={detail.item_type} />
        <InfoRow label="관리번호" value={detail.id} />
      </div>
      {detail.description && (
        <div className="mt-6">
          <h2 className="text-base font-bold text-gray-900">상세 내용</h2>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-gray-600">
            {detail.description}
          </p>
        </div>
      )}
    </>
  );

  const storageBlock = isGet && (detail.storage || detail.contact) && (
    <div className="mt-6 md:mt-0">
      <h2 className="mb-2 text-base font-bold text-gray-900">보관 장소</h2>
      <div className="space-y-2.5 rounded-2xl border border-gray-100 bg-white p-4">
        {detail.storage && (
          <div className="flex items-center gap-2.5">
            <MapPin size={18} className="shrink-0 text-primary" />
            <span className="text-sm text-gray-800">{detail.storage}</span>
          </div>
        )}
        {detail.contact && (
          <div className="flex items-center gap-2.5">
            <Phone size={18} className="shrink-0 text-primary" />
            <a
              href={`tel:${detail.contact}`}
              className="text-sm text-gray-600 hover:text-primary"
            >
              {detail.contact}
            </a>
          </div>
        )}
      </div>
      {detail.storage && (
        <div className="mt-3 hidden overflow-hidden rounded-2xl border border-gray-100 md:block">
          <div className="aspect-[4/3] w-full bg-gray-100">
            <KakaoMap place={detail.storage} className="h-full w-full" />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-nav-safe bg-white pb-28 md:bg-gray-50 md:pb-12">
      <div className="mx-auto w-full max-w-[1080px] md:px-6 md:pt-6">
        {/* 데스크탑 브레드크럼 */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 hidden items-center gap-1 text-sm text-gray-450 hover:text-primary md:flex"
        >
          <ChevronLeft size={16} />
          {isGet ? '습득물 목록' : '분실물 목록'}
        </button>

        <div className="md:grid md:grid-cols-2 md:gap-10 md:rounded-2xl md:bg-white md:p-8 md:shadow-sm">
          {/* 좌측: 이미지 + 보관장소 */}
          <div>
            <CategoryThumb
              image={detail.image}
              prdtClNm={detail.item_type}
              className="aspect-[4/3] w-full md:rounded-2xl"
              iconSize={76}
              alt={detail.item_name}
            />
            <div className="hidden md:block">{storageBlock}</div>
          </div>

          {/* 우측: 정보 */}
          <div className="px-4 pt-5 md:px-0 md:pt-0">
            {titleBlock}

            {/* 데스크탑 액션 */}
            <div className="mt-8 hidden items-center gap-3 md:flex">
              <button
                type="button"
                onClick={handleBookmark}
                aria-label="북마크"
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                  bookmarked
                    ? 'border-primary text-primary'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                <Bookmark size={20} fill={bookmarked ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                onClick={handleShare}
                aria-label="공유하기"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500"
              >
                <Share2 size={20} />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="h-12 flex-1 rounded-xl bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary/90"
              >
                {ctaLabel}
              </button>
            </div>

            {/* 모바일 보관장소 */}
            <div className="md:hidden">{storageBlock}</div>
          </div>
        </div>
      </div>

      {/* 모바일 하단 액션 바 (하단 탭 위에 고정) */}
      <div className="fixed right-0 bottom-16 left-0 z-40 flex items-center gap-3 border-t border-gray-100 bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={handleBookmark}
          aria-label="북마크"
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
            bookmarked ? 'border-primary text-primary' : 'border-gray-200 text-gray-500'
          }`}
        >
          <Bookmark size={20} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="h-12 flex-1 rounded-xl bg-primary text-[15px] font-semibold text-white"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
};

export default ItemDetail;
