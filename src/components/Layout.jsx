import React, { useEffect } from 'react';
import Sidebar from './SideBar.jsx';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import useThemeStore from '../store/useThemeStore.js';

export default function Layout() {
  const navigate = useNavigate();
  const isLogin = useAuthStore(state => state.isLogin);
  const theme = useThemeStore(state => state.theme);
  console.log(isLogin, theme);
  if (!isLogin) {
    navigate('/login');
  }

  // 侧边栏布局
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* 侧边栏固定宽度 */}
      <div className={`w-60 flex-shrink-0 `}>
        <Sidebar />
      </div>

      {/* 主内容区域，占据剩余空间并可滚动 */}
      <main className={`flex-1  p-8 ${theme} h-screen`}>
        <Outlet />
      </main>
    </div>
  );
}
