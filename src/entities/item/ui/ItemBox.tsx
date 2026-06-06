import { useState, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Bookmark } from 'lucide-react';
import formatDisplayDate from '@/lib/utils/formatDisplayDate';
import CategoryThumb from '@/shared/ui/item/CategoryThumb';
import TypeBadge from '@/shared/ui/item/TypeBadge';
import {
  getCategoryMeta,
  formatCategoryLabel
} from '@/shared/config/categoryMeta';

type ItemData = {
  atcId: string;
  fdPrdtNm?: string;
  lstPrdtNm?: string;
  fdYmd?: string;
  lstYmd?: string;
  depPlace?: string;
  lstPlace?: string;
  fdFilePathImg?: string;
  prdtClNm?: string;
};

type ItemBoxProps = {
  itemType: 'get' | 'lost' | 'main';
  item?: ItemData;
  /** auto = 모바일 행/데스크탑 카드, card = 항상 세로 카드, row = 항상 가로 행 */
  layout?: 'auto' | 'card' | 'row';
};

/** 등록일이 최근(7일 이내)인지 */
const isRecent = (ymd?: string): boolean => {
  if (!ymd) return false;
  const digits = ymd.replace(/\D/g, '');
  if (digits.length !== 8) return false;
  const date = new Date(
    Number(digits.slice(0, 4)),
    Number(digits.slice(4, 6)) - 1,
    Number(digits.slice(6, 8))
  );
  const diff = Date.now() - date.getTime();
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
};

const BookmarkButton = ({
  bookmarked,
  onToggle,
  className = ''
}: {
  bookmarked: boolean;
  onToggle: (e: MouseEvent) => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={bookmarked ? '북마크 해제' : '북마크'}
    aria-pressed={bookmarked}
    className={`text-gray-300 transition-colors hover:text-primary ${className}`}
  >
    <Bookmark
      size={20}
      className={bookmarked ? 'text-primary' : ''}
      fill={bookmarked ? 'currentColor' : 'none'}
    />
  </button>
);

const ItemBox = ({ itemType, item, layout = 'auto' }: ItemBoxProps) => {
  const [bookmarked, setBookmarked] = useState(false);

  if (!item) return null;

  const isGet = itemType !== 'lost';
  const name = (isGet ? item.fdPrdtNm : item.lstPrdtNm) || '이름 미상';
  const rawDate = isGet ? item.fdYmd : item.lstYmd;
  const place = (isGet ? item.depPlace : item.lstPlace) || '장소 미상';
  const image = isGet ? item.fdFilePathImg : undefined;
  const date = formatDisplayDate(rawDate);
  const isNew = isRecent(rawDate);
  const category = formatCategoryLabel(item.prdtClNm);
  const { fg } = getCategoryMeta(item.prdtClNm);
  const to = isGet
    ? `/getlist/detail/${item.atcId}`
    : `/lostlist/detail/${item.atcId}`;

  const handleBookmark = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked((prev) => !prev);
  };

  const MetaRow = (
    <>
      <p className="mt-1.5 flex items-center gap-1 truncate text-[13px] text-gray-450">
        <MapPin size={13} className="shrink-0" />
        <span className="truncate">{place}</span>
      </p>
      <p className="mt-1 flex items-center gap-1 text-[13px] text-gray-350">
        <Clock size={13} className="shrink-0" />
        <span>{date}</span>
      </p>
    </>
  );

  const BadgeLine = (
    <div className="flex items-center gap-1.5">
      <TypeBadge type={isGet ? 'get' : 'lost'} />
      <span className="text-[12px] font-semibold" style={{ color: fg }}>
        {category}
      </span>
      {isNew && (
        <span className="text-[11px] font-extrabold text-secondary">NEW</span>
      )}
    </div>
  );

  // 가로 행 (모바일 목록)
  const row = (
    <Link
      to={to}
      className="flex items-center gap-3.5 border-b border-gray-100 py-4 active:bg-gray-50"
    >
      <CategoryThumb
        prdtClNm={item.prdtClNm}
        image={image}
        className="h-[72px] w-[72px] rounded-2xl"
        iconSize={30}
      />
      <div className="min-w-0 flex-1">
        {BadgeLine}
        <h3 className="mt-1 truncate text-[16px] font-bold text-gray-900">
          {name}
        </h3>
        {MetaRow}
      </div>
      <BookmarkButton
        bookmarked={bookmarked}
        onToggle={handleBookmark}
        className="self-start"
      />
    </Link>
  );

  // 세로 카드 (데스크탑 그리드 / 홈 스크롤러)
  const card = (
    <Link
      to={to}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative">
        <CategoryThumb
          prdtClNm={item.prdtClNm}
          image={image}
          className="h-[130px] w-full rounded-none"
          iconSize={44}
        />
        <span className="absolute left-2.5 top-2.5">
          <TypeBadge type={isGet ? 'get' : 'lost'} />
        </span>
        <BookmarkButton
          bookmarked={bookmarked}
          onToggle={handleBookmark}
          className="absolute right-2.5 top-2.5 rounded-full bg-white/80 p-1 backdrop-blur-sm"
        />
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-semibold" style={{ color: fg }}>
            {category}
          </span>
          {isNew && (
            <span className="text-[11px] font-extrabold text-secondary">
              NEW
            </span>
          )}
        </div>
        <h3 className="mt-1 truncate text-[15px] font-bold text-gray-900">
          {name}
        </h3>
        {MetaRow}
      </div>
    </Link>
  );

  if (layout === 'card') return card;
  if (layout === 'row') return row;

  return (
    <>
      <div className="lg:hidden">{row}</div>
      <div className="hidden lg:block">{card}</div>
    </>
  );
};

export default ItemBox;
