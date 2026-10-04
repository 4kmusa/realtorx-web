export default async function handler(req: any, res: any) {
  const ERPNEXT_URL = process.env.ERPNEXT_URL;
  const API_KEY = process.env.ERPNEXT_API_KEY;
  const API_SECRET = process.env.ERPNEXT_API_SECRET;

  // Debug log (Vercel function logs mein dikhega)
  console.log('[PROXY DEBUG]', {
    hasUrl: !!ERPNEXT_URL,
    urlPreview: ERPNEXT_URL ? ERPNEXT_URL.slice(0, 30) + '...' : 'MISSING',
    hasKey: !!API_KEY,
    hasSecret: !!API_SECRET,
    method: req.method,
    query: req.query,
  });

  if (!ERPNEXT_URL || !API_KEY || !API_SECRET) {
    return res.status(500).json({
      error: 'Server configuration missing',
      env_check: {
        url: !!ERPNEXT_URL,
        key: !!API_KEY,
        secret: !!API_SECRET,
      },
    });
  }

  try {
    const pathArray = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
    const path = pathArray.join('/');

    const query = { ...req.query };
    delete query.path;
    const queryString = new URLSearchParams(query as any).toString();

    const targetUrl = `${ERPNEXT_URL}/api/${path}${queryString ? '?' + queryString : ''}`;

    const options: any = {
      method: req.method,
      headers: {
        Authorization: `token ${API_KEY}:${API_SECRET}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const erpRes = await fetch(targetUrl, options);
    const text = await erpRes.text();

    res.status(erpRes.status);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.send(text);
  } catch (err: any) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy failed', message: err?.message || 'Unknown' });
  }
}
