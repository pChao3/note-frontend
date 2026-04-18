import React, { useState } from 'react';
import Sidebar from './SideBar.jsx';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import useThemeStore from '../store/useThemeStore.js';
import { Menu, X } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const isLogin = useAuthStore(state => state.isLogin);
  const theme = useThemeStore(state => state.theme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isLogin) {
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 shadow-sm">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-3 text-lg font-bold text-gray-800 dark:text-white">Notes</span>
      </header>

      {/* Desktop sidebar - fixed position */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-60 flex-shrink-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay + drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 h-full bg-white dark:bg-gray-900 shadow-2xl">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
