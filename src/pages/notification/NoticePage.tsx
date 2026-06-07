import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AppNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '@/lib/api/notification';
import { getTimeDiff } from '@/lib/utils/getTimeDiff';
import none_alarm from '@/assets/none_alarm.svg';
import { useAuthStore } from '@/features/auth/model/authStore';

const Notice = () => {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: fetchNotifications,
    enabled: !!userId,
    staleTime: 1000 * 15
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    queryClient.invalidateQueries({ queryKey: ['unreadCount', userId] });
  };

  const handleClick = async (n: AppNotification) => {
    if (!n.read) {
      try {
        await markNotificationRead(n.id);
        invalidate();
      } catch {
        /* 무시 */
      }
    }
    if (n.item_id) {
      const to =
        n.item_type === 'lost'
          ? `/lostlist/detail/${n.item_id}`
          : `/getlist/detail/${n.item_id}`;
      navigate(to);
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      invalidate();
    } catch {
      /* 무시 */
    }
  };

  if (isLoading) {
    return <p className="pt-16 text-center text-sm text-gray-400">불러오는 중...</p>;
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center pt-16">
        <img src={none_alarm} alt="" className="w-28 opacity-90" />
        <p className="mt-4 text-sm text-gray-400">새로운 알림이 없습니다.</p>
      </div>
    );
  }

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div>
      {hasUnread && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleReadAll}
            className="text-xs font-medium text-gray-400 hover:text-primary"
          >
            모두 읽음
          </button>
        </div>
      )}
      <ul className="divide-y divide-gray-50">
        {notifications.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => handleClick(n)}
              className={`flex w-full items-start gap-3 py-4 text-left active:bg-gray-50 ${
                n.read ? '' : 'bg-[#F5F9FF]'
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF1FF]">
                <Bell size={18} className="text-primary" />
              </span>
              <div className="min-w-0 flex-1">
                {n.keyword && (
                  <span className="inline-flex rounded-md bg-[#E8F0FF] px-2 py-0.5 text-[11px] font-bold text-primary">
                    {n.keyword}
                  </span>
                )}
                <p className="mt-1.5 text-sm font-semibold text-gray-800">{n.title}</p>
                {n.message && (
                  <p className="mt-0.5 truncate text-sm text-gray-500">{n.message}</p>
                )}
                <p className="mt-0.5 text-xs text-gray-400">
                  {getTimeDiff({ createdAt: n.created_at })}
                </p>
              </div>
              <ChevronRight size={18} className="mt-2 shrink-0 text-gray-300" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notice;
