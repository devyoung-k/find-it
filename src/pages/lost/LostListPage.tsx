import { useSearchParams } from 'react-router-dom';
import ItemListView from '@/widgets/item-list/ui/ItemListView';
import { useLostItemsInfinite } from '@/entities/lost/model/useLostItemsInfinite';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';

const LostList = () => {
  const [params] = useSearchParams();
  const category = params.get('category');

  const query = useLostItemsInfinite({
    query: { staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 30 }
  });

  useHeaderConfig(
    () => ({ children: '분실물', isShowSearch: true, link: '/searchlost' }),
    []
  );

  return (
    <ItemListView
      itemType="lost"
      title="분실물"
      searchLink="/searchlost"
      searchPlaceholder="분실물 검색"
      scrollKey="lostlist"
      emptyTitle="등록된 분실물이 없습니다."
      emptyDescription="새로운 분실물 신고를 기다리고 있어요."
      initialCategory={category}
      query={query}
    />
  );
};

export default LostList;
