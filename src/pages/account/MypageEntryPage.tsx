import MyPage from '@/pages/account/MyPagePage';
import SignIn from '@/pages/account/SignInPage';
import { useAuthStore } from '@/features/auth/model/authStore';

const MypageEntry = () => {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  if (status === 'idle' || status === 'loading') {
    return null;
  }

  return user ? <MyPage /> : <SignIn />;
};

export default MypageEntry;
