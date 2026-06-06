import { AllData } from '@/types/types';
import { API_BASE_URL, buildHeaders } from '@/lib/api/auth';

const DEFAULT_IMAGE =
  'https://www.lost112.go.kr/lostnfs/images/sub/img02_no_img.gif';

export interface GetFoundItemsResponse {
  success: boolean;
  message?: string;
  data: Array<
    {
      atcId: string;
      depPlace: string;
      fdFilePathImg?: string;
      fdPrdtNm: string;
      fdSbjt?: string;
      fdSn?: string;
      fdYmd: string;
      prdtClNm: string;
    } & Record<string, unknown>
  >;
}

export const getFoundItems = async (
  page: number = 0,
  size: number = 10
): Promise<AllData[]> => {
  const response = await fetch(
    `${API_BASE_URL}/found-items?page=${page}&size=${size}`,
    { headers: buildHeaders() }
  );

  if (!response.ok) {
    throw new Error('습득물 목록을 불러오지 못했습니다.');
  }

  const json = (await response.json()) as GetFoundItemsResponse;

  if (!json.success || !Array.isArray(json.data)) {
    throw new Error(json.message || '습득물 데이터 형식이 올바르지 않습니다.');
  }

  return json.data.map((item) => ({
    atcId: item.atcId,
    depPlace: item.depPlace,
    fdFilePathImg:
      item.fdFilePathImg && item.fdFilePathImg !== ''
        ? item.fdFilePathImg
        : DEFAULT_IMAGE,
    fdPrdtNm: item.fdPrdtNm,
    fdSbjt: item.fdSbjt ?? '',
    fdSn: item.fdSn ?? '',
    fdYmd: item.fdYmd,
    prdtClNm: item.prdtClNm,
    rnum: '',
    lstYmd: '',
    lstPlace: '',
    lstPrdtNm: ''
  }));
};
