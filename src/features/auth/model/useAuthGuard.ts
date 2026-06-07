import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/authStore';

/**
 * 회원 전용 액션(북마크, 문의 등) 보호용 가드.
 *
 * 반환된 함수를 액션 핸들러 맨 앞에서 호출한다.
 * - 인증되어 있으면 `true` 를 반환 → 액션 계속 진행.
 * - 게스트면 로그인 페이지(`/signin`)로 보내고 `false` 를 반환 → 액션 중단.
 *   로그인 후 원래 위치로 돌아올 수 있도록 현재 경로를 `state.from` 으로 전달한다.
 *
 * 사용 예:
 * ```ts
 * const ensureAuth = useAuthGuard();
 * const handleBookmark = () => {
 *   if (!ensureAuth()) return;
 *   // ...회원 액션
 * };
 * ```
 */
export const useAuthGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const status = useAuthStore((s) => s.status);

  return useCallback((): boolean => {
    if (status === 'authenticated') {
      return true;
    }
    navigate('/signin', {
      state: { from: `${location.pathname}${location.search}` }
    });
    return false;
  }, [status, navigate, location.pathname, location.search]);
};
