// RealtorX Agent application: details → email code and a password for "My application" → profile and ID number → ID
// documents → selfie video saying a code phrase → terms and submit. The application key is kept in this browser; on
// another device the applicant signs in on "My application" (/my-application) to continue. No dashboard account yet.
import React, { useEffect, useRef, useState } from 'react';
import { Check, RefreshCw, Upload, Video } from 'lucide-react';
import { callGet, callPost, uploadFile } from '../../services/api/client';
import { APPLICATION_STORE as STORE, Saved, loadJSON, saveJSON } from './applicationStore';
import { Alert, Button, Checkbox, Field, inputClass, textareaClass } from '../../components/site/ui';
import PhoneInput from '../../components/site/PhoneInput';

const API = 'realtor_x.api.agents';

interface Status {
  application: string;
  status: string;
  email: string;
  email_verified: number;
  full_name: string;
  mobile: string;
  id_type: string | null;
  documents: Record<'id_front' | 'id_back' | 'photo' | 'selfie_video', boolean>;
  city?: string | null;
  areas_served?: string | null;
  experience_years?: number | null;
  current_agency?: string | null;
  languages?: string | null;
  about?: string | null;
  id_number?: string | null;
  kyc_phrase?: string;
  rejection_reason?: string | null;
}

const STEPS = ['Details', 'Verify', 'Profile', 'ID', 'Video', 'Submit'];

const load = () => loadJSON<Saved>(STORE);
const store = (s: Saved | null) => saveJSON(STORE, s);

export default function AgentApplication() {
  const [saved, setSaved] = useState<Saved | null>(load);
  const [status, setStatus] = useState<Status | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  /** Reload the application; `advance` moves to the first incomplete step (off while the applicant is choosing documents). */
  const refresh = async (s: Saved | null = saved, advance = true) => {
    if (!s) return;
    try {
      const st = await callGet<Status>(`${API}.apply_status`, { application: s.application, key: s.key });
      setStatus(st);
      if (st.status !== 'Draft' || !advance) return;
      if (!st.email_verified) setStep(1);
      else if (!st.city || !st.id_number) setStep(2);
      else if (!st.documents.id_front || !st.documents.id_back) setStep(3);
      else if (!st.documents.selfie_video) setStep(4);
      else setStep(5);
    } catch (e: any) {
      // Forget the saved application only when the server says it is gone or the key is wrong; a network error or a
      // server hiccup keeps it, so the applicant can try again without starting over.
      if (e?.status === 404 || e?.status === 403 || e?.status === 401 || e?.type === 'DoesNotExistError') {
        store(null);
        setSaved(null);
        setStep(0);
      } else {
        setError(e?.message || 'Cannot reach RealtorX. Check your connection and try again.');
      }
    }
  };

  useEffect(() => {
    if (saved) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  const args = () => ({ application: saved!.application, key: saved!.key });

  if (status && status.status !== 'Draft') {
    const first = status.full_name.split(' ')[0];
    return (
      <div className="rounded-3xl border border-line bg-panel p-8" role="status">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">Application {status.application}</p>
        <p className="mt-3 text-3xl font-medium tracking-[-0.03em] text-fg">
          {status.status === 'Approved' ? <>Welcome, <span className="em">{first}</span>.</> : status.status === 'Rejected' ? 'Not approved this time' : <>Thank you, <span className="em">{first}</span>.</>}
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-fg-2">
          {['Submitted', 'Under Review'].includes(status.status) && `The RealtorX team is reviewing your application and may call you for a short live video check. We will email ${status.email}.`}
          {status.status === 'Rejected' && (status.rejection_reason || 'Please contact RealtorX for details.')}
          {status.status === 'Approved' && 'You are now a RealtorX Agent. The RealtorX team will give you your Agent dashboard password.'}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button onClick={() => (window.location.href = status.status === 'Approved' ? '/agent/' : '/my-application')} arrow>{status.status === 'Approved' ? 'Open the Agent dashboard' : 'Follow your application'}</Button>
          <Button variant="ghost" onClick={() => { store(null); setSaved(null); setStatus(null); setStep(0); }}>Start a different application</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-panel p-6 sm:p-8">
      <ol className="mb-8 grid grid-cols-6 gap-1.5" aria-label="Application steps">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? 'step' : undefined}>
            <span className={`block h-[3px] rounded-full ${i < step ? 'bg-fg' : i === step ? 'bg-gradient-to-r from-blue to-flame' : 'bg-line-2'}`} />
            <span className={`mt-2 hidden text-[11px] sm:block ${i === step ? 'text-fg' : 'text-fg-3'}`}>{label}</span>
          </li>
        ))}
      </ol>
      <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3 sm:hidden">Step {step + 1} of 6 · {STEPS[step]}</p>

      {notice && <div className="mb-5"><Alert tone="success">{notice}</Alert></div>}

      {step === 0 && <DetailsStep busy={busy} onSubmit={(d) => run(async () => {
        const r = await callPost<Saved & { email: string }>(`${API}.apply_start`, d);
        const s = { application: r.application, key: r.key };
        store(s);
        setSaved(s);
        await refresh(s);
      })} />}

      {step === 1 && status && <CodeStep email={status.email} busy={busy}
        onVerify={(code, password) => run(async () => {
          await callPost(`${API}.apply_verify_code`, { ...args(), code, password });
          setNotice('Email verified. Use this email and password on "My application" to follow your application or continue it on another device.');
          await refresh();
        })}
        onResend={() => run(async () => { await callPost(`${API}.apply_resend_code`, args()); })} />}

      {step === 2 && status && <ProfileStep status={status} busy={busy}
        onSave={(d) => run(async () => { setNotice(null); await callPost(`${API}.apply_save_details`, { ...args(), ...d }); await refresh(); })} />}

      {step === 3 && status && (
        <DocumentsStep status={status} busy={busy}
          onUpload={(kind, file) => run(async () => { await uploadFile(`${API}.apply_upload`, file, { ...args(), kind }); await refresh(saved, false); })}
          onNext={() => setStep(4)} />
      )}

      {step === 4 && status && <VideoStep phrase={status.kyc_phrase || ''} done={status.documents.selfie_video} busy={busy}
        onUpload={(file) => run(async () => { await uploadFile(`${API}.apply_upload`, file, { ...args(), kind: 'selfie_video' }); await refresh(); })} />}

      {step === 5 && status && <SubmitStep busy={busy}
        onSubmit={() => run(async () => { await callPost(`${API}.apply_submit`, { ...args(), accept_terms: 1 }); await refresh(); })} />}

      {error && <div className="mt-5"><Alert>{error}</Alert></div>}
    </div>
  );
}

