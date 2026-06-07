import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from '@/app/layouts/AppLayout';
import RequireAuth from '@/features/auth/ui/RequireAuth';

// 라우트별 코드 스플리팅 (Suspense는 AppProviders에 설정됨)
const Main = lazy(() => import('@/pages/main/MainPage'));
const GetList = lazy(() => import('@/pages/find/GetListPage'));
const GetDetail = lazy(() => import('@/pages/find/GetDetailPage'));
const LostList = lazy(() => import('@/pages/lost/LostListPage'));
const LostDetail = lazy(() => import('@/pages/lost/LostDetailPage'));
const SearchFindDetail = lazy(
  () => import('@/pages/search/SearchFindDetailPage')
);
const SearchFindResult = lazy(
  () => import('@/pages/search/SearchFindResultPage')
);
const SearchLostDetail = lazy(
  () => import('@/pages/search/SearchLostDetailPage')
);
const SearchLostResult = lazy(
  () => import('@/pages/search/SearchLostResultPage')
);
const MypageEntry = lazy(() => import('@/pages/account/MypageEntryPage'));
const MyPage = lazy(() => import('@/pages/account/MyPagePage'));
const MypageEdit = lazy(() => import('@/pages/account/MypageEditPage'));
const MypageDelete = lazy(() => import('@/pages/account/MypageDeletePage'));
const Notification = lazy(() => import('@/pages/notification/NotificationPage'));
const SignIn = lazy(() => import('@/pages/account/SignInPage'));
const SignUp = lazy(() => import('@/pages/account/SignUpPage'));
const ResetPassword = lazy(() => import('@/pages/account/ResetPasswordPage'));
const Welcome = lazy(() => import('@/pages/account/WelcomePage'));
const Notice = lazy(() => import('@/pages/account/NoticePage'));
const Credit = lazy(() => import('@/pages/account/CreditPage'));
const PostList = lazy(() => import('@/pages/community/PostListPage'));
const PostDetail = lazy(() => import('@/pages/community/PostDetailPage'));
const CreatePost = lazy(() => import('@/pages/community/CreatePostPage'));
const SearchPost = lazy(() => import('@/pages/community/SearchPostPage'));
const NotFound = lazy(() => import('@/pages/main/NotFoundPage'));

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Main />} />
        <Route path="/getlist" element={<GetList />} />
        <Route path="/getlist/detail/:id" element={<GetDetail />} />
        <Route path="/lostlist" element={<LostList />} />
        <Route path="/lostlist/detail/:id" element={<LostDetail />} />
        <Route path="/searchfind" element={<SearchFindDetail />} />
        <Route path="/searchfindresult" element={<SearchFindResult />} />
        <Route path="/searchlost" element={<SearchLostDetail />} />
        <Route path="/searchlostresult" element={<SearchLostResult />} />
        <Route path="/mypageentry" element={<MypageEntry />} />
        <Route
          path="/mypage"
          element={
            <RequireAuth>
              <MyPage />
            </RequireAuth>
          }
        />
        <Route
          path="/mypageedit"
          element={
            <RequireAuth>
              <MypageEdit />
            </RequireAuth>
          }
        />
        <Route
          path="/mypagedelete"
          element={
            <RequireAuth>
              <MypageDelete />
            </RequireAuth>
          }
        />
        <Route
          path="/notification"
          element={
            <RequireAuth>
              <Notification />
            </RequireAuth>
          }
        />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/credit" element={<Credit />} />
        <Route path="/postlist" element={<PostList />} />
        <Route path="/postdetail/:id" element={<PostDetail />} />
        <Route
          path="/createpost"
          element={
            <RequireAuth>
              <CreatePost />
            </RequireAuth>
          }
        />
        <Route
          path="/createpost/:id"
          element={
            <RequireAuth>
              <CreatePost />
            </RequireAuth>
          }
        />
        <Route path="/searchpost" element={<SearchPost />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
