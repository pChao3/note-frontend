// src/routes.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// 自动导入所有 pages 下的页面（推荐魔法写法，零维护）
const modules = import.meta.glob('./pages/**/*.jsx', { eager: true });

const routes = Object.keys(modules)
  .map(path => {
    const name = path.match(/\.\/pages\/(.*)\.jsx$/)[1];
    console.log('name', name);
    // Index 改成 /，_layout 忽略，NotFound 特殊处理
    let routePath = name === 'Index' ? '/' : `/${name.toLowerCase()}`;
    if (name.includes('_layout')) return null;
    if (name === 'NotFound') return { path: '*', Component: modules[path].default };

    return {
      path: routePath,
      Component: modules[path].default,
    };
  })
  .filter(Boolean);

export const router = createBrowserRouter(routes);

export default function Routes() {
  return <RouterProvider router={router} />;
}
