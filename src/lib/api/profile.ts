import { API_BASE_URL, authorizedFetch, buildHeaders } from '@/lib/api/auth';

export interface Profile {
  id: string;
  email: string | null;
  nickname: string | null;
  state: string | null;
  city: string | null;
  keywords: string | null;
  avatar_url: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface ProfileApi {
  id: string;
  email: string | null;
  nickname: string | null;
  state: string | null;
  city: string | null;
  keywords: string | null;
  avatarUrl: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const toProfile = (r: ProfileApi): Profile => ({
  id: r.id,
  email: r.email ?? null,
  nickname: r.nickname ?? null,
  state: r.state ?? null,
  city: r.city ?? null,
  keywords: r.keywords ?? null,
  avatar_url: r.avatarUrl ?? null,
  created_at: r.createdAt ?? null,
  updated_at: r.updatedAt ?? null
});

const toUpsertBody = (payload: Partial<Omit<Profile, 'id'>>) => ({
  email: payload.email,
  nickname: payload.nickname,
  state: payload.state,
  city: payload.city,
  keywords: payload.keywords,
  avatarUrl: payload.avatar_url
});

export const fetchProfileById = async (id: string): Promise<Profile | null> => {
  const response = await authorizedFetch(`/profiles/${id}`, { method: 'GET' });
  if (!response.ok) {
    return null;
  }
  const json = (await response.json()) as ApiResponse<ProfileApi | null>;
  if (!json.success || !json.data) return null;
  return toProfile(json.data);
};

export const fetchProfileByNickname = async (
  nickname: string
): Promise<Profile[]> => {
  const response = await fetch(
    `${API_BASE_URL}/profiles?nickname=${encodeURIComponent(nickname)}`,
    { headers: buildHeaders({ auth: true }) }
  );
  if (!response.ok) return [];
  const json = (await response.json()) as ApiResponse<ProfileApi[] | ProfileApi | null>;
  if (!json.success || !json.data) return [];
  const list = Array.isArray(json.data) ? json.data : [json.data];
  return list.map(toProfile);
};

export const upsertProfile = async (
  _id: string,
  payload: Partial<Omit<Profile, 'id'>>
): Promise<void> => {
  const response = await authorizedFetch('/profiles', {
    method: 'POST',
    body: JSON.stringify(toUpsertBody(payload))
  });
  if (!response.ok) {
    throw new Error('프로필 저장에 실패했습니다.');
  }
};

export const updateProfile = async (
  id: string,
  payload: Partial<Omit<Profile, 'id'>>
): Promise<void> => {
  const response = await authorizedFetch(`/profiles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(toUpsertBody(payload))
  });
  if (!response.ok) {
    throw new Error('프로필 수정에 실패했습니다.');
  }
};
