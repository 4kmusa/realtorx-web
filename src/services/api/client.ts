// Single entry point for calls to the Frappe/ERPNext backend.
//
// - Always same-origin through the /api/erp proxy, with the session cookie.
// - Never sends API keys: identity comes only from the Frappe session.
// - Adds the CSRF token (obtained from realtor_x.api.session.get_session_info) on writes.
// - Converts Frappe error payloads into short, user-safe messages (no tracebacks).

export const API_BASE = '/api/erp';

let csrfToken: string | null = null;

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

/** POST to a whitelisted method (form-encoded, with CSRF) and return its `message`. */
export async function callPost<T = any>(method: string, data?: Record<string, unknown>): Promise<T> {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(data || {})) {
    if (value === undefined || value === null) continue;
    body.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (csrfToken) headers['X-Frappe-CSRF-Token'] = csrfToken;
  const payload = await request<{ message?: T }>(`/method/${method}`, { method: 'POST', headers, body: body.toString() });
  return (payload.message ?? null) as T;
}

/** POST a single file (multipart field "file") plus extra fields to a whitelisted method. */
export async function uploadFile<T = any>(method: string, file: File, data?: Record<string, string>): Promise<T> {
  const body = new FormData();
  for (const [key, value] of Object.entries(data || {})) body.append(key, value);
  body.append('file', file, file.name);
  const headers: Record<string, string> = {};
  if (csrfToken) headers['X-Frappe-CSRF-Token'] = csrfToken;
  const payload = await request<{ message?: T }>(`/method/${method}`, { method: 'POST', headers, body });
  return (payload.message ?? null) as T;
}

/** Insert a document through the standard REST API (permissions enforced server-side). */
export async function createDoc<T = any>(doctype: string, doc: Record<string, unknown>): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (csrfToken) headers['X-Frappe-CSRF-Token'] = csrfToken;
  const payload = await request<{ data: T }>(`/resource/${encodeURIComponent(doctype)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(doc),
  });
  return payload.data;
}

/** Frappe's login endpoint (sets the session cookie). */
export async function login(usr: string, pwd: string): Promise<void> {
  const body = new URLSearchParams({ usr, pwd });
  await request('/method/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
}

export async function logout(): Promise<void> {
  try {
    const headers: Record<string, string> = {};
    if (csrfToken) headers['X-Frappe-CSRF-Token'] = csrfToken;
    await request('/method/logout', { method: 'POST', headers });
  } finally {
    setCsrfToken(null);
  }
}
