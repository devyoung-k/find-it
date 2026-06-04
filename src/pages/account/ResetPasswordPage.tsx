import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PasswordResetFormCard from '@/pages/account/components/password-change/PasswordResetFormCard';
import { hasToken } from '@/lib/api/auth';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const resetToken = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('token');
  }, [location.search]);

  const canRenderForm = Boolean(resetToken);

  useEffect(() => {
    if (canRenderForm) return;
    navigate(hasToken() ? '/' : '/signin', { replace: true });
  }, [canRenderForm, navigate]);

  useHeaderConfig(
    () => ({ isShowPrev: true, children: '비밀번호 재설정', empty: true }),
    []
  );

  if (!canRenderForm) {
    return null;
  }

  return (
    <div className="min-h-nav-safe flex w-full flex-col items-center bg-white">
      <main
        id="main-content"
        className="flex w-full flex-1 items-start justify-center px-4 pt-12 pb-24"
      >
        <div className="w-full max-w-md">
          <PasswordResetFormCard token={resetToken as string} />
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
