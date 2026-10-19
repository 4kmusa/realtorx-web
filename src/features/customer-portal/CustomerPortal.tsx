// Customer portal: /customer/<section>[/<id>]. All data comes from session-bound
// realtor_x.api.portal.customer_* endpoints; nothing here can change balances or prices.
import React, { useEffect, useState } from 'react';
import {
  Bell, Building2, CalendarClock, CreditCard, FileText, Home, Landmark, LifeBuoy, Loader2, ShieldCheck, User, UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PageId } from '../../types';
import { API_BASE, callPost } from '../../services/api/client';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  BackLink, DataTable, DataView, Field, NavItem, Notice, PortalShell, PrimaryButton, SectionHeader, StatCard,
  formatDate, formatPKR, inputClass, useApi,
} from '../portal/kit';
import { NotificationsSection, SecuritySection, SupportSection, useUnreadCount } from '../portal/shared';
import { parsePath } from '../../app/routes';

type Nav = (page: PageId, id?: string) => void;

const NAV: NavItem[] = [
  { section: 'dashboard', label: 'Dashboard', icon: Home },
  { section: 'properties', label: 'My properties', icon: Building2 },
  { section: 'installments', label: 'Installments', icon: CalendarClock },
  { section: 'payments', label: 'Payments', icon: CreditCard },
  { section: 'documents', label: 'Documents', icon: FileText },
  { section: 'notifications', label: 'Notifications', icon: Bell },
  { section: 'support', label: 'Support', icon: LifeBuoy },
  { section: 'profile', label: 'Profile', icon: User },
  { section: 'verification', label: 'Verification', icon: UserCheck },
  { section: 'security', label: 'Security', icon: ShieldCheck },
];

interface Installment {
  name: string;
  deal: string;
  installment_number: number;
  due_date: string;
  amount: number;
  paid_amount: number;
  outstanding: number;
  state: string;
  property_title?: string;
}

interface Payment {
  name: string;
  deal: string;
  amount: number;
  payment_date: string;
  payment_mode?: string;
  reference_number?: string;
  installment?: string;
  property_title?: string;
  installment_number?: number;
}

