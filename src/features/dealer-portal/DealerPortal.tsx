// Dealer portal: /dealer/<section>[/<id>]. Dealers work their own leads, visits and
// booking requests; approvals, prices and payouts stay with RealtorX staff.
import React, { useEffect, useState } from 'react';
import {
  Bell, Briefcase, Building2, CalendarCheck, ClipboardList, Coins, Home, Landmark, LifeBuoy, Loader2, ShieldCheck,
  User, Users, Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PageId } from '../../types';
import { callGet, callPost } from '../../services/api/client';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  BackLink, DataTable, DataView, Field, NavItem, Notice, PortalShell, PrimaryButton, SectionHeader, StatCard,
  formatDate, formatPKR, inputClass, useApi,
} from '../portal/kit';
import { NotificationsSection, SecuritySection, SupportSection, useUnreadCount } from '../portal/shared';
import { parsePath } from '../../app/routes';

type Nav = (page: PageId, id?: string) => void;
const BOOKING_LEAD_KEY = 'realtorx_booking_lead';

const NAV: NavItem[] = [
  { section: 'dashboard', label: 'Dashboard', icon: Home },
  { section: 'leads', label: 'Leads', icon: Users },
  { section: 'site-visits', label: 'Site visits', icon: CalendarCheck },
  { section: 'inventory', label: 'Inventory', icon: Building2 },
  { section: 'bookings', label: 'Bookings', icon: ClipboardList },
  { section: 'deals', label: 'Deals', icon: Briefcase },
  { section: 'commissions', label: 'Commissions', icon: Coins },
  { section: 'payouts', label: 'Payouts', icon: Wallet },
  { section: 'notifications', label: 'Notifications', icon: Bell },
  { section: 'support', label: 'Support', icon: LifeBuoy },
  { section: 'profile', label: 'Profile', icon: User },
  { section: 'payout-settings', label: 'Payout settings', icon: Landmark },
  { section: 'security', label: 'Security', icon: ShieldCheck },
];

export default function DealerPortal({ section, onNavigate }: { section: string | null; onNavigate: Nav }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [root, id] = (section || 'dashboard').split('/');
  const go = (s: string) => onNavigate('dealer', s);
  const unread = useUnreadCount(section || 'dashboard');
  const openLink = (link: string) => {
    const route = parsePath(link);
    onNavigate(route.page, route.id || undefined);
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      sessionStorage.setItem('realtorx_after_login', 'dealer');
      onNavigate('login');
    }
  }, [loading, isAuthenticated, onNavigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" aria-label="Loading" />
      </div>
    );
  }
  if (!user.is_dealer) return <NotActiveYet onNavigate={onNavigate} />;

  let content: React.ReactNode;
  switch (root) {
    case 'leads':
      content = id ? <LeadDetail name={id} back={() => go('leads')} go={go} /> : <Leads open={(l) => go(`leads/${l}`)} />;
      break;
    case 'site-visits':
      content = <SiteVisits />;
      break;
    case 'inventory':
      content = id ? <InventoryDetail property={id} back={() => go('inventory')} go={go} /> : <Inventory open={(p) => go(`inventory/${p}`)} />;
      break;
    case 'bookings':
      content = <Bookings />;
      break;
    case 'deals':
      content = id ? <DealDetail name={id} back={() => go('deals')} /> : <Deals open={(d) => go(`deals/${d}`)} />;
      break;
    case 'commissions':
      content = id ? <CommissionDetail name={id} back={() => go('commissions')} /> : <Commissions open={(c) => go(`commissions/${c}`)} />;
      break;
    case 'payouts':
      content = <Payouts />;
      break;
    case 'notifications':
      content = <NotificationsSection openLink={openLink} />;
      break;
    case 'support':
      content = <SupportSection ticketId={id} go={go} />;
      break;
    case 'profile':
      content = <Profile />;
      break;
    case 'payout-settings':
      content = <PayoutSettings go={go} />;
      break;
    case 'security':
      content = <SecuritySection email={user.email} />;
      break;
    default:
      content = <Dashboard go={go} />;
  }

  return (
    <PortalShell
      title="Dealer portal"
      subtitle={user.full_name}
      nav={NAV}
      active={NAV.some((n) => n.section === root) ? root : 'dashboard'}
      onSelect={go}
      badges={{ notifications: unread }}
      onLogout={async () => {
        await logout();
        onNavigate('home');
      }}
    >
      {content}
    </PortalShell>
  );
}

