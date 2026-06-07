import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/authStore';

/** 로그인이 필요한 라우트 보호. 인증 확정 전엔 렌더하지 않고, 게스트면 /signin으로(로그인 후 복귀용 from 전달). */
const RequireAuth = ({ children }: { children: ReactNode }) => {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return null;
  }
  if (status === 'guest') {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  return <>{children}</>;
};

export default RequireAuth;
