import { DetailData } from '@/types/types';
import { logger } from '@/lib/utils/logger';
import { API_BASE_URL, buildHeaders } from '@/lib/api/auth';

const DEFAULT_IMAGE =
  'https://www.lost112.go.kr/lostnfs/images/sub/img02_no_img.gif';

interface FoundItemDetailResponse {
  success: boolean;
  message?: string;
  data?:
    | {
        atcId?: string;
        fdPrdtNm?: string;
        prdtClNm?: string;
        depPlace?: string;
        fdPlace?: string;
        fdYmd?: string;
        fdSbjt?: string;
        fdFilePathImg?: string;
        fndKeepOrgnSeNm?: string;
        tel?: string;
      }
    | null;
}

/** 습득물 상세 (Spring 백엔드 /api/found-items/{id}) */
export const getSearchId = async (id: string): Promise<DetailData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/found-items/${id}`, {
      headers: buildHeaders()
    });
    if (!response.ok) {
      throw new Error('네트워크 응답 없음');
    }

    const json = (await response.json()) as FoundItemDetailResponse;
    if (!json.success || !json.data) {
      throw new Error(json.message || '습득물 상세 정보를 불러오지 못했습니다.');
    }

    const item = json.data;
    const detailData: DetailData = {
      id: item.atcId ?? '',
      item_name: item.fdPrdtNm ?? '',
      image:
        item.fdFilePathImg && item.fdFilePathImg !== ''
          ? item.fdFilePathImg
          : DEFAULT_IMAGE,
      place: item.fdPlace ?? item.depPlace ?? '',
      date: item.fdYmd ?? '',
      item_type: item.prdtClNm ?? '',
      description: item.fdSbjt ?? item.fndKeepOrgnSeNm ?? '',
      storage: item.depPlace ?? '',
      contact: item.tel ?? ''
    };
    return detailData;
  } catch (error) {
    logger.error('getSearchId 요청 실패', error);
    return null;
  }
};
