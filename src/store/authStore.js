import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// 创建 Auth Store
export const useAuthStore = create(
  persist(
    set => ({
      isLogin: false,
      // Action：登录操作
      login: () => {
        set({ isLogin: true });
      },
      // Action：登出操作
      logout: () => {
        set({ isLogin: false });
      },
    }),
    { name: 'user-info' }
  )
);
