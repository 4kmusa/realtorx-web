import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/erp': {
          target: 'http://192.168.52.241:8000',
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: 'localhost',
          cookiePathRewrite: '/',
          rewrite: (p) => p.replace(/^\/api\/erp/, '/api'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Strip the header that makes Werkzeug return 417
              proxyReq.removeHeader('expect');
              proxyReq.removeHeader('Expect');
            });
          },
        },
      },
    },
  };
});
