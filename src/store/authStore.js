import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth store.
 * We persist `isLogin` in localStorage (via zustand/persist) and keep the
 * raw token in sessionStorage so it still clears on browser close. The login
 * action hydrates both in one step to keep the two in sync.
 */
export const useAuthStore = create(
  persist(
    set => ({
      isLogin: false,
      login: token => {
        if (token) sessionStorage.setItem('token', token);
        set({ isLogin: !!token });
      },
      logout: () => {
        sessionStorage.removeItem('token');
        set({ isLogin: false });
      },
    }),
    {
      name: 'user-info',
      // Re-check token on hydration: if the tab was fully closed,
      // sessionStorage is gone but `isLogin` might still be true — fix that.
      onRehydrateStorage: () => state => {
        if (state && state.isLogin && !sessionStorage.getItem('token')) {
          state.isLogin = false;
        }
      },
    }
  )
);
