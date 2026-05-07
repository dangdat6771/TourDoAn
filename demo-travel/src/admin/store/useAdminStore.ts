import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminUser } from '../types';

interface AdminState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (user: AdminUser) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => {
        if (user.token) {
          localStorage.setItem('token', user.token);
        }
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'admin-storage',
    }
  )
);
