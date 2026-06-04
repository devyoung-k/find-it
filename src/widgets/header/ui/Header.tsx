import { ChevronLeft, Search, Bell } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import BrandLogo from '@/shared/ui/BrandLogo';

export interface HeaderProps {
  isShowLogo?: boolean;
  isShowPrev?: boolean;
  isShowSymbol?: boolean;
  isShowSearch?: boolean;
  isShowSubmit?: boolean;
  isShowBell?: boolean;
  empty?: boolean; // 우측 자리 맞춤용 spacer
  link?: string;
  customStyle?: string;
  children?: ReactNode;
  onSubmitClick?: () => void;
  submitLabel?: string;
}

const Header = ({
  isShowLogo,
  isShowPrev,
  isShowSymbol,
  isShowSearch,
  isShowSubmit,
  isShowBell,
  empty,
  link,
  customStyle,
  children,
  onSubmitClick,
  submitLabel
}: HeaderProps) => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const handlePreviousPage = () => {
    navigate(-1);
    if (
      location.pathname === '/searchfindresult' ||
      location.pathname === '/searchlostresult'
    ) {
      queryClient.removeQueries({ queryKey: ['searchFindResult'], exact: true });
      queryClient.removeQueries({ queryKey: ['searchLostResult'], exact: true });
    }
  };

  // 홈: 로고 좌측 + 벨 우측 자동
  const showBell = isShowBell || isShowLogo;

  const leftItems: ReactNode[] = [];
  if (isShowPrev) {
    leftItems.push(
      <button
        key="prev"
        onClick={handlePreviousPage}
        aria-label="이전으로"
        className="-ml-1 text-gray-700"
      >
        <ChevronLeft size={26} />
      </button>
    );
  }
  if (isShowLogo) {
    leftItems.push(
      <Link key="logo" to="/" aria-label="메인 페이지로 이동">
        <h1>
          <BrandLogo size={28} />
        </h1>
      </Link>
    );
  }
  if (isShowSymbol && !isShowLogo) {
    leftItems.push(
      <Link key="symbol" to="/" aria-label="메인 페이지로 이동">
        <BrandLogo size={26} showWordmark={false} />
      </Link>
    );
  }

  const rightItems: ReactNode[] = [];
  if (isShowSearch && link) {
    rightItems.push(
      <Link key="search" to={link} aria-label="검색하기" className="text-gray-700">
        <Search size={22} />
      </Link>
    );
  }
  if (showBell) {
    rightItems.push(
      <Link key="bell" to="/notification" aria-label="알림" className="text-gray-700">
        <Bell size={22} />
      </Link>
    );
  }
  if (isShowSubmit !== undefined) {
    const isActive = Boolean(isShowSubmit);
    rightItems.push(
      <button
        key="submit"
        type="button"
        className={`text-[15px] font-semibold ${
          isActive ? 'text-primary' : 'text-gray-350'
        }`}
        disabled={!isActive}
        onClick={isActive ? onSubmitClick : undefined}
      >
        {submitLabel ?? '완료'}
      </button>
    );
  }
  if (empty && rightItems.length === 0) {
    rightItems.push(<span key="empty" aria-hidden className="h-6 w-6" />);
  }

  const title =
    children !== undefined ? (
      typeof children === 'string' ? (
        <p className="truncate text-[17px] font-bold text-gray-900">{children}</p>
      ) : (
        children
      )
    ) : null;

  // 로고는 좌측 정렬이므로 가운데 비움
  const centerContent = isShowLogo ? null : title;

  return (
    <header
      className="fixed top-0 left-0 z-[9999] w-full border-b border-gray-50 bg-white md:hidden"
      role="banner"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:bg-white focus:px-4 focus:py-2"
      >
        메인 콘텐츠로 건너뛰기
      </a>
      <div
        className={`mx-auto flex h-14 w-full items-center px-4 ${customStyle || ''}`}
      >
        <div className="flex min-w-[56px] items-center gap-2">{leftItems}</div>
        <div className="flex flex-1 items-center justify-center px-1 text-center">
          {centerContent}
        </div>
        <div className="flex min-w-[56px] items-center justify-end gap-3">
          {rightItems}
        </div>
      </div>
    </header>
  );
};

export default Header;
