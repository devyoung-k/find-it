import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ItemDetail from '@/entities/item/ui/ItemDetail';
import useDetailDataStore from '@/entities/item/model/useDetailDataStore';
import { lostSearchId } from '@/lib/utils/lostAPIData';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';

const GetDetail = () => {
  const setDetail = useDetailDataStore((state) => state.setDetail);
  const detail = useDetailDataStore((state) => state.detail);
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    (async () => {
      if(!id) return;
        const data = await lostSearchId(id);

      setDetail(data ?? null);
    })();
  }, [id, setDetail]);

  useHeaderConfig(
    () => ({
      children: '분실물 상세정보',
      isShowPrev: true,
      empty: true
    }),
    []
  );

  return (
    <div className="w-full">
      {detail ? (
        <ItemDetail detail={detail} kind="lost" />
      ) : (
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-400">
          불러오는 중...
        </div>
      )}
    </div>
  );
};

export default GetDetail;