function NotActiveYet({ onNavigate }: { onNavigate: Nav }) {
  const [app, setApp] = useState<{ status: string; raw_status: string; id: string } | null | undefined>(undefined);
  useEffect(() => {
    callGet<{ status: string; raw_status: string; id: string } | null>('realtor_x.api.portal.get_my_dealer_application')
      .then(setApp)
      .catch(() => setApp(null));
  }, []);
  if (app === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" aria-label="Loading" />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      {app ? (
        <EmptyState
          icon={ClipboardList}
          title={`Application ${app.status.toLowerCase()}`}
          description={`Your dealer application ${app.id} is ${app.raw_status}. The portal opens once our team activates your account.`}
          actionLabel="Contact support"
          onAction={() => onNavigate('contact')}
        />
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No dealer account"
          description="Apply to become a RealtorX dealer to access leads, inventory and commissions."
          actionLabel="Apply now"
          onAction={() => onNavigate('become-dealer')}
        />
      )}
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────
interface Summary {
  open_leads: number;
  followups_due: number;
  upcoming_visits: number;
  pending_bookings: number;
  active_deals: number;
  sales_value: number;
  commission_by_status: Record<string, number>;
  commission_outstanding: number;
  leads_by_status: Record<string, number>;
}

function Dashboard({ go }: { go: (s: string) => void }) {
  const state = useApi<Summary>('realtor_x.api.portal.dealer_summary');
  return (
    <>
      <SectionHeader title="Overview" />
      <DataView state={state}>
        {(s) => (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="Open leads" value={s.open_leads} hint={s.followups_due ? `${s.followups_due} follow-up(s) due` : undefined} tone={s.followups_due ? 'warn' : 'default'} />
              <StatCard label="Upcoming visits" value={s.upcoming_visits} />
              <StatCard label="Bookings in review" value={s.pending_bookings} />
              <StatCard label="Active deals" value={s.active_deals} hint={formatPKR(s.sales_value)} />
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0B1A30] p-4">
              <h3 className="font-semibold text-white">Commission</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {['Earned', 'Approved', 'Payable', 'Paid'].map((k) => (
                  <div key={k}>
                    <p className="text-xs text-slate-400">{k}</p>
                    <p className="font-semibold tabular-nums text-white">{formatPKR(s.commission_by_status[k] || 0)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Commission amounts are recorded by RealtorX finance and may change until approved.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <PrimaryButton onClick={() => go('leads')}>Work my leads</PrimaryButton>
              <button onClick={() => go('inventory')} className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5">
                Browse inventory
              </button>
            </div>
          </div>
        )}
      </DataView>
    </>
  );
}

// ── Leads ────────────────────────────────────────────────────────────────
interface Lead {
  name: string;
  lead_name: string;
  phone: string;
  email?: string;
  status: string;
  next_followup_date?: string;
  inquiry_type?: string;
  visit_preferred_date?: string;
  visit_preferred_slot?: string;
  property_title?: string;
  project_name?: string;
  inquiry_message?: string;
  inquiry_subject?: string;
  creation: string;
}

const LEAD_FILTERS = ['All', 'New', 'Contacted', 'Qualified', 'Site Visit', 'Negotiation', 'Booking', 'Won', 'Lost'];

function Leads({ open }: { open: (l: string) => void }) {
  const [status, setStatus] = useState('All');
  const state = useApi<Lead[]>('realtor_x.api.portal.dealer_leads', status === 'All' ? undefined : { status }, status);
  return (
    <>
      <SectionHeader title="Leads" description="Leads RealtorX has assigned to you." />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter by status">
        {LEAD_FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={status === f}
            onClick={() => setStatus(f)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs ${status === f ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]' : 'border-white/10 text-slate-300 hover:bg-white/5'}`}
          >
            {f}
          </button>
        ))}
      </div>
      <DataView state={state} isEmpty={(r) => r.length === 0} empty={{ icon: Users, title: 'No leads here', description: 'New assignments will appear in this list.' }}>
        {(rows) => (
          <DataTable
            rows={rows}
            rowKey={(r) => r.name}
            onRowClick={(r) => open(r.name)}
            columns={[
              { header: 'Name', cell: (r) => <span className="font-medium text-white">{r.lead_name}</span> },
              { header: 'Phone', cell: (r) => <a href={`tel:${r.phone}`} onClick={(e) => e.stopPropagation()} className="hover:text-[#F5A623]">{r.phone}</a> },
              { header: 'Interest', cell: (r) => r.property_title || r.inquiry_type || '—' },
              { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
              { header: 'Follow-up', cell: (r) => formatDate(r.next_followup_date) },
            ]}
          />
        )}
      </DataView>
    </>
  );
}

interface LeadDetailData {
  lead: Lead;
  history: { content: string; creation: string }[];
  visits: { name: string; visit_date: string; status: string; outcome?: string }[];
  allowed_statuses: string[];
}

function LeadDetail({ name, back, go }: { name: string; back: () => void; go: (s: string) => void }) {
  const state = useApi<LeadDetailData>('realtor_x.api.portal.dealer_lead_detail', { name }, name);
  const [form, setForm] = useState({ status: '', next_followup_date: '', note: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      state.setData(await callPost<LeadDetailData>('realtor_x.api.portal.dealer_update_lead', { name, ...form }));
      setForm({ status: '', next_followup_date: '', note: '' });
      setMsg({ tone: 'success', text: 'Lead updated.' });
    } catch (err: any) {
      setMsg({ tone: 'error', text: err?.message || 'Could not update the lead.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <BackLink onClick={back}>Leads</BackLink>
      <DataView state={state}>
        {({ lead, history, visits, allowed_statuses }) => {
          const closed = ['Won', 'Lost', 'Booking'].includes(lead.status);
          return (
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-[#0B1A30] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{lead.lead_name}</h2>
                      <p className="text-sm text-slate-400">
                        <a href={`tel:${lead.phone}`} className="hover:text-[#F5A623]">{lead.phone}</a>
                        {lead.email && <> · {lead.email}</>}
                      </p>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>
                  <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                    {[
                      ['Inquiry', lead.inquiry_type],
                      ['Property', lead.property_title],
                      ['Project', lead.project_name],
                      ['Preferred visit', lead.visit_preferred_date ? `${formatDate(lead.visit_preferred_date)} ${lead.visit_preferred_slot || ''}` : ''],
                      ['Next follow-up', formatDate(lead.next_followup_date)],
                      ['Received', formatDate(lead.creation)],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k as string}>
                        <dt className="text-xs text-slate-500">{k}</dt>
                        <dd className="text-slate-200">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {lead.inquiry_message && <p className="mt-4 whitespace-pre-line rounded-lg bg-white/[0.03] p-3 text-sm text-slate-300">{lead.inquiry_message}</p>}
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-white">History</h3>
                  {history.length === 0 ? (
                    <p className="text-sm text-slate-500">No follow-ups recorded yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {history.map((h, i) => (
                        <li key={i} className="rounded-lg border border-white/10 bg-[#0B1A30] p-3 text-sm">
                          <p className="text-xs text-slate-500">{formatDate(h.creation)}</p>
                          <p className="mt-1 text-slate-300">{h.content.replace(/<[^>]+>/g, ' ')}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {visits.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-semibold text-white">Site visits</h3>
                    <ul className="space-y-2 text-sm">
                      {visits.map((v) => (
                        <li key={v.name} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0B1A30] p-3">
                          <span className="text-slate-300">{formatDate(v.visit_date)}</span>
                          <StatusBadge status={v.status} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {!closed ? (
                  <form onSubmit={save} className="space-y-3 rounded-xl border border-white/10 bg-[#0B1A30] p-4">
                    <h3 className="font-semibold text-white">Record follow-up</h3>
                    <Field label="Status" htmlFor="ld-status">
                      <select id="ld-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                        <option value="">Keep “{lead.status}”</option>
                        {allowed_statuses.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="Next follow-up" htmlFor="ld-date">
                      <input id="ld-date" type="date" min={new Date().toISOString().slice(0, 10)} value={form.next_followup_date} onChange={(e) => setForm({ ...form, next_followup_date: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Note" htmlFor="ld-note" hint={form.status === 'Lost' ? 'A reason is required when marking a lead as lost.' : undefined}>
                      <textarea id="ld-note" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputClass} />
                    </Field>
                    {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
                    <PrimaryButton type="submit" busy={busy} className="w-full">Save</PrimaryButton>
                  </form>
                ) : (
                  <Notice>This lead is {lead.status.toLowerCase()}; follow-ups are handled by RealtorX.</Notice>
                )}
                {!closed && (
                  <button
                    onClick={() => {
                      sessionStorage.setItem(BOOKING_LEAD_KEY, lead.name);
                      go('inventory');
                    }}
                    className="w-full rounded-lg border border-white/15 px-4 py-2.5 text-sm text-white hover:bg-white/5"
                  >
                    Book a unit for this lead
                  </button>
                )}
              </div>
            </div>
          );
        }}
      </DataView>
    </>
  );
}

// ── Site visits ──────────────────────────────────────────────────────────
interface Visit {
  name: string;
  visit_date: string;
  visit_time?: string;
  status: string;
  outcome?: string;
  visitor: string;
  property_title?: string;
  project_name?: string;
}

function SiteVisits() {
  const state = useApi<Visit[]>('realtor_x.api.portal.dealer_site_visits');
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ status: 'Completed', outcome: '', follow_up_date: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async (name: string) => {
    setBusy(true);
    setMsg('');
    try {
      await callPost('realtor_x.api.portal.dealer_update_site_visit', { name, ...form });
      setEditing(null);
      state.reload();
    } catch (err: any) {
      setMsg(err?.message || 'Could not update the visit.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SectionHeader title="Site visits" description="Visits scheduled by RealtorX for your leads and customers." />
      <DataView state={state} isEmpty={(r) => r.length === 0} empty={{ icon: CalendarCheck, title: 'No site visits', description: 'Scheduled visits will appear here.' }}>
        {(rows) => (
          <ul className="space-y-3">
            {rows.map((v) => {
              const open = ['Scheduled', 'Confirmed'].includes(v.status);
              return (
                <li key={v.name} className="rounded-xl border border-white/10 bg-[#0B1A30] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white">{v.visitor || v.name}</p>
                      <p className="text-xs text-slate-400">
                        {formatDate(v.visit_date)} {v.visit_time ? v.visit_time.slice(0, 5) : ''} · {[v.property_title, v.project_name].filter(Boolean).join(' · ') || 'Project not set'}
                      </p>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                  {v.outcome && <p className="mt-2 text-sm text-slate-300">{v.outcome}</p>}
                  {open && editing !== v.name && (
                    <button onClick={() => { setEditing(v.name); setForm({ status: 'Completed', outcome: '', follow_up_date: '' }); }} className="mt-3 text-sm text-[#F5A623] hover:underline">
                      Update visit
                    </button>
                  )}
                  {editing === v.name && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <Field label="Status" htmlFor={`sv-${v.name}-s`}>
                        <select id={`sv-${v.name}-s`} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                          <option>Confirmed</option>
                          <option>Completed</option>
                          <option>No-Show</option>
                          <option>Cancelled</option>
                        </select>
                      </Field>
                      <Field label="Follow-up date" htmlFor={`sv-${v.name}-d`}>
                        <input id={`sv-${v.name}-d`} type="date" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} className={inputClass} />
                      </Field>
                      <div className="sm:col-span-3">
                        <Field label="Outcome" htmlFor={`sv-${v.name}-o`}>
                          <textarea id={`sv-${v.name}-o`} rows={2} value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} className={inputClass} />
                        </Field>
                      </div>
                      {msg && <div className="sm:col-span-3"><Notice tone="error">{msg}</Notice></div>}
                      <div className="flex gap-2 sm:col-span-3">
                        <PrimaryButton busy={busy} onClick={() => save(v.name)}>Save</PrimaryButton>
                        <button onClick={() => setEditing(null)} className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Cancel</button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </DataView>
    </>
  );
}

// ── Inventory & booking requests ─────────────────────────────────────────
interface Unit {
  name: string;
  property_title: string;
  project_name?: string;
  status: string;
  list_price: number;
  size?: number;
  size_unit?: string;
  custom_property_category?: string;
  unit_number?: string;
}

function Inventory({ open }: { open: (p: string) => void }) {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const state = useApi<{ items: Unit[]; total: number }>(
    'realtor_x.api.v1.get_public_properties',
    { page_length: 100, search: query, sort: 'newest' },
    query
  );
  const bookingLead = sessionStorage.getItem(BOOKING_LEAD_KEY);
  return (
    <>
      <SectionHeader title="Inventory" description="Units currently available to book. Prices are set by RealtorX." />
      {bookingLead && <div className="mb-4"><Notice>Choose a unit to book for lead {bookingLead}.</Notice></div>}
      <form onSubmit={(e) => { e.preventDefault(); setQuery(search.trim()); }} className="mb-4 flex gap-2">
        <label htmlFor="inv-search" className="sr-only">Search units</label>
        <input id="inv-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or unit number" className={inputClass} />
        <PrimaryButton type="submit">Search</PrimaryButton>
      </form>
      <DataView state={state} isEmpty={(d) => d.items.length === 0} empty={{ icon: Building2, title: 'No available units', description: 'Try another search.' }}>
        {(d) => (
          <DataTable
            rows={d.items}
            rowKey={(r) => r.name}
            onRowClick={(r) => open(r.name)}
            columns={[
              { header: 'Unit', cell: (r) => <span className="font-medium text-white">{r.property_title}</span> },
              { header: 'Project', cell: (r) => r.project_name || '—' },
              { header: 'Type', cell: (r) => r.custom_property_category || '—' },
              { header: 'Size', cell: (r) => (r.size ? `${r.size} ${r.size_unit || ''}` : '—') },
              { header: 'Price', cell: (r) => formatPKR(r.list_price), align: 'right' },
            ]}
          />
        )}
      </DataView>
    </>
  );
}

function InventoryDetail({ property, back, go }: { property: string; back: () => void; go: (s: string) => void }) {
  const state = useApi<Unit>('realtor_x.api.v1.get_public_property_details', { property_id: property }, property);
  const leadId = sessionStorage.getItem(BOOKING_LEAD_KEY) || '';
  const [form, setForm] = useState({ customer_name: '', phone: '', email: '', cnic: '', note: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!leadId) return;
    callGet<LeadDetailData>('realtor_x.api.portal.dealer_lead_detail', { name: leadId })
      .then(({ lead }) => setForm((f) => ({ ...f, customer_name: lead.lead_name, phone: lead.phone, email: lead.email || '' })))
      .catch(() => sessionStorage.removeItem(BOOKING_LEAD_KEY));
  }, [leadId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await callPost('realtor_x.api.portal.dealer_submit_booking', { property_id: property, lead: leadId || undefined, ...form });
      sessionStorage.removeItem(BOOKING_LEAD_KEY);
      go('bookings');
    } catch (err: any) {
      setError(err?.message || 'Could not submit the booking.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <BackLink onClick={back}>Inventory</BackLink>
      <DataView state={state}>
        {(u) => (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-xl border border-white/10 bg-[#0B1A30] p-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-white">{u.property_title}</h2>
                <StatusBadge status={u.status} />
              </div>
              <p className="mt-1 text-sm text-slate-400">{[u.project_name, u.custom_property_category, u.size && `${u.size} ${u.size_unit || ''}`].filter(Boolean).join(' · ')}</p>
              <p className="mt-4 text-2xl font-bold tabular-nums text-white">{formatPKR(u.list_price)}</p>
              <p className="text-xs text-slate-500">List price. The final price is confirmed by RealtorX on approval.</p>
            </div>
            {u.status === 'Available' ? (
              <form onSubmit={submit} className="space-y-3 rounded-xl border border-white/10 bg-[#0B1A30] p-4">
                <h3 className="font-semibold text-white">Submit booking request</h3>
                <p className="text-xs text-slate-400">The unit is reserved immediately and RealtorX reviews the request.</p>
                <Field label="Customer full name" htmlFor="bk-name">
                  <input id="bk-name" required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Customer mobile" htmlFor="bk-phone">
                  <input id="bk-phone" required type="tel" placeholder="0300 1234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Customer email (optional)" htmlFor="bk-email" hint="Used to give the customer portal access.">
                  <input id="bk-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Customer CNIC (optional)" htmlFor="bk-cnic">
                  <input id="bk-cnic" value={form.cnic} onChange={(e) => setForm({ ...form, cnic: e.target.value })} className={inputClass} placeholder="42101-1234567-1" />
                </Field>
                <Field label="Note for RealtorX (optional)" htmlFor="bk-note">
                  <textarea id="bk-note" rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputClass} />
                </Field>
                {error && <Notice tone="error">{error}</Notice>}
                <PrimaryButton type="submit" busy={busy} className="w-full">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit booking
                </PrimaryButton>
              </form>
            ) : (
              <Notice>This unit is {u.status.toLowerCase()} and cannot be booked.</Notice>
            )}
          </div>
        )}
      </DataView>
    </>
  );
}

interface Booking {
  name: string;
  property_title: string;
  customer_name: string;
  booking_date: string;
  net_price?: number;
  sale_price?: number;
  status: string;
}

function Bookings() {
  const state = useApi<Booking[]>('realtor_x.api.portal.dealer_bookings');
  return (
    <>
      <SectionHeader title="Bookings" description="Booking requests you submitted and their review status." />
      <DataView state={state} isEmpty={(r) => r.length === 0} empty={{ icon: ClipboardList, title: 'No bookings yet', description: 'Submit a booking from Inventory.' }}>
        {(rows) => (
          <DataTable
            rows={rows}
            rowKey={(r) => r.name}
            columns={[
              { header: 'Booking', cell: (r) => <span className="font-mono text-xs">{r.name}</span> },
              { header: 'Unit', cell: (r) => r.property_title },
              { header: 'Customer', cell: (r) => r.customer_name || '—' },
              { header: 'Date', cell: (r) => formatDate(r.booking_date) },
              { header: 'Price', cell: (r) => formatPKR(r.net_price ?? r.sale_price), align: 'right' },
              { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
          />
        )}
      </DataView>
    </>
  );
}

// ── Deals & money ────────────────────────────────────────────────────────
interface Deal {
  name: string;
  property_title: string;
  customer_name: string;
  deal_date: string;
  net_sale_value: number;
  dealer_commission: number;
  verified_paid: number;
  paid_pct: number;
  status: string;
}

function Deals({ open }: { open: (d: string) => void }) {
  const state = useApi<Deal[]>('realtor_x.api.portal.dealer_deals');
  return (
    <>
      <SectionHeader title="Deals" description="Collection progress counts verified customer payments only." />
      <DataView state={state} isEmpty={(r) => r.length === 0} empty={{ icon: Briefcase, title: 'No deals yet' }}>
        {(rows) => (
          <DataTable
            rows={rows}
            rowKey={(r) => r.name}
            onRowClick={(r) => open(r.name)}
            columns={[
              { header: 'Deal', cell: (r) => <span className="font-mono text-xs">{r.name}</span> },
              { header: 'Unit', cell: (r) => r.property_title },
              { header: 'Customer', cell: (r) => r.customer_name },
              { header: 'Value', cell: (r) => formatPKR(r.net_sale_value), align: 'right' },
              { header: 'Collected', cell: (r) => `${r.paid_pct}%`, align: 'right' },
              { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
          />
        )}
      </DataView>
    </>
  );
}

function DealDetail({ name, back }: { name: string; back: () => void }) {
  const state = useApi<Deal & { commissions: { name: string; dealer_commission: number; status: string }[]; installments_summary: { installment_number: number; due_date: string; amount: number; paid_amount: number; status: string }[] }>(
    'realtor_x.api.portal.dealer_deal_detail',
    { name },
    name
  );
  return (
    <>
      <BackLink onClick={back}>Deals</BackLink>
      <DataView state={state}>
        {(d) => (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-[#0B1A30] p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-white">{d.property_title}</h2>
                  <p className="text-sm text-slate-400">{d.customer_name} · {formatDate(d.deal_date)}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
                <StatCard label="Deal value" value={formatPKR(d.net_sale_value)} />
                <StatCard label="Verified collected" value={formatPKR(d.verified_paid)} hint={`${d.paid_pct}%`} tone="good" />
                <StatCard label="Your commission (recorded)" value={formatPKR(d.commissions.reduce((s, c) => s + c.dealer_commission, 0))} />
              </div>
            </div>
            {d.installments_summary.length > 0 && (
              <DataTable
                rows={d.installments_summary}
                rowKey={(r) => String(r.installment_number)}
                columns={[
                  { header: '#', cell: (r) => r.installment_number },
                  { header: 'Due', cell: (r) => formatDate(r.due_date) },
                  { header: 'Amount', cell: (r) => formatPKR(r.amount), align: 'right' },
                  { header: 'Paid', cell: (r) => formatPKR(r.paid_amount), align: 'right' },
                  { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
                ]}
              />
            )}
          </div>
        )}
      </DataView>
    </>
  );
}

interface Commission {
  name: string;
  deal: string;
  dealer_commission: number;
  status: string;
  payment_reference?: string;
  creation: string;
}

function Commissions({ open }: { open: (c: string) => void }) {
  const state = useApi<{ rows: Commission[]; totals: Record<string, number> }>('realtor_x.api.portal.dealer_commissions');
  return (
    <>
      <SectionHeader title="Commission statement" description="Amounts recorded by RealtorX finance. Earned amounts become payable after approval." />
      <DataView state={state} isEmpty={(d) => d.rows.length === 0} empty={{ icon: Coins, title: 'No commission records yet' }}>
        {(d) => (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {['Earned', 'Approved', 'Payable', 'Paid'].map((k) => (
                <StatCard key={k} label={k} value={formatPKR(d.totals[k] || 0)} tone={k === 'Paid' ? 'good' : 'default'} />
              ))}
            </div>
            <DataTable
              rows={d.rows}
              rowKey={(r) => r.name}
              onRowClick={(r) => open(r.name)}
              columns={[
                { header: 'Record', cell: (r) => <span className="font-mono text-xs">{r.name}</span> },
                { header: 'Deal', cell: (r) => r.deal },
                { header: 'Date', cell: (r) => formatDate(r.creation) },
                { header: 'Amount', cell: (r) => formatPKR(r.dealer_commission), align: 'right' },
                { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
              ]}
            />
          </div>
        )}
      </DataView>
    </>
  );
}

function CommissionDetail({ name, back }: { name: string; back: () => void }) {
  const state = useApi<Commission & { deal_info: { property_title?: string; net_sale_value?: number; deal_date?: string; status?: string } }>(
    'realtor_x.api.portal.dealer_commission_detail',
    { name },
    name
  );
  return (
    <>
      <BackLink onClick={back}>Commission statement</BackLink>
      <DataView state={state}>
        {(c) => (
          <div className="max-w-lg rounded-xl border border-white/10 bg-[#0B1A30] p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-slate-400">{c.name}</p>
              <StatusBadge status={c.status} />
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-white">{formatPKR(c.dealer_commission)}</p>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ['Deal', c.deal],
                ['Unit', c.deal_info?.property_title || '—'],
                ['Deal value', formatPKR(c.deal_info?.net_sale_value)],
                ['Deal date', formatDate(c.deal_info?.deal_date)],
                ['Payment reference', c.payment_reference || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-slate-400">{k}</dt>
                  <dd className="text-right text-slate-200">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </DataView>
    </>
  );
}

function Payouts() {
  const state = useApi<{ name: string; period_from?: string; period_to?: string; net_payable: number; payment_date?: string; status: string; payment_reference?: string }[]>(
    'realtor_x.api.portal.dealer_payouts'
  );
  return (
    <>
      <SectionHeader title="Payouts" description="Payments RealtorX has made or approved to you." />
      <DataView state={state} isEmpty={(r) => r.length === 0} empty={{ icon: Wallet, title: 'No payouts yet' }}>
        {(rows) => (
          <DataTable
            rows={rows}
            rowKey={(r) => r.name}
            columns={[
              { header: 'Payout', cell: (r) => <span className="font-mono text-xs">{r.name}</span> },
              { header: 'Period', cell: (r) => `${formatDate(r.period_from)} – ${formatDate(r.period_to)}` },
              { header: 'Net', cell: (r) => formatPKR(r.net_payable), align: 'right' },
              { header: 'Paid on', cell: (r) => formatDate(r.payment_date) },
              { header: 'Reference', cell: (r) => r.payment_reference || '—' },
              { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
          />
        )}
      </DataView>
    </>
  );
}

// ── Profile & payout settings ────────────────────────────────────────────
interface DealerProfile {
  name: string;
  full_name: string;
  email: string;
  phone: string;
  city?: string;
  company_name?: string;
  dealer_type?: string;
  status: string;
  availability?: string;
  service_radius_km?: number;
  commission_plan?: string;
  cnic_masked: string;
  bank_name?: string;
  account_masked: string;
  iban_masked: string;
}

function Profile() {
  const state = useApi<DealerProfile>('realtor_x.api.portal.dealer_profile');
  return (
    <>
      <SectionHeader title="Profile" description="To change these details, contact Support." />
      <DataView state={state}>
        {(p) => (
          <dl className="max-w-lg space-y-2 rounded-xl border border-white/10 bg-[#0B1A30] p-4 text-sm">
            {[
              ['Dealer ID', p.name],
              ['Name', p.full_name],
              ['Email', p.email],
              ['Mobile', p.phone],
              ['City', p.city],
              ['Company', p.company_name],
              ['Type', p.dealer_type],
              ['Status', p.status],
              ['Availability', p.availability],
              ['Service radius', p.service_radius_km ? `${p.service_radius_km} km` : ''],
              ['Commission plan', p.commission_plan],
              ['CNIC', p.cnic_masked],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between gap-4">
                <dt className="text-slate-400">{k}</dt>
                <dd className="text-right text-slate-200">{v || '—'}</dd>
              </div>
            ))}
          </dl>
        )}
      </DataView>
    </>
  );
}

function PayoutSettings({ go }: { go: (s: string) => void }) {
  const state = useApi<DealerProfile>('realtor_x.api.portal.dealer_profile');
  const [form, setForm] = useState({ bank_name: '', account_title: '', account_number: '', iban: '', note: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await callPost<{ ticket: string }>('realtor_x.api.portal.dealer_request_payout_change', form);
      go(`support/${res.ticket}`);
    } catch (err: any) {
      setError(err?.message || 'Could not submit the request.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SectionHeader title="Payout settings" description="Where RealtorX pays your commission." />
      <DataView state={state}>
        {(p) => (
          <div className="grid gap-6 lg:grid-cols-2">
            <dl className="space-y-2 rounded-xl border border-white/10 bg-[#0B1A30] p-4 text-sm">
              <h3 className="mb-2 font-semibold text-white">Current details</h3>
              {[
                ['Bank', p.bank_name],
                ['Account number', p.account_masked],
                ['IBAN', p.iban_masked],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-slate-400">{k}</dt>
                  <dd className="text-right font-mono text-slate-200">{v || 'Not on file'}</dd>
                </div>
              ))}
            </dl>
            <form onSubmit={submit} className="space-y-3 rounded-xl border border-white/10 bg-[#0B1A30] p-4">
              <h3 className="font-semibold text-white">Request a change</h3>
              <p className="text-xs text-slate-400">For your protection, bank details are changed only after RealtorX verifies the request.</p>
              <Field label="Bank name" htmlFor="po-bank">
                <input id="po-bank" required value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} className={inputClass} placeholder="e.g. HBL, Meezan Bank" />
              </Field>
              <Field label="Account title" htmlFor="po-title">
                <input id="po-title" required value={form.account_title} onChange={(e) => setForm({ ...form, account_title: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Account number" htmlFor="po-acc">
                <input id="po-acc" required inputMode="numeric" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} className={inputClass} />
              </Field>
              <Field label="IBAN (optional)" htmlFor="po-iban">
                <input id="po-iban" value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} className={inputClass} placeholder="PK..." />
              </Field>
              {error && <Notice tone="error">{error}</Notice>}
              <PrimaryButton type="submit" busy={busy} className="w-full">Submit for verification</PrimaryButton>
            </form>
          </div>
        )}
      </DataView>
    </>
  );
}
