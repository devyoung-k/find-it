import { authorizedFetch } from '@/lib/api/auth';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  item_id: string | null;
  item_type: string | null;
  keyword: string | null;
  read: boolean;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface NotificationApi {
  id: string;
  type: string;
  title: string;
  message: string | null;
  itemId: string | null;
  itemType: string | null;
  keyword: string | null;
  read: boolean;
  createdAt: string;
}

const toNotification = (r: NotificationApi): AppNotification => ({
  id: r.id,
  type: r.type,
  title: r.title,
  message: r.message ?? null,
  item_id: r.itemId ?? null,
  item_type: r.itemType ?? null,
  keyword: r.keyword ?? null,
  read: r.read,
  created_at: r.createdAt
});

export const fetchNotifications = async (): Promise<AppNotification[]> => {
  const res = await authorizedFetch('/notifications?page=0&size=50', { method: 'GET' });
  if (!res.ok) throw new Error('알림을 불러오지 못했습니다.');
  const json = (await res.json()) as ApiResponse<NotificationApi[]>;
  return Array.isArray(json.data) ? json.data.map(toNotification) : [];
};

export const fetchUnreadCount = async (): Promise<number> => {
  const res = await authorizedFetch('/notifications/unread-count', { method: 'GET' });
  if (!res.ok) return 0;
  const json = (await res.json()) as ApiResponse<{ count: number }>;
  return json.data?.count ?? 0;
};

export const markNotificationRead = async (id: string) => {
  await authorizedFetch(`/notifications/${id}/read`, { method: 'POST' });
};

export const markAllNotificationsRead = async () => {
  await authorizedFetch('/notifications/read-all', { method: 'POST' });
};
