
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            icons: ['lucide-react'],
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
            const BLOCKED_PATTERNS = [
              /^\/api\/resource\/User(\?|$)/,
              /^\/api\/resource\/Company(\?|$)/,
              /^\/api\/resource\/Role(\?|$)/,
              /^\/api\/resource\/User Permission(\?|$)/,
              /^\/api\/method\/frappe\.client\.(set_value|insert|delete|submit|cancel)/,
              /^\/api\/method\/frappe\.desk\.(search|reportview|form\.save|form\.delete|form\.submit)/,
              /^\/api\/method\/frappe\.apps\./,
              /^\/api\/method\/frappe\.utils\./,
            ];
            proxy.on('proxyReq', (proxyReq, req, res) => {
              proxyReq.removeHeader('expect');
              proxyReq.removeHeader('Expect');

              const url = req.url || '';
              const method = (req.method || 'GET').toUpperCase();

              if (method === 'DELETE') {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Method not allowed by proxy policy' }));
                proxyReq.destroy();
                return;
              }

              for (const pat of BLOCKED_PATTERNS) {
                if (pat.test(url)) {
                  res.statusCode = 403;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Endpoint not allowed by proxy policy' }));
                  proxyReq.destroy();
                  return;
                }
              }

              if (env.ERPNEXT_API_KEY && env.ERPNEXT_API_SECRET) {
                proxyReq.setHeader('Authorization', `token ${env.ERPNEXT_API_KEY}:${env.ERPNEXT_API_SECRET}`);
              }
            });
          },
        },

        // Files served by ERPNext
        '/files': {
          target: 'http://192.168.52.241:8000',
          changeOrigin: true,
          secure: false,
        },

        // Private files served by ERPNext
        '/private': {
          target: 'http://192.168.52.241:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
