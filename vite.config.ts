
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { Plugin, defineConfig, loadEnv } from 'vite';

// The Agent and Developer dashboards are separate apps (own HTML entry, own login) next to the website.
const DASHBOARDS = ['agent', 'developer'];

/** Dev server: /agent/<anything> and /developer/<anything> load their own app (SPA fallback per app). */
function dashboardFallback(): Plugin {
  return {
    name: 'realtorx-dashboard-fallback',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url || '';
        const match = url.match(/^\/(agent|developer)(\/[^?.]*)?(\?.*)?$/);
        if (match) req.url = `/${match[1]}/index.html`;
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Local Frappe dev server; override with ERPNEXT_PROXY_TARGET in .env.local.
  const erpTarget = env.ERPNEXT_PROXY_TARGET || 'http://127.0.0.1:8000';
  return {
    plugins: [react(), tailwindcss(), dashboardFallback()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          ...Object.fromEntries(DASHBOARDS.map((d) => [d, path.resolve(__dirname, d, 'index.html')])),
        },
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
        // Same-origin proxy to Frappe. It never adds credentials: requests carry only the
        // visitor's own session cookie, and the backend enforces all permissions.
        '/api/erp': {
          target: erpTarget,
          changeOrigin: true,
          secure: false,
          xfwd: true, // pass the visitor IP so backend rate limits are per visitor
          cookieDomainRewrite: '',
          cookiePathRewrite: '/',
          rewrite: (p) => p.replace(/^\/api\/erp/, '/api'),

          configure: (proxy) => {
            // Defence in depth only; the backend is the authority.
            const BLOCKED_PATTERNS = [
              /^\/api\/resource\/User(\?|$)/,
              /^\/api\/resource\/Company(\?|$)/,
              /^\/api\/resource\/Role(\?|$)/,
              /^\/api\/resource\/User Permission(\?|\/|$)/,
              /^\/api\/method\/frappe\.client\.(set_value|insert|insert_many|save|delete|submit|cancel|rename_doc)/,
              /^\/api\/method\/frappe\.desk\.(search|reportview|form\.save|form\.delete|form\.submit)/,
              /^\/api\/method\/frappe\.apps\./,
              /^\/api\/method\/frappe\.utils\./,
              /^\/api\/method\/run_doc_method/,
            ];
            proxy.on('proxyReq', (proxyReq, req, res) => {
              proxyReq.removeHeader('expect');
              proxyReq.removeHeader('Expect');
              proxyReq.removeHeader('authorization'); // never forward client-supplied API tokens

              let url = req.url || '';
              try {
                url = decodeURIComponent(url);
              } catch {
                /* keep raw */
              }
              const method = (req.method || 'GET').toUpperCase();
              const blocked = method === 'DELETE' || BLOCKED_PATTERNS.some((pat) => pat.test(url));
              if (blocked) {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ exception: 'Not allowed from the website.' }));
                proxyReq.destroy();
              }
            });
          },
        },

        // Files served by ERPNext
        '/files': {
          target: erpTarget,
          changeOrigin: true,
          secure: false,
        },

        // Private files served by ERPNext
        '/private': {
          target: erpTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
