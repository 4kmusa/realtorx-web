// Agent dashboard: my buyers (follow-ups, add a buyer, request a booking) and my deals.
import React, { useRef, useState } from 'react';
import { Briefcase, ChevronDown, ChevronUp, Phone, Plus, Upload, Users } from 'lucide-react';
import { callPost, uploadFile } from '../../services/api/client';
import { DocumentLinks, StatementView } from '../money';
import { t } from '../i18n';
import { BackLink, DataTable, DataView, Field, Notice, PrimaryButton, SectionHeader, formatDate, formatMoney, inputClass, useApi } from '../kit/kit';
import PhoneInput from '../../components/site/PhoneInput';
import { localDate } from '../../utils/date';

interface LeadRow {
  name: string;
  lead_name: string;
  phone: string;
  email: string | null;
  status: string;
  inquiry_type: string | null;
  property_reference: string | null;
  property_title: string | null;
  next_followup_date: string | null;
  agent_source: string | null;
  overdue: boolean;
  creation: string;
}
interface LeadDetail extends LeadRow {
  inquiry_message: string | null;
  lost_reason: string | null;
  history: { text: string; on: string }[];
  deals: { name: string; unit: string; stage: string }[];
}

const STATUSES = ['Contacted', 'Qualified', 'Site Visit', 'Negotiation', 'Lost'];

export function BuyersSection() {
  const [filter, setFilter] = useState('open');
  const [open, setOpen] = useState<string | null>(new URLSearchParams(window.location.search).get('lead'));
  const [adding, setAdding] = useState(false);
  const [tick, setTick] = useState(0);
  const state = useApi<LeadRow[]>('realtor_x.api.portal.agent_leads', { status: filter === 'all' ? undefined : filter }, `${filter}-${tick}`);
  if (open) return <LeadPanel name={open} onBack={() => { setOpen(null); setTick((t) => t + 1); }} />;
  if (adding) return <AddBuyer onDone={(lead) => { setAdding(false); setOpen(lead); }} onCancel={() => setAdding(false)} />;
  return (
    <>
      <SectionHeader title="My buyers" description="Buyers from your share links, assigned to you by RealtorX, or added by you." action={<PrimaryButton onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Add buyer</PrimaryButton>} />
      <div className="mb-3 flex gap-2 text-xs">
        {[['open', 'Open'], ['all', 'All']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`rounded-full px-3 py-1 ${filter === v ? 'bg-fg text-ink' : 'bg-white/5 text-fg-2'}`}>{l}</button>
        ))}
      </div>
      <DataView state={state} isEmpty={(r) => r.length === 0} empty={{ icon: Users, title: 'No buyers yet', description: 'Share units from "Inventory to sell": buyers who enquire through your link appear here.' }}>
        {(rows) => (
          <DataTable
            rows={rows}
            rowKey={(r) => r.name}
            onRowClick={(r) => setOpen(r.name)}
            columns={[
              { header: 'Buyer', cell: (r) => <span className="font-semibold text-fg">{r.lead_name}</span> },
              { header: 'Interested in', cell: (r) => r.property_title || '—' },
              { header: 'Status', cell: (r) => r.status },
              { header: 'Follow-up', cell: (r) => <span className={r.overdue ? 'font-semibold text-rose-300' : ''}>{formatDate(r.next_followup_date)}</span> },
              { header: 'Source', cell: (r) => r.agent_source || '—' },
            ]}
          />
        )}
      </DataView>
    </>
  );
}

