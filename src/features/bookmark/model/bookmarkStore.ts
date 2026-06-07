import { create } from 'zustand';
import {
  addBookmark,
  fetchBookmarkIds,
  removeBookmark,
  type BookmarkItemInput
} from '@/lib/api/bookmark';
import { logger } from '@/lib/utils/logger';

interface BookmarkState {
  ids: Set<string>;
  loaded: boolean;
  /** 로그인 시 1회 로드(내 북마크 ID 셋). */
  load: () => Promise<void>;
  /** 로그아웃 시 초기화. */
  reset: () => void;
  has: (itemId: string) => boolean;
  /** 낙관적 토글 + 서버 반영(실패 시 롤백). */
  toggle: (item: BookmarkItemInput) => Promise<void>;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  ids: new Set(),
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    try {
      const ids = await fetchBookmarkIds();
      set({ ids: new Set(ids), loaded: true });
    } catch (error) {
      logger.warn('북마크 로드 실패', error);
    }
  },

  reset: () => set({ ids: new Set(), loaded: false }),

  has: (itemId) => get().ids.has(itemId),

  toggle: async (item) => {
    const exists = get().ids.has(item.itemId);
    const optimistic = new Set(get().ids);
    if (exists) optimistic.delete(item.itemId);
    else optimistic.add(item.itemId);
    set({ ids: optimistic });
    try {
      if (exists) await removeBookmark(item.itemId);
      else await addBookmark(item);
    } catch (error) {
      // 롤백
      const reverted = new Set(get().ids);
      if (exists) reverted.add(item.itemId);
      else reverted.delete(item.itemId);
      set({ ids: reverted });
      logger.error('북마크 토글 실패', error);
      throw error;
    }
  }
}));
