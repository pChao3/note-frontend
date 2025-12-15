// src/main.jsx (或 src/main.tsx)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // 导入根组件 App

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn'; // 导入中文语言包

// 扩展插件
dayjs.extend(relativeTime);

// 设置全局语言为简体中文
dayjs.locale('zh-cn');

// --- 样式导入 ---
// 1. 引入 Tailwind CSS 的主样式文件
// 这个文件必须包含 @tailwind base, @tailwind components, @tailwind utilities 指令
import './index.css';

// 2. 引入 Ant Design 的样式重置
// Ant Design v5+ 需要引入这个文件来重置样式
import 'antd/dist/reset.css';
// 如果您使用的是较旧的 Ant Design 版本 (v4 或更早)，可能是 import 'antd/dist/antd.css';

// 3. (可选) 引入全局上下文提供者，例如 Ant Design 的 ConfigProvider
// ConfigProvider 可用于定制主题、国际化等，这里暂时只做基本包裹。
import { ConfigProvider } from 'antd';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 使用 ConfigProvider 包裹应用，确保 Ant Design 组件能正确接收主题配置。
      这里可以定义全局主题颜色等。
    */}
    <ConfigProvider
      theme={{
        token: {
          // 自定义 Ant Design 主题色，匹配 Tailwind 风格
          colorPrimary: '#4f46e5', // 匹配 Tailwind 的 indigo-600
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
