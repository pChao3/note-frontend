import React from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

import App from '../App.jsx';
import useThemeStore from '../store/useThemeStore.js';

/**
 * Top-level wrapper that keeps Ant Design's theme algorithm in sync with
 * our app-wide light/dark toggle. Kept in its own file so `main.jsx` stays
 * a pure entrypoint (required for Vite's fast-refresh).
 */
export default function ThemedApp() {
  const mode = useThemeStore(s => s.theme);
  return (
    <ConfigProvider
      theme={{
        algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { colorPrimary: '#4f46e5' },
      }}
    >
      <App />
    </ConfigProvider>
  );
}
