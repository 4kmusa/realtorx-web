// Visit request and booking request forms. The server validates the unit/project, re-checks the unit
// status under a lock and returns a reference. A booking request holds the unit while RealtorX reviews
// it; it is not a confirmed booking.
import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, CheckCircle2, Loader2, X } from 'lucide-react';
import { callPost } from '../../services/api/client';
import { useAuth } from '../../context/AuthContext';

export type RequestMode = 'visit' | 'booking';

interface Props {
  mode: RequestMode;
  unitId?: string | null;
  projectId?: string | null;
  title: string;
  onClose: () => void;
  onDone?: (reference: string) => void;
}

const SLOTS = ['Morning', 'Afternoon', 'Evening'];
const input = 'w-full rounded-lg border border-white/10 bg-[#081221] px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F5A623]/60 focus:outline-none';

function utm(): Record<string, string> {
  const out: Record<string, string> = {};
  const params = new URLSearchParams(window.location.search);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign']) {
    const v = params.get(key);
    if (v) out[key] = v.slice(0, 140);
  }
  return out;
}

export default function RequestModal({ mode, unitId, projectId, title, onClose, onDone }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.full_name || '', phone: user?.phone || '', email: user?.email || '', visit_date: '', visit_slot: 'Morning', message: '', consent: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reference: string; hours?: number } | null>(null);
  const first = useRef<HTMLInputElement>(null);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  useEffect(() => {
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^(\+92|0)?3\d{9}$/.test(form.phone.replace(/[\s-]/g, ''))) return setError('Please enter a valid Pakistani mobile number, e.g. 03001234567.');
    if (!form.consent) return setError('Please agree that RealtorX may contact you about this request.');
    if (mode === 'visit' && !form.visit_date) return setError('Please choose a preferred visit date.');
    setBusy(true);
    try {
      const payload = {
        property_id: unitId || undefined,
        project_id: projectId || undefined,
        name: form.name.trim(),
        phone: form.phone.replace(/[\s-]/g, ''),
        email: form.email.trim() || undefined,
        message: form.message.trim() || undefined,
        consent: 1,
        landing_page: window.location.pathname.slice(0, 500),
        ...(mode === 'visit' ? { visit_date: form.visit_date, visit_slot: form.visit_slot } : {}),
        ...utm(),
      };
      const res = await callPost<{ reference: string; hold_hours?: number }>(
        mode === 'visit' ? 'realtor_x.api.v1.request_visit' : 'realtor_x.api.v1.request_booking',
        payload
      );
      setDone({ reference: res.reference, hours: res.hold_hours });
      onDone?.(res.reference);
    } catch (err: any) {
      setError(err?.message || 'Could not send your request.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="req-title" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0B1A30] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="req-title" className="text-lg font-semibold text-white">{mode === 'visit' ? 'Request a visit' : 'Request booking'}</h2>
            <p className="text-xs text-slate-400">{title}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        {done ? (
          <div className="mt-6 text-center" role="status">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
            <p className="mt-3 font-semibold text-white">Request received</p>
            <p className="mt-1 text-sm text-slate-300">Reference <span className="font-mono text-[#F5A623]">{done.reference}</span></p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {mode === 'visit'
                ? 'The RealtorX realtor for this property will call you to confirm the appointment.'
                : `The unit is held for you for up to ${done.hours || 48} hours while RealtorX reviews your request. This is a request, not a confirmed booking; we will call you about the next steps.`}
            </p>
            <button onClick={onClose} className="mt-6 w-full rounded-xl bg-[#F5A623] py-3 text-sm font-bold text-slate-950">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200" role="alert">{error}</p>}
            <label className="block text-sm text-slate-200">Full name *<input ref={first} className={`${input} mt-1`} required minLength={2} maxLength={140} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label className="block text-sm text-slate-200">Mobile *<input className={`${input} mt-1`} required inputMode="tel" maxLength={16} placeholder="03XX XXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label className="block text-sm text-slate-200">Email<input type="email" className={`${input} mt-1`} maxLength={140} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            {mode === 'visit' && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm text-slate-200">Preferred date *<input type="date" className={`${input} mt-1`} min={tomorrow} required value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} /></label>
                <label className="block text-sm text-slate-200">Time
                  <select className={`${input} mt-1`} value={form.visit_slot} onChange={(e) => setForm({ ...form, visit_slot: e.target.value })}>
                    {SLOTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
              </div>
            )}
            <label className="block text-sm text-slate-200">Message<textarea rows={3} className={`${input} mt-1`} maxLength={2000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
            {mode === 'booking' && (
              <p className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-200">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" /> The unit will be held for you while RealtorX reviews the request (up to 48 hours). Price and availability are confirmed by RealtorX.
              </p>
            )}
            <label className="flex items-start gap-2 text-xs text-slate-300">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#F5A623]" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
              I agree that RealtorX may contact me by phone, WhatsApp or email about this request.
            </label>
            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] py-3 text-sm font-bold text-slate-950 disabled:opacity-50">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} {mode === 'visit' ? 'Send visit request' : 'Send booking request'}
            </button>
            <p className="text-[11px] text-slate-500">Your details are used only for this request. Phone numbers are never shown publicly.</p>
          </form>
        )}
      </div>
    </div>
  );
}
