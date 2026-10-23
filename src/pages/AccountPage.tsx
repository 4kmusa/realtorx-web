// My account (/account): a signed-in buyer's enquiries, site visit requests and booking requests with their status,
// their contact details (used on every request), password change and sign-out. Signed out: the sign-in form.
import React, { useEffect, useState } from 'react';
import { CalendarDays, Home, KeyRound, LogOut, MessageSquare, UserRound } from 'lucide-react';
import { PageId } from '../types';
import { Alert, Button, Container, Eyebrow, Field, inputClass } from '../components/site/ui';
import { Skeleton } from '../components/ui/Skeleton';
import { callPost } from '../services/api/client';
import AuthForms from '../features/buyer/AuthForms';
import { BuyerRequest, useBuyer } from '../features/buyer/session';
import PhoneInput from '../components/site/PhoneInput';

type Nav = (page: PageId, id?: string) => void;

const TONE: Record<string, string> = {
  New: 'bg-white/10 text-fg-2', Contacted: 'bg-blue/15 text-blue-2', Qualified: 'bg-blue/15 text-blue-2', 'Pending Review': 'bg-amber-500/15 text-amber-300',
  Approved: 'bg-emerald-500/15 text-emerald-300', Won: 'bg-emerald-500/15 text-emerald-300', Converted: 'bg-emerald-500/15 text-emerald-300',
  Rejected: 'bg-red-500/15 text-red-300', Lost: 'bg-white/10 text-fg-3', Expired: 'bg-white/10 text-fg-3', Cancelled: 'bg-white/10 text-fg-3',
};
const day = (d?: string | null) => (d ? new Date(`${d.slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

function Requests({ title, icon: Icon, rows, empty, detail, onOpen }: { title: string; icon: React.ElementType; rows: BuyerRequest[]; empty: string;
  detail?: (r: BuyerRequest) => string | null; onOpen: (r: BuyerRequest) => void }) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3"><Icon className="h-4 w-4" /> {title}</h2>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-5 text-[14px] text-fg-3">{empty}</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-panel">
          {rows.map((r) => (
            <li key={r.reference}>
              <button onClick={() => onOpen(r)} disabled={!r.unit} className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left enabled:hover:bg-white/[0.02]">
                <span className="min-w-0">
                  <span className="block truncate text-[15px] text-fg">{r.title}</span>
                  <span className="text-[12px] text-fg-3">{[r.reference, day(r.date), detail?.(r)].filter(Boolean).join(' · ')}</span>
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[12px] ${TONE[r.status] || 'bg-white/10 text-fg-2'}`}>{r.status}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AccountPage({ onNavigate }: { onNavigate: Nav }) {
  const { buyer, loading, refresh, signOut } = useBuyer();
  const [profile, setProfile] = useState({ full_name: '', phone: '' });
  const [pwd, setPwd] = useState({ old: '', next: '', again: '' });
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string; where: 'profile' | 'password' } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'My account | RealtorX';
    if (buyer) setProfile({ full_name: buyer.full_name, phone: buyer.phone || '' });
  }, [buyer]);
  useEffect(() => {
    refresh(); // fresh statuses every time the page opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !buyer) return <Container className="py-20"><Skeleton className="h-10 w-1/3" /><Skeleton className="mt-6 h-64 rounded-2xl" /></Container>;
  if (!buyer) {
    return (
      <Container narrow className="py-16 md:py-24">
        <Eyebrow className="mb-6">My account</Eyebrow>
        <h1 className="mb-8 text-[36px] font-medium tracking-[-0.03em] text-fg md:text-5xl">Sign in to <span className="em">continue</span>.</h1>
        <div className="max-w-md"><AuthForms /></div>
      </Container>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await callPost('realtor_x.api.buyers.update_profile', { full_name: profile.full_name, phone: profile.phone });
      await refresh();
      setMsg({ tone: 'success', text: 'Saved. New requests use these details.', where: 'profile' });
    } catch (err: any) {
      setMsg({ tone: 'error', text: err.message, where: 'profile' });
    } finally {
      setBusy(false);
    }
  };
  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (pwd.next !== pwd.again) return setMsg({ tone: 'error', text: 'The two new passwords are not the same.', where: 'password' });
    setBusy(true);
    try {
      await callPost('realtor_x.api.buyers.change_password', { old_password: pwd.old, new_password: pwd.next });
      await refresh();
      setPwd({ old: '', next: '', again: '' });
      setMsg({ tone: 'success', text: 'Password changed. You were signed out on other devices.', where: 'password' });
    } catch (err: any) {
      setMsg({ tone: 'error', text: err.message, where: 'password' });
    } finally {
      setBusy(false);
    }
  };
  const open = (r: BuyerRequest) => r.unit && onNavigate('property-detail', r.unit);

  return (
    <div className="bg-ink pb-24">
      <Container className="pt-14 md:pt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow className="mb-4">My account</Eyebrow>
            <h1 className="text-[36px] font-medium tracking-[-0.03em] text-fg md:text-5xl">Hello, <span className="em">{buyer.full_name.split(' ')[0]}</span>.</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onNavigate('properties')}>Browse properties</Button>
            <Button variant="ghost" onClick={async () => { await signOut(); onNavigate('home'); }}><LogOut className="h-4 w-4" /> Sign out</Button>
          </div>
        </div>

        <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_360px]">
          <div className="space-y-12">
            <Requests title="Booking requests" icon={Home} rows={buyer.bookings} onOpen={open} empty="No booking requests yet."
              detail={(r) => (r.status === 'Pending Review' && r.expires_on ? `held until ${day(r.expires_on)}` : r.project || null)} />
            <Requests title="Site visits" icon={CalendarDays} rows={buyer.visits} onOpen={open} empty="No visit requests yet."
              detail={(r) => (r.visit_date ? `${day(r.visit_date)}${r.visit_slot ? `, ${r.visit_slot.toLowerCase()}` : ''}` : null)} />
            <Requests title="Enquiries" icon={MessageSquare} rows={buyer.enquiries} onOpen={open} empty="No enquiries yet." />
          </div>

          <aside className="space-y-8">
            <form onSubmit={save} className="space-y-4 rounded-2xl border border-line bg-panel p-6">
              <h2 className="flex items-center gap-2 text-[15px] font-medium text-fg"><UserRound className="h-4 w-4" /> Your details</h2>
              <p className="text-[13px] text-fg-3">RealtorX uses these on every request you send.</p>
              <Field label="Full name" htmlFor="ac-name"><input id="ac-name" className={inputClass} value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></Field>
              <Field label="Mobile number" htmlFor="ac-phone"><PhoneInput id="ac-phone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} /></Field>
              <Field label="Email" htmlFor="ac-email"><input id="ac-email" className={`${inputClass} opacity-60`} value={buyer.email} disabled /></Field>
              {msg?.where === 'profile' && <Alert tone={msg.tone}>{msg.text}</Alert>}
              <Button type="submit" busy={busy} className="w-full">Save</Button>
            </form>
            <form onSubmit={change} className="space-y-4 rounded-2xl border border-line bg-panel p-6">
              <h2 className="flex items-center gap-2 text-[15px] font-medium text-fg"><KeyRound className="h-4 w-4" /> Password</h2>
              <Field label="Current password" htmlFor="ac-old"><input id="ac-old" type="password" autoComplete="current-password" className={inputClass} value={pwd.old} onChange={(e) => setPwd({ ...pwd, old: e.target.value })} /></Field>
              <Field label="New password" htmlFor="ac-new"><input id="ac-new" type="password" autoComplete="new-password" className={inputClass} value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} /></Field>
              <Field label="Repeat the new password" htmlFor="ac-new2"><input id="ac-new2" type="password" autoComplete="new-password" className={inputClass} value={pwd.again} onChange={(e) => setPwd({ ...pwd, again: e.target.value })} /></Field>
              {msg?.where === 'password' && <Alert tone={msg.tone}>{msg.text}</Alert>}
              <Button type="submit" variant="secondary" busy={busy} className="w-full">Change password</Button>
            </form>
          </aside>
        </div>
      </Container>
    </div>
  );
}
