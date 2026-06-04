import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Box, Tag, MessageCircle, User, Bell } from 'lucide-react';
import { useAuthStore } from '@/features/auth/model/authStore';
import BrandLogo from '@/shared/ui/BrandLogo';

interface TabDef {
  label: string;
  to: string;
  icon: typeof Home;
  matches: string[];
}

const TABS: TabDef[] = [
  { label: '홈', to: '/', icon: Home, matches: ['/'] },
  {
    label: '습득물',
    to: '/getlist',
    icon: Box,
    matches: ['/getlist', '/searchfind']
  },
  {
    label: '분실물',
    to: '/lostlist',
    icon: Tag,
    matches: ['/lostlist', '/searchlost']
  },
  {
    label: '게시판',
    to: '/postlist',
    icon: MessageCircle,
    matches: ['/postlist', '/searchpost', '/createpost', '/postdetail']
  }
];

const Navigation = () => {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;
  const displayName =
    user?.nickname || user?.email?.split('@')[0] || '';

  useEffect(() => {
    document.body.classList.add('has-navigation');
    return () => {
      document.body.classList.remove('has-navigation');
    };
  }, []);

  const isActive = (matches: string[]) => {
    return matches.some((path) =>
      path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
    );
  };

  const isMyActive = () =>
    ['/mypage', '/signin', '/signup', '/notification', '/notice'].some((p) =>
      location.pathname.startsWith(p)
    );

  const myTo = isLoggedIn ? '/mypage' : '/signin';
  const avatarInitial = displayName ? displayName.charAt(0) : '나';

  return (
    <>
      {/* 데스크탑 상단 네비게이션 */}
      <nav className="fixed top-0 right-0 left-0 z-50 hidden border-b border-gray-200 bg-white md:block">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
          <div className="flex items-center gap-7">
            <Link to="/" aria-label="홈으로 이동">
              <BrandLogo size={30} />
            </Link>
            <div className="flex items-center gap-1">
              {TABS.map((tab) => (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${
                    isActive(tab.matches)
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/notification"
              aria-label="알림"
              className="text-gray-450 transition-colors hover:text-primary"
            >
              <Bell size={22} />
            </Link>

            {isLoggedIn ? (
              <Link
                to="/mypage"
                className={`flex items-center gap-2 rounded-full py-1 pr-3 pl-1 transition-colors ${
                  isMyActive() ? 'bg-primary/10' : 'hover:bg-gray-100'
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {avatarInitial}
                </span>
                <span className="text-sm font-semibold text-gray-700">
                  {displayName || '마이페이지'}
                </span>
              </Link>
            ) : (
              <Link
                to="/signin"
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 모바일 하단 탭바 */}
      <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="grid h-16 grid-cols-5">
          {TABS.map((tab) => {
            const active = isActive(tab.matches);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`flex flex-col items-center justify-center gap-1 ${
                  active ? 'text-primary' : 'text-gray-400'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
          <Link
            to={myTo}
            className={`flex flex-col items-center justify-center gap-1 ${
              isMyActive() ? 'text-primary' : 'text-gray-400'
            }`}
          >
            <User size={22} strokeWidth={isMyActive() ? 2.4 : 2} />
            <span className="text-[11px] font-medium">MY</span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
