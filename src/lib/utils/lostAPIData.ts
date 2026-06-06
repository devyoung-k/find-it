import { DetailData } from '@/types/types';
import { logger } from '@/lib/utils/logger';
import { API_BASE_URL, buildHeaders } from '@/lib/api/auth';

const DEFAULT_IMAGE =
  'https://www.lost112.go.kr/lostnfs/images/sub/img02_no_img.gif';

interface LostItemDetailResponse {
  success: boolean;
  message?: string;
  data?:
    | {
        atcId?: string;
        prdtClNm?: string;
        lstPlace?: string;
        lstYmd?: string;
        lstPrdtNm?: string;
        lstSbjt?: string;
        lstFilePathImg?: string;
        rnum?: string;
      }
    | null;
}

/** 분실물 상세 (Spring 백엔드 /api/lost-items/{id}) */
export const lostSearchId = async (id: string): Promise<DetailData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/lost-items/${id}`, {
      headers: buildHeaders()
    });
    if (!response.ok) {
      throw new Error('네트워크 응답 없음');
    }

    const json = (await response.json()) as LostItemDetailResponse;
    if (!json.success || !json.data) {
      throw new Error(json.message || '분실물 상세 정보를 불러오지 못했습니다.');
    }

    const item = json.data;
    // 물품명이 없으면 분류명 소분류를 이름으로 사용
    const subName = item.prdtClNm?.includes('>')
      ? item.prdtClNm.split('>').pop()?.trim()
      : item.prdtClNm;

    const detailData: DetailData = {
      id: item.atcId ?? '',
      item_name: item.lstPrdtNm || subName || '이름 미상',
      image:
        item.lstFilePathImg && item.lstFilePathImg !== ''
          ? item.lstFilePathImg
          : DEFAULT_IMAGE,
      place: item.lstPlace ?? '',
      date: item.lstYmd ?? '',
      item_type: item.prdtClNm ?? '',
      description: item.lstSbjt ?? '',
      storage: '',
      contact: ''
    };
    return detailData;
  } catch (error) {
    logger.error('lostSearchId 요청 실패', error);
    return null;
  }
};