function LeadPanel({ name, onBack }: { name: string; onBack: () => void }) {
  const [tick, setTick] = useState(0);
  const state = useApi<LeadDetail>('realtor_x.api.portal.agent_lead', { name }, String(tick));
  const [form, setForm] = useState({ status: '', next_followup_date: '', note: '', lost_reason: '' });
  const [unit, setUnit] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const act = async (fn: () => Promise<string>) => {
    setBusy(true);
    setMsg(null);
    try {
      setMsg({ tone: 'success', text: await fn() });
      setTick((t) => t + 1);
    } catch (e: any) {
      setMsg({ tone: 'error', text: e?.message || 'Could not save.' });
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <BackLink onClick={onBack}>My buyers</BackLink>
      <DataView state={state}>
        {(l) => {
          const closed = ['Booking', 'Won', 'Lost'].includes(l.status);
          return (
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-4">
                <div className="rounded-xl border border-line bg-panel p-5">
                  <p className="text-lg font-semibold text-fg">{l.lead_name}</p>
                  <p className="mt-1 text-sm text-fg-2">{l.status} · {l.agent_source} · since {formatDate(l.creation)}</p>
                  <a href={`tel:${l.phone}`} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-200"><Phone className="h-4 w-4" /> {l.phone}</a>
                  {l.email && <p className="mt-2 text-sm text-fg-2">{l.email}</p>}
                  {l.property_title && <p className="mt-3 text-sm text-fg-2">Interested in: <b className="text-fg">{l.property_title}</b></p>}
                  {l.inquiry_message && <p className="mt-2 text-sm text-fg-2">“{l.inquiry_message}”</p>}
                  {l.deals.length > 0 && <p className="mt-3 text-sm text-fg-2">Deals: {l.deals.map((d) => `${d.name} (${d.stage})`).join(', ')}</p>}
                </div>
                <div className="rounded-xl border border-line bg-panel p-5">
                  <p className="font-semibold text-fg">{t("History")}</p>
                  <ul className="mt-2 space-y-2 text-sm">
                    {l.history.length ? l.history.map((h, i) => <li key={i} className="text-fg-2"><span className="text-xs text-fg-3">{formatDate(h.on)}</span> · {h.text}</li>) : <li className="text-fg-3">{t("No notes yet.")}</li>}
                  </ul>
                </div>
              </div>
              {!closed ? (
                <div className="space-y-4">
                  <form className="space-y-3 rounded-xl border border-line bg-panel p-5" onSubmit={(e) => { e.preventDefault(); act(async () => { await callPost('realtor_x.api.portal.agent_update_lead', { name, ...form, status: form.status || undefined, next_followup_date: form.next_followup_date || undefined }); setForm({ status: '', next_followup_date: '', note: '', lost_reason: '' }); return 'Saved.'; }); }}>
                    <p className="font-semibold text-fg">{t("Follow-up")}</p>
                    <Field label="Status" htmlFor="ld-status">
                      <select id="ld-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                        <option value="">Keep “{l.status}”</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </Field>
                    {form.status === 'Lost' && <Field label="Why was the buyer lost?" htmlFor="ld-lost"><input id="ld-lost" value={form.lost_reason} onChange={(e) => setForm({ ...form, lost_reason: e.target.value })} className={inputClass} /></Field>}
                    <Field label="Next follow-up" htmlFor="ld-date"><input id="ld-date" type="date" value={form.next_followup_date} onChange={(e) => setForm({ ...form, next_followup_date: e.target.value })} className={inputClass} /></Field>
                    <Field label="Note" htmlFor="ld-note"><textarea id="ld-note" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputClass} /></Field>
                    <PrimaryButton type="submit" busy={busy}>Save</PrimaryButton>
                  </form>
                  <form className="space-y-3 rounded-xl border border-line bg-panel p-5" onSubmit={(e) => { e.preventDefault(); act(async () => { const r = await callPost<{ reference: string; hold_hours: number }>('realtor_x.api.portal.agent_request_booking', { lead: name, unit: unit || l.property_reference }); return `Booking request ${r.reference} sent. The unit is held for ${r.hold_hours} hours while RealtorX reviews it.`; }); }}>
                    <p className="font-semibold text-fg">{t("Ready to book?")}</p>
                    <p className="text-sm text-fg-2">RealtorX holds the unit while the team confirms the booking and opens the deal.</p>
                    <Field label="Unit ID" htmlFor="ld-unit" hint="The listing ID from the unit's link, e.g. PROP-2026-00008.">
                      <input id="ld-unit" placeholder={l.property_reference || 'PROP-…'} value={unit} onChange={(e) => setUnit(e.target.value.trim())} className={inputClass} />
                    </Field>
                    <PrimaryButton type="submit" busy={busy} disabled={!unit && !l.property_reference}>Request booking</PrimaryButton>
                  </form>
                  {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
                </div>
              ) : (
                <Notice>This buyer is {l.status.toLowerCase()}. RealtorX updates it from the deal.</Notice>
              )}
            </div>
          );
        }}
      </DataView>
    </>
  );
}

function AddBuyer({ onDone, onCancel }: { onDone: (lead: string) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', property_id: '', note: '', consent: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await callPost<{ lead: string | null; protected?: boolean; message?: string }>('realtor_x.api.portal.agent_add_lead', { ...form, consent: form.consent ? 1 : 0 });
      if (r.lead) onDone(r.lead);
      else setError(r.message || 'This buyer is already registered with another RealtorX Agent.');
    } catch (err: any) {
      setError(err?.message || 'Could not add the buyer.');
    } finally {
      setBusy(false);
    }
  };
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  return (
    <>
      <BackLink onClick={onCancel}>My buyers</BackLink>
      <SectionHeader title="Add a buyer" />
      <form onSubmit={submit} className="max-w-lg space-y-3 rounded-xl border border-line bg-panel p-5">
        <Field label="Name" htmlFor="ab-name"><input id="ab-name" required value={form.name} onChange={set('name')} className={inputClass} /></Field>
        <Field label="Mobile" htmlFor="ab-phone"><PhoneInput id="ab-phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} /></Field>
        <Field label="Email (optional)" htmlFor="ab-email"><input id="ab-email" type="email" value={form.email} onChange={set('email')} className={inputClass} /></Field>
        <Field label="Unit ID (optional)" htmlFor="ab-unit"><input id="ab-unit" value={form.property_id} onChange={set('property_id')} className={inputClass} /></Field>
        <Field label="Note" htmlFor="ab-note"><textarea id="ab-note" rows={3} value={form.note} onChange={set('note')} className={inputClass} /></Field>
        <label className="flex items-start gap-2 text-sm text-fg-2"><input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-1" /> The buyer agreed that RealtorX may contact them.</label>
        {error && <Notice tone="error">{error}</Notice>}
        <PrimaryButton type="submit" busy={busy}>Add buyer</PrimaryButton>
      </form>
    </>
  );
}

