// Vercel Routing Middleware: the website's API (/api/erp/*) and the backend's files (/files/*, /private/files/*) are
// rewritten at Vercel's edge straight to the Frappe site in ERPNEXT_URL (no trailing slash).
//
// - Same origin for the browser, so the Frappe session cookie stays first-party (no CORS, no third-party cookies).
// - The request is passed through untouched: uploads (ID photos, the identity-check video, payment proofs,
//   inventory files) and large downloads (3D models, 360° photos, PDFs) are not limited by a function's body size.
// - Requests run as the visitor's own Frappe session or as Guest; no API key is added. The blocklist below is defence
//   in depth for Desk APIs the website never uses; the backend is the authority.
// Local development uses the same routes through the Vite dev proxy (vite.config.ts).

export const config = { matcher: ['/api/erp/:path*', '/files/:path*', '/private/files/:path*'] };

const BLOCKED_PATTERNS = [
  /^\/resource\/User(\?|$)/,
  /^\/resource\/Company(\?|$)/,
  /^\/resource\/Role(\?|$)/,
  /^\/resource\/User Permission(\?|\/|$)/,
  /^\/method\/frappe\.client\.(set_value|insert|insert_many|save|delete|submit|cancel|rename_doc)/,
  /^\/method\/frappe\.desk\.(search|reportview|form\.save|form\.delete|form\.submit)/,
  /^\/method\/frappe\.apps\./,
  /^\/method\/frappe\.utils\./,
  /^\/method\/run_doc_method/,
  /^\/method\/login(\?|$)/, // the website and dashboards sign in through realtor_x.api.portal.login
];

const json = (status: number, body: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export default function middleware(request: Request): Response {
  const base = (globalThis as any).process?.env?.ERPNEXT_URL as string | undefined;
  if (!base) return json(500, { exception: 'Server configuration missing' });

  const url = new URL(request.url);
  let path = url.pathname;
  if (path.startsWith('/api/erp/')) {
    const rest = path.slice('/api/erp'.length); // "/method/…" or "/resource/…"
    let probe = rest + url.search;
    try {
      probe = decodeURIComponent(probe);
    } catch {
      /* keep raw */
    }
    if (request.method === 'DELETE' || BLOCKED_PATTERNS.some((pattern) => pattern.test(probe))) {
      return json(403, { exception: 'Not allowed from the website.' });
    }
    path = `/api${rest}`;
  }
  const target = new URL(path + url.search, base.replace(/\/+$/, '') + '/');
  return new Response(null, { headers: { 'x-middleware-rewrite': target.toString() } });
}
