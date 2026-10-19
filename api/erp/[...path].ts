import https from 'https';
import http from 'http';
import { URL } from 'url';

// Same-origin proxy from the SPA (Vercel) to Frappe.
//
// It NEVER adds an API key: every request runs as the visitor's own Frappe session
// (forwarded `Cookie` / returned `Set-Cookie`), or as Guest. All permissions are
// enforced by the backend; the blocklist below is defence in depth only.

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
];

const FORWARDED_REQUEST_HEADERS = ['cookie', 'x-frappe-csrf-token', 'accept', 'accept-language', 'user-agent'];

function serializeBody(req: any): string | null {
  if (req.method === 'GET' || req.method === 'HEAD' || req.body == null) return null;
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  const type = String(req.headers['content-type'] || '');
  if (type.includes('application/x-www-form-urlencoded')) {
    return new URLSearchParams(req.body as Record<string, string>).toString();
  }
  return JSON.stringify(req.body);
}

export default async function handler(req: any, res: any) {
  const ERPNEXT_URL = process.env.ERPNEXT_URL;
  if (!ERPNEXT_URL) {
    return res.status(500).json({ exception: 'Server configuration missing' });
  }

  try {
    const pathArray = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
    const path = pathArray.join('/');
    const query = { ...req.query };
    delete query.path;
    const queryString = new URLSearchParams(query as any).toString();

    let probe = '/' + path + (queryString ? '?' + queryString : '');
    try {
      probe = decodeURIComponent(probe);
    } catch {
      /* keep raw */
    }
    if (req.method === 'DELETE' || BLOCKED_PATTERNS.some((pat) => pat.test(probe))) {
      return res.status(403).json({ exception: 'Not allowed from the website.' });
    }

    const target = new URL(`${ERPNEXT_URL}/api/${path}${queryString ? '?' + queryString : ''}`);
    const isHttps = target.protocol === 'https:';
    const lib = isHttps ? https : http;

    const headers: Record<string, string | number> = {};
    for (const name of FORWARDED_REQUEST_HEADERS) {
      if (req.headers[name]) headers[name] = req.headers[name];
    }
    const clientIp = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
    if (clientIp) headers['X-Forwarded-For'] = clientIp;

    const body = serializeBody(req);
    if (body !== null) {
      headers['Content-Type'] = String(req.headers['content-type'] || 'application/json');
      headers['Content-Length'] = Buffer.byteLength(body);
    }

    const upstream = await new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: Buffer }>(
      (resolve, reject) => {
        const request = lib.request(
          {
            hostname: target.hostname,
            port: target.port || (isHttps ? 443 : 80),
            path: target.pathname + target.search,
            method: req.method,
            headers,
          },
          (response) => {
            // Collect raw bytes so binary downloads (PDFs, images) are not corrupted.
            const chunks: Buffer[] = [];
            response.on('data', (chunk: Buffer) => chunks.push(chunk));
            response.on('end', () =>
              resolve({ status: response.statusCode || 502, headers: response.headers, body: Buffer.concat(chunks) })
            );
          }
        );
        request.on('error', reject);
        request.setTimeout(30_000, () => request.destroy(new Error('Upstream timeout')));
        if (body !== null) request.write(body);
        request.end();
      }
    );

    const setCookie = upstream.headers['set-cookie'];
    if (setCookie) {
      // Frappe cookies are host-only; drop any Domain attribute so they bind to this origin.
      res.setHeader(
        'Set-Cookie',
        setCookie.map((c) => c.replace(/;\s*Domain=[^;]+/i, ''))
      );
    }
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers['content-type'] || 'application/json');
    if (upstream.headers['content-disposition']) {
      res.setHeader('Content-Disposition', upstream.headers['content-disposition']);
    }
    res.setHeader('Cache-Control', 'no-store');
    res.send(upstream.body);
  } catch (err: any) {
    console.error('Proxy error:', err?.message);
    res.status(502).json({ exception: 'The server is temporarily unavailable. Please try again.' });
  }
}
