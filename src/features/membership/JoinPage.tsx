// Membership journey (/join): account -> profile -> Manifesto -> Code -> Oath -> submitted.
// The server validates everything again and records the acceptance; staff then approve or decline.
import React, { useEffect, useState } from 'react';
import { BadgeCheck, Check, ChevronLeft, Loader2, ScrollText, ShieldCheck, UserPlus } from 'lucide-react';
import { PageId } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { callGet, callPost } from '../../services/api/client';
import { Skeleton } from '../../components/ui/Skeleton';
import { CODE, MANIFESTO, MEMBER_TYPES, OATH, PHILOSOPHY } from './content';

type Nav = (page: PageId, id?: string) => void;

export interface MyMembership {
  name: string;
  member_id: string | null;
  member_type: string;
  status: string;
  decline_reason: string | null;
  full_name: string;
  firm_name: string | null;
  city: string | null;
  phone: string | null;
  cnic_masked: string | null;
  experience_years: number | null;
  specialization: string | null;
  areas_served: string | null;
  bio: string | null;
  website: string | null;
  oath_date: string | null;
  approved_on: string | null;
  membership_tier: string | null;
  profile_image: string | null;
  is_realtor: boolean;
  is_developer: boolean;
  orientation_completed: number;
  profile_completion: number;
  trust_rating: number | null;
  performance: { live_listings?: number; leads_received?: number; deals_closed?: number; events_attended?: number };
  subscription: { plan: string; start_date: string; end_date: string | null; payment_status: string } | null;
  documents: Record<'cnic_front' | 'cnic_back' | 'business_document', boolean>;
  applied_on: string;
}

const STEPS = ['Account', 'Profile', 'Manifesto', 'Code', 'Oath'];
// After applying: verification and an orientation at the Hub, then approval and the Member ID.
const input = 'w-full rounded-lg border border-white/10 bg-[#081221] px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F5A623]/60 focus:outline-none';
const PK_MOBILE = /^(\+92|0)?3\d{9}$/;
const CNIC = /^\d{5}-?\d{7}-?\d$/;

