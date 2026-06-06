import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ItemDetail from '@/entities/item/ui/ItemDetail';
import { getSearchId } from '@/lib/utils/getAPIData';
import useDetailDataStore from '@/entities/item/model/useDetailDataStore';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';

const GetDetail = () => {
  const setDetail = useDetailDataStore((state) => state.setDetail);
  const detail = useDetailDataStore((state) => state.detail);
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    if (!id) return;
    setDetail(null);
    const searchId = async () => {
      const data = await getSearchId(id);
      setDetail(data);
    };

    searchId();
  }, [id, setDetail]);

  useHeaderConfig(
    () => ({
      children: '습득물 상세정보',
      isShowPrev: true,
      empty: true
    }),
    []
  );

  return (
    <div className="w-full">
      {detail ? (
        <ItemDetail detail={detail} kind="get" />
      ) : (
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-400">
          불러오는 중...
        </div>
      )}
    </div>
  );
};

export default GetDetail;
