import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, ListChecks, Settings, PenLine, Sun, Moon } from 'lucide-react';

const navItems = [
  { name: '仪表盘', icon: LayoutDashboard, path: '/dashboard' },
  { name: '日记列表', icon: ListChecks, path: '/timeline' },
  { name: '日历视图', icon: Calendar, path: '/calendar' },
  { name: '设置', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = React.useState(false); // 模拟主题切换

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    // 实际项目中需要在这里添加 Tailwind CSS/HTML class 切换逻辑
  };

  return (
    <div className="fixed w-60 h-full bg-white shadow-2xl p-4 flex flex-col justify-between border-r border-gray-100 dark:bg-gray-900 dark:border-gray-700">
      {/* 顶部：Logo 和 Slogan */}
      <div>
        <div className="flex items-center space-x-2 p-2 mb-8 border-b pb-4">
          <PenLine className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl font-extrabold text-gray-800 dark:text-white tracking-wider">
            日记本
          </h1>
        </div>

        {/* 导航链接 */}
        <nav className="space-y-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
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

      {/* 底部：快捷入口和主题切换 */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between p-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <span className="font-medium">主题切换</span>
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>

        {/* 快捷写日记按钮 */}
        <Link
          to="/editor"
          className="mt-3 w-full flex items-center justify-center p-3 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors font-semibold shadow-md"
        >
          <PenLine className="w-5 h-5 mr-2" />
          写日记
        </Link>
      </div>
    </div>
  );
}
