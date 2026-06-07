import { authorizedFetch } from '@/lib/api/auth';

export interface BookmarkItemInput {
  itemId: string;
  itemType?: string; // 'get' | 'lost'
  name?: string;
  place?: string;
  imageUrl?: string;
  category?: string;
  itemDate?: string;
}

export interface Bookmark {
  id: string;
  item_id: string;
  item_type: string | null;
  name: string | null;
  place: string | null;
  image_url: string | null;
  category: string | null;
  item_date: string | null;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface BookmarkApi {
  id: string;
  itemId: string;
  itemType: string | null;
  name: string | null;
  place: string | null;
  imageUrl: string | null;
  category: string | null;
  itemDate: string | null;
  createdAt: string;
}

const toBookmark = (r: BookmarkApi): Bookmark => ({
  id: r.id,
  item_id: r.itemId,
  item_type: r.itemType ?? null,
  name: r.name ?? null,
  place: r.place ?? null,
  image_url: r.imageUrl ?? null,
  category: r.category ?? null,
  item_date: r.itemDate ?? null,
  created_at: r.createdAt
});

/** 내가 북마크한 아이템 ID 목록(카드 표시용). 인증 필요. */
export const fetchBookmarkIds = async (): Promise<string[]> => {
  const res = await authorizedFetch('/bookmarks/ids', { method: 'GET' });
  if (!res.ok) throw new Error('북마크를 불러오지 못했습니다.');
  const json = (await res.json()) as ApiResponse<string[]>;
  return Array.isArray(json.data) ? json.data : [];
};

/** 내 북마크 목록(상세 표시용). 인증 필요. */
export const fetchMyBookmarks = async (): Promise<Bookmark[]> => {
  const res = await authorizedFetch('/bookmarks', { method: 'GET' });
  if (!res.ok) throw new Error('북마크를 불러오지 못했습니다.');
  const json = (await res.json()) as ApiResponse<BookmarkApi[]>;
  return Array.isArray(json.data) ? json.data.map(toBookmark) : [];
};

export const addBookmark = async (item: BookmarkItemInput) => {
  const res = await authorizedFetch('/bookmarks', {
    method: 'POST',
    body: JSON.stringify({
      itemId: item.itemId,
      itemType: item.itemType,
      name: item.name,
      place: item.place,
      imageUrl: item.imageUrl,
      category: item.category,
      itemDate: item.itemDate
    })
  });
  if (!res.ok) throw new Error('북마크 추가에 실패했습니다.');
};

export const removeBookmark = async (itemId: string) => {
  const res = await authorizedFetch(`/bookmarks/${encodeURIComponent(itemId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('북마크 해제에 실패했습니다.');
};