function DetailsStep({ busy, onSubmit }: { busy: boolean; onSubmit: (d: Record<string, string>) => void }) {
  const [d, setD] = useState({ full_name: '', email: '', mobile: '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(d); }} className="space-y-5">
      <p className="text-[15px] leading-relaxed text-fg-2">Start with your name, email and mobile number. We will email you a 6-digit code.</p>
      <Field label="Full name (as on your ID)" htmlFor="ap-name"><input id="ap-name" required minLength={3} value={d.full_name} onChange={(e) => setD({ ...d, full_name: e.target.value })} className={inputClass} autoComplete="name" /></Field>
      <Field label="Email" htmlFor="ap-email"><input id="ap-email" required type="email" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} className={inputClass} autoComplete="email" /></Field>
      <Field label="Mobile number" htmlFor="ap-mobile"><PhoneInput id="ap-mobile" required value={d.mobile} onChange={(v) => setD({ ...d, mobile: v })} /></Field>
      <Button type="submit" size="lg" busy={busy} className="w-full">Continue</Button>
    </form>
  );
}

function CodeStep({ email, busy, onVerify, onResend }: { email: string; busy: boolean; onVerify: (code: string, password: string) => void; onResend: () => void }) {
  const [code, setCode] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [mismatch, setMismatch] = useState(false);
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (pwd !== pwd2) return setMismatch(true); onVerify(code, pwd); }} className="space-y-5">
      <p className="text-[15px] leading-relaxed text-fg-2">We sent a 6-digit code to <span className="text-fg">{email}</span>. Enter it and choose a password for "My application", where you follow your application on this website. (Approved agents get a separate Agent dashboard password from RealtorX.)</p>
      <Field label="Verification code" htmlFor="ap-code">
        <input id="ap-code" required inputMode="numeric" pattern="[0-9 ]{6,7}" maxLength={7} placeholder="000000" value={code} onChange={(e) => setCode(e.target.value)} className={`${inputClass} text-center text-xl tracking-[0.5em]`} autoComplete="one-time-code" />
      </Field>
      <Field label="Choose a password" htmlFor="ap-pwd" hint="At least 8 characters. A few words with a number works well.">
        <input id="ap-pwd" type="password" value={pwd} onChange={(e) => { setPwd(e.target.value); setMismatch(false); }} className={inputClass} autoComplete="new-password" />
      </Field>
      <Field label="Repeat the password" htmlFor="ap-pwd2" error={mismatch ? 'The passwords do not match.' : null}>
        <input id="ap-pwd2" type="password" value={pwd2} onChange={(e) => { setPwd2(e.target.value); setMismatch(false); }} className={inputClass} autoComplete="new-password" />
      </Field>
      <Button type="submit" size="lg" busy={busy} className="w-full">Verify email</Button>
      <button type="button" onClick={onResend} className="flex items-center gap-1.5 text-[13px] text-fg-3 hover:text-fg"><RefreshCw className="h-3.5 w-3.5" /> Send a new code</button>
    </form>
  );
}

