import https from 'https';
import http from 'http';
import { URL } from 'url';

export default async function handler(req: any, res: any) {
  const ERPNEXT_URL = process.env.ERPNEXT_URL;
  const API_KEY = process.env.ERPNEXT_API_KEY;
  const API_SECRET = process.env.ERPNEXT_API_SECRET;

  console.log('[PROXY INIT]', {
    hasUrl: !!ERPNEXT_URL,
    urlValue: ERPNEXT_URL,
    hasKey: !!API_KEY,
    keyPreview: API_KEY ? API_KEY.slice(0, 8) + '...' : 'MISSING',
    hasSecret: !!API_SECRET,
    secretPreview: API_SECRET ? API_SECRET.slice(0, 8) + '...' : 'MISSING',
  });

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

    console.log('[PROXY REQUEST]', {
      target: targetUrl,
      hostname: options.hostname,
      path: options.path,
      method: options.method,
      authPrefix: options.headers['Authorization'].slice(0, 25),
      userAgent: options.headers['User-Agent'],
      ngrokSkip: options.headers['ngrok-skip-browser-warning'],
    });

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

    console.log('[PROXY RESPONSE]', {
      status: erpResponse.status,
      contentType: erpResponse.headers['content-type'],
      bodyPreview: erpResponse.body.slice(0, 300),
    });

    res.status(erpResponse.status);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.send(erpResponse.body);
  } catch (err: any) {
    console.error('[PROXY ERROR]', err);
    res.status(500).json({ error: 'Proxy failed', message: err?.message || 'Unknown' });
  }
}
