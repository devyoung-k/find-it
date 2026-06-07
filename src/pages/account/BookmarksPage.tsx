import { Link } from 'react-router-dom';
import { Bookmark as BookmarkIcon, MapPin, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMyBookmarks } from '@/lib/api/bookmark';
import { useBookmarkStore } from '@/features/bookmark/model/bookmarkStore';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';
import CategoryThumb from '@/shared/ui/item/CategoryThumb';
import formatDisplayDate from '@/lib/utils/formatDisplayDate';

const Bookmarks = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const toggleBookmark = useBookmarkStore((s) => s.toggle);
  const queryClient = useQueryClient();

  useHeaderConfig(
    () => ({ isShowPrev: true, children: '북마크한 물건', empty: true }),
    []
  );

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['myBookmarks', userId],
    queryFn: fetchMyBookmarks,
    enabled: !!userId,
    staleTime: 1000 * 30
  });

  const handleRemove = async (itemId: string) => {
    try {
      await toggleBookmark({ itemId }); // 이미 북마크 상태 → 해제
      queryClient.setQueryData(
        ['myBookmarks', userId],
        (old: typeof bookmarks | undefined) =>
          (old ?? []).filter((b) => b.item_id !== itemId)
      );
    } catch {
      /* store 에서 롤백 처리됨 */
    }
  };

  return (
    <div className="min-h-nav-safe bg-white">
      <div className="mx-auto w-full max-w-[800px] px-4 pb-24 md:px-6 md:pt-4">
        {isLoading ? (
          <p className="py-16 text-center text-sm text-gray-400">불러오는 중...</p>
        ) : bookmarks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-20 text-gray-400">
            <BookmarkIcon size={28} className="text-gray-300" />
            <p className="text-sm">북마크한 물건이 없어요.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 pt-2">
            {bookmarks.map((b) => {
              const to =
                b.item_type === 'lost'
                  ? `/lostlist/detail/${b.item_id}`
                  : `/getlist/detail/${b.item_id}`;
              return (
                <li key={b.id} className="flex items-center gap-3 py-3">
                  <Link to={to} className="flex min-w-0 flex-1 items-center gap-3">
                    <CategoryThumb
                      image={b.image_url ?? undefined}
                      prdtClNm={b.category ?? undefined}
                      className="h-16 w-16 shrink-0 rounded-lg"
                      iconSize={28}
                      alt={b.name ?? '물건'}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold text-gray-900">
                        {b.name || '이름 미상'}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[13px] text-gray-450">
                        <MapPin size={13} className="shrink-0" />
                        {b.place || '장소 미상'}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {formatDisplayDate(b.item_date ?? undefined)}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(b.item_id)}
                    aria-label="북마크 해제"
                    className="shrink-0 rounded-full p-2 text-gray-300 hover:bg-gray-50 hover:text-secondary"
                  >
                    <X size={18} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
