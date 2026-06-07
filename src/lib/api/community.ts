import { API_BASE_URL, authorizedFetch, buildHeaders } from '@/lib/api/auth';

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  tag: string | null;
  author_id: string | null;
  author_nickname: string | null;
  image_urls: string[];
  like_count: number;
  liked: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CommunityPage {
  items: CommunityPost[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// 커뮤니티 전체(조회/작성)를 Spring 백엔드 /api/community 사용. 작성은 JWT 인증 필요.

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

interface CommunityPostApi {
  id: string;
  title: string;
  content: string;
  tag: string | null;
  authorId: string | null;
  authorNickname: string | null;
  imageUrls?: string[] | null;
  likeCount?: number | null;
  liked?: boolean | null;
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
  image_urls: r.imageUrls ?? [],
  like_count: r.likeCount ?? 0,
  liked: r.liked ?? false,
  created_at: r.createdAt,
  updated_at: r.updatedAt ?? undefined
});

/** 페이지네이션 목록. tag 가 '전체'/빈값이면 전체 조회. */
export const fetchCommunityPage = async (
  page: number,
  size: number,
  tag?: string
): Promise<CommunityPage> => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size)
  });
  if (tag && tag !== '전체') params.set('tag', tag);
  const response = await fetch(`${API_BASE_URL}/community?${params.toString()}`, {
    headers: buildHeaders()
  });
  if (!response.ok) {
    throw new Error('게시글을 불러오지 못했습니다.');
  }
  const json = (await response.json()) as ApiResponse<CommunityPostApi[]>;
  return {
    items: Array.isArray(json.data) ? json.data.map(toPost) : [],
    page: json.page ?? page,
    size: json.size ?? size,
    totalElements: json.totalElements ?? 0,
    totalPages: json.totalPages ?? 0
  };
};

/** 커뮤니티 이미지 업로드 → 공개 URL. (multipart 이므로 Content-Type 미지정) */
export const uploadCommunityImage = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(`${API_BASE_URL}/uploads/image`, {
    method: 'POST',
    headers: buildHeaders({ auth: true }), // X-API-KEY + Bearer, Content-Type 은 브라우저가 설정
    body: form
  });
  if (!response.ok) {
    throw new Error('이미지 업로드에 실패했습니다.');
  }
  const json = (await response.json()) as ApiResponse<{ url: string }>;
  return json.data.url;
};

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
    image_urls?: string[];
  }
) => {
  // authorId는 서버가 JWT(@AuthenticationPrincipal)에서 결정한다.
  const response = await authorizedFetch('/community', {
    method: 'POST',
    body: JSON.stringify({
      title: payload.title,
      content: payload.content,
      tag: payload.tag,
      authorNickname: payload.author_nickname,
      imageUrls: payload.image_urls ?? []
    })
  });
  if (!response.ok) {
    throw new Error('게시글 등록에 실패했습니다.');
  }
};

/** 게시글 수정(작성자 본인만). 서버가 JWT 로 소유권 검사. */
export const updateCommunityPost = async (
  id: string,
  payload: Pick<CommunityPost, 'title' | 'content' | 'tag'> & {
    image_urls?: string[];
  }
) => {
  const response = await authorizedFetch(`/community/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: payload.title,
      content: payload.content,
      tag: payload.tag,
      imageUrls: payload.image_urls ?? []
    })
  });
  if (!response.ok) {
    throw new Error('게시글 수정에 실패했습니다.');
  }
};

/** 게시글 삭제(작성자 본인만). */
export const deleteCommunityPost = async (id: string) => {
  const response = await authorizedFetch(`/community/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('게시글 삭제에 실패했습니다.');
  }
};

export interface CommunityComment {
  id: string;
  post_id: string;
  content: string;
  author_id: string | null;
  author_nickname: string | null;
  created_at: string;
  updated_at?: string;
}

