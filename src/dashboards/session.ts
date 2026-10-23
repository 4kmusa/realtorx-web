// Agent / Developer dashboard sessions (realtor_x.api.portal). Each dashboard has its own sign-in; an
// account can use a dashboard only with that dashboard's role. The server checks everything again.
import { callGet, callPost, setCsrfToken } from '../services/api/client';

export type DashboardApp = 'agent' | 'developer';

export interface DashboardSession {
  app: DashboardApp;
  user: string | null;
  allowed: boolean;
  full_name?: string;
  image?: string | null;
  language?: string;
  time_zone?: string | null;
  csrf_token?: string;
  developers?: { name: string; company_owner_name: string; status: string | null }[];
}

export async function getSession(app: DashboardApp): Promise<DashboardSession> {
  const s = await callGet<DashboardSession>('realtor_x.api.portal.session', { app });
  setCsrfToken(s?.csrf_token);
  return s;
}

/** When RealtorX asks for it, the password step answers with a code challenge instead of a session. */
export interface CodeChallenge {
  needs_code: true;
  token: string;
  sent_to: string;
}

export async function signIn(app: DashboardApp, usr: string, pwd: string): Promise<DashboardSession | CodeChallenge> {
  const s = await callPost<DashboardSession | CodeChallenge>('realtor_x.api.portal.login', { app, usr, pwd });
  if (!('needs_code' in s)) setCsrfToken(s?.csrf_token);
  return s;
}

export async function verifyCode(app: DashboardApp, token: string, code: string): Promise<DashboardSession> {
  const s = await callPost<DashboardSession>('realtor_x.api.portal.login_code', { app, token, code });
  setCsrfToken(s?.csrf_token);
  return s;
}

export async function signOut(): Promise<void> {
  try {
    await callPost('realtor_x.api.portal.logout');
  } finally {
    setCsrfToken(null);
  }
}

/** Website and back-office addresses shown on the dashboards. */
export const WEBSITE_URL = (import.meta.env.VITE_WEBSITE_URL as string | undefined) || '/';
