import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchUnreadCount } from '@/lib/api/notification';
import { useAuthStore } from '@/features/auth/model/authStore';

/** 헤더 종 + 안 읽은 알림 배지. 로그인 시에만 개수 조회. */
const NotificationBell = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const { data: count = 0 } = useQuery({
    queryKey: ['unreadCount', userId],
    queryFn: fetchUnreadCount,
    enabled: !!userId,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60
  });

  return (
    <Link to="/notification" aria-label="알림" className="relative text-gray-700">
      <Bell size={22} />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-secondary px-1 text-[10px] leading-none font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
