import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, ListChecks, Settings, PenLine, Sun, Moon } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';

const navItems = [
  { name: '仪表盘', icon: LayoutDashboard, path: '/dashboard' },
  { name: '日记列表', icon: ListChecks, path: '/timeline' },
  { name: '日历视图', icon: Calendar, path: '/calendar' },
  { name: 'RAG Chat', icon: Settings, path: '/chat' },
  { name: '设置', icon: Settings, path: '/settings' },
];

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  const mode = useThemeStore(state => state.theme);

  const handleNav = () => {
    onClose?.();
  };

  return (
    <div
      className={`w-full lg:w-60 h-full bg-white shadow-2xl p-4 flex flex-col justify-between border-r border-gray-100 dark:bg-gray-900 dark:border-gray-700 ${mode}`}
    >
      {/* Logo and Slogan */}
      <div>
        <div className="flex items-center space-x-2 p-2 mb-6 border-b pb-4">
          <PenLine className="w-8 h-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <h1 className="text-xl font-extrabold text-gray-800 dark:text-white tracking-wider mb-0!">
            Notes
          </h1>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={handleNav}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 font-semibold dark:bg-indigo-800 dark:text-white'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-300'
                      : 'text-gray-400 group-hover:text-indigo-500'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Theme toggle + Write Note */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <span className="font-medium">主题切换</span>
          {mode === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>

        <Link
          to="/editor"
          onClick={handleNav}
          className="mt-3 w-full flex items-center justify-center p-3 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors font-semibold shadow-md"
        >
          <PenLine className="w-5 h-5 mr-2" />
          写日记
        </Link>
      </div>
    </div>
  );
}