export default function CustomerPortal({ section, onNavigate }: { section: string | null; onNavigate: Nav }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [root, id] = (section || 'dashboard').split('/');
  const go = (s: string) => onNavigate('portal', s);
  const unread = useUnreadCount(section || 'dashboard');
  const openLink = (link: string) => {
    const route = parsePath(link);
    onNavigate(route.page, route.id || undefined);
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      sessionStorage.setItem('realtorx_after_login', 'portal');
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

  if (!user.is_customer) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={Landmark}
          title="No customer account linked yet"
          description="Your customer portal becomes available once RealtorX records your booking and links it to this email address. Contact us if you have already booked."
          actionLabel="Contact us"
          onAction={() => onNavigate('contact')}
        />
      </div>
    );
  }

  let content: React.ReactNode;
  switch (root) {
    case 'properties':
      content = id ? <PropertyDetail deal={id} back={() => go('properties')} openPayment={(p) => go(`payments/${p}`)} /> : <Properties open={(d) => go(`properties/${d}`)} />;
      break;
    case 'installments':
      content = <Installments />;
      break;
    case 'payments':
      content = id === 'new' ? <PaymentInstructions go={go} /> : id ? <PaymentDetail name={id} back={() => go('payments')} /> : <Payments open={(p) => go(`payments/${p}`)} go={go} />;
      break;
    case 'documents':
      content = <Documents />;
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
    case 'verification':
      content = <Verification go={go} />;
      break;
    case 'security':
      content = <SecuritySection email={user.email} />;
      break;
    default:
      content = <Dashboard go={go} />;
  }

  return (
    <PortalShell
      title="Customer portal"
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

// ── Dashboard ────────────────────────────────────────────────────────────
interface Summary {
  properties: number;
  contract_value: number;
  verified_paid: number;
  outstanding: number;
  overdue_count: number;
  overdue_amount: number;
  pending_bookings: number;
  next_due: Installment | null;
}

function Dashboard({ go }: { go: (s: string) => void }) {
  const state = useApi<Summary>('realtor_x.api.portal.customer_summary');
  return (
    <>
      <SectionHeader title="Overview" description="Amounts paid include only receipts verified by our finance team." />
      <DataView state={state}>
        {(s) => (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="Properties" value={s.properties} hint={s.pending_bookings ? `${s.pending_bookings} booking(s) in review` : undefined} />
              <StatCard label="Contract value" value={formatPKR(s.contract_value)} />
              <StatCard label="Verified payments" value={formatPKR(s.verified_paid)} tone="good" />
              <StatCard label="Outstanding" value={formatPKR(s.outstanding)} tone={s.overdue_count ? 'warn' : 'default'} hint={s.overdue_count ? `${s.overdue_count} overdue · ${formatPKR(s.overdue_amount)}` : undefined} />
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0B1A30] p-4">
              <h3 className="font-semibold text-white">Next installment</h3>
              {s.next_due ? (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className="text-slate-300">
                    #{s.next_due.installment_number} · due {formatDate(s.next_due.due_date)}
                  </span>
                  <span className="font-semibold tabular-nums text-white">{formatPKR(s.next_due.outstanding)}</span>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-400">No upcoming installments.</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <PrimaryButton onClick={() => go('installments')}>View schedule</PrimaryButton>
                <button onClick={() => go('payments/new')} className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5">
                  How to pay
                </button>
              </div>
            </div>
          </div>
        )}
      </DataView>
    </>
  );
}

// ── Properties ───────────────────────────────────────────────────────────
interface OwnedProperty {
  type: 'Deal' | 'Booking';
  name: string;
  property_title: string;
  project_name: string;
  date: string;
  contract_price: number;
  verified_paid: number;
  status: string;
}

function Properties({ open }: { open: (deal: string) => void }) {
  const state = useApi<OwnedProperty[]>('realtor_x.api.portal.customer_properties');
  return (
    <>
      <SectionHeader title="My properties" description="Bookings under review and confirmed purchases." />
      <DataView state={state} isEmpty={(r) => r.length === 0} empty={{ icon: Building2, title: 'No properties yet', description: 'Your bookings will appear here once recorded.' }}>
        {(rows) => (
          <div className="grid gap-3 sm:grid-cols-2">
            {rows.map((p) => (
              <button
                key={p.name}
                onClick={() => p.type === 'Deal' && open(p.name)}
                disabled={p.type !== 'Deal'}
                className="rounded-xl border border-white/10 bg-[#0B1A30] p-4 text-left transition-colors enabled:hover:border-[#F5A623]/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{p.property_title}</p>
                    <p className="text-xs text-slate-500">{[p.project_name, p.type === 'Booking' ? 'Booking in review' : p.name].filter(Boolean).join(' · ')}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-slate-400">Price</span>
                  <span className="tabular-nums text-white">{formatPKR(p.contract_price)}</span>
                </div>
                {p.type === 'Deal' && (
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-slate-400">Verified paid</span>
                    <span className="tabular-nums text-emerald-400">{formatPKR(p.verified_paid)}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </DataView>
    </>
  );
}

interface PropertyDetailData {
  deal: { name: string; deal_date: string; gross_price: number; discount: number; net_sale_value: number; status: string };
  property: { property_title?: string; unit_number?: string; tower?: string; floor?: string; size?: number; size_unit?: string };
  project_name: string;
  verified_paid: number;
  installments: Installment[];
  payments: Payment[];
  documents: { name: string; file_name: string }[];
}

function PropertyDetail({ deal, back, openPayment }: { deal: string; back: () => void; openPayment: (p: string) => void }) {
  const state = useApi<PropertyDetailData>('realtor_x.api.portal.customer_property_detail', { deal }, deal);
  return (
    <>
      <BackLink onClick={back}>My properties</BackLink>
      <DataView state={state}>
        {(d) => {
          const outstanding = d.installments.reduce((s, i) => s + i.outstanding, 0);
          return (
            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-[#0B1A30] p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{d.property.property_title}</h2>
                    <p className="text-xs text-slate-500">
                      {[d.project_name, d.property.tower && `Tower ${d.property.tower}`, d.property.floor && `Floor ${d.property.floor}`, d.property.unit_number && `Unit ${d.property.unit_number}`, d.property.size && `${d.property.size} ${d.property.size_unit || ''}`].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <StatusBadge status={d.deal.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <StatCard label="Contract price" value={formatPKR(d.deal.net_sale_value)} hint={d.deal.discount ? `after ${formatPKR(d.deal.discount)} discount` : undefined} />
                  <StatCard label="Verified paid" value={formatPKR(d.verified_paid)} tone="good" />
                  <StatCard label="Outstanding" value={formatPKR(outstanding)} />
                  <StatCard label="Deal date" value={formatDate(d.deal.deal_date)} />
                </div>
              </div>
              <InstallmentTable rows={d.installments} />
              <div>
                <h3 className="mb-2 font-semibold text-white">Verified payments</h3>
                {d.payments.length ? (
                  <PaymentTable rows={d.payments} open={openPayment} />
                ) : (
                  <p className="text-sm text-slate-500">No verified payments yet.</p>
                )}
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-white">Documents</h3>
                <DocumentList docs={d.documents} />
              </div>
            </div>
          );
        }}
      </DataView>
    </>
  );
}

// ── Installments & payments ──────────────────────────────────────────────
const STATE_TONE: Record<string, string> = {
  Paid: 'text-emerald-400',
  Overdue: 'text-rose-400',
  'Partially Paid': 'text-amber-400',
  Upcoming: 'text-slate-300',
};

function InstallmentTable({ rows, showProperty = false }: { rows: Installment[]; showProperty?: boolean }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No installment schedule yet.</p>;
  return (
    <DataTable
      rows={rows}
      rowKey={(r) => r.name}
      columns={[
        { header: '#', cell: (r) => r.installment_number },
        ...(showProperty ? [{ header: 'Property', cell: (r: Installment) => r.property_title || r.deal }] : []),
        { header: 'Due date', cell: (r) => formatDate(r.due_date) },
        { header: 'Amount', cell: (r) => formatPKR(r.amount), align: 'right' as const },
        { header: 'Paid', cell: (r) => formatPKR(r.paid_amount), align: 'right' as const },
        { header: 'Outstanding', cell: (r) => formatPKR(r.outstanding), align: 'right' as const },
        { header: 'Status', cell: (r) => <span className={`text-xs font-semibold ${STATE_TONE[r.state] || ''}`}>{r.state}</span> },
      ]}
    />
  );
}

function Installments() {
  const state = useApi<Installment[]>('realtor_x.api.portal.customer_installments');
  return (
    <>
      <SectionHeader title="Installments" description="Overdue means the due date has passed and a balance remains." />
      <DataView state={state} isEmpty={(r) => r.length === 0} empty={{ icon: CalendarClock, title: 'No installments', description: 'Your payment schedule appears once your deal is approved.' }}>
        {(rows) => <InstallmentTable rows={rows} showProperty />}
      </DataView>
    </>
  );
}

function PaymentTable({ rows, open }: { rows: Payment[]; open: (p: string) => void }) {
  return (
    <DataTable
      rows={rows}
      rowKey={(r) => r.name}
      onRowClick={(r) => open(r.name)}
      columns={[
        { header: 'Receipt', cell: (r) => <span className="font-mono text-xs">{r.name}</span> },
        { header: 'Date', cell: (r) => formatDate(r.payment_date) },
        { header: 'Method', cell: (r) => r.payment_mode || '—' },
        { header: 'Reference', cell: (r) => r.reference_number || '—' },
        { header: 'Amount', cell: (r) => formatPKR(r.amount), align: 'right' },
      ]}
    />
  );
}

function Payments({ open, go }: { open: (p: string) => void; go: (s: string) => void }) {
  const state = useApi<Payment[]>('realtor_x.api.portal.customer_payments');
  return (
    <>
      <SectionHeader
        title="Payments"
        description="Receipts verified by RealtorX finance."
        action={<PrimaryButton onClick={() => go('payments/new')}>How to pay</PrimaryButton>}
      />
      <DataView state={state} isEmpty={(r) => r.length === 0} empty={{ icon: CreditCard, title: 'No verified payments yet', description: 'Payments appear here after our finance team verifies them.' }}>
        {(rows) => <PaymentTable rows={rows} open={open} />}
      </DataView>
    </>
  );
}

function PaymentDetail({ name, back }: { name: string; back: () => void }) {
  const state = useApi<Payment>('realtor_x.api.portal.customer_payment_detail', { name }, name);
  return (
    <>
      <BackLink onClick={back}>Payments</BackLink>
      <DataView state={state}>
        {(p) => (
          <div className="max-w-lg rounded-xl border border-white/10 bg-[#0B1A30] p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">Verified receipt</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-white">{formatPKR(p.amount)}</p>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ['Receipt', p.name],
                ['Date', formatDate(p.payment_date)],
                ['Method', p.payment_mode || '—'],
                ['Bank reference', p.reference_number || '—'],
                ['Property', p.property_title || p.deal],
                ['Installment', p.installment_number ? `#${p.installment_number}` : 'Not allocated'],
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

function PaymentInstructions({ go }: { go: (s: string) => void }) {
  return (
    <>
      <BackLink onClick={() => go('payments')}>Payments</BackLink>
      <SectionHeader title="How to pay" />
      <div className="max-w-2xl space-y-4 text-sm text-slate-300">
        <Notice>
          Online payment reporting will open after RealtorX finalises its payment verification process. Until then, follow the steps
          below.
        </Notice>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Pay only to the bank account or payee named in your official booking documents.</li>
          <li>Keep the bank slip or transfer confirmation and note the transaction reference.</li>
          <li>
            Send the reference and a photo of the slip through{' '}
            <button className="text-[#F5A623] hover:underline" onClick={() => go('support')}>Support</button> so finance can verify it.
          </li>
          <li>The payment appears under Payments once verified, and your installment balance updates.</li>
        </ol>
        <p className="text-slate-500">RealtorX staff will never ask you to pay into a personal account.</p>
      </div>
    </>
  );
}

// ── Documents ────────────────────────────────────────────────────────────
function DocumentList({ docs }: { docs: { name: string; file_name: string; attached_to?: string; creation?: string }[] }) {
  if (!docs.length) return <p className="text-sm text-slate-500">No documents shared yet.</p>;
  return (
    <ul className="divide-y divide-white/5 rounded-xl border border-white/10 bg-[#0B1A30]">
      {docs.map((d) => (
        <li key={d.name} className="flex items-center justify-between gap-3 p-3 text-sm">
          <span className="flex min-w-0 items-center gap-2 text-slate-200">
            <FileText className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="truncate">{d.file_name}</span>
          </span>
          <a
            className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/5"
            href={`${API_BASE}/method/realtor_x.api.portal.download_customer_document?file_id=${encodeURIComponent(d.name)}`}
          >
            Download
          </a>
        </li>
      ))}
    </ul>
  );
}

function Documents() {
  const state = useApi<{ name: string; file_name: string; attached_to?: string }[]>('realtor_x.api.portal.customer_documents');
  return (
    <>
      <SectionHeader title="Documents" description="Agreements, receipts and letters RealtorX has attached to your account." />
      <DataView state={state} isEmpty={(r) => r.length === 0} empty={{ icon: FileText, title: 'No documents yet', description: 'Documents appear here when our team shares them.' }}>
        {(docs) => <DocumentList docs={docs} />}
      </DataView>
    </>
  );
}

// ── Profile & verification ───────────────────────────────────────────────
interface ProfileData {
  name: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  city?: string;
  address?: string;
  cnic_on_file: boolean;
  cnic_masked: string;
}

function Profile() {
  const state = useApi<ProfileData>('realtor_x.api.portal.customer_profile');
  const [form, setForm] = useState<{ whatsapp: string; city: string; address: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    if (state.data && !form) setForm({ whatsapp: state.data.whatsapp || '', city: state.data.city || '', address: state.data.address || '' });
  }, [state.data, form]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setMsg(null);
    try {
      state.setData(await callPost<ProfileData>('realtor_x.api.portal.update_customer_profile', form));
      setMsg({ tone: 'success', text: 'Saved.' });
    } catch (err: any) {
      setMsg({ tone: 'error', text: err?.message || 'Could not save.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SectionHeader title="Profile" description="To change your name, email or primary phone, contact Support (these are tied to your contract)." />
      <DataView state={state}>
        {(p) => (
          <form onSubmit={save} className="max-w-lg space-y-3 rounded-xl border border-white/10 bg-[#0B1A30] p-4">
            <dl className="space-y-1 text-sm">
              {[
                ['Name', p.full_name],
                ['Email', p.email],
                ['Mobile', p.phone],
                ['Customer ID', p.name],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-slate-400">{k}</dt>
                  <dd className="text-right text-slate-200">{v || '—'}</dd>
                </div>
              ))}
            </dl>
            {form && (
              <>
                <Field label="WhatsApp number" htmlFor="pf-wa">
                  <input id="pf-wa" type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={inputClass} placeholder="0300 1234567" />
                </Field>
                <Field label="City" htmlFor="pf-city">
                  <input id="pf-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Postal address" htmlFor="pf-address">
                  <textarea id="pf-address" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} />
                </Field>
              </>
            )}
            {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
            <PrimaryButton type="submit" busy={busy}>Save changes</PrimaryButton>
          </form>
        )}
      </DataView>
    </>
  );
}

function Verification({ go }: { go: (s: string) => void }) {
  const state = useApi<ProfileData>('realtor_x.api.portal.customer_profile');
  return (
    <>
      <SectionHeader title="Verification" description="Identity details RealtorX holds for your contract." />
      <DataView state={state}>
        {(p) => (
          <div className="max-w-lg space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0B1A30] p-4 text-sm">
              <span className="text-slate-300">CNIC</span>
              <span className={p.cnic_on_file ? 'text-emerald-400' : 'text-amber-400'}>{p.cnic_on_file ? `On file (${p.cnic_masked})` : 'Not provided'}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0B1A30] p-4 text-sm">
              <span className="text-slate-300">Mobile number</span>
              <span className={p.phone ? 'text-emerald-400' : 'text-amber-400'}>{p.phone ? 'On file' : 'Not provided'}</span>
            </div>
            {!p.cnic_on_file && (
              <Notice>
                Please share your CNIC with our team through <button className="underline" onClick={() => go('support')}>Support</button> to complete
                verification. Do not send CNIC images by email or WhatsApp to anyone outside RealtorX.
              </Notice>
            )}
          </div>
        )}
      </DataView>
    </>
  );
}