export default function JoinPage({ onNavigate }: { onNavigate: Nav }) {
  const { user, isAuthenticated, loading: authLoading, signup, refreshUser } = useAuth();
  const [membership, setMembership] = useState<MyMembership | null | undefined>(undefined);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [account, setAccount] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [profile, setProfile] = useState({
    member_type: (() => {
      const preset = sessionStorage.getItem('realtorx_join_type');
      sessionStorage.removeItem('realtorx_join_type');
      return MEMBER_TYPES.some((t) => t.value === preset) ? (preset as string) : 'Realtor';
    })(), full_name: '', firm_name: '', city: '', phone: '', cnic: '', experience_years: '', areas_served: '',
    specialization: '', website: '', bio: '',
  });
  const [accepted, setAccepted] = useState({ manifesto: false, code: false, oath: false });
  const [signature, setSignature] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setMembership(null);
      setStep(0);
      return;
    }
    callGet<MyMembership | null>('realtor_x.api.membership.get_my_membership')
      .then((m) => {
        setMembership(m);
        if (!m || m.status === 'Rejected') setStep(1);
      })
      .catch(() => setMembership(null));
    setProfile((p) => ({ ...p, full_name: p.full_name || user?.full_name || '', phone: p.phone || user?.phone || '' }));
  }, [authLoading, isAuthenticated, user?.full_name, user?.phone]);

  const type = MEMBER_TYPES.find((t) => t.value === profile.member_type)!;
  const go = (n: number) => {
    setError(null);
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!PK_MOBILE.test(account.phone.replace(/[\s-]/g, ''))) return setError('Please enter a valid Pakistani mobile number, e.g. 03001234567.');
    setBusy(true);
    setError(null);
    const res = await signup({ ...account, phone: account.phone.replace(/[\s-]/g, '') });
    setBusy(false);
    if (!res.success) return setError(res.error || 'Could not create your account.');
    await refreshUser();
    setProfile((p) => ({ ...p, full_name: account.full_name, phone: account.phone }));
    go(1);
  };

  const checkProfile = () => {
    const p = profile;
    if (p.full_name.trim().length < 2) return 'Please enter your full name.';
    if (type.org && p.firm_name.trim().length < 2) return 'Please enter your company / agency name.';
    if (p.city.trim().length < 2) return 'Please enter your city.';
    if (!PK_MOBILE.test(p.phone.replace(/[\s-]/g, ''))) return 'Please enter a valid Pakistani mobile number.';
    if (!CNIC.test(p.cnic.trim())) return 'Please enter your 13-digit CNIC, e.g. 42101-1234567-1.';
    if (p.website && !/^https?:\/\//.test(p.website.trim())) return 'Website / social link must start with http:// or https://';
    return null;
  };

  const submit = async () => {
    if (signature.trim().toLowerCase().replace(/\s+/g, ' ') !== profile.full_name.trim().toLowerCase().replace(/\s+/g, ' ')) {
      return setError('Please type your full name exactly as entered in your profile to sign the Oath.');
    }
    setBusy(true);
    setError(null);
    try {
      await callPost('realtor_x.api.membership.apply_for_membership', {
        ...profile,
        phone: profile.phone.replace(/[\s-]/g, ''),
        experience_years: profile.experience_years || 0,
        manifesto_accepted: 1,
        code_agreed: 1,
        oath_accepted: 1,
        oath_signature: signature.trim(),
      });
      await refreshUser();
      setMembership(await callGet<MyMembership | null>('realtor_x.api.membership.get_my_membership'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      setError(e?.message || 'Could not submit your application.');
    } finally {
      setBusy(false);
    }
  };

  if (authLoading || membership === undefined) {
    return <div className="mx-auto max-w-3xl px-4 py-16"><Skeleton className="h-96 rounded-2xl" /></div>;
  }
  if (user?.is_staff) {
    return <Centered title="You are signed in as RealtorX staff" text="Members apply with their own personal accounts. Review applications in Desk → RealtorX Member." />;
  }
  if (membership && membership.status !== 'Rejected') {
    return <ApplicationStatus membership={membership} onNavigate={onNavigate} />;
  }

  return (
    <div className="min-h-screen bg-[#081221] pb-16">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#F5A623]">RealtorX membership</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Join the RealtorX community</h1>
        <p className="mt-2 text-sm text-slate-400">Realtors, agencies, developers, investors and solution partners. Five short steps; RealtorX reviews every application.</p>

        {membership?.status === 'Rejected' && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200" role="status">
            Your previous application was declined{membership.decline_reason ? `: ${membership.decline_reason}` : '.'} You can correct your details and apply again.
          </div>
        )}

        <ol className="mt-8 flex items-center gap-2" aria-label="Progress">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-[#F5A623] text-slate-950' : 'bg-white/10 text-slate-400'}`} aria-current={i === step ? 'step' : undefined}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={`hidden text-xs sm:inline ${i === step ? 'text-white' : 'text-slate-500'}`}>{label}</span>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-white/10" />}
            </li>
          ))}
        </ol>

        {error && <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200" role="alert">{error}</div>}

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0B1A30] p-6">
          {step === 0 && !isAuthenticated && (
            <form onSubmit={createAccount} className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><UserPlus className="h-5 w-5 text-[#F5A623]" /> Create your account</h2>
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <button type="button" className="text-[#F5A623] hover:underline" onClick={() => { sessionStorage.setItem('realtorx_after_login', 'join'); onNavigate('login'); }}>
                  Sign in
                </button>
              </p>
              <Field label="Full name" id="j-name"><input id="j-name" className={input} required maxLength={140} value={account.full_name} onChange={(e) => setAccount({ ...account, full_name: e.target.value })} /></Field>
              <Field label="Email" id="j-email"><input id="j-email" type="email" className={input} required maxLength={140} value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} /></Field>
              <Field label="Mobile" id="j-phone"><input id="j-phone" inputMode="tel" className={input} required maxLength={16} placeholder="03XX XXXXXXX" value={account.phone} onChange={(e) => setAccount({ ...account, phone: e.target.value })} /></Field>
              <Field label="Password" id="j-pass"><input id="j-pass" type="password" className={input} required minLength={8} value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} autoComplete="new-password" /></Field>
              <Next busy={busy} label="Create account and continue" />
            </form>
          )}

          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); const problem = checkProfile(); if (problem) setError(problem); else go(2); }} className="space-y-5">
              <h2 className="text-lg font-semibold text-white">Your profile</h2>
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-slate-200">I am joining as</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {MEMBER_TYPES.map((t) => (
                    <label key={t.value} className={`cursor-pointer rounded-xl border p-3 ${profile.member_type === t.value ? 'border-[#F5A623] bg-[#F5A623]/5' : 'border-white/10 hover:border-white/25'}`}>
                      <input type="radio" name="member_type" className="sr-only" checked={profile.member_type === t.value} onChange={() => setProfile({ ...profile, member_type: t.value })} />
                      <span className="block text-sm font-semibold text-white">{t.label}</span>
                      <span className="text-xs text-slate-400">{t.description}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name (as on CNIC) *" id="p-name"><input id="p-name" className={input} maxLength={140} value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></Field>
                {type.org && <Field label="Company / agency name *" id="p-firm"><input id="p-firm" className={input} maxLength={140} value={profile.firm_name} onChange={(e) => setProfile({ ...profile, firm_name: e.target.value })} /></Field>}
                <Field label="City *" id="p-city"><input id="p-city" className={input} maxLength={140} value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} /></Field>
                <Field label="Mobile *" id="p-phone"><input id="p-phone" inputMode="tel" className={input} maxLength={16} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></Field>
                <Field label="CNIC *" id="p-cnic"><input id="p-cnic" className={input} maxLength={15} placeholder="42101-1234567-1" value={profile.cnic} onChange={(e) => setProfile({ ...profile, cnic: e.target.value })} /></Field>
                <Field label="Experience (years)" id="p-exp"><input id="p-exp" inputMode="numeric" className={input} maxLength={2} value={profile.experience_years} onChange={(e) => setProfile({ ...profile, experience_years: e.target.value.replace(/\D/g, '') })} /></Field>
              </div>
              <Field label="Areas you work in" id="p-areas"><input id="p-areas" className={input} maxLength={1000} placeholder="e.g. Bahria Town Karachi, DHA City" value={profile.areas_served} onChange={(e) => setProfile({ ...profile, areas_served: e.target.value })} /></Field>
              <Field label="Specialization" id="p-spec"><input id="p-spec" className={input} maxLength={1000} placeholder="e.g. Residential plots, commercial, rentals, project sales" value={profile.specialization} onChange={(e) => setProfile({ ...profile, specialization: e.target.value })} /></Field>
              <Field label="Website or social link" id="p-web"><input id="p-web" className={input} maxLength={300} placeholder="https://" value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} /></Field>
              <Field label="About you" id="p-bio"><textarea id="p-bio" rows={3} className={input} maxLength={1000} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></Field>
              <p className="text-xs text-slate-500">After applying you can upload your CNIC and business documents from your member page. They are private to RealtorX.</p>
              <Next label="Continue" />
            </form>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><ScrollText className="h-5 w-5 text-[#F5A623]" /> The RealtorX Manifesto</h2>
              <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl bg-black/20 p-4 text-sm leading-relaxed text-slate-300">
                {MANIFESTO.map((p) => <p key={p}>{p}</p>)}
                <p className="border-l-2 border-[#F5A623] pl-3 italic text-slate-200">{PHILOSOPHY}</p>
              </div>
              <Accept checked={accepted.manifesto} onChange={(v) => setAccepted({ ...accepted, manifesto: v })} label="I have read the RealtorX Manifesto." />
              <StepNav back={() => go(1)} next={() => (accepted.manifesto ? go(3) : setError('Please confirm you have read the Manifesto.'))} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white">The RealtorX Code</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {CODE.map(([title, text], i) => (
                  <li key={title} className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="text-sm font-semibold text-white">{i + 1}. {title}</p>
                    <p className="mt-1 text-xs text-slate-400">{text}</p>
                  </li>
                ))}
              </ul>
              <Accept checked={accepted.code} onChange={(v) => setAccepted({ ...accepted, code: v })} label="I agree to follow the RealtorX Code." />
              <StepNav back={() => go(2)} next={() => (accepted.code ? go(4) : setError('Please agree to the RealtorX Code.'))} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><ShieldCheck className="h-5 w-5 text-[#F5A623]" /> The RealtorX Oath</h2>
              <div className="space-y-2 rounded-xl border border-[#F5A623]/20 bg-[#F5A623]/5 p-5 text-sm leading-relaxed text-slate-200">
                {OATH.map((line) => <p key={line}>{line}</p>)}
              </div>
              <Accept checked={accepted.oath} onChange={(v) => setAccepted({ ...accepted, oath: v })} label="I take the RealtorX Oath." />
              <Field label={`Sign by typing your full name (${profile.full_name || 'as in your profile'})`} id="o-sign">
                <input id="o-sign" className={`${input} font-serif text-lg italic`} maxLength={140} value={signature} onChange={(e) => setSignature(e.target.value)} autoComplete="off" />
              </Field>
              <div className="flex items-center justify-between gap-3">
                <button onClick={() => go(3)} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"><ChevronLeft className="h-4 w-4" /> Back</button>
                <button
                  onClick={() => (accepted.oath ? submit() : setError('Please take the Oath to apply.'))}
                  disabled={busy}
                  className="flex items-center gap-2 rounded-xl bg-[#F5A623] px-6 py-3 text-sm font-bold text-slate-950 hover:brightness-110 disabled:opacity-50"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit application
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ApplicationStatus({ membership, onNavigate }: { membership: MyMembership; onNavigate: Nav }) {
  const approved = ['Approved', 'Active'].includes(membership.status);
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5A623]/10 text-[#F5A623]">
        {approved ? <BadgeCheck className="h-8 w-8" /> : <ShieldCheck className="h-8 w-8" />}
      </div>
      <h1 className="text-2xl font-bold text-white">{approved ? `Welcome, member ${membership.member_id}` : membership.status === 'Suspended' ? 'Membership suspended' : 'Application received'}</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">
        {approved
          ? 'Your RealtorX membership is active. Your member page has your digital member card, listings, Solution Desk cases and Hub bookings.'
          : membership.status === 'Suspended'
            ? membership.decline_reason || 'Please contact RealtorX.'
            : membership.status === 'Orientation'
              ? 'Your verification is complete. Please attend an orientation at the RealtorX Hub; register for one on the Hub page. You will be approved after it.'
              : 'Thank you for taking the RealtorX Oath. Next: verification by the Community Team, then an orientation at the Hub. Upload your CNIC on your member page to speed this up.'}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={() => onNavigate('member')} className="rounded-xl bg-[#F5A623] px-6 py-3 text-sm font-bold text-slate-950">Go to my member page</button>
        {membership.status === 'Orientation' && <button onClick={() => onNavigate('hub')} className="rounded-xl border border-white/15 px-6 py-3 text-sm text-white">See orientations</button>}
      </div>
    </div>
  );
}

function Centered({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="mt-3 text-sm text-slate-400">{text}</p>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-200">{label}</label>
      {children}
    </div>
  );
}

function Accept({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 p-3 text-sm text-white">
      <input type="checkbox" className="h-4 w-4 accent-[#F5A623]" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {label}
    </label>
  );
}

function Next({ busy, label }: { busy?: boolean; label: string }) {
  return (
    <div className="flex justify-end">
      <button type="submit" disabled={busy} className="flex items-center gap-2 rounded-xl bg-[#F5A623] px-6 py-3 text-sm font-bold text-slate-950 hover:brightness-110 disabled:opacity-50">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} {label}
      </button>
    </div>
  );
}

function StepNav({ back, next }: { back: () => void; next: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <button onClick={back} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"><ChevronLeft className="h-4 w-4" /> Back</button>
      <button onClick={next} className="rounded-xl bg-[#F5A623] px-6 py-3 text-sm font-bold text-slate-950 hover:brightness-110">Continue</button>
    </div>
  );
}
