// "My application" (/my-application): the agent applicant's website profile. They sign in with a code emailed to the
// address they applied with and follow the status (submitted, review, approved, not approved). This is not the Agent
// dashboard: approved agents get a separate dashboard password from RealtorX.
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { callGet, callPost } from '../../services/api/client';
import { Alert, Button, Container, Eyebrow, Field, inputClass } from '../../components/site/ui';
import { PageId } from '../../types';
import { APPLICATION_STORE, PROFILE_STORE, loadJSON, saveJSON } from './applicationStore';

const API = 'realtor_x.api.agents';

interface Profile {
  application: string;
  full_name: string;
  email: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Suspended';
  submitted_on: string | null;
  approved_on: string | null;
  updated_on: string;
  rejection_reason: string | null;
  can_continue: boolean;
  dashboard: string | null;
  token?: string;
}
type Session = { application: string; token: string };

const day = (v: string | null) => (v ? new Date(v.replace(' ', 'T')).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

const MESSAGE: Record<Profile['status'], string> = {
  Draft: 'Your application is not finished yet. Continue where you left off.',
  Submitted: 'We have your application. The RealtorX agent team will review your details, ID and video.',
  'Under Review': 'The RealtorX agent team is reviewing your documents and video. We may call you for a short live video check.',
  Approved: 'You are now a RealtorX Agent. The RealtorX team will give you your Agent dashboard password.',
  Rejected: 'We could not approve your application this time.',
  Suspended: 'Your agent account is on hold. Please contact RealtorX.',
};

function Steps({ p }: { p: Profile }) {
  const decided = ['Approved', 'Rejected', 'Suspended'].includes(p.status);
  const steps = [
    { label: 'Applied', done: p.status !== 'Draft', note: day(p.submitted_on) },
    { label: 'In review', done: decided || p.status === 'Under Review', active: ['Submitted', 'Under Review'].includes(p.status), note: '' },
    { label: p.status === 'Rejected' ? 'Not approved' : 'Approved', done: decided, bad: p.status === 'Rejected', note: decided ? day(p.approved_on || p.updated_on) : '' },
  ];
  return (
    <ol className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {steps.map((s) => (
        <li key={s.label} className={`flex items-center gap-3 rounded-2xl border p-4 ${s.done ? 'border-line-2 bg-white/[0.04]' : 'border-line'}`}>
          {s.bad ? <XCircle className="h-5 w-5 text-bad" /> : s.done ? <CheckCircle2 className="h-5 w-5 text-good" /> : s.active ? <Clock className="h-5 w-5 text-amber" /> : <Circle className="h-5 w-5 text-fg-3" />}
          <span>
            <span className="block text-[15px] text-fg">{s.label}</span>
            {s.note && <span className="block text-xs text-fg-3">{s.note}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function MyApplicationPage({ onNavigate }: { onNavigate: (page: PageId, id?: string) => void }) {
  const [session, setSession] = useState<Session | null>(() => loadJSON<Session>(PROFILE_STORE));
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ email: '', code: '' });
  const [challenge, setChallenge] = useState<{ token: string; sent_to: string } | null>(null); // the code was emailed
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    callGet<Profile>(`${API}.my_application`, { application: session.application, token: session.token })
      .then(setProfile)
      .catch((e: any) => {
        if (e?.status === 404 || e?.status === 403 || e?.status === 401 || e?.type === 'DoesNotExistError') {
          saveJSON(PROFILE_STORE, null); // signed out or expired: sign in again
          setSession(null);
        } else setError(e?.message || 'Cannot reach RealtorX. Check your connection and try again.');
      });
  }, [session]);

  // Sign-in with a code emailed to the address used when applying (no password to remember).
  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (!challenge) {
        setChallenge(await callPost<{ token: string; sent_to: string }>(`${API}.my_application_code`, { email: form.email.trim() }));
        return;
      }
      const p = await callPost<Profile>(`${API}.my_application_code_login`, { token: challenge.token, code: form.code.trim() });
      const s = { application: p.application, token: p.token! };
      saveJSON(PROFILE_STORE, s);
      if (p.can_continue) saveJSON(APPLICATION_STORE, { application: p.application, key: p.token }); // the form continues on this device
      setForm({ email: '', code: '' });
      setChallenge(null);
      setProfile(p);
      setSession(s);
    } catch (err: any) {
      setError(err?.message || 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    if (session) await callPost(`${API}.my_application_logout`, session).catch(() => undefined);
    saveJSON(PROFILE_STORE, null);
    setSession(null);
    setProfile(null);
  };

  return (
    <div className="bg-ink pb-24">
      <Container className="pt-16 md:pt-24" narrow>
        <Eyebrow className="mb-6">My application</Eyebrow>
        {!session || !profile ? (
          <>
            <h1 className="text-balance text-[40px] font-medium leading-[1.04] tracking-[-0.035em] text-fg md:text-6xl">Follow your <span className="em">application</span>.</h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-fg-2">
              Enter the email you applied with; we send you a 6-digit code to open your application. Approved agents use the Agent dashboard with the password RealtorX gives them.
            </p>
            {session && !profile ? (
              error ? (
                <div className="mt-10 space-y-3">
                  <p className="text-sm text-red-300">{error}</p>
                  <button type="button" onClick={() => { setError(null); setSession({ ...session }); }} className="text-sm text-fg underline underline-offset-4">Try again</button>
                </div>
              ) : <p className="mt-10 text-sm text-fg-3">Loading…</p>
            ) : (
              <form onSubmit={signIn} className="mt-10 max-w-md space-y-4 rounded-3xl border border-line bg-panel p-6">
                {!challenge ? (
                  <Field label="Email" htmlFor="ma-email">
                    <input id="ma-email" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
                  </Field>
                ) : (
                  <>
                    <p className="text-[14px] leading-relaxed text-fg-2">If <span className="text-fg">{challenge.sent_to}</span> has an application, we emailed it a 6-digit code. It can take a minute; check the spam folder too.</p>
                    <Field label="6-digit code" htmlFor="ma-code">
                      <input id="ma-code" required autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={7} value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value })} className={`${inputClass} text-center text-xl tracking-[0.4em]`} />
                    </Field>
                  </>
                )}
                {error && <Alert>{error}</Alert>}
                <Button type="submit" size="lg" busy={busy} className="w-full">{challenge ? 'Open my application' : 'Email me a code'}</Button>
                {challenge && (
                  <button type="button" onClick={() => { setChallenge(null); setForm({ ...form, code: '' }); setError(null); }} className="text-xs text-fg-3 hover:text-fg">
                    Use another email or send a new code
                  </button>
                )}
              </form>
            )}
            <p className="mt-8 text-[14px] text-fg-3">
              Not applied yet? <button onClick={() => onNavigate('become-agent')} className="text-fg underline underline-offset-4">Apply to become a RealtorX Agent</button>
            </p>
          </>
        ) : (
          <div className="rounded-3xl border border-line bg-panel p-6 sm:p-8" role="status">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">Application {profile.application}</p>
            <h1 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-fg md:text-4xl">{profile.full_name}</h1>
            <p className="mt-1 text-sm text-fg-3">{profile.email}</p>
            <Steps p={profile} />
            <p className="mt-6 text-[15px] leading-relaxed text-fg-2">{MESSAGE[profile.status]}</p>
            {profile.rejection_reason && <div className="mt-4"><Alert>{profile.rejection_reason}</Alert></div>}
            <div className="mt-7 flex flex-wrap gap-3">
              {profile.can_continue && <Button arrow onClick={() => { window.history.pushState(null, '', '/become-an-agent#apply'); onNavigate('become-agent'); }}>Continue the application</Button>}
              {profile.status === 'Approved' && <Button arrow onClick={() => (window.location.href = profile.dashboard || '/agent/')}>Open the Agent dashboard</Button>}
              <Button variant="ghost" onClick={signOut}>Sign out</Button>
            </div>
            <p className="mt-6 text-xs text-fg-3">Last update {day(profile.updated_on)}. This page is your application profile; the Agent dashboard has its own password from RealtorX.</p>
          </div>
        )}
      </Container>
    </div>
  );
}
