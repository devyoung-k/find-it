import { AllData } from '@/types/types';
import { API_BASE_URL, buildHeaders } from '@/lib/api/auth';

const DEFAULT_IMAGE =
  'https://www.lost112.go.kr/lostnfs/images/sub/img02_no_img.gif';

interface ApiListResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
}

interface FoundItemDto {
  atcId: string;
  fdPrdtNm?: string;
  prdtClNm?: string;
  depPlace?: string;
  fdYmd?: string;
  fdSbjt?: string;
  fdSn?: string;
  fdFilePathImg?: string;
}

interface LostItemDto {
  atcId: string;
  prdtClNm?: string;
  lstPlace?: string;
  lstYmd?: string;
  lstPrdtNm?: string;
  rnum?: string;
}

/** 습득물 키워드 검색 (백엔드 /api/found-items/search) */
export const searchFoundItems = async (
  keyword: string,
  page = 0,
  size = 10
): Promise<AllData[]> => {
  const trimmed = keyword.trim();
  if (!trimmed) return [];

  const response = await fetch(
    `${API_BASE_URL}/found-items/search?keyword=${encodeURIComponent(
      trimmed
    )}&page=${page}&size=${size}`,
    { headers: buildHeaders() }
  );
  if (!response.ok) {
    throw new Error('습득물 검색에 실패했습니다.');
  }
  const json = (await response.json()) as ApiListResponse<FoundItemDto>;
  if (!json.success || !Array.isArray(json.data)) return [];

  return json.data.map((item) => ({
    atcId: item.atcId,
    depPlace: item.depPlace ?? '',
    fdFilePathImg:
      item.fdFilePathImg && item.fdFilePathImg !== ''
        ? item.fdFilePathImg
        : DEFAULT_IMAGE,
    fdPrdtNm: item.fdPrdtNm ?? '',
    fdSbjt: item.fdSbjt ?? '',
    fdSn: item.fdSn ?? '',
    fdYmd: item.fdYmd ?? '',
    prdtClNm: item.prdtClNm ?? '',
    rnum: '',
    lstYmd: '',
    lstPlace: '',
    lstPrdtNm: ''
  }));
};

/** 분실물 키워드 검색 (백엔드 /api/lost-items/search) */
export const searchLostItems = async (
  keyword: string,
  page = 0,
  size = 10
): Promise<AllData[]> => {
  const trimmed = keyword.trim();
  if (!trimmed) return [];

  const response = await fetch(
    `${API_BASE_URL}/lost-items/search?keyword=${encodeURIComponent(
      trimmed
    )}&page=${page}&size=${size}`,
    { headers: buildHeaders() }
  );
  if (!response.ok) {
    throw new Error('분실물 검색에 실패했습니다.');
  }
  const json = (await response.json()) as ApiListResponse<LostItemDto>;
  if (!json.success || !Array.isArray(json.data)) return [];

  return json.data.map((item) => {
    const subName = item.prdtClNm?.includes('>')
      ? item.prdtClNm.split('>').pop()?.trim()
      : item.prdtClNm;
    return {
      atcId: item.atcId,
      depPlace: '',
      fdFilePathImg: DEFAULT_IMAGE,
      fdPrdtNm: '',
      fdSbjt: '',
      fdSn: '',
      fdYmd: '',
      prdtClNm: item.prdtClNm ?? '',
      rnum: item.rnum ?? '',
      lstYmd: item.lstYmd ?? '',
      lstPlace: item.lstPlace ?? '',
      lstPrdtNm: item.lstPrdtNm || subName || '이름 미상'
    };
  });
};
