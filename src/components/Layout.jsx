import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import Sidebar from './SideBar.jsx';
import MobileBottomNav from './MobileBottomNav.jsx';
import { useAuthStore } from '../store/authStore.js';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = useAuthStore(state => state.isLogin);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Side-effect-based redirect (no state update during render)
  useEffect(() => {
    if (!isLogin) navigate('/login', { replace: true });
  }, [isLogin, navigate]);

  // Close drawer on route change via browser back/forward
  useEffect(() => {
    const handler = () => setMobileMenuOpen(false);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileMenuOpen]);

  // Close drawer on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const onKey = e => e.key === 'Escape' && setMobileMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const pageTitle = titleFromPath(location.pathname);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Mobile top bar */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 flex items-center px-3 shadow-sm safe-pt"
        style={{ paddingLeft: 'max(0.75rem, var(--safe-left))', paddingRight: 'max(0.75rem, var(--safe-right))' }}
      >
        <div className="h-14 w-full flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="打开菜单"
            className="tap-feedback p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-2 text-base font-bold text-gray-800 dark:text-white truncate">
            {pageTitle}
          </span>
        </div>
      </header>

      {/* Desktop sidebar (fixed) */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-60 flex-shrink-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-200 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          className={`relative w-72 max-w-[80vw] h-full bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-250 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="关闭菜单"
            className="tap-feedback absolute top-3 right-3 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <Sidebar onClose={() => setMobileMenuOpen(false)} />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen pb-[calc(4rem+var(--safe-bottom))] lg:pb-0">
        <div
          className="p-4 sm:p-6 lg:p-8"
          style={{
            paddingLeft: 'max(1rem, var(--safe-left))',
            paddingRight: 'max(1rem, var(--safe-right))',
          }}
        >
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}

function titleFromPath(pathname) {
  if (pathname.startsWith('/dashboard')) return '仪表盘';
  if (pathname.startsWith('/timeline')) return '日记列表';
  if (pathname.startsWith('/calendar')) return '日历视图';
  if (pathname.startsWith('/chat')) return 'RAG Chat';
  if (pathname.startsWith('/settings')) return '设置';
  if (pathname.startsWith('/editor')) return '写日记';
  return 'Notes';
}
