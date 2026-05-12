import React from 'react';
import ReactDOM from 'react-dom/client';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// Tailwind + Ant Design resets
import './index.css';
import 'antd/dist/reset.css';

import ThemedApp from './components/ThemedApp.jsx';

// Initialize theme before React renders to avoid a flash of the wrong palette.
// Zustand persists under the key `user-theme` with shape {state:{theme}}.
// Default to light.
(() => {
  let initialTheme = 'light';
  try {
    const raw = localStorage.getItem('user-theme');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.theme === 'dark') initialTheme = 'dark';
    }
  } catch {
    /* ignore; fall back to light */
  }
  document.documentElement.classList.toggle('dark', initialTheme === 'dark');
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemedApp />
  </React.StrictMode>
);
