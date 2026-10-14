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
    build: {
      // Chunk size warning threshold
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            // React + core
            'react-vendor': ['react', 'react-dom'],
            // Icons (huge lib, separate)
            'icons': ['lucide-react'],
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '192.168.83.85',
        '192.168.52.241',
        '.local',
      ],
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/erp': {
          target: 'http://192.168.52.241:8000',
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: '',
          cookiePathRewrite: '/',
          rewrite: (p) => p.replace(/^\/api\/erp/, '/api'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              // Debug log — dekho kaunse headers ja rahe hain
              if (req.url?.includes('/resource/Property') || req.url?.includes('getdoctype')) {
                console.log('[PROXY-DEBUG]', req.method, req.url);
                console.log('  Authorization:', proxyReq.getHeader('authorization')?.toString()?.slice(0, 40) || 'MISSING');
                console.log('  Cookie:', proxyReq.getHeader('cookie')?.toString()?.slice(0, 60) || 'none');
                console.log('  Origin:', proxyReq.getHeader('origin') || 'none');
              }
              proxyReq.removeHeader('expect');
              proxyReq.removeHeader('Expect');
            });
          },
        },
        // Files served by ERPNext at /files/ and /private/
        // We proxy them so LAN clients (phone) can also load images
        '/files': {
          target: 'http://192.168.52.241:8000',
          changeOrigin: true,
          secure: false,
        },
        '/private': {
          target: 'http://192.168.52.241:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
