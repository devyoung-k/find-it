import { Link, useNavigate } from 'react-router-dom';
import { Search, Box, Tag, Bell, ChevronRight } from 'lucide-react';
import { useFoundItemsInfinite } from '@/entities/found/model/useFoundItemsInfinite';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';
import ItemBox from '@/entities/item/ui/ItemBox';
import {
  HOME_CATEGORY_CHIPS,
  getCategoryMeta
} from '@/shared/config/categoryMeta';

/** 카테고리 바로가기 칩 (아이콘 + 라벨) */
const CategoryShortcut = ({
  label,
  variant
}: {
  label: string;
  variant: 'circle' | 'pill';
}) => {
  const { Icon, fg, bg } = getCategoryMeta(label);

  if (variant === 'pill') {
    return (
      <Link
        to={`/getlist?category=${encodeURIComponent(label)}`}
        className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary hover:text-primary"
      >
        <Icon size={16} color={fg} strokeWidth={2} />
        {label}
      </Link>
    );
  }

  return (
    <Link
      to={`/getlist?category=${encodeURIComponent(label)}`}
      className="flex w-16 shrink-0 flex-col items-center gap-1.5"
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: bg }}
      >
        <Icon size={26} color={fg} strokeWidth={2} />
      </span>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </Link>
  );
};

/** 키워드 알림 배너 */
const KeywordBanner = () => (
  <Link
    to="/notification"
    className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#5B8DEF] to-[#4785FF] p-5 text-white shadow-sm transition-shadow hover:shadow-md"
  >
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/25">
      <Bell size={22} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-base font-bold">키워드 알림 받기</p>
      <p className="mt-0.5 text-sm text-white/85">
        찾는 물건을 등록하면 새 습득물을 바로 알려드려요
      </p>
    </div>
    <ChevronRight size={22} className="shrink-0 text-white/80" />
  </Link>
);

const Main = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useFoundItemsInfinite({
    pageSize: 8,
    query: { staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 30 }
  });

  const items = (data?.pages?.flatMap((page) => page) ?? []).slice(0, 8);

  useHeaderConfig(() => ({ isShowLogo: true }), []);

  const goSearch = () => navigate('/searchfind');

  const recentSection = (
    <section className="mx-auto w-full max-w-[1280px] px-4 md:px-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">방금 등록된 습득물</h2>
          <p className="mt-0.5 text-sm text-gray-450">
            가장 최근 접수된 물건이에요
          </p>
        </div>
        <Link
          to="/getlist"
          className="flex shrink-0 items-center text-sm text-gray-450 hover:text-primary"
        >
          전체보기 <ChevronRight size={16} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[230px] animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          {/* 모바일: 가로 스크롤 */}
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:hidden">
            {items.map((item, i) => (
              <div key={`${item.atcId}-${i}`} className="w-[150px] shrink-0">
                <ItemBox item={item} itemType="get" layout="card" />
              </div>
            ))}
          </div>
          {/* 데스크탑: 그리드 */}
          <div className="hidden grid-cols-4 gap-4 md:grid">
            {items.map((item, i) => (
              <ItemBox
                key={`${item.atcId}-${i}`}
                item={item}
                itemType="get"
                layout="card"
              />
            ))}
          </div>
        </>
      ) : (
        <p className="rounded-2xl bg-gray-50 py-10 text-center text-sm text-gray-400">
          등록된 습득물이 없습니다.
        </p>
      )}
    </section>
  );

  return (
    <div className="min-h-nav-safe bg-white pb-10">
      {/* ===== 데스크탑 히어로 ===== */}
      <section className="hidden bg-gradient-to-b from-[#EAF2FF] to-white py-14 md:block">
        <div className="mx-auto max-w-[760px] px-6 text-center">
          <h1 className="text-[34px] leading-tight font-extrabold text-gray-900">
            잃어버린 소중함,
            <br />
            찾아줘가 한 번에 찾아드려요
          </h1>
          <p className="mt-4 text-[15px] text-gray-500">
            전국 유실물을 한 곳에서 검색하고, 키워드 알림으로 놓치지 마세요
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              goSearch();
            }}
            className="mx-auto mt-7 flex max-w-[560px] items-center gap-2 rounded-full border border-gray-200 bg-white p-1.5 pl-5 shadow-sm"
          >
            <Search size={20} className="shrink-0 text-gray-350" />
            <input
              type="text"
              readOnly
              onFocus={goSearch}
              placeholder="어떤 물건을 찾고 있나요?"
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-350"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              검색
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {HOME_CATEGORY_CHIPS.map((label) => (
              <CategoryShortcut key={label} label={label} variant="pill" />
            ))}
          </div>
        </div>
      </section>

      {/* ===== 모바일 상단 ===== */}
      <section className="px-4 pt-3 md:hidden">
        <button
          type="button"
          onClick={goSearch}
          className="flex w-full items-center gap-2.5 rounded-2xl bg-gray-100 px-4 py-3.5 text-left text-gray-400"
        >
          <Search size={20} />
          <span className="text-[15px]">어떤 물건을 찾고 있나요?</span>
        </button>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            to="/getlist"
            className="rounded-2xl bg-[#EAF1FF] p-4 transition-colors active:bg-[#dde9ff]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <Box size={22} className="text-primary" />
            </span>
            <p className="mt-3 text-[15px] font-bold text-gray-900">습득물 찾기</p>
            <p className="mt-0.5 text-xs text-gray-500">누가 보관 중인 물건</p>
          </Link>
          <Link
            to="/lostlist"
            className="rounded-2xl bg-[#FFEDE9] p-4 transition-colors active:bg-[#ffe0d9]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <Tag size={22} className="text-secondary" />
            </span>
            <p className="mt-3 text-[15px] font-bold text-gray-900">분실물 보기</p>
            <p className="mt-0.5 text-xs text-gray-500">누군가 잃어버린 물건</p>
          </Link>
        </div>

        <div className="-mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-1">
          {HOME_CATEGORY_CHIPS.map((label) => (
            <CategoryShortcut key={label} label={label} variant="circle" />
          ))}
        </div>
      </section>

      {/* ===== 최근 습득물 ===== */}
      <div className="mt-6 md:mt-10">{recentSection}</div>

      {/* ===== 키워드 배너 ===== */}
      <div className="mx-auto mt-6 w-full max-w-[1280px] px-4 md:mt-10 md:px-6">
        <KeywordBanner />
      </div>
    </div>
  );
};

export default Main;
