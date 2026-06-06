import { API_BASE_URL, authorizedFetch, buildHeaders } from '@/lib/api/auth';

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  tag: string | null;
  author_id: string | null;
  author_nickname: string | null;
  created_at: string;
  updated_at?: string;
}

// 커뮤니티 전체(조회/작성)를 Spring 백엔드 /api/community 사용. 작성은 JWT 인증 필요.

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface CommunityPostApi {
  id: string;
  title: string;
  content: string;
  tag: string | null;
  authorId: string | null;
  authorNickname: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

const toPost = (r: CommunityPostApi): CommunityPost => ({
  id: r.id,
  title: r.title,
  content: r.content,
  tag: r.tag ?? null,
  author_id: r.authorId ?? null,
  author_nickname: r.authorNickname ?? null,
  created_at: r.createdAt,
  updated_at: r.updatedAt ?? undefined
});

export const fetchRecentCommunityPosts = async (
  limit: number = 10
): Promise<CommunityPost[]> => {
  const response = await fetch(
    `${API_BASE_URL}/community/recent?limit=${limit}`,
    { headers: buildHeaders() }
  );
  if (!response.ok) {
    throw new Error('게시글을 불러오지 못했습니다.');
  }
  const json = (await response.json()) as ApiResponse<CommunityPostApi[]>;
  if (!json.success || !Array.isArray(json.data)) {
    return [];
  }
  return json.data.map(toPost);
};

export const searchCommunityPosts = async (
  keyword: string
): Promise<CommunityPost[]> => {
  const sanitized = keyword.trim();
  if (!sanitized) return [];
  const response = await fetch(
    `${API_BASE_URL}/community/search?keyword=${encodeURIComponent(
      sanitized
    )}&limit=50`,
    { headers: buildHeaders() }
  );
  if (!response.ok) {
    throw new Error('게시글 검색에 실패했습니다.');
  }
  const json = (await response.json()) as ApiResponse<CommunityPostApi[]>;
  if (!json.success || !Array.isArray(json.data)) {
    return [];
  }
  return json.data.map(toPost);
};

export const fetchCommunityPostById = async (
  id: string
): Promise<CommunityPost | null> => {
  const response = await fetch(`${API_BASE_URL}/community/${id}`, {
    headers: buildHeaders()
  });
  if (!response.ok) {
    return null;
  }
  const json = (await response.json()) as ApiResponse<CommunityPostApi | null>;
  if (!json.success || !json.data) {
    return null;
  }
  return toPost(json.data);
};

export const createCommunityPost = async (
  payload: Pick<CommunityPost, 'title' | 'content' | 'tag'> & {
    author_id?: string;
    author_nickname: string;
  }
) => {
  // authorId는 서버가 JWT(@AuthenticationPrincipal)에서 결정한다.
  const response = await authorizedFetch('/community', {
    method: 'POST',
    body: JSON.stringify({
      title: payload.title,
      content: payload.content,
      tag: payload.tag,
      authorNickname: payload.author_nickname
    })
  });
  if (!response.ok) {
    throw new Error('게시글 등록에 실패했습니다.');
  }
};
