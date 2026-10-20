// Member portal: /member/<section>[/<id>]. One home for every RealtorX member type; realtors also
// keep the sales desk (/dealer) for leads, visits, bookings and commission.
import React, { useEffect, useRef, useState } from 'react';
import {
  BadgeCheck, Bell, Briefcase, Building2, CalendarDays, CreditCard, FileUp, Home, LifeBuoy, Loader2, ShieldCheck, User, Warehouse,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PageId } from '../../types';
import { callGet, callPost, uploadFile } from '../../services/api/client';
import { StatusBadge } from '../../components/ui/Badge';
import {
  BackLink, DataTable, DataView, Field, NavItem, Notice, PortalShell, PrimaryButton, SectionHeader, StatCard, formatDate, inputClass, useApi,
} from '../portal/kit';
import { NotificationsSection, SecuritySection, useUnreadCount } from '../portal/shared';
import { parsePath } from '../../app/routes';
import MyListingsPage from '../marketplace/MyListingsPage';
import MyBookingRequests from '../requests/MyBookingRequests';
import { MyMembership } from '../membership/JoinPage';
import { formatWhen } from '../community/HubPage';

type Nav = (page: PageId, id?: string) => void;

export default function MemberPortal({ section, onNavigate }: { section: string | null; onNavigate: Nav }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [root, id] = (section || 'dashboard').split('/');
  const go = (s: string) => onNavigate('member', s);
  const unread = useUnreadCount(section || 'dashboard');
  const membership = useApi<MyMembership | null>(isAuthenticated ? 'realtor_x.api.membership.get_my_membership' : null, undefined, section || '');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      sessionStorage.setItem('realtorx_after_login', 'member');
      onNavigate('login');
    }
  }, [loading, isAuthenticated, onNavigate]);

  if (loading || !user || membership.loading && !membership.data && !membership.error) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-500" aria-label="Loading" /></div>;
  }
  const m = membership.data;
  if (!m) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-white">You are not a RealtorX member yet</h1>
        <p className="mt-3 text-sm text-slate-400">Apply in five short steps. You can still post a property and use the Solution Desk without membership.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => onNavigate('join')} className="rounded-xl bg-[#F5A623] px-6 py-3 text-sm font-bold text-slate-950">Join RealtorX</button>
          <button onClick={() => onNavigate('my-listings')} className="rounded-xl border border-white/15 px-6 py-3 text-sm text-white">My listings</button>
        </div>
        <div className="mt-12 text-left"><MyBookingRequests /></div>
      </div>
    );
  }
  const approved = ['Approved', 'Active'].includes(m.status);
  const nav: NavItem[] = [
    { section: 'dashboard', label: 'Overview', icon: Home },
    ...(approved ? [{ section: 'card', label: 'Member card', icon: CreditCard }] : []),
    { section: 'profile', label: 'Profile & documents', icon: User },
    { section: 'listings', label: 'My listings', icon: Building2 },
    { section: 'requests', label: 'Booking requests', icon: CalendarDays },
    { section: 'cases', label: 'Solution Desk', icon: LifeBuoy },
    ...(approved ? [{ section: 'hub', label: 'Hub & events', icon: CalendarDays }] : []),
    ...(m.is_realtor ? [{ section: 'leads', label: 'Buyer leads', icon: Briefcase }] : []),
    ...(approved && m.is_developer ? [{ section: 'developer', label: 'Developer Center', icon: Warehouse }] : []),
    { section: 'notifications', label: 'Notifications', icon: Bell },
    { section: 'security', label: 'Security', icon: ShieldCheck },
  ];
  const openLink = (link: string) => {
    const route = parsePath(link);
    onNavigate(route.page, route.id || undefined);
  };

  let content: React.ReactNode;
  switch (root) {
    case 'card':
      content = <MemberCard m={m} />;
      break;
    case 'profile':
      content = <Profile m={m} reload={membership.reload} />;
      break;
    case 'listings':
      content = <MyListingsPage onNavigate={onNavigate} embedded />;
      break;
    case 'requests':
      content = <MyBookingRequests />;
      break;
    case 'cases':
      content = id ? <CaseDetail name={id} back={() => go('cases')} /> : <Cases open={(c) => go(`cases/${c}`)} onNavigate={onNavigate} />;
      break;
    case 'hub':
      content = approved ? <Hub /> : null;
      break;
    case 'developer':
      content = approved && m.is_developer ? <DeveloperCenter /> : null;
      break;
    case 'leads':
      content = m.is_realtor ? (id ? <LeadDetail name={id} back={() => go('leads')} /> : <Leads open={(l) => go(`leads/${l}`)} />) : null;
      break;
    case 'notifications':
      content = <NotificationsSection openLink={openLink} />;
      break;
    case 'security':
      content = <SecuritySection email={user.email} />;
      break;
    default:
      content = <Overview m={m} go={go} onNavigate={onNavigate} />;
  }

  return (
    <PortalShell
      title="RealtorX member"
      subtitle={approved ? `${m.full_name} · ${m.member_id}` : m.full_name}
      nav={nav}
      active={nav.some((n) => n.section === root) ? root : 'dashboard'}
      onSelect={go}
      onLogout={async () => {
        await logout();
        onNavigate('home');
      }}
      badges={{ notifications: unread }}
    >
      {content}
    </PortalShell>
  );
}

