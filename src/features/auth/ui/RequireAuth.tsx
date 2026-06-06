import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/authStore';

/** 로그인이 필요한 라우트 보호. 인증 확정 전엔 렌더하지 않고, 게스트면 /signin으로. */
const RequireAuth = ({ children }: { children: ReactNode }) => {
  const status = useAuthStore((s) => s.status);

  if (status === 'idle' || status === 'loading') {
    return null;
  }
  if (status === 'guest') {
    return <Navigate to="/signin" replace />;
  }
  return <>{children}</>;
};

export default RequireAuth;
