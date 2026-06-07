import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Bookmark,
  FileText,
  Tag,
  Settings,
  Info,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/model/authStore';
import { fetchMyPosts } from '@/lib/api/community';
import { useBookmarkStore } from '@/features/bookmark/model/bookmarkStore';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';
import { logger } from '@/lib/utils/logger';

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget: () => void;
      showWidget: () => void;
    };
  }
}

const showAlert = () => alert('서비스 준비 중이에요, 조금만 기다려주세요! 😀');

const MyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);
  const bookmarkCount = useBookmarkStore((s) => s.ids.size);
  const [postCount, setPostCount] = useState(0);

  // 인증 상태 확정 후 비로그인이면 로그인 페이지로
  useEffect(() => {
    if (status === 'guest') {
      navigate('/signin');
    }
  }, [status, navigate]);

  // 내가 쓴 글 수 (정확한 총 개수)
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      try {
        const page = await fetchMyPosts(0, 1);
        if (mounted) setPostCount(page.totalElements);
      } catch (error) {
        logger.warn('내 글 수를 불러오지 못했습니다.', error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/65eeb6d69131ed19d977bab0/1hom7kdu6';
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);

    const hideTawk = () => window.Tawk_API?.hideWidget();
    if (location.pathname !== '/mypageentry') hideTawk();
    else window.Tawk_API?.showWidget();
    return hideTawk;
  }, [location]);

  const handleLogout = () => {
    void (async () => {
      await logout();
      navigate('/');
    })();
  };

  useHeaderConfig(() => ({ children: 'MY' }), []);

  if (!user) {
    return (
      <div className="min-h-nav-safe flex items-center justify-center text-sm text-gray-400">
        사용자 정보를 불러오는 중입니다...
      </div>
    );
  }

  const nickname = user.nickname || user.email?.split('@')[0] || '회원';
  const avatarInitial = nickname.charAt(0) || '나';
  const keywordCount = (user.keywords ?? '')
    .split(/[,\s]+/)
    .filter(Boolean).length;

  const stats = [
    { label: '북마크', value: bookmarkCount },
    { label: '키워드', value: keywordCount },
    { label: '내 글', value: postCount }
  ];

  type MenuItem = {
    label: string;
    icon: typeof Bell;
    count?: string;
    onClick: () => void;
  };

  const primaryMenu: MenuItem[] = [
    {
      label: '키워드 알림',
      icon: Bell,
      count: `${keywordCount}개`,
      onClick: () => navigate('/notification')
    },
    {
      label: '북마크한 물건',
      icon: Bookmark,
      count: `${bookmarkCount}개`,
      onClick: () => navigate('/bookmarks')
    },
    {
      label: '내가 쓴 글·댓글',
      icon: FileText,
      count: `${postCount}개`,
      onClick: () => navigate('/myactivity')
    },
    { label: '분실물 등록하기', icon: Tag, onClick: showAlert }
  ];

  const secondaryMenu: MenuItem[] = [
    { label: '알림 설정', icon: Settings, onClick: showAlert },
    { label: '공지사항', icon: Info, onClick: () => navigate('/notice') }
  ];

  const MenuRow = ({ item }: { item: MenuItem }) => {
    const Icon = item.icon;
    return (
      <button
        type="button"
        onClick={item.onClick}
        className="flex w-full items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4 text-left transition-colors hover:bg-gray-100"
      >
        <Icon size={20} className="shrink-0 text-gray-500" />
        <span className="flex-1 text-[15px] font-medium text-gray-800">
          {item.label}
        </span>
        {item.count && (
          <span className="text-sm text-gray-400">{item.count}</span>
        )}
        <ChevronRight size={18} className="text-gray-300" />
      </button>
    );
  };

  return (
    <div className="min-h-nav-safe bg-white">
      <div className="mx-auto w-full max-w-[800px] px-4 pt-4 pb-10 md:px-6 md:pt-8">
        {/* 프로필 카드 */}
        <section className="flex items-center gap-4 rounded-2xl border border-gray-100 p-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xl font-bold text-white">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="프로필"
                className="h-full w-full object-cover"
              />
            ) : (
              avatarInitial
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-gray-900">{nickname}</p>
            <p className="truncate text-sm text-gray-400">{user.email || '-'}</p>
          </div>
          <Link
            to="/mypageedit"
            className="shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            편집
          </Link>
        </section>

        {/* 통계 */}
        <section className="mt-3 grid grid-cols-3 divide-x divide-gray-100 rounded-2xl bg-gray-50 py-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-extrabold text-primary">{s.value}</p>
              <p className="mt-0.5 text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </section>

        {/* 메뉴 */}
        <section className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {primaryMenu.map((item) => (
            <MenuRow key={item.label} item={item} />
          ))}
        </section>

        <section className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {secondaryMenu.map((item) => (
            <MenuRow key={item.label} item={item} />
          ))}
        </section>

        {/* 로그아웃 */}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 flex items-center gap-2 px-1 text-sm text-gray-400 transition-colors hover:text-gray-600"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default MyPage;
