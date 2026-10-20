// Solution Desk (/solutions): anyone can describe a problem; RealtorX assigns, tracks and resolves it.
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Gavel, Handshake, Hourglass, LifeBuoy, Loader2, Megaphone, PackageOpen, TrendingDown } from 'lucide-react';
import { PageId } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { callGet, callPost } from '../../services/api/client';

type Nav = (page: PageId, id?: string) => void;

const EXAMPLES: [React.ElementType, string, string][] = [
  [TrendingDown, 'Stuck investment', 'Your money is stuck in a project or a file is not moving.'],
  [Hourglass, 'Project delay', 'Possession or development is long overdue.'],
  [Handshake, 'Merger / partnership', 'You need a partner, joint venture or merger.'],
  [PackageOpen, 'Inventory liquidation', 'You need to sell bulk inventory quickly and fairly.'],
  [Gavel, 'Legal & documentation', 'Transfer, title or documentation problems.'],
  [Megaphone, 'Sales & marketing support', 'Your project needs realtors, campaigns or launch support.'],
];
const input = 'w-full rounded-lg border border-white/10 bg-[#081221] px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F5A623]/60 focus:outline-none';

export default function SolutionsPage({ onNavigate }: { onNavigate: Nav }) {
  const { user, isAuthenticated } = useAuth();
  const [types, setTypes] = useState<string[]>([]);
  const [form, setForm] = useState({ case_type: '', subject: '', description: '', contact_name: '', contact_phone: '', contact_email: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    callGet<string[]>('realtor_x.api.community.get_case_types').then(setTypes).catch(() => setTypes([]));
  }, []);
  useEffect(() => {
    if (user) setForm((f) => ({ ...f, contact_name: f.contact_name || user.full_name, contact_phone: f.contact_phone || user.phone || '', contact_email: f.contact_email || user.email }));
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.case_type) return setError('Please choose what kind of help you need.');
    if (form.description.trim().length < 20) return setError('Please describe the problem in at least 20 characters.');
    setBusy(true);
    try {
      const res = await callPost<{ case: string }>('realtor_x.api.community.submit_case', form);
      setDone(res.case);
    } catch (err: any) {
      setError(err?.message || 'Could not submit your case.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1A30] pb-16">
      <section className="border-b border-white/[0.06] bg-gradient-to-b from-[#081221] to-[#0B1A30]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F5A623]"><LifeBuoy className="h-4 w-4" /> RealtorX Solution Desk</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold text-white sm:text-4xl">Real estate problems deserve real solutions</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
            Tell us what is stuck. A RealtorX case manager reviews it, brings in the right members and partners, and keeps you updated until it is resolved.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EXAMPLES.map(([Icon, title, text]) => (
              <li key={title} className="rounded-xl border border-white/10 bg-[#081221] p-4">
                <Icon className="h-5 w-5 text-[#F5A623]" />
                <p className="mt-2 text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs text-slate-400">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        <ol className="mb-8 grid grid-cols-4 gap-2 text-center text-xs text-slate-400">
          {['Submit', 'Assigned', 'Tracked', 'Resolved'].map((s, i) => (
            <li key={s} className="rounded-lg border border-white/10 bg-[#081221] py-2"><span className="font-bold text-[#F5A623]">{i + 1}.</span> {s}</li>
          ))}
        </ol>

        {done ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center" role="status">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-300" />
            <h2 className="mt-3 text-xl font-semibold text-white">Case {done} submitted</h2>
            <p className="mt-2 text-sm text-slate-300">A case manager will contact you. {isAuthenticated ? 'You can follow updates on your member page.' : 'Sign in with the same email to follow updates online.'}</p>
            {isAuthenticated && <button onClick={() => onNavigate('member', `cases/${done}`)} className="mt-5 rounded-xl bg-[#F5A623] px-5 py-2.5 text-sm font-bold text-slate-950">Follow this case</button>}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-[#081221] p-6">
            <h2 className="text-lg font-semibold text-white">Submit a problem</h2>
            {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200" role="alert">{error}</div>}
            <div>
              <label htmlFor="c-type" className="mb-1.5 block text-sm text-slate-200">What do you need help with? *</label>
              <select id="c-type" className={input} value={form.case_type} onChange={(e) => setForm({ ...form, case_type: e.target.value })}>
                <option value="">Choose…</option>
                {types.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="c-subject" className="mb-1.5 block text-sm text-slate-200">Subject *</label>
              <input id="c-subject" className={input} required minLength={5} maxLength={200} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Possession delayed in project X" />
            </div>
            <div>
              <label htmlFor="c-desc" className="mb-1.5 block text-sm text-slate-200">Describe the problem *</label>
              <textarea id="c-desc" rows={6} className={input} maxLength={5000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What happened, since when, which project / developer, what you have tried." />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="c-name" className="mb-1.5 block text-sm text-slate-200">Your name *</label>
                <input id="c-name" className={input} required maxLength={140} value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
              </div>
              <div>
                <label htmlFor="c-phone" className="mb-1.5 block text-sm text-slate-200">Mobile *</label>
                <input id="c-phone" inputMode="tel" className={input} required maxLength={16} value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} placeholder="03XX XXXXXXX" />
              </div>
              <div>
                <label htmlFor="c-email" className="mb-1.5 block text-sm text-slate-200">Email</label>
                <input id="c-email" type="email" className={input} maxLength={140} value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
              </div>
            </div>
            <p className="text-xs text-slate-500">Your details are used only to work on this case. See our privacy notice.</p>
            <div className="flex justify-end">
              <button type="submit" disabled={busy} className="flex items-center gap-2 rounded-xl bg-[#F5A623] px-6 py-3 text-sm font-bold text-slate-950 hover:brightness-110 disabled:opacity-50">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit case
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