// ── Overview ─────────────────────────────────────────────────────────────

function Overview({ m, go, onNavigate }: { m: MyMembership; go: (s: string) => void; onNavigate: Nav }) {
  const approved = ['Approved', 'Active'].includes(m.status);
  const cases = useApi<any[]>('realtor_x.api.community.get_my_cases');
  const docsMissing = !m.documents.cnic_front || !m.documents.cnic_back;
  const steps: [string, boolean][] = [
    ['Application & Oath', true],
    ['Verification', ['Orientation', 'Approved', 'Active'].includes(m.status)],
    ['Orientation', !!m.orientation_completed || approved],
    ['Member ID', approved],
  ];
  const perf = m.performance || {};
  return (
    <div className="space-y-6">
      <SectionHeader title={`Welcome, ${m.full_name.split(' ')[0]}`} description={`${m.member_type} member`} />
      {['Pending', 'Under Review', 'Orientation'].includes(m.status) && (
        <div className="rounded-xl border border-white/10 bg-[#081221] p-4">
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {steps.map(([label, done], i) => (
              <li key={label} className="flex items-center gap-2 text-sm">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'}`}>{i + 1}</span>
                <span className={done ? 'text-white' : 'text-slate-400'}>{label}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-slate-300">
            {m.status === 'Orientation'
              ? <>Verification passed. Please attend an orientation: <button className="text-[#F5A623] underline" onClick={() => onNavigate('hub')}>see upcoming orientations</button>.</>
              : <>Your application is being reviewed by the Community Team.{docsMissing && <> Upload your CNIC to speed this up: <button className="text-[#F5A623] underline" onClick={() => go('profile')}>Profile &amp; documents</button>.</>}</>}
          </p>
        </div>
      )}
      {m.status === 'Suspended' && <Notice tone="error">Your membership is suspended. {m.decline_reason}</Notice>}
      {m.status === 'Rejected' && (
        <Notice tone="error">
          Your application was declined: {m.decline_reason}{' '}
          <button className="underline" onClick={() => onNavigate('join')}>Apply again</button>
        </Notice>
      )}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Membership" value={approved ? m.member_id : m.status} hint={approved ? `Since ${formatDate(m.approved_on)}` : undefined} tone={approved ? 'good' : 'default'} />
        <StatCard label="Profile complete" value={`${m.profile_completion || 0}%`} hint={m.profile_completion < 100 ? 'Add photo, bio and documents' : undefined} />
        <StatCard label={m.is_realtor ? 'Live listings' : 'Open cases'} value={m.is_realtor ? perf.live_listings ?? 0 : cases.data ? cases.data.filter((c) => !['Resolved', 'Closed', 'Rejected'].includes(c.status)).length : '—'} />
        <StatCard label={m.is_realtor ? 'Deals closed' : 'Events attended'} value={m.is_realtor ? perf.deals_closed ?? 0 : perf.events_attended ?? 0} tone="good" />
      </div>
      {approved && (
        <div className="rounded-xl border border-white/10 bg-[#081221] p-4 text-sm">
          <p className="text-xs uppercase tracking-wider text-slate-500">Subscription</p>
          {m.subscription ? (
            <p className="mt-1 text-white">
              {m.subscription.plan} · until {formatDate(m.subscription.end_date)} · <span className="text-slate-400">{m.subscription.payment_status}</span>
            </p>
          ) : (
            <p className="mt-1 text-slate-300">No active subscription. The Community Team will contact you about membership plans.</p>
          )}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        {m.is_realtor ? <QuickLink title="Buyer leads" text={`${perf.leads_received ?? 0} received so far`} onClick={() => go('leads')} /> : <QuickLink title="Post a property" text="List for sale or rent" onClick={() => onNavigate('post-listing')} />}
        <QuickLink title="Solution Desk" text="Get help with a problem" onClick={() => onNavigate('solutions')} />
        {approved ? <QuickLink title="Book the Hub" text="Rooms, desks and events" onClick={() => go('hub')} /> : <QuickLink title="Marketplace" text="Browse verified listings" onClick={() => onNavigate('properties')} />}
      </div>
    </div>
  );
}

function QuickLink({ title, text, onClick }: { title: string; text: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-xl border border-white/10 bg-[#081221] p-4 text-left hover:border-[#F5A623]/40">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{text}</p>
    </button>
  );
}

// ── Member card ──────────────────────────────────────────────────────────

function MemberCard({ m }: { m: MyMembership }) {
  return (
    <div className="space-y-4">
      <SectionHeader title="Digital member card" description="Show this card at the RealtorX Hub and events." />
      <div className="relative mx-auto aspect-[1.6/1] w-full max-w-md overflow-hidden rounded-2xl border border-[#F5A623]/40 bg-gradient-to-br from-[#0B1A30] via-[#13294a] to-[#081221] p-6 shadow-2xl">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#F5A623]/10" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5A623]">RealtorX</p>
        <p className="text-[10px] uppercase tracking-wider text-slate-400">{m.membership_tier || 'Member'}</p>
        <div className="mt-6">
          <p className="text-xl font-bold text-white">{m.full_name}</p>
          <p className="text-sm text-slate-300">{[m.member_type, m.firm_name].filter(Boolean).join(' · ')}</p>
        </div>
        <div className="absolute inset-x-6 bottom-6 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Member ID</p>
            <p className="font-mono text-lg font-bold text-[#F5A623]">{m.member_id}</p>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end gap-1 text-[10px] uppercase tracking-wider text-emerald-300"><BadgeCheck className="h-3.5 w-3.5" /> Oath taken</p>
            <p className="text-xs text-slate-300">{formatDate(m.oath_date)}</p>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500">Connect. Collaborate. Grow.</p>
    </div>
  );
}

// ── Profile & documents ──────────────────────────────────────────────────

const DOCS: [keyof MyMembership['documents'], string][] = [
  ['cnic_front', 'CNIC front'],
  ['cnic_back', 'CNIC back'],
  ['business_document', 'Business / agency document (optional)'],
];

function Profile({ m, reload }: { m: MyMembership; reload: () => void }) {
  const [form, setForm] = useState({
    bio: m.bio || '', specialization: m.specialization || '', areas_served: m.areas_served || '', website: m.website || '',
    experience_years: m.experience_years != null ? String(m.experience_years) : '',
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy('save');
    setMsg(null);
    try {
      await callPost('realtor_x.api.membership.update_my_member_profile', form);
      setMsg({ tone: 'success', text: 'Profile saved.' });
      reload();
    } catch (err: any) {
      setMsg({ tone: 'error', text: err?.message || 'Could not save.' });
    } finally {
      setBusy(null);
    }
  };

  const upload = async (doc: string, file?: File) => {
    if (!file) return;
    setBusy(doc);
    setMsg(null);
    try {
      await uploadFile('realtor_x.api.membership.upload_member_document', file, { document: doc });
      setMsg({ tone: 'success', text: doc === 'custom_profile_image' ? 'Profile photo updated.' : 'Document uploaded. Only RealtorX staff can see it.' });
      reload();
    } catch (err: any) {
      setMsg({ tone: 'error', text: err?.message || 'Upload failed.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Profile & documents" description="Name, CNIC and member type are verified by RealtorX; contact us to change them." />
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <dl className="grid gap-3 rounded-xl border border-white/10 bg-[#081221] p-4 text-sm sm:grid-cols-2">
        {[['Name', m.full_name], ['Member type', m.member_type], ['Company', m.firm_name || '—'], ['City', m.city || '—'], ['Mobile', m.phone || '—'], ['CNIC', m.cnic_masked || '—']].map(([k, v]) => (
          <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="text-white">{v}</dd></div>
        ))}
      </dl>
      <form onSubmit={save} className="space-y-4">
        <Field label="About you" htmlFor="mp-bio"><textarea id="mp-bio" rows={3} className={inputClass} maxLength={1000} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Specialization" htmlFor="mp-spec"><input id="mp-spec" className={inputClass} maxLength={1000} value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></Field>
          <Field label="Areas you work in" htmlFor="mp-areas"><input id="mp-areas" className={inputClass} maxLength={1000} value={form.areas_served} onChange={(e) => setForm({ ...form, areas_served: e.target.value })} /></Field>
          <Field label="Website or social link" htmlFor="mp-web"><input id="mp-web" className={inputClass} maxLength={300} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></Field>
          <Field label="Experience (years)" htmlFor="mp-exp"><input id="mp-exp" inputMode="numeric" className={inputClass} maxLength={2} value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value.replace(/\D/g, '') })} /></Field>
        </div>
        <PrimaryButton type="submit" busy={busy === 'save'}>Save profile</PrimaryButton>
      </form>
      <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#081221] p-4">
        {m.profile_image ? <img src={m.profile_image} alt="" className="h-16 w-16 rounded-full object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5A623]/15 text-xl font-bold text-[#F5A623]">{m.full_name.charAt(0)}</span>}
        <div className="flex-1">
          <p className="text-sm font-medium text-white">Profile photo</p>
          <p className="text-xs text-slate-400">Shown in the member directory. JPG, PNG or WEBP.</p>
        </div>
        <input ref={(el) => { fileRefs.current.photo = el; }} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => upload('custom_profile_image', e.target.files?.[0])} />
        <button onClick={() => fileRefs.current.photo?.click()} disabled={!!busy} className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/5 disabled:opacity-50">
          {busy === 'custom_profile_image' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />} {m.profile_image ? 'Change' : 'Upload'}
        </button>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">Verification documents</h3>
        <ul className="space-y-2">
          {DOCS.map(([key, label]) => (
            <li key={key} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#081221] p-3">
              <span className="text-sm text-slate-200">{label}</span>
              <span className="flex items-center gap-3">
                {m.documents[key] && <StatusBadge status="Uploaded" />}
                <input ref={(el) => { fileRefs.current[key] = el; }} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={(e) => upload(key, e.target.files?.[0])} />
                <button onClick={() => fileRefs.current[key]?.click()} disabled={!!busy} className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/5 disabled:opacity-50">
                  {busy === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />} {m.documents[key] ? 'Replace' : 'Upload'}
                </button>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">JPG, PNG, WEBP or PDF. Stored privately; never shown on the website.</p>
      </div>
    </div>
  );
}

// ── Solution Desk ────────────────────────────────────────────────────────

interface CaseRow { name: string; subject: string; case_type: string; status: string; creation: string; modified: string }
interface CaseDetailData {
  name: string; subject: string; case_type: string; status: string; description: string; resolution: string | null; rejection_reason: string | null;
  created: string; updates: { text: string; from_you: boolean; posted_on: string }[];
}

function Cases({ open, onNavigate }: { open: (name: string) => void; onNavigate: Nav }) {
  const state = useApi<CaseRow[]>('realtor_x.api.community.get_my_cases');
  return (
    <div className="space-y-4">
      <SectionHeader title="Solution Desk" description="Problems you asked RealtorX to help with." action={<PrimaryButton onClick={() => onNavigate('solutions')}>New case</PrimaryButton>} />
      <DataView state={state} isEmpty={(d) => d.length === 0} empty={{ icon: LifeBuoy, title: 'No cases yet', description: 'Submit a problem and a case manager will help.', actionLabel: 'Submit a problem', onAction: () => onNavigate('solutions') }}>
        {(rows) => (
          <DataTable
            rows={rows}
            rowKey={(r) => r.name}
            onRowClick={(r) => open(r.name)}
            columns={[
              { header: 'Case', cell: (r) => <span className="font-medium text-white">{r.subject}</span> },
              { header: 'Type', cell: (r) => r.case_type },
              { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
              { header: 'Updated', cell: (r) => formatDate(r.modified) },
            ]}
          />
        )}
      </DataView>
    </div>
  );
}

function CaseDetail({ name, back }: { name: string; back: () => void }) {
  const state = useApi<CaseDetailData>('realtor_x.api.community.get_my_case', { name }, name);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      state.setData(await callPost<CaseDetailData>('realtor_x.api.community.reply_to_case', { name, message: reply }));
      setReply('');
    } catch (err: any) {
      setError(err?.message || 'Could not send.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-4">
      <BackLink onClick={back}>All cases</BackLink>
      <DataView state={state}>
        {(c) => (
          <div className="space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2"><StatusBadge status={c.status} /><span className="text-xs text-slate-500">{c.name} · {c.case_type}</span></div>
              <h2 className="mt-2 text-xl font-semibold text-white">{c.subject}</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-300">{c.description}</p>
            </div>
            {c.resolution && <Notice tone="success">Resolution: {c.resolution}</Notice>}
            {c.rejection_reason && <Notice tone="error">Closed without action: {c.rejection_reason}</Notice>}
            <ol className="space-y-3">
              {c.updates.map((u, i) => (
                <li key={i} className={`rounded-xl p-3 text-sm ${u.from_you ? 'ml-8 bg-[#F5A623]/10 text-slate-200' : 'mr-8 bg-white/5 text-slate-200'}`}>
                  <p className="mb-1 text-[11px] text-slate-500">{u.from_you ? 'You' : 'RealtorX'} · {formatWhen(u.posted_on)}</p>
                  <p className="whitespace-pre-line">{u.text}</p>
                </li>
              ))}
              {c.updates.length === 0 && <li className="text-sm text-slate-500">No updates yet. A case manager will post progress here.</li>}
            </ol>
            {!['Resolved', 'Closed', 'Rejected'].includes(c.status) && (
              <form onSubmit={send} className="space-y-2">
                {error && <Notice tone="error">{error}</Notice>}
                <label htmlFor="case-reply" className="sr-only">Reply</label>
                <textarea id="case-reply" rows={3} className={inputClass} maxLength={3000} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Add information or reply to RealtorX" />
                <PrimaryButton type="submit" busy={busy} disabled={reply.trim().length < 2}>Send</PrimaryButton>
              </form>
            )}
          </div>
        )}
      </DataView>
    </div>
  );
}

// ── Hub ──────────────────────────────────────────────────────────────────

interface Space { name: string; space_name: string; space_type: string; capacity: number | null; location: string | null; hourly_rate: number | null; description: string | null }
interface Booking { name: string; space: string; booking_date: string; from_time: string; to_time: string; purpose: string; status: string; rejection_reason: string | null }
interface Registration { name: string; title: string; starts_on: string; venue: string | null; status: string; event_status: string }

function Hub() {
  const spaces = useApi<Space[]>('realtor_x.api.community.get_hub_spaces');
  const [tick, setTick] = useState(0);
  const bookings = useApi<Booking[]>('realtor_x.api.community.get_my_space_bookings', undefined, String(tick));
  const regs = useApi<Registration[]>('realtor_x.api.community.get_my_event_registrations', undefined, String(tick));
  const [form, setForm] = useState({ space: '', booking_date: '', from_time: '10:00', to_time: '11:00', purpose: '', attendees: '2' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await callPost('realtor_x.api.community.request_space_booking', form);
      setMsg({ tone: 'success', text: 'Request sent. The Hub team will confirm it.' });
      setTick((t) => t + 1);
    } catch (err: any) {
      setMsg({ tone: 'error', text: err?.message || 'Could not request the booking.' });
    } finally {
      setBusy(false);
    }
  };
  const cancel = async (method: string, name: string) => {
    try {
      await callPost(method, { name });
      setTick((t) => t + 1);
    } catch (err: any) {
      setMsg({ tone: 'error', text: err?.message || 'Could not cancel.' });
    }
  };
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      <SectionHeader title="Hub & events" description="Request a meeting room, desk or developer pod. Bookings are confirmed by the Hub team." />
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <DataView state={spaces} isEmpty={(d) => d.length === 0} empty={{ icon: CalendarDays, title: 'No bookable spaces yet' }}>
        {(list) => (
          <form onSubmit={request} className="grid gap-4 rounded-xl border border-white/10 bg-[#081221] p-4 sm:grid-cols-2">
            <Field label="Space" htmlFor="hb-space">
              <select id="hb-space" required className={inputClass} value={form.space} onChange={(e) => setForm({ ...form, space: e.target.value })}>
                <option value="">Choose a space</option>
                {list.map((s) => <option key={s.name} value={s.name}>{s.space_name} · {s.space_type}{s.capacity ? ` · ${s.capacity} people` : ''}</option>)}
              </select>
            </Field>
            <Field label="Date" htmlFor="hb-date"><input id="hb-date" type="date" required min={today} className={inputClass} value={form.booking_date} onChange={(e) => setForm({ ...form, booking_date: e.target.value })} /></Field>
            <Field label="From" htmlFor="hb-from"><input id="hb-from" type="time" required min="08:00" max="22:00" className={inputClass} value={form.from_time} onChange={(e) => setForm({ ...form, from_time: e.target.value })} /></Field>
            <Field label="To" htmlFor="hb-to"><input id="hb-to" type="time" required min="08:00" max="22:00" className={inputClass} value={form.to_time} onChange={(e) => setForm({ ...form, to_time: e.target.value })} /></Field>
            <Field label="Purpose" htmlFor="hb-purpose"><input id="hb-purpose" required minLength={3} maxLength={140} className={inputClass} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="e.g. Client meeting" /></Field>
            <Field label="People" htmlFor="hb-people"><input id="hb-people" inputMode="numeric" className={inputClass} value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value.replace(/\D/g, '') })} /></Field>
            <div className="sm:col-span-2"><PrimaryButton type="submit" busy={busy}>Request booking</PrimaryButton></div>
          </form>
        )}
      </DataView>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">My bookings</h3>
        <DataView state={bookings} isEmpty={(d) => d.length === 0} empty={{ icon: CalendarDays, title: 'No bookings yet' }}>
          {(rows) => (
            <DataTable
              rows={rows}
              rowKey={(r) => r.name}
              columns={[
                { header: 'Space', cell: (r) => <span className="text-white">{r.space}</span> },
                { header: 'When', cell: (r) => `${formatDate(r.booking_date)} ${r.from_time.slice(0, 5)}–${r.to_time.slice(0, 5)}` },
                { header: 'Purpose', cell: (r) => r.purpose },
                { header: 'Status', cell: (r) => <span title={r.rejection_reason || undefined}><StatusBadge status={r.status} /></span> },
                { header: '', cell: (r) => (['Requested', 'Confirmed'].includes(r.status) ? <button className="text-xs text-red-300 hover:underline" onClick={() => cancel('realtor_x.api.community.cancel_space_booking', r.name)}>Cancel</button> : null) },
              ]}
            />
          )}
        </DataView>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">My event registrations</h3>
        <DataView state={regs} isEmpty={(d) => d.length === 0} empty={{ icon: CalendarDays, title: 'No registrations', description: 'Upcoming events are listed on the Hub page.' }}>
          {(rows) => (
            <DataTable
              rows={rows}
              rowKey={(r) => r.name}
              columns={[
                { header: 'Event', cell: (r) => <span className="text-white">{r.title}</span> },
                { header: 'When', cell: (r) => formatWhen(r.starts_on) },
                { header: 'Status', cell: (r) => <StatusBadge status={r.event_status === 'Cancelled' ? 'Cancelled' : r.status} /> },
                { header: '', cell: (r) => (r.status === 'Registered' ? <button className="text-xs text-red-300 hover:underline" onClick={() => cancel('realtor_x.api.community.cancel_event_registration', r.name)}>Cancel</button> : null) },
              ]}
            />
          )}
        </DataView>
      </div>
    </div>
  );
}

// ── Developer Center ─────────────────────────────────────────────────────

interface DevProject {
  name: string; project_name: string; status: string; city: string | null; brochure: string | null; units_total: number;
  units_by_status: Record<string, number>; listings_pending: number; interested_buyers: number;
  realtors: { name: string; role: string; member_id: string | null }[];
}

interface DevCenter {
  developer: { company_owner_name: string };
  projects: DevProject[];
  totals: Record<string, number>;
  dedicated_spaces: { space_name: string; space_type: string; location: string | null }[];
}
interface DevLead { name: string; buyer: string; status: string; property: string | null; realtor: string; date: string }
interface DevProfile { name: string; company_owner_name: string; about: string | null; website: string | null; logo: string | null }

function DeveloperCenter() {
  const state = useApi<DevCenter>('realtor_x.api.community.get_developer_center');
  const leads = useApi<DevLead[]>('realtor_x.api.community.get_developer_leads');
  const profile = useApi<DevProfile>('realtor_x.api.community.get_developer_profile');
  const [form, setForm] = useState<{ about: string; website: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const logoRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (profile.data && !form) setForm({ about: profile.data.about || '', website: profile.data.website || '' });
  }, [profile.data, form]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setBusy('profile');
    setMsg(null);
    try {
      profile.setData(await callPost<DevProfile>('realtor_x.api.community.update_developer_profile', form));
      setMsg({ tone: 'success', text: 'Developer profile saved. It appears on the Developer Program page.' });
    } catch (err: any) {
      setMsg({ tone: 'error', text: err?.message || 'Could not save.' });
    } finally {
      setBusy(null);
    }
  };
  const uploadLogo = async (file?: File) => {
    if (!file) return;
    setBusy('logo');
    setMsg(null);
    try {
      profile.setData(await uploadFile<DevProfile>('realtor_x.api.community.upload_developer_logo', file));
    } catch (err: any) {
      setMsg({ tone: 'error', text: err?.message || 'Upload failed.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Developer Center" description="Your projects, inventory, assigned RealtorX realtors, buyer interest and public profile." />
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <DataView state={state}>
        {(d) => (
          <>
            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard label="Projects" value={d.totals.projects} />
              <StatCard label="Units" value={d.totals.units} />
              <StatCard label="Available" value={d.totals.available} tone="good" />
              <StatCard label="Interested buyers" value={d.totals.interested_buyers} />
            </div>
            {d.dedicated_spaces.length > 0 && (
              <Notice tone="success">Your dedicated space at the Hub: {d.dedicated_spaces.map((sp) => `${sp.space_name} (${sp.space_type}${sp.location ? `, ${sp.location}` : ''})`).join(', ')}</Notice>
            )}
            {d.projects.length === 0 ? (
              <Notice>No projects are linked to {d.developer.company_owner_name} yet. RealtorX staff add your projects in the back office.</Notice>
            ) : (
              <ul className="space-y-3">
                {d.projects.map((p) => (
                  <li key={p.name} className="rounded-xl border border-white/10 bg-[#081221] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white">{p.project_name}</p>
                        <p className="text-xs text-slate-400">{[p.city, p.status].filter(Boolean).join(' · ')}</p>
                      </div>
                      {p.brochure && <a href={p.brochure} target="_blank" rel="noopener noreferrer" className="text-xs text-[#F5A623] hover:underline">Brochure</a>}
                    </div>
                    <p className="mt-3 text-xs text-slate-300">
                      {p.units_total} units · {Object.entries(p.units_by_status).filter(([, n]) => n).map(([st, n]) => `${n} ${st.toLowerCase()}`).join(', ') || 'none yet'}
                      {p.listings_pending ? ` · ${p.listings_pending} awaiting review` : ''} · {p.interested_buyers} interested buyers
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Realtors: {p.realtors.length ? p.realtors.map((r) => `${r.name}${r.member_id ? ` (${r.member_id})` : ''}${r.role === 'Lead Realtor' ? ' · lead' : ''}`).join(', ') : 'not assigned yet'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </DataView>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">Buyer interest on your units</h3>
        <DataView state={leads} isEmpty={(r) => r.length === 0} empty={{ icon: Briefcase, title: 'No buyer interest yet', description: 'Leads appear here when buyers press "I\'m interested" on your units.' }}>
          {(rows) => (
            <DataTable
              rows={rows}
              rowKey={(r) => r.name}
              columns={[
                { header: 'Buyer', cell: (r) => <span className="text-white">{r.buyer}</span> },
                { header: 'Unit', cell: (r) => r.property || '—' },
                { header: 'Realtor', cell: (r) => r.realtor },
                { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
                { header: 'Date', cell: (r) => formatDate(r.date) },
              ]}
            />
          )}
        </DataView>
        <p className="mt-2 text-xs text-slate-500">Buyer contact details stay with the RealtorX realtor handling the unit.</p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">Public developer profile</h3>
        <DataView state={profile}>
          {(dp) => (
            <form onSubmit={saveProfile} className="space-y-4 rounded-xl border border-white/10 bg-[#081221] p-4">
              <div className="flex items-center gap-4">
                {dp.logo ? <img src={dp.logo} alt="" className="h-14 w-14 rounded-lg bg-white object-contain p-1" /> : <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#F5A623]/15 font-bold text-[#F5A623]">{dp.company_owner_name.charAt(0)}</span>}
                <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => uploadLogo(e.target.files?.[0])} />
                <button type="button" onClick={() => logoRef.current?.click()} disabled={!!busy} className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/5 disabled:opacity-50">
                  {busy === 'logo' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />} {dp.logo ? 'Change logo' : 'Upload logo'}
                </button>
              </div>
              <Field label="About your company" htmlFor="dev-about"><textarea id="dev-about" rows={3} maxLength={2000} className={inputClass} value={form?.about || ''} onChange={(e) => setForm({ about: e.target.value, website: form?.website || '' })} /></Field>
              <Field label="Website" htmlFor="dev-web"><input id="dev-web" maxLength={300} className={inputClass} value={form?.website || ''} onChange={(e) => setForm({ about: form?.about || '', website: e.target.value })} placeholder="https://" /></Field>
              <PrimaryButton type="submit" busy={busy === 'profile'}>Save profile</PrimaryButton>
            </form>
          )}
        </DataView>
      </div>
    </div>
  );
}

// ── Buyer leads (Member Success) ─────────────────────────────────────────

interface LeadRow {
  name: string; lead_name: string; phone: string; email: string | null; status: string; property_reference: string | null;
  property_title: string | null; inquiry_message: string | null; next_followup_date: string | null; creation: string;
}
interface LeadDetailData extends LeadRow { notes: { text: string; on: string }[] }
const LEAD_STATUSES = ['Contacted', 'Qualified', 'Site Visit', 'Negotiation', 'Won', 'Lost'];

function Leads({ open }: { open: (name: string) => void }) {
  const [filter, setFilter] = useState('');
  const state = useApi<LeadRow[]>('realtor_x.api.community.get_my_leads', { status: filter || undefined }, filter);
  return (
    <div className="space-y-4">
      <SectionHeader title="Buyer leads" description="Buyers who pressed &quot;I'm interested&quot; on listings tagged to you. Call them and record your follow-up." />
      <div className="flex flex-wrap gap-2">
        {['', 'New', ...LEAD_STATUSES].map((st) => (
          <button key={st || 'all'} onClick={() => setFilter(st)} className={`rounded-full border px-3 py-1 text-xs ${filter === st ? 'border-[#F5A623] bg-[#F5A623]/15 text-[#F5A623]' : 'border-white/10 text-slate-300'}`}>{st || 'All'}</button>
        ))}
      </div>
      <DataView state={state} isEmpty={(r) => r.length === 0} empty={{ icon: Briefcase, title: 'No buyer leads yet', description: 'Leads arrive when buyers are interested in listings tagged to you.' }}>
        {(rows) => (
          <DataTable
            rows={rows}
            rowKey={(r) => r.name}
            onRowClick={(r) => open(r.name)}
            columns={[
              { header: 'Buyer', cell: (r) => <span className="font-medium text-white">{r.lead_name}</span> },
              { header: 'Phone', cell: (r) => <a href={`tel:${r.phone}`} onClick={(e) => e.stopPropagation()} className="text-[#F5A623] hover:underline">{r.phone}</a> },
              { header: 'Property', cell: (r) => r.property_title || '—' },
              { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
              { header: 'Follow-up', cell: (r) => formatDate(r.next_followup_date) },
              { header: 'Received', cell: (r) => formatDate(r.creation) },
            ]}
          />
        )}
      </DataView>
    </div>
  );
}

function LeadDetail({ name, back }: { name: string; back: () => void }) {
  const state = useApi<LeadDetailData>('realtor_x.api.community.get_my_lead', { name }, name);
  const [form, setForm] = useState({ status: '', next_followup_date: '', note: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      state.setData(await callPost<LeadDetailData>('realtor_x.api.community.update_my_lead', { name, status: form.status || undefined, next_followup_date: form.next_followup_date || undefined, note: form.note || undefined }));
      setForm({ status: '', next_followup_date: '', note: '' });
      setMsg({ tone: 'success', text: 'Saved.' });
    } catch (err: any) {
      setMsg({ tone: 'error', text: err?.message || 'Could not save.' });
    } finally {
      setBusy(false);
    }
  };
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="space-y-4">
      <BackLink onClick={back}>All leads</BackLink>
      <DataView state={state}>
        {(l) => (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">{l.lead_name}</h2>
                <p className="text-sm text-slate-400">{l.property_title || 'General inquiry'} · received {formatDate(l.creation)}</p>
              </div>
              <StatusBadge status={l.status} />
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={`tel:${l.phone}`} className="rounded-lg bg-[#F5A623] px-4 py-2 text-sm font-bold text-slate-950">Call {l.phone}</a>
              <a href={`https://wa.me/${l.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white">WhatsApp</a>
              {l.email && <span className="self-center text-sm text-slate-300">{l.email}</span>}
            </div>
            {l.inquiry_message && <p className="rounded-xl bg-white/5 p-3 text-sm text-slate-200">&ldquo;{l.inquiry_message}&rdquo;</p>}
            {!['Won', 'Lost'].includes(l.status) && (
              <form onSubmit={save} className="grid gap-4 rounded-xl border border-white/10 bg-[#081221] p-4 sm:grid-cols-2">
                {msg && <div className="sm:col-span-2"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
                <Field label="Status" htmlFor="ld-status">
                  <select id="ld-status" className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="">No change</option>
                    {LEAD_STATUSES.map((st) => <option key={st} value={st}>{st === 'Won' ? 'Won (deal closed)' : st}</option>)}
                  </select>
                </Field>
                <Field label="Next follow-up" htmlFor="ld-date"><input id="ld-date" type="date" min={today} className={inputClass} value={form.next_followup_date} onChange={(e) => setForm({ ...form, next_followup_date: e.target.value })} /></Field>
                <div className="sm:col-span-2">
                  <Field label={form.status === 'Lost' ? 'Why was the lead lost? *' : 'Note'} htmlFor="ld-note"><textarea id="ld-note" rows={3} maxLength={2000} className={inputClass} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
                </div>
                <div className="sm:col-span-2"><PrimaryButton type="submit" busy={busy}>Save follow-up</PrimaryButton></div>
              </form>
            )}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-white">Notes</h3>
              {l.notes.length === 0 ? <p className="text-sm text-slate-500">No notes yet.</p> : (
                <ul className="space-y-2">{l.notes.map((n, i) => <li key={i} className="rounded-lg bg-white/5 p-3 text-sm text-slate-200"><span className="block text-[11px] text-slate-500">{formatDate(n.on)}</span>{n.text}</li>)}</ul>
              )}
            </div>
          </div>
        )}
      </DataView>
    </div>
  );
}
