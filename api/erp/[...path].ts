import https from 'https';
import http from 'http';
import { URL } from 'url';

export default async function handler(req: any, res: any) {
  const ERPNEXT_URL = process.env.ERPNEXT_URL;
  const API_KEY = process.env.ERPNEXT_API_KEY;
  const API_SECRET = process.env.ERPNEXT_API_SECRET;

  if (!ERPNEXT_URL || !API_KEY || !API_SECRET) {
    return res.status(500).json({
      error: 'Server configuration missing',
      env_check: { url: !!ERPNEXT_URL, key: !!API_KEY, secret: !!API_SECRET },
    });
  }

  try {
    const pathArray = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
    const path = pathArray.join('/');

    const query = { ...req.query };
    delete query.path;
    const queryString = new URLSearchParams(query as any).toString();

    const targetUrl = `${ERPNEXT_URL}/api/${path}${queryString ? '?' + queryString : ''}`;
    const parsed = new URL(targetUrl);

    const isHttps = parsed.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options: any = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: req.method,
      headers: {
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'curl/7.81.0',
        'Host': parsed.hostname,
      },
    };

    const bodyString =
      req.method !== 'GET' && req.method !== 'HEAD' && req.body
        ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
        : null;

    if (bodyString) {
      options.headers['Content-Length'] = Buffer.byteLength(bodyString);
    }

    const erpResponse = await new Promise<{ status: number; headers: any; body: string }>(
      (resolve, reject) => {
        const request = lib.request(options, (response: any) => {
          let data = '';
          response.on('data', (chunk: any) => { data += chunk; });
          response.on('end', () => {
            resolve({
              status: response.statusCode || 500,
              headers: response.headers,
              body: data,
            });
          });
        });

        request.on('error', reject);

        if (bodyString) request.write(bodyString);
        request.end();
      }
    );

    res.status(erpResponse.status);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.send(erpResponse.body);
  } catch (err: any) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy failed', message: err?.message || 'Unknown' });
  }
}
