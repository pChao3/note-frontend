import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import Pages from 'vite-plugin-pages';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    Pages({
      dirs: 'src/pages', // 扫描 pages 目录
      exclude: ['**/components/*.jsx'],
      routeStyle: 'remix', // /about 对应 About.tsx，/ 对应 Index.tsx
    }),
  ],
});
