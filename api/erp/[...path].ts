export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  const ERPNEXT_URL = process.env.ERPNEXT_URL;
  const API_KEY = process.env.ERPNEXT_API_KEY;
  const API_SECRET = process.env.ERPNEXT_API_SECRET;

  if (!ERPNEXT_URL || !API_KEY || !API_SECRET) {
    return new Response(
      JSON.stringify({ error: 'Server configuration missing' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api\/erp\//, '');
    const targetUrl = `${ERPNEXT_URL}/api/${path}${url.search}`;

    const method = req.method.toUpperCase();
    const hasBody = method !== 'GET' && method !== 'HEAD';
    const bodyText = hasBody ? await req.text() : undefined;

    const response = await fetch(targetUrl, {
      method,
      headers: {
        Authorization: `token ${API_KEY}:${API_SECRET}`,
        'Content-Type': req.headers.get('content-type') || 'application/json',
        Accept: 'application/json',
      },
      body: bodyText,
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Proxy failed', message: err?.message || 'Unknown' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
