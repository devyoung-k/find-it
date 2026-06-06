import { create } from 'zustand';
import * as authApi from '@/lib/api/auth';
import { setOnSessionExpired } from '@/lib/api/auth';
import type { AuthUser, SignUpPayload } from '@/lib/api/auth';
import { logger } from '@/lib/utils/logger';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest';

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignUpPayload) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  patchUser: (partial: Partial<AuthUser>) => void;
  refreshMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',

  init: async () => {
    if (!authApi.hasToken()) {
      set({ user: null, status: 'guest' });
      return;
    }
    set({ status: 'loading' });
    try {
      const user = await authApi.getMe();
      set({ user, status: 'authenticated' });
    } catch (error) {
      logger.warn('세션 복원 실패', error);
      authApi.clearTokens();
      set({ user: null, status: 'guest' });
    }
  },

  login: async (email, password) => {
    set({ status: 'loading' });
    try {
      const user = await authApi.login(email, password);
      set({ user, status: 'authenticated' });
    } catch (error) {
      set({ user: null, status: 'guest' });
      throw error;
    }
  },

  signup: async (payload) => {
    set({ status: 'loading' });
    try {
      const user = await authApi.signUp(payload);
      set({ user, status: 'authenticated' });
    } catch (error) {
      set({ user: null, status: 'guest' });
      throw error;
    }
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, status: 'guest' });
  },

  setUser: (user) => set({ user, status: 'authenticated' }),

  patchUser: (partial) => {
    const current = get().user;
    if (current) set({ user: { ...current, ...partial } });
  },

  refreshMe: async () => {
    try {
      const user = await authApi.getMe();
      set({ user, status: 'authenticated' });
    } catch (error) {
      logger.warn('내 정보 새로고침 실패', error);
    }
  }
}));

// 세션 만료(리프레시 실패)로 토큰이 폐기되면 스토어도 게스트로 즉시 초기화
setOnSessionExpired(() => {
  useAuthStore.setState({ user: null, status: 'guest' });
});