interface CommunityCommentApi {
  id: string;
  postId: string;
  content: string;
  authorId: string | null;
  authorNickname: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

const toComment = (r: CommunityCommentApi): CommunityComment => ({
  id: r.id,
  post_id: r.postId,
  content: r.content,
  author_id: r.authorId ?? null,
  author_nickname: r.authorNickname ?? null,
  created_at: r.createdAt,
  updated_at: r.updatedAt ?? undefined
});

/** 댓글 목록(공개). */
export const fetchComments = async (
  postId: string
): Promise<CommunityComment[]> => {
  const response = await fetch(`${API_BASE_URL}/community/${postId}/comments`, {
    headers: buildHeaders()
  });
  if (!response.ok) {
    throw new Error('댓글을 불러오지 못했습니다.');
  }
  const json = (await response.json()) as ApiResponse<CommunityCommentApi[]>;
  if (!json.success || !Array.isArray(json.data)) {
    return [];
  }
  return json.data.map(toComment);
};

/** 댓글 작성(인증). */
export const createComment = async (
  postId: string,
  content: string,
  authorNickname: string
): Promise<CommunityComment> => {
  const response = await authorizedFetch(`/community/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, authorNickname })
  });
  if (!response.ok) {
    throw new Error('댓글 등록에 실패했습니다.');
  }
  const json = (await response.json()) as ApiResponse<CommunityCommentApi>;
  return toComment(json.data);
};

/** 댓글 삭제(작성자 본인만). */
export const deleteComment = async (commentId: string) => {
  const response = await authorizedFetch(`/community/comments/${commentId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('댓글 삭제에 실패했습니다.');
  }
};

export interface MyComment {
  id: string;
  post_id: string;
  post_title: string;
  content: string;
  created_at: string;
}

/** 내가 쓴 글(작성자별 페이지). 인증 필요. */
export const fetchMyPosts = async (
  page: number,
  size: number
): Promise<CommunityPage> => {
  const response = await authorizedFetch(
    `/community/me/posts?page=${page}&size=${size}`,
    { method: 'GET' }
  );
  if (!response.ok) {
    throw new Error('내 글을 불러오지 못했습니다.');
  }
  const json = (await response.json()) as ApiResponse<CommunityPostApi[]>;
  return {
    items: Array.isArray(json.data) ? json.data.map(toPost) : [],
    page: json.page ?? page,
    size: json.size ?? size,
    totalElements: json.totalElements ?? 0,
    totalPages: json.totalPages ?? 0
  };
};

interface MyCommentApi {
  id: string;
  postId: string;
  postTitle: string;
  content: string;
  createdAt: string;
}

/** 내가 쓴 댓글(최신순, 원문 제목 포함). 인증 필요. */
export const fetchMyComments = async (): Promise<MyComment[]> => {
  const response = await authorizedFetch('/community/me/comments', {
    method: 'GET'
  });
  if (!response.ok) {
    throw new Error('내 댓글을 불러오지 못했습니다.');
  }
  const json = (await response.json()) as ApiResponse<MyCommentApi[]>;
  if (!json.success || !Array.isArray(json.data)) return [];
  return json.data.map((r) => ({
    id: r.id,
    post_id: r.postId,
    post_title: r.postTitle,
    content: r.content,
    created_at: r.createdAt
  }));
};

/** 좋아요(공감). 인증 필요. 반환: 갱신된 상태/개수. */
export const likePost = async (
  postId: string
): Promise<{ liked: boolean; likeCount: number }> => {
  const res = await authorizedFetch(`/community/${postId}/likes`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('좋아요에 실패했습니다.');
  const json = (await res.json()) as ApiResponse<{ liked: boolean; likeCount: number }>;
  return { liked: json.data.liked, likeCount: json.data.likeCount };
};

/** 좋아요 취소. 인증 필요. */
export const unlikePost = async (
  postId: string
): Promise<{ liked: boolean; likeCount: number }> => {
  const res = await authorizedFetch(`/community/${postId}/likes`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('좋아요 취소에 실패했습니다.');
  const json = (await res.json()) as ApiResponse<{ liked: boolean; likeCount: number }>;
  return { liked: json.data.liked, likeCount: json.data.likeCount };
};
