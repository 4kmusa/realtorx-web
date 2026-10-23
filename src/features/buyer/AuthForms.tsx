// Buyer sign-in, account creation (with an emailed 6-digit code) and forgotten password. Used on /sign-in and inside
// the enquiry, visit and booking forms, so a visitor can sign in without losing their place.
import React, { useState } from 'react';
import { Alert, Button, Checkbox, Field, inputClass } from '../../components/site/ui';
import { callPost } from '../../services/api/client';
import { Buyer, useBuyer } from './session';
import PhoneInput from '../../components/site/PhoneInput';

type Step = 'signin' | 'signup' | 'signup-code' | 'reset' | 'reset-code';

export default function AuthForms({ onSignedIn, intro, compact }: { onSignedIn?: (b: Buyer | null) => void; intro?: string; compact?: boolean }) {
  const { started, otherAccount, signOut } = useBuyer();
  const [step, setStep] = useState<Step>('signin');
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', password2: '', code: '', agree: false });
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const set = (patch: Partial<typeof f>) => setF((x) => ({ ...x, ...patch }));
  const go = (s: Step) => { setStep(s); setError(null); setNote(null); };

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await work();
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  const finish = async (session: any) => {
    const b = await started(session); // always load the account (an optional call would skip its argument)
    onSignedIn?.(b);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'signin') {
      return run(async () => finish(await callPost('realtor_x.api.portal.login', { app: 'buyer', usr: f.email.trim(), pwd: f.password })));
    }
    if (step === 'signup') {
      if (f.password !== f.password2) return setError('The two passwords are not the same.');
      if (!f.agree) return setError('Please accept the terms and privacy policy.');
      return run(async () => {
        const r = await callPost<{ token: string; sent_to: string }>('realtor_x.api.buyers.signup', { full_name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(), password: f.password });
        setToken(r.token);
        setNote(`We emailed a 6-digit code to ${r.sent_to}.`);
        go('signup-code');
        setNote(`We emailed a 6-digit code to ${r.sent_to}.`);
      });
    }
    if (step === 'signup-code') {
      return run(async () => finish(await callPost('realtor_x.api.buyers.signup_verify', { token, code: f.code.trim() })));
    }
    if (step === 'reset') {
      return run(async () => {
        const r = await callPost<{ token: string; sent_to: string }>('realtor_x.api.buyers.reset_start', { email: f.email.trim() });
        setToken(r.token);
        go('reset-code');
        setNote(`If ${r.sent_to} has a buyer account, we emailed it a 6-digit code.`);
      });
    }
    if (f.password !== f.password2) return setError('The two passwords are not the same.');
    return run(async () => finish(await callPost('realtor_x.api.buyers.reset_finish', { token, code: f.code.trim(), password: f.password })));
  };

  const resend = () => run(async () => {
    await callPost(step === 'signup-code' ? 'realtor_x.api.buyers.signup_resend' : 'realtor_x.api.buyers.reset_resend', { token });
    setNote('A new code is on its way.');
  });

  if (otherAccount) {
    return (
      <div className="space-y-4">
        <Alert tone="info">You are signed in as {otherAccount}, which is not a buyer account. Sign out to use a buyer account.</Alert>
        <Button variant="secondary" onClick={() => signOut()}>Sign out</Button>
      </div>
    );
  }

  const tabs = step === 'signin' || step === 'signup';
  const title = { signin: 'Sign in', signup: 'Create your free account', 'signup-code': 'Check your email', reset: 'Reset your password', 'reset-code': 'Choose a new password' }[step];
  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {intro && <p className="text-[15px] leading-relaxed text-fg-2">{intro}</p>}
      {tabs ? (
        <div className="flex rounded-full border border-line p-1" role="tablist">
          {(['signin', 'signup'] as Step[]).map((s) => (
            <button key={s} type="button" role="tab" aria-selected={step === s} onClick={() => go(s)}
              className={`flex-1 rounded-full py-2 text-[14px] transition-colors ${step === s ? 'bg-fg text-ink' : 'text-fg-2 hover:text-fg'}`}>
              {s === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>
      ) : (
        !compact && <h2 className="text-xl font-medium text-fg">{title}</h2>
      )}
      {note && <Alert tone="info">{note}</Alert>}

      {step === 'signup' && (
        <Field label="Full name" htmlFor="b-name">
          <input id="b-name" required autoComplete="name" className={inputClass} value={f.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
      )}
      {(step === 'signin' || step === 'signup' || step === 'reset') && (
        <Field label="Email" htmlFor="b-email">
          <input id="b-email" type="email" required autoComplete="email" className={inputClass} value={f.email} onChange={(e) => set({ email: e.target.value })} />
        </Field>
      )}
      {step === 'signup' && (
        <Field label="Mobile number" htmlFor="b-phone" hint="Choose your country, then the number.">
          <PhoneInput id="b-phone" required value={f.phone} onChange={(v) => set({ phone: v })} />
        </Field>
      )}
      {(step === 'signup-code' || step === 'reset-code') && (
        <Field label="6-digit code" htmlFor="b-code">
          <input id="b-code" required inputMode="numeric" autoComplete="one-time-code" maxLength={6} className={`${inputClass} tracking-[0.4em]`} value={f.code}
            onChange={(e) => set({ code: e.target.value.replace(/\D/g, '') })} />
        </Field>
      )}
      {(step === 'signin' || step === 'signup' || step === 'reset-code') && (
        <Field label={step === 'reset-code' ? 'New password' : 'Password'} htmlFor="b-pwd" hint={step === 'signin' ? undefined : 'At least 8 characters; a few words are easiest to remember.'}>
          <input id="b-pwd" type="password" required autoComplete={step === 'signin' ? 'current-password' : 'new-password'} className={inputClass} value={f.password} onChange={(e) => set({ password: e.target.value })} />
        </Field>
      )}
      {(step === 'signup' || step === 'reset-code') && (
        <Field label="Repeat the password" htmlFor="b-pwd2">
          <input id="b-pwd2" type="password" required autoComplete="new-password" className={inputClass} value={f.password2} onChange={(e) => set({ password2: e.target.value })} />
        </Field>
      )}
      {step === 'signup' && (
        <Checkbox id="b-agree" checked={f.agree} onChange={(v) => set({ agree: v })}>
          I accept the <a href="/terms" target="_blank" rel="noreferrer" className="underline underline-offset-4">Terms of Use</a>, the <a href="/privacy" target="_blank" rel="noreferrer" className="underline underline-offset-4">Privacy Policy</a> and the <a href="/booking-policy" target="_blank" rel="noreferrer" className="underline underline-offset-4">Booking Policy</a>.
        </Checkbox>
      )}

      {error && <Alert>{error}</Alert>}
      <Button type="submit" size="lg" busy={busy} className="w-full">
        {{ signin: 'Sign in', signup: 'Create account', 'signup-code': 'Confirm and continue', reset: 'Email me a code', 'reset-code': 'Save and sign in' }[step]}
      </Button>

      <div className="flex flex-wrap justify-between gap-2 text-[13px] text-fg-3">
        {step === 'signin' && <button type="button" onClick={() => go('reset')} className="hover:text-fg">Forgot your password?</button>}
        {(step === 'signup-code' || step === 'reset-code') && <button type="button" onClick={resend} className="hover:text-fg">Send a new code</button>}
        {!tabs && <button type="button" onClick={() => go('signin')} className="hover:text-fg">Back to sign in</button>}
      </div>
    </form>
  );
}
