import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';

import Layout from './components/Layout.jsx';
import { useAuthStore } from './store/authStore.js';

// Lazy-load pages to keep the first paint (especially on mobile) snappy.
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Timeline = lazy(() => import('./pages/Timeline'));
const CalendarView = lazy(() => import('./pages/CalendarPage.jsx'));
const Settings = lazy(() => import('./pages/Setting.jsx'));
const EditorPage = lazy(() => import('./pages/EditorPage'));
const Chat = lazy(() => import('./pages/Chat.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

const ProtectedRoute = ({ element }) => {
  const isLogin = useAuthStore(state => state.isLogin);
  return isLogin ? element : <Navigate to="/login" replace />;
};

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Spin size="large" />
  </div>
);

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route path="/timeline" element={<ProtectedRoute element={<Timeline />} />} />
            <Route path="/calendar" element={<ProtectedRoute element={<CalendarView />} />} />
            <Route path="/chat" element={<ProtectedRoute element={<Chat />} />} />
            <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
            <Route path="/editor" element={<ProtectedRoute element={<EditorPage />} />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
