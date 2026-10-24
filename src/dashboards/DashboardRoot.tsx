// Shared frame of the Agent and Developer dashboards: loads the session, shows the dashboard's own
// sign-in screen, refuses accounts of another kind, and hands the signed-in session to the app.
import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Loader2, LogOut } from 'lucide-react';
import { CodeChallenge, DashboardApp, DashboardSession, WEBSITE_URL, getSession, signIn, signOut, verifyCode } from './session';
import { adoptAccountLanguage, t, useLang } from './i18n';
import { LanguagePicker } from './kit/kit';
import { AUTH_ERROR_EVENT, setCsrfToken } from '../services/api/client';

const TITLES: Record<DashboardApp, { name: string; tagline: string }> = {
  agent: { name: 'RealtorX Agent', tagline: 'Sell RealtorX inventory, track your buyers, deals and commission.' },
  developer: { name: 'RealtorX Developer', tagline: 'Your projects, inventory, sales and payments with RealtorX.' },
};

export default function DashboardRoot({ app, children }: { app: DashboardApp; children: (session: DashboardSession, logout: () => void) => React.ReactNode }) {
  const [session, setSession] = useState<DashboardSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lang = useLang();
  useEffect(() => adoptAccountLanguage(session?.language), [session?.language]);

  const load = () =>
    getSession(app)
      .then(setSession)
      .catch((e) => setError(e?.message || 'Cannot reach RealtorX. Please try again.'));

  useEffect(() => {
    document.title = `${TITLES[app].name} | RealtorX`;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app]);

  // A refused call may mean the session has ended: if so, go back to the sign-in screen instead of leaving errors on screen.
  const [expired, setExpired] = useState(false);
  const signedIn = useRef(false);
  signedIn.current = !!session?.user;
  useEffect(() => {
    let checking = false;
    const onAuthError = async () => {
      if (!signedIn.current || checking) return;
      checking = true;
      try {
        const now = await getSession(app);
        if (signedIn.current && !now.user) {
          setCsrfToken(null);
          setExpired(true);
          setSession(now);
        }
      } catch {
        /* offline: keep the screen; the section shows its own error */
      } finally {
        checking = false;
      }
    };
    window.addEventListener(AUTH_ERROR_EVENT, onAuthError);
    return () => window.removeEventListener(AUTH_ERROR_EVENT, onAuthError);
  }, [app]);

  const logout = async () => {
    await signOut().catch(() => undefined);
    setSession({ app, user: null, allowed: false });
  };

  if (error) return <Centered><p className="text-sm text-fg-2">{error}</p><button onClick={() => { setError(null); load(); }} className="mt-4 text-sm text-fg hover:underline">{t("Try again")}</button></Centered>;
  if (!session) return <Centered><Loader2 className="h-8 w-8 animate-spin text-fg" aria-label={t('Loading')} /></Centered>;
  if (session.user && !session.allowed) {
    return (
      <Centered>
        <Brand app={app} />
        <p className="mt-6 max-w-sm text-sm text-fg-2">
          You are signed in as <b className="text-fg">{session.user}</b>, which is not a {TITLES[app].name} account.
        </p>
        <button onClick={logout} className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-line-2 px-5 text-sm text-fg hover:bg-white/[0.04]">
          <LogOut className="h-4 w-4" /> Sign out and use another account
        </button>
      </Centered>
    );
  }
  if (!session.user) return <LoginScreen app={app} notice={expired ? t('Your session has ended. Please sign in again.') : null} onSignedIn={(s) => { setExpired(false); setSession(s); }} />;
  return <React.Fragment key={lang}>{children(session, logout)}</React.Fragment>; // a language change redraws every screen
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 text-center text-fg">{children}</div>;
}

function Brand({ app }: { app: DashboardApp }) {
  return (
    <div className="flex flex-col items-center">
      <img src="/images/realtorx-logo-480.png" alt="RealtorX" className="h-11 w-auto" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
      <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.24em] text-fg-3">{t(app === 'agent' ? 'Agent dashboard' : 'Developer dashboard')}</p>
      <h1 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-fg">{t(TITLES[app].name)}</h1>
    </div>
  );
}