interface DealRow {
  name: string;
  unit_title: string | null;
  project_name: string | null;
  stage: string;
  buyer_name: string;
  agreed_price: number;
  currency: string | null;
  reserved_on: string | null;
  next_stage: string | null;
  blockers: string[];
}

export function DealsSection() {
  const [open, setOpen] = useState<string | null>(new URLSearchParams(window.location.search).get('deal'));
  const [tick, setTick] = useState(0);
  const state = useApi<DealRow[]>('realtor_x.api.portal.agent_deals', undefined, String(tick));
  return (
    <>
      <SectionHeader title="Deals" description="Your buyers' bookings, stage by stage. RealtorX moves each stage once the documents and payments are in." />
      <DataView state={state} isEmpty={(r) => r.length === 0} empty={{ icon: Briefcase, title: 'No deals yet', description: 'When RealtorX confirms a booking for your buyer, the deal appears here.' }}>
        {(rows) => (
          <ul className="space-y-3">
            {rows.map((d) => (
              <li key={d.name} className="rounded-xl border border-line bg-panel p-4">
                <button onClick={() => setOpen(open === d.name ? null : d.name)} className="flex w-full flex-wrap items-center justify-between gap-2 text-left" aria-expanded={open === d.name}>
                  <span className="font-semibold text-fg">{d.unit_title} <span className="text-xs font-normal text-fg-2">· {d.project_name} · {d.name}</span></span>
                  <span className="flex items-center gap-2"><span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-semibold text-sky-200">{d.stage}</span>{open === d.name ? <ChevronUp className="h-4 w-4 text-fg-2" /> : <ChevronDown className="h-4 w-4 text-fg-2" />}</span>
                </button>
                <p className="mt-1 text-sm text-fg-2">{d.buyer_name} · {formatMoney(d.agreed_price, d.currency)} · reserved {formatDate(d.reserved_on)}</p>
                {d.next_stage && d.blockers.length > 0 && <p className="mt-2 text-xs text-amber-200">Before “{d.next_stage}”: {d.blockers.join(' ')}</p>}
                {open === d.name && (
                  <div className="mt-4 space-y-4 border-t border-line pt-4">
                    <DocumentLinks method="realtor_x.api.portal.agent_document" deal={d.name} stage={d.stage} kinds={['statement', 'booking_form', 'allotment_letter']} />
                    <StatementView method="realtor_x.api.portal.agent_deal_statement" documentMethod="realtor_x.api.portal.agent_document" deal={d.name} key={`${d.name}-${tick}`} />
                    {!['Transferred', 'Cancelled'].includes(d.stage) && <PaymentProof deal={d.name} onDone={() => setTick((t) => t + 1)} />}
                    <BuyerLink deal={d.name} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </DataView>
    </>
  );
}

function BuyerLink({ deal }: { deal: string }) {
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const make = async () => {
    setBusy(true);
    setError(null);
    try {
      setLink((await callPost<{ url: string }>('realtor_x.api.portal.agent_statement_link', { deal })).url);
    } catch (err: any) {
      setError(err?.message || 'Could not make the link.');
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link || '');
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="space-y-2 rounded-lg bg-white/[0.03] p-4 text-sm">
      <p className="font-semibold text-fg">{t('Statement link for the buyer')}</p>
      <p className="text-xs text-fg-2">{t('The buyer sees their schedule and payments without a login. A new link stops the old one.')}</p>
      {link ? (
        <div className="flex flex-wrap items-center gap-2">
          <input readOnly value={link} aria-label={t('Statement link')} className={`${inputClass} flex-1`} onFocus={(e) => e.target.select()} />
          <button type="button" onClick={copy} className="rounded-lg border border-line-2 px-3 py-2 text-xs text-fg hover:bg-white/5">{copied ? t('Copied') : t('Copy')}</button>
          <a href={`https://wa.me/?text=${encodeURIComponent(link)}`} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-fg">WhatsApp</a>
        </div>
      ) : (
        <PrimaryButton type="button" busy={busy} onClick={make}>{t('Make link')}</PrimaryButton>
      )}
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  );
}

function PaymentProof({ deal, onDone }: { deal: string; onDone: () => void }) {
  const file = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ amount: '', paid_on: localDate(), method: 'Bank transfer', reference_no: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const f = file.current?.files?.[0];
    if (!f) return setMsg({ tone: 'error', text: 'Attach the bank slip, transfer screenshot or cheque copy.' });
    setBusy(true);
    setMsg(null);
    try {
      await uploadFile('realtor_x.api.portal.agent_upload_payment', f, { deal, ...form });
      setMsg({ tone: 'success', text: 'Sent. RealtorX Accounts will verify it; it counts once verified.' });
      setForm({ ...form, amount: '', reference_no: '' });
      if (file.current) file.current.value = '';
      onDone();
    } catch (err: any) {
      setMsg({ tone: 'error', text: err?.message || 'Could not send the payment proof.' });
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="grid gap-3 rounded-lg bg-white/[0.03] p-4 sm:grid-cols-2">
      <p className="font-semibold text-fg sm:col-span-2">{t("Send the buyer's payment proof")}</p>
      <Field label="Amount" htmlFor={`pp-amt-${deal}`}><input id={`pp-amt-${deal}`} type="number" min={1} required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} /></Field>
      <Field label="Paid on" htmlFor={`pp-date-${deal}`}><input id={`pp-date-${deal}`} type="date" required value={form.paid_on} onChange={(e) => setForm({ ...form, paid_on: e.target.value })} className={inputClass} /></Field>
      <Field label="Method" htmlFor={`pp-m-${deal}`}>
        <select id={`pp-m-${deal}`} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className={inputClass}>
          {['Bank transfer', 'Cheque', 'Pay order / demand draft', 'Cash deposit', 'Online payment'].map((m) => <option key={m} value={m}>{t(m)}</option>)}
        </select>
      </Field>
      <Field label="Bank / cheque reference" htmlFor={`pp-ref-${deal}`}><input id={`pp-ref-${deal}`} value={form.reference_no} onChange={(e) => setForm({ ...form, reference_no: e.target.value })} className={inputClass} /></Field>
      <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
        <input ref={file} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" aria-label="Payment proof" className="text-xs text-fg-2" />
        <PrimaryButton type="submit" busy={busy}><Upload className="h-4 w-4" /> Send proof</PrimaryButton>
      </div>
      {msg && <div className="sm:col-span-2"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
    </form>
  );
}
