import { logger } from '@/lib/utils/logger';

export interface AuthUser {
  id: string;
  email: string;
  nickname: string | null;
  state: string | null;
  city: string | null;
  keywords: string | null;
  avatarUrl: string | null;
}

interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface SignUpPayload {
  email: string;
  password: string;
  nickname: string;
  state?: string | null;
  city?: string | null;
}

const resolveApiBaseUrl = () => {
  const envValue = (
    import.meta.env.VITE_API_BASE_URL as string | undefined
  )?.replace(/\/$/, '');

  if (!envValue) {
    // Vercel 배포에서는 /api rewrite가 백엔드로 프록시하므로 동일 출처로 폴백
    logger.warn(
      'VITE_API_BASE_URL이 설정되지 않아 동일 출처 /api 로 폴백합니다.'
    );
    return typeof window !== 'undefined'
      ? `${window.location.origin}/api`
      : '/api';
  }

  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    envValue.startsWith('http://')
  ) {
    return `${window.location.origin}/api`;
  }
  return envValue;
};

export const API_BASE_URL = resolveApiBaseUrl();
const API_SECURITY_KEY = import.meta.env.VITE_API_SECURITY_KEY as
  | string
  | undefined;

const STORAGE_KEY = 'findit_auth';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

const readTokens = (): StoredTokens | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredTokens) : null;
  } catch {
    return null;
  }
};

const writeTokens = (tokens: StoredTokens) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
};

export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export const hasToken = () => !!readTokens()?.accessToken;
export const getAccessToken = () => readTokens()?.accessToken;

/** 공용 헤더 (X-API-KEY + 선택적 JSON + Bearer) */
export const buildHeaders = (opts?: {
  json?: boolean;
  auth?: boolean;
}): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (opts?.json) headers['Content-Type'] = 'application/json';
  if (API_SECURITY_KEY) headers['X-API-KEY'] = API_SECURITY_KEY;
  if (opts?.auth) {
    const token = readTokens()?.accessToken;
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

class AuthError extends Error {}

const parseResponse = async <T>(response: Response): Promise<T> => {
  let json: ApiResponse<T> | null = null;
  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    json = null;
  }
  if (!response.ok || !json || json.success === false) {
    throw new AuthError(json?.message || '요청을 처리하지 못했습니다.');
  }
  return json.data;
};

/** 액세스 토큰 만료 시 1회 재발급 후 재시도하는 인증 fetch */
export const authorizedFetch = async (
  path: string,
  init: RequestInit = {},
  retry = true
): Promise<Response> => {
  const doFetch = () =>
    fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...buildHeaders({ json: !!init.body, auth: true }),
        ...(init.headers as Record<string, string> | undefined)
      }
    });

  let response = await doFetch();
  if (response.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      response = await doFetch();
    }
  }
  return response;
};

// 동시에 여러 요청이 401을 받아도 리프레시는 단 한 번만 수행한다(토큰 회전 레이스 방지).
let refreshPromise: Promise<boolean> | null = null;

const performRefresh = async (): Promise<boolean> => {
  const tokens = readTokens();
  if (!tokens?.refreshToken) return false;
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: buildHeaders({ json: true }),
      body: JSON.stringify({ refreshToken: tokens.refreshToken })
    });
    const data = await parseResponse<AuthTokenResponse>(response);
    writeTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    });
    return true;
  } catch (error) {
    logger.warn('토큰 재발급 실패', error);
    clearTokens();
    onSessionExpired?.();
    return false;
  }
};

const tryRefresh = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

// 세션이 만료되어 토큰이 폐기될 때 호출되는 콜백(authStore가 등록).
let onSessionExpired: (() => void) | null = null;
export const setOnSessionExpired = (cb: (() => void) | null) => {
  onSessionExpired = cb;
};

export const login = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: buildHeaders({ json: true }),
    body: JSON.stringify({ email, password })
  });
  const data = await parseResponse<AuthTokenResponse>(response);
  writeTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.user;
};

export const signUp = async (payload: SignUpPayload): Promise<AuthUser> => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: buildHeaders({ json: true }),
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      nickname: payload.nickname,
      state: payload.state ?? null,
      city: payload.city ?? null
    })
  });
  const data = await parseResponse<AuthTokenResponse>(response);
  writeTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.user;
};

export const getMe = async (): Promise<AuthUser> => {
  const response = await authorizedFetch('/auth/me', { method: 'GET' });
  return parseResponse<AuthUser>(response);
};

export const logout = async (): Promise<void> => {
  try {
    await authorizedFetch('/auth/logout', { method: 'POST' }, false);
  } catch (error) {
    logger.warn('로그아웃 요청 실패(토큰은 폐기됨)', error);
  } finally {
    clearTokens();
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const response = await authorizedFetch('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword })
  });
  await parseResponse<null>(response);
};

export const deleteAccount = async (): Promise<void> => {
  const response = await authorizedFetch('/auth/me', { method: 'DELETE' });
  await parseResponse<null>(response);
  clearTokens();
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
    method: 'POST',
    headers: buildHeaders({ json: true }),
    body: JSON.stringify({ email })
  });
  await parseResponse<null>(response);
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: buildHeaders({ json: true }),
    body: JSON.stringify({ token, newPassword })
  });
  await parseResponse<null>(response);
};
