import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSession } from '../services/travelApi';

interface UserState {
  user: UserSession | null;
  isAuthenticated: boolean;
  redirectAfterLogin: string | null;
  login: (user: UserSession) => void;
  logout: () => void;
  setRedirectAfterLogin: (path: string | null) => void;
  updateProfile: (payload: Partial<UserSession>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      redirectAfterLogin: null,
      login: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          redirectAfterLogin: null,
        }),
      setRedirectAfterLogin: (path) =>
        set({
          redirectAfterLogin: path,
        }),
      updateProfile: (payload) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...payload } : state.user,
        })),
    }),
    {
      name: 'user-storage',
    },
  ),
);