function ProfileStep({ status, busy, onSave }: { status: Status; busy: boolean; onSave: (d: Record<string, string>) => void }) {
  const [d, setD] = useState({
    city: status.city || '', areas_served: status.areas_served || '', experience_years: String(status.experience_years ?? ''), current_agency: status.current_agency || '',
    languages: status.languages || '', about: status.about || '', id_number: status.id_number || '',
  });
  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD({ ...d, [k]: e.target.value });
  const idLabel = `${status.id_type || 'ID'} number`;
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(d); }} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="City" htmlFor="ap-city"><input id="ap-city" required value={d.city} onChange={set('city')} className={inputClass} /></Field>
        <Field label={idLabel} htmlFor="ap-id"><input id="ap-id" required value={d.id_number} onChange={set('id_number')} className={inputClass} /></Field>
        <Field label="Years in real estate" htmlFor="ap-years"><input id="ap-years" type="number" min={0} max={60} value={d.experience_years} onChange={set('experience_years')} className={inputClass} /></Field>
        <Field label="Current agency (if any)" htmlFor="ap-agency"><input id="ap-agency" value={d.current_agency} onChange={set('current_agency')} className={inputClass} /></Field>
      </div>
      <Field label="Areas you work in" htmlFor="ap-areas"><input id="ap-areas" placeholder="Bahria Town Karachi, DHA" value={d.areas_served} onChange={set('areas_served')} className={inputClass} /></Field>
      <Field label="Languages" htmlFor="ap-lang"><input id="ap-lang" placeholder="Urdu, English" value={d.languages} onChange={set('languages')} className={inputClass} /></Field>
      <Field label="About you (optional)" htmlFor="ap-about"><textarea id="ap-about" rows={3} value={d.about} onChange={set('about')} className={textareaClass} /></Field>
      <Button type="submit" size="lg" busy={busy} className="w-full">Save and continue</Button>
    </form>
  );
}

function FilePick({ label, done, accept, onPick, busy }: { label: string; done: boolean; accept: string; onPick: (f: File) => void; busy: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3.5">
      <span className="flex items-center gap-3 text-[15px] text-fg">
        <span className={`flex h-5 w-5 items-center justify-center rounded-full ${done ? 'bg-good/15 text-good' : 'border border-line-2'}`}>{done && <Check className="h-3 w-3" />}</span>
        {label}
      </span>
      <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => ref.current?.click()}><Upload className="h-3.5 w-3.5" strokeWidth={1.5} /> {done ? 'Replace' : 'Upload'}</Button>
      <input ref={ref} type="file" accept={accept} className="hidden" aria-label={label} onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ''; }} />
    </div>
  );
}

function DocumentsStep({ status, busy, onUpload, onNext }: { status: Status; busy: boolean; onUpload: (kind: string, f: File) => void; onNext: () => void }) {
  const id = status.id_type || 'ID';
  const ready = status.documents.id_front && status.documents.id_back;
  return (
    <div className="space-y-4">
      <p className="text-[15px] leading-relaxed text-fg-2">Clear photos (JPG or PNG) or a PDF. They are stored privately and seen only by the RealtorX verification team.</p>
      <FilePick label={`${id}, front`} done={status.documents.id_front} accept="image/jpeg,image/png,image/webp,application/pdf" busy={busy} onPick={(f) => onUpload('id_front', f)} />
      <FilePick label={`${id}, back`} done={status.documents.id_back} accept="image/jpeg,image/png,image/webp,application/pdf" busy={busy} onPick={(f) => onUpload('id_back', f)} />
      <FilePick label="Profile photo (optional)" done={status.documents.photo} accept="image/jpeg,image/png,image/webp" busy={busy} onPick={(f) => onUpload('photo', f)} />
      <Button size="lg" disabled={!ready || busy} onClick={onNext} className="mt-2 w-full">Continue</Button>
    </div>
  );
}

