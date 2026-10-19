import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Loader2 } from 'lucide-react';
import { callGet, callPost } from '../services/api/client';
import { PageId } from '../types';

interface ProjectOption {
  name: string;
  project_name: string;
}

interface PropertySummary {
  name: string;
  property_title: string;
  project: string;
  project_name?: string;
}

const PK_MOBILE = /^(\+?92|0)?3\d{9}$/;
const MAX_DAYS_AHEAD = 90;

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const input =
  'w-full rounded-lg border border-white/10 bg-[#081221] p-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#F5A623]';

export default function SiteVisitPage({
  propertyId,
  onNavigate,
}: {
  propertyId: string | null;
  onNavigate: (page: PageId, id?: string) => void;
}) {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [property, setProperty] = useState<PropertySummary | null>(null);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', project_id: '', visit_date: isoDate(1), visit_slot: 'Morning', message: '', consent: false,
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    callGet<ProjectOption[]>('realtor_x.api.v1.get_public_projects')
      .then((rows) => setProjects(rows || []))
      .catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    if (!propertyId) return;
    callGet<PropertySummary>('realtor_x.api.v1.get_public_property_details', { property_id: propertyId })
      .then((p) => {
        setProperty(p);
        setForm((f) => ({ ...f, project_id: p.project || f.project_id }));
      })
      .catch(() => setProperty(null));
  }, [propertyId]);

  const phoneDigits = form.phone.replace(/[\s-]/g, '');
  const problems = useMemo(() => {
    const p: string[] = [];
    if (form.name.trim().length < 2) p.push('Please enter your full name.');
    if (!PK_MOBILE.test(phoneDigits)) p.push('Enter a valid mobile number, e.g. 0300 1234567.');
    if (!form.visit_date) p.push('Please choose a preferred date.');
    if (!form.consent) p.push('Please confirm that we may contact you.');
    return p;
  }, [form, phoneDigits]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (problems.length) {
      setError(problems[0]);
      return;
    }
    setStatus('sending');
    try {
      const result = await callPost<{ lead: string; duplicate: boolean }>('realtor_x.api.v1.request_site_visit', {
        name: form.name.trim(),
        phone: phoneDigits,
        email: form.email.trim(),
        project_id: form.project_id,
        property_id: property?.name || '',
        visit_date: form.visit_date,
        visit_slot: form.visit_slot,
        message: form.message.trim(),
        consent: 1,
        landing_page: window.location.pathname.slice(0, 500),
      });
      if (!result?.lead) throw new Error('We could not send your request. Please try again or call us.');
      setReference(result.lead);
      setStatus('done');
    } catch (err: any) {
      setError(err?.message || 'We could not send your request. Please try again or call us.');
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="text-2xl font-bold text-white">Visit request received</h1>
        <p className="mt-3 text-sm text-slate-400">
          This is a request, not a confirmed appointment. Our team will call you to confirm the date, time and meeting
          point.
        </p>
        <p className="mt-4 text-xs text-slate-500">
          Reference <span className="font-mono text-[#F5A623]">{reference}</span>
        </p>
        <button
          onClick={() => onNavigate('properties')}
          className="mt-8 rounded-lg bg-[#F5A623] px-6 py-2.5 font-semibold text-black hover:bg-[#d98c15]"
        >
          Continue browsing
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <CalendarDays className="mx-auto mb-3 h-8 w-8 text-[#F5A623]" aria-hidden="true" />
        <h1 className="text-3xl font-bold text-white">Request a site visit</h1>
        <p className="mt-2 text-sm text-slate-400">
          Tell us when suits you. A RealtorX advisor will call to confirm before the visit.
        </p>
      </div>

      <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl border border-white/10 bg-[#0B1A30] p-6">
        {property && (
          <div className="rounded-lg border border-white/10 bg-[#081221] p-3 text-sm">
            <span className="text-slate-500">Property: </span>
            <span className="text-white">{property.property_title}</span>
            {property.project_name && <span className="text-slate-400"> · {property.project_name}</span>}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sv-name" className="mb-1 block text-xs text-slate-400">Full name *</label>
            <input id="sv-name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
          </div>
          <div>
            <label htmlFor="sv-phone" className="mb-1 block text-xs text-slate-400">Mobile number *</label>
            <input
              id="sv-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={16}
              placeholder="0300 1234567"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d\s+-]/g, '') })}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="sv-email" className="mb-1 block text-xs text-slate-400">Email (optional)</label>
            <input id="sv-email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
          </div>
          <div>
            <label htmlFor="sv-project" className="mb-1 block text-xs text-slate-400">Project</label>
            <select
              id="sv-project"
              value={form.project_id}
              disabled={!!property}
              onChange={(e) => setForm({ ...form, project_id: e.target.value })}
              className={input}
            >
              <option value="">Not sure yet</option>
              {projects.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.project_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sv-date" className="mb-1 block text-xs text-slate-400">Preferred date *</label>
            <input
              id="sv-date"
              type="date"
              min={isoDate(0)}
              max={isoDate(MAX_DAYS_AHEAD)}
              value={form.visit_date}
              onChange={(e) => setForm({ ...form, visit_date: e.target.value })}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="sv-slot" className="mb-1 block text-xs text-slate-400">Preferred time</label>
            <select id="sv-slot" value={form.visit_slot} onChange={(e) => setForm({ ...form, visit_slot: e.target.value })} className={input}>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="sv-message" className="mb-1 block text-xs text-slate-400">Anything we should know? (optional)</label>
          <textarea id="sv-message" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${input} resize-none`} />
        </div>

        <label className="flex items-start gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            className="mt-0.5 h-4 w-4 accent-[#F5A623]"
          />
          <span>
            I agree that RealtorX may contact me about this request. See our{' '}
            <button type="button" onClick={() => onNavigate('privacy')} className="text-[#F5A623] hover:underline">
              privacy notice
            </button>
            .
          </span>
        </label>

        {error && (
          <div role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F5A623] py-3 font-bold text-black hover:bg-[#d98c15] disabled:opacity-50"
        >
          {status === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === 'sending' ? 'Sending…' : 'Request visit'}
        </button>
      </form>
    </div>
  );
}
