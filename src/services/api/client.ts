// Single entry point for calls to the Frappe/ERPNext backend.
//
// - Always same-origin through the /api/erp proxy, with the session cookie.
// - Never sends API keys: identity comes only from the Frappe session.
// - Adds the CSRF token on writes (from the dashboard session, or fetched once after a CSRF error).
// - Converts Frappe error payloads into short, user-safe messages (no tracebacks).

export const API_BASE = '/api/erp';

let csrfToken: string | null = null;

/** Same-origin URL of a GET method that returns a file (e.g. a PDF), for links and downloads. */
export function methodUrl(method: string, params?: Record<string, string | number | null | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => v != null && v !== '' && query.set(k, String(v)));
  return `${API_BASE}/method/${method}${query.toString() ? `?${query}` : ''}`;
}

export function setCsrfToken(token: string | null | undefined) {
  csrfToken = token || null;
}

export class ApiError extends Error {
  status: number;
  type?: string;
  constructor(message: string, status: number, type?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.type = type;
  }
}

const GENERIC_ERROR = 'Something went wrong. Please try again.';

function stripTags(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim();
}

/** Extract the first human-readable message from a Frappe error response. */
export function extractErrorMessage(payload: any, status: number): string {
  try {
    if (payload?._server_messages) {
      const messages = JSON.parse(payload._server_messages);
      for (const raw of messages) {
        const msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const text = stripTags(String(msg?.message ?? msg ?? ''));
        if (text) return text;
      }
    }
  } catch {
    /* fall through */
  }
  const exception = String(payload?.exception || '');
  if (exception && !exception.includes('Traceback')) {
    const text = stripTags(exception.replace(/^[\w.]+(Error|Exception):\s*/, ''));
    if (text) return text;
  }
  if (status === 401 || status === 403) return 'Please sign in to continue.';
  if (status === 404) return 'Not found.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  return GENERIC_ERROR;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...init,
      headers: { Accept: 'application/json', ...(init.headers || {}) },
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.exception) {
    throw new ApiError(extractErrorMessage(payload, response.status), response.status, payload?.exc_type);
  }
  return payload as T;
}

function toQuery(params?: Record<string, unknown>): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/** GET a whitelisted method and return its `message`. */
export async function callGet<T = any>(method: string, params?: Record<string, unknown>): Promise<T> {
  const payload = await request<{ message?: T }>(`/method/${method}${toQuery(params)}`, { method: 'GET' });
  // Frappe omits `message` entirely when a method returns None; normalise to null.
  return (payload.message ?? null) as T;
}

/** POST with the CSRF token. A signed-in visitor (agent, applicant) whose token this page does not know yet gets
 * a CSRF error once: the token of the current session is fetched and the request is sent again. */
async function post<T>(method: string, makeBody: () => BodyInit, contentType?: string): Promise<T> {
  const send = () => {
    const headers: Record<string, string> = contentType ? { 'Content-Type': contentType } : {};
    if (csrfToken) headers['X-Frappe-CSRF-Token'] = csrfToken;
    return request<{ message?: T }>(`/method/${method}`, { method: 'POST', headers, body: makeBody() });
  };
  try {
    return ((await send()).message ?? null) as T;
  } catch (err) {
    if (!(err instanceof ApiError) || err.type !== 'CSRFTokenError') throw err;
    setCsrfToken(await callGet<string | null>('realtor_x.api.account.csrf_token'));
    return ((await send()).message ?? null) as T;
  }
}

/** POST to a whitelisted method (form-encoded, with CSRF) and return its `message`. */
export async function callPost<T = any>(method: string, data?: Record<string, unknown>): Promise<T> {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(data || {})) {
    if (value === undefined || value === null) continue;
    body.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
  }
  return post<T>(method, () => body.toString(), 'application/x-www-form-urlencoded');
}

/** POST a single file (multipart field "file") plus extra fields to a whitelisted method. */
export async function uploadFile<T = any>(method: string, file: File, data?: Record<string, string>): Promise<T> {
  return post<T>(method, () => {
    const body = new FormData();
    for (const [key, value] of Object.entries(data || {})) body.append(key, value);
    body.append('file', file, file.name);
    return body;
  });
}
