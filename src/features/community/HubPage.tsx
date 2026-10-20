// RealtorX Hub (/hub): upcoming events with registration, and the spaces members can request.
import React, { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Loader2, MapPin, Users, X } from 'lucide-react';
import { PageId } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { callGet, callPost } from '../../services/api/client';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

type Nav = (page: PageId, id?: string) => void;

export interface HubEvent {
  name: string;
  title: string;
  event_type: string;
  starts_on: string;
  ends_on: string | null;
  venue_space: string | null;
  venue: string | null;
  description: string;
  capacity: number | null;
  seats_left: number | null;
  registration_open: number;
  members_only: number;
}

export function formatWhen(value: string | null): string {
  if (!value) return '';
  const d = new Date(value.replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString('en-PK', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

const input = 'w-full rounded-lg border border-white/10 bg-[#081221] px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F5A623]/60 focus:outline-none';

export default function HubPage({ onNavigate }: { onNavigate: Nav }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<HubEvent[] | null>(null);
  const [register, setRegister] = useState<HubEvent | null>(null);

  useEffect(() => {
    callGet<HubEvent[]>('realtor_x.api.community.get_events').then(setEvents).catch(() => setEvents([]));
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1A30] pb-16">
      <section className="border-b border-white/[0.06] bg-gradient-to-b from-[#081221] to-[#0B1A30]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#F5A623]">RealtorX Hub</p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Where the community meets</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
            Meeting rooms, desks and developer pods for members, plus orientations, oath ceremonies, trainings and networking events.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => onNavigate(user?.member?.is_approved ? 'member' : 'join', user?.member?.is_approved ? 'hub' : undefined)} className="rounded-xl bg-[#F5A623] px-5 py-2.5 text-sm font-bold text-slate-950">
              {user?.member?.is_approved ? 'Book a room or desk' : 'Become a member to book spaces'}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <h2 className="mb-5 text-xl font-semibold text-white">Upcoming events</h2>
        {!events ? (
          <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-48 rounded-2xl" /></div>
        ) : events.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No upcoming events" description="New orientations and trainings are announced here." />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {events.map((e) => (
              <li key={e.name} className="flex flex-col rounded-2xl border border-white/10 bg-[#081221] p-5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded bg-[#F5A623]/15 px-2 py-0.5 font-semibold text-[#F5A623]">{e.event_type}</span>
                  {e.members_only ? <span className="rounded bg-white/10 px-2 py-0.5 text-slate-300">Members only</span> : null}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{e.title}</h3>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-300"><CalendarDays className="h-4 w-4 text-slate-500" /> {formatWhen(e.starts_on)}</p>
                {(e.venue || e.venue_space) && <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300"><MapPin className="h-4 w-4 text-slate-500" /> {e.venue || e.venue_space}</p>}
                {e.seats_left != null && <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300"><Users className="h-4 w-4 text-slate-500" /> {e.seats_left} seats left</p>}
                {e.description && <div className="prose prose-invert mt-3 line-clamp-4 text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: e.description }} />}
                <div className="mt-auto pt-4">
                  {e.registration_open && e.seats_left !== 0 ? (
                    <button onClick={() => setRegister(e)} className="rounded-lg bg-[#F5A623] px-4 py-2 text-xs font-bold text-slate-950">Register</button>
                  ) : (
                    <span className="text-xs text-slate-500">Registration closed</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {register && <RegisterModal event={register} onClose={() => setRegister(null)} />}
    </div>
  );
}

function RegisterModal({ event, onClose }: { event: HubEvent; onClose: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '', email: user?.email || '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await callPost<{ status: string }>('realtor_x.api.community.register_for_event', { event: event.name, ...form });
      setDone(res.status === 'already_registered' ? 'You are already registered for this event.' : 'You are registered. See you there!');
    } catch (err: any) {
      setError(err?.message || 'Could not register.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="reg-title" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0B1A30] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="reg-title" className="text-lg font-semibold text-white">Register</h2>
            <p className="text-xs text-slate-400">{event.title} · {formatWhen(event.starts_on)}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        {done ? (
          <p className="mt-6 flex items-center gap-2 text-sm text-emerald-300" role="status"><CheckCircle2 className="h-5 w-5" /> {done}</p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            {error && <p className="rounded-lg bg-red-500/10 p-2 text-sm text-red-200" role="alert">{error}</p>}
            <label className="block text-sm text-slate-200">Full name<input className={`${input} mt-1`} required maxLength={140} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label>
            <label className="block text-sm text-slate-200">Mobile<input className={`${input} mt-1`} required inputMode="tel" maxLength={16} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label className="block text-sm text-slate-200">Email<input type="email" className={`${input} mt-1`} maxLength={140} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] py-3 text-sm font-bold text-slate-950 disabled:opacity-50">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
