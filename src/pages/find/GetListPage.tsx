import { useSearchParams } from 'react-router-dom';
import ItemListView from '@/widgets/item-list/ui/ItemListView';
import { useFoundItemsInfinite } from '@/entities/found/model/useFoundItemsInfinite';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';

const GetList = () => {
  const [params] = useSearchParams();
  const category = params.get('category');

  const query = useFoundItemsInfinite({
    query: { staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 30 }
  });

  useHeaderConfig(
    () => ({ children: '습득물', isShowSearch: true, link: '/searchfind' }),
    []
  );

  return (
    <ItemListView
      itemType="get"
      title="습득물"
      searchLink="/searchfind"
      searchPlaceholder="습득물 검색"
      scrollKey="getlist"
      emptyTitle="등록된 습득물이 없습니다."
      emptyDescription="새로운 습득물 정보를 기다리고 있어요."
      initialCategory={category}
      query={query}
    />
  );
};

export default GetList;
