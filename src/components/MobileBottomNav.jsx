import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListChecks, PenLine, Calendar, Settings } from 'lucide-react';

const items = [
  { name: '仪表盘', icon: LayoutDashboard, path: '/dashboard' },
  { name: '日记', icon: ListChecks, path: '/timeline' },
  { name: '写作', icon: PenLine, path: '/editor', primary: true },
  { name: '日历', icon: Calendar, path: '/calendar' },
  { name: '我的', icon: Settings, path: '/settings' },
];

/**
 * Persistent bottom navigation for phone-sized viewports.
 * Hidden on lg+ screens where the sidebar handles navigation.
 */
export default function MobileBottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 safe-pb"
      aria-label="底部导航"
    >
      <ul className="grid grid-cols-5 h-16">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <li key={item.path} className="flex">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] tap-feedback ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`
                }
              >
                {({ isActive }) =>
                  item.primary ? (
                    <span className="-mt-5 flex flex-col items-center">
                      <span
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'bg-indigo-500 text-white'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </span>
                      <span className="mt-1">{item.name}</span>
                    </span>
                  ) : (
                    <>
                      <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                      <span>{item.name}</span>
                    </>
                  )
                }
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