function LoginScreen({ app, notice, onSignedIn }: { app: DashboardApp; notice?: string | null; onSignedIn: (s: DashboardSession) => void }) {
  const [usr, setUsr] = useState('');
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<CodeChallenge | null>(null);
  const [code, setCode] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (challenge) {
        onSignedIn(await verifyCode(app, challenge.token, code));
        return;
      }
      const result = await signIn(app, usr.trim(), pwd);
      if ('needs_code' in result) {
        setChallenge(result);
        setPwd('');
      } else onSignedIn(result);
    } catch (err: any) {
      const message: string = err?.message || '';
      if (challenge && /expired|sign in again/i.test(message)) {
        setChallenge(null);
        setCode('');
      }
      setError(!challenge && /invalid login|incorrect|credentials/i.test(message) ? t('Email or password is not correct.') : message || 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-10 text-fg">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-end"><LanguagePicker /></div>
        <Brand app={app} />
        <p className="mt-2 text-center text-sm text-fg-2">{t(TITLES[app].tagline)}</p>
        <form onSubmit={submit} className="mt-10 space-y-5 rounded-3xl border border-line bg-panel p-7">
          {challenge ? (
            <label className="block text-sm">
              <span className="mb-1.5 block text-fg-2">{t('Sign-in code')}</span>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                autoFocus
                maxLength={7}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-center text-lg tracking-[0.4em] text-fg outline-none focus:border-blue-2/70"
              />
              <span className="mt-1.5 block text-xs text-fg-2">{t('We emailed a 6-digit code to {0}. It expires in 10 minutes.').replace('{0}', challenge.sent_to)}</span>
            </label>
          ) : (
            <>
              <label className="block text-sm">
                <span className="mb-1.5 block text-fg-2">{t('Email')}</span>
                <input type="email" autoComplete="username" required value={usr} onChange={(e) => setUsr(e.target.value)} className="w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-fg outline-none focus:border-blue-2/70" />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-fg-2">{t('Password')}</span>
                <span className="relative block">
                  <input type={show ? 'text' : 'password'} autoComplete="current-password" required value={pwd} onChange={(e) => setPwd(e.target.value)} className="w-full rounded-xl border border-line bg-ink px-3 py-2.5 pe-10 text-fg outline-none focus:border-blue-2/70" />
                  <button type="button" onClick={() => setShow((v) => !v)} className="absolute end-2 top-1/2 -translate-y-1/2 p-1 text-fg-2 hover:text-fg" aria-label={show ? 'Hide password' : 'Show password'}>
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>
            </>
          )}
          {notice && !error && <p role="status" className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{notice}</p>}
          {error && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-fg text-ink h-11 text-sm font-medium hover:bg-white disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} {t(challenge ? 'Verify code' : 'Sign in')}
          </button>
          {challenge ? (
            <button type="button" onClick={() => { setChallenge(null); setCode(''); setError(null); }} className="block w-full text-center text-xs text-fg-2 hover:text-fg">
              {t('Use another account or send a new code')}
            </button>
          ) : (
            <p className="text-center text-xs text-fg-3">{t('Forgot your password? Contact RealtorX for a new one.')}</p>
          )}
        </form>
        <p className="mt-6 text-center text-xs text-fg-3">
          {t(app === 'agent' ? 'Not an agent yet? ' : 'Want to list your project? ')}
          <a href={app === 'agent' ? `${WEBSITE_URL.replace(/\/$/, '')}/become-an-agent` : `${WEBSITE_URL.replace(/\/$/, '')}/for-developers`} className="text-fg hover:underline">
            {t(app === 'agent' ? 'Become a RealtorX Agent' : 'Partner with RealtorX')}
          </a>
        </p>
        {app === 'agent' && (
          <p className="mt-2 text-center text-xs text-fg-3">
            {t('Applied already? ')}
            <a href={`${WEBSITE_URL.replace(/\/$/, '')}/my-application`} className="text-fg hover:underline">{t('Follow your application on the website')}</a>
          </p>
        )}
      </div>
    </div>
  );
}
