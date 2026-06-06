import PostDetailBody from '@/widgets/community/ui/PostDetailBody';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';

const PostDetail = () => {
  useHeaderConfig(
    () => ({
      isShowPrev: true,
      children: '게시글',
      empty: true
    }),
    []
  );

  return (
    <div className="min-h-nav-safe w-full bg-white">
      <PostDetailBody />
    </div>
  );
};

export default PostDetail;