function VideoStep({ phrase, done, busy, onUpload }: { phrase: string; done: boolean; busy: boolean; onUpload: (f: File) => void }) {
  const live = useRef<HTMLVideoElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [clip, setClip] = useState<{ url: string; file: File } | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);
  // The live preview is a new <video> each time it shows (also after "Record again"): give it the camera again.
  useEffect(() => {
    if (!clip && stream && live.current) live.current.srcObject = stream;
  }, [clip, stream]);
  useEffect(() => () => { if (clip) URL.revokeObjectURL(clip.url); }, [clip]);
  const open = async () => {
    setCamError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
      setStream(s);
      if (live.current) live.current.srcObject = s;
    } catch {
      setCamError('Camera or microphone is not available. You can upload a short video instead.');
    }
  };
  const record = () => {
    if (!stream) return;
    const type = ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'].find((t) => MediaRecorder.isTypeSupported?.(t)) || '';
    // About 1.6 Mbit/s: 15 seconds stay near 3 MB, quick to upload on mobile data.
    const rec = new MediaRecorder(stream, { ...(type ? { mimeType: type } : {}), videoBitsPerSecond: 1_500_000, audioBitsPerSecond: 64_000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: rec.mimeType || 'video/webm' });
      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
      setClip({ url: URL.createObjectURL(blob), file: new File([blob], `selfie.${ext}`, { type: blob.type }) });
      setRecording(false);
    };
    recorder.current = rec;
    rec.start();
    setRecording(true);
    setTimeout(() => rec.state === 'recording' && rec.stop(), 15000);
  };
  return (
    <div className="space-y-5">
      <p className="text-[15px] leading-relaxed text-fg-2">Record a short video (up to 15 seconds) looking at the camera. Say your full name and this phrase:</p>
      <p className="rounded-2xl border border-line px-5 py-5 text-center font-serif text-3xl italic text-fg">“{phrase}”</p>
      <div className="overflow-hidden rounded-2xl bg-black">
        {clip ? <video src={clip.url} controls className="aspect-video w-full" /> : <video ref={live} autoPlay muted playsInline className="aspect-video w-full" />}
      </div>
      {camError && <Alert tone="info">{camError}</Alert>}
      <div className="flex flex-wrap items-center gap-2">
        {!stream && !clip && <Button type="button" variant="secondary" onClick={open}><Video className="h-4 w-4" strokeWidth={1.5} /> Turn on camera</Button>}
        {stream && !clip && (recording
          ? <Button type="button" onClick={() => recorder.current?.stop()} className="!bg-bad !text-white">Stop recording</Button>
          : <Button type="button" onClick={record}><span className="h-2.5 w-2.5 rounded-full bg-bad" /> Record</Button>)}
        {clip && (
          <>
            <Button type="button" busy={busy} onClick={() => onUpload(clip.file)}>Use this video</Button>
            <Button type="button" variant="secondary" onClick={() => setClip(null)}>Record again</Button>
          </>
        )}
        <button type="button" onClick={() => fileRef.current?.click()} className="px-3 text-[13px] text-fg-3 underline underline-offset-4 hover:text-fg">Upload a video file instead</button>
        <input ref={fileRef} type="file" accept="video/mp4,video/webm" className="hidden" aria-label="Selfie video file" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ''; }} />
      </div>
      {done && <p className="flex items-center gap-2 text-sm text-good"><Check className="h-4 w-4" /> Video received.</p>}
    </div>
  );
}

function SubmitStep({ busy, onSubmit }: { busy: boolean; onSubmit: () => void }) {
  const [ok, setOk] = useState(false);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
      <div className="rounded-2xl border border-line p-5 text-[14px] leading-relaxed text-fg-2">
        <p className="mb-3 font-medium text-fg">RealtorX Agent terms, in short</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>You sell RealtorX inventory and follow RealtorX’s prices and payment plans.</li>
          <li>Commission is agreed for each project; your share and when it is paid are explained when you are approved.</li>
          <li>You never take buyer payments yourself; buyers pay only through the official payment route.</li>
          <li>Your ID and video are used only to verify you and are kept private.</li>
        </ul>
      </div>
      <Checkbox id="ap-terms" checked={ok} onChange={setOk}>I confirm my details are true and I accept the <a href="/agent-terms" target="_blank" rel="noreferrer" className="underline underline-offset-4">RealtorX Agent Terms</a> and the <a href="/privacy" target="_blank" rel="noreferrer" className="underline underline-offset-4">Privacy Policy</a>.</Checkbox>
      <Button type="submit" size="lg" disabled={!ok} busy={busy} className="w-full">Submit application</Button>
    </form>
  );
}
