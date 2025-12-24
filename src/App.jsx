import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 导入组件
import Layout from './components/Layout.jsx';
import Login from './pages/Login'; // 假设 Login 已经移动到 pages 目录
import Dashboard from './pages/Dashboard';
import Timeline from './pages/Timeline';
import CalendarView from './pages/CalendarPage.jsx';
import Settings from './pages/Setting.jsx';
import EditorPage from './pages/EditorPage';
import { useAuthStore } from './store/authStore.js';

// 路由保护组件
const ProtectedRoute = ({ element }) => {
  const isLogin = useAuthStore(state => state.isLogin);
  return isLogin ? element : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 欢迎/登录页 (不需要 Layout 框架) */}
        <Route path="/login" element={<Login />} />

        {/* 主应用框架 */}
        <Route element={<Layout />}>
          {/* 默认跳转到仪表盘 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 保护路由 */}
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/timeline" element={<ProtectedRoute element={<Timeline />} />} />
          <Route path="/calendar" element={<ProtectedRoute element={<CalendarView />} />} />
          <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
          <Route path="/editor" element={<ProtectedRoute element={<EditorPage />} />} />
        </Route>

        {/* 404 页面 */}
        <Route
          path="*"
          element={<div className="text-center text-4xl mt-20">404 - 页面未找到</div>}
        />
      </Routes>
    </Router>
  );
}
