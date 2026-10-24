// Developer dashboard sections: contract, projects & inventory (units, payment plans, inventory updates).
import React, { useRef, useState } from 'react';
import { Building2, Download, FileSignature, Upload } from 'lucide-react';
import { callGet, callPost, uploadFile } from '../../services/api/client';
import { DocumentLinks, RefundsTable, StatementView, type RefundRow } from '../money';
import { BackLink, DataTable, DataView, Notice, PrimaryButton, SectionHeader, formatDate, formatMoney, useApi } from '../kit/kit';
import { t } from '../i18n';
import { InventoryMap } from './insights';

interface Contract {
  name: string;
  developer_name: string;
  status: string;
  country: string;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  commission_rate: number;
  commission_payer: string;
  commission_earned_on: string;
  payment_route: string;
  bank_name: string | null;
  account_title: string | null;
  iban: string | null;
  signed_on: string | null;
  special_terms: string | null;
  projects: { project: string; project_name: string; commission_rate: number }[];
}

export function ContractSection() {
  const state = useApi<Contract[]>('realtor_x.api.portal.developer_contracts');
  return (
    <>
      <SectionHeader title="Contract" description="The terms under which RealtorX sells your projects. Contact RealtorX to change them." />
      <DataView state={state} isEmpty={(r) => r.length === 0} empty={{ icon: FileSignature, title: 'No contract yet', description: 'Your signed contract with RealtorX appears here once it is active.' }}>
        {(rows) => (
          <div className="space-y-4">
            {rows.map((c) => (
              <div key={c.name} className="rounded-xl border border-line bg-panel p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-fg">{c.name} · {c.developer_name}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.status === 'Active' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-fg-2'}`}>{c.status}</span>
                </div>
                <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  {new Set(c.projects.map((p) => p.commission_rate)).size <= 1 && (
                    <Item label="Commission" value={`${c.projects[0]?.commission_rate ?? c.commission_rate}% of the property value`} />
                  )}
                  <Item label="Paid by" value={c.commission_payer} />
                  <Item label="Earned when" value={c.commission_earned_on} />
                  <Item label="Buyer payments" value={c.payment_route} />
                  <Item label="Valid" value={`${formatDate(c.start_date)} – ${c.end_date ? formatDate(c.end_date) : 'open-ended'}`} />
                  <Item label="Country / currency" value={`${c.country} · ${c.currency}`} />
                  {(c.bank_name || c.iban) && <Item label="Your account for buyer payments" value={[c.bank_name, c.account_title, c.iban].filter(Boolean).join(' · ')} />}
                  <Item label="Signed" value={formatDate(c.signed_on)} />
                </dl>
                <p className="mt-4 text-xs text-fg-2">Projects: {c.projects.map((p) => (new Set(c.projects.map((x) => x.commission_rate)).size > 1 ? `${p.project_name} (${p.commission_rate}% commission)` : p.project_name)).join(', ') || '—'}</p>
              </div>
            ))}
          </div>
        )}
      </DataView>
    </>
  );
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-fg-2">{label}</dt>
      <dd className="mt-0.5 text-fg">{value}</dd>
    </div>
  );
}

interface Unit {
  name: string;
  unit_code: string | null;
  property_title: string;
  custom_property_category: string | null;
  size: number | null;
  size_unit: string | null;
  list_price: number | null;
  bedrooms: number | null;
  status: string;
  listing_status: string | null;
  floor: string | null;
  live: boolean;
}
interface Plan { id: string; name: string; summary: string }
interface ProjectUnits { project: { name: string; project_name: string }; units: Unit[]; plans: Plan[] }
interface ImportRow { name: string; project: string; status: string; rows_total: number; rows_new: number; rows_updated: number; rows_error: number; rejection_reason: string | null; creation: string }

export function ProjectDetail({ project, currency, onBack }: { project: string; currency?: string | null; onBack: () => void }) {
  const [tick, setTick] = useState(0);
  const state = useApi<ProjectUnits>('realtor_x.api.portal.developer_units', { project }, `${project}-${tick}`);
  const imports = useApi<ImportRow[]>('realtor_x.api.portal.developer_imports', undefined, String(tick));
  const [filter, setFilter] = useState('');
  const [view, setView] = useState<'map' | 'list'>('map');
  return (
    <>
      <BackLink onClick={onBack}>All projects</BackLink>
      <DataView state={state}>
        {(d) => {
          const units = d.units.filter((u) => !filter || u.status === filter);
          return (
            <>
              <SectionHeader title={d.project.project_name} description={`${d.units.length} units · status is kept up to date by RealtorX`} />
              {d.plans.length > 0 && (
                <div className="mb-5 rounded-xl border border-line bg-panel p-4 text-sm">
                  <p className="font-semibold text-fg">{t("Payment plans")}</p>
                  <ul className="mt-2 space-y-1 text-fg-2">{d.plans.map((p) => <li key={p.id}><b className="text-fg">{p.name}:</b> {p.summary}</li>)}</ul>
                </div>
              )}
              <div className="mb-4 inline-flex rounded-full border border-line p-1 text-xs">
                {(['map', 'list'] as const).map((v) => (
                  <button key={v} onClick={() => setView(v)} className={`rounded-full px-4 py-1.5 ${view === v ? 'bg-fg text-ink' : 'text-fg-2'}`}>{t(v === 'map' ? 'Map' : 'List')}</button>
                ))}
              </div>
              {view === 'map' ? <InventoryMap project={project} /> : (<>
              <div className="mb-3 flex flex-wrap gap-2 text-xs">
                {['', 'Available', 'Reserved', 'Booked', 'Sold', 'Blocked'].map((s) => (
                  <button key={s || 'all'} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1 ${filter === s ? 'bg-fg text-ink' : 'bg-white/5 text-fg-2'}`}>{s || 'All'}</button>
                ))}
              </div>
              <DataTable
                rows={units}
                rowKey={(u) => u.name}
                columns={[
                  { header: 'Unit', cell: (u) => <span className="font-semibold text-fg">{u.unit_code || u.name}</span> },
                  { header: 'Type', cell: (u) => u.custom_property_category || '—' },
                  { header: 'Floor', cell: (u) => u.floor || '—' },
                  { header: 'Size', cell: (u) => (u.size ? `${u.size} ${u.size_unit || ''}` : '—') },
                  { header: 'Price', cell: (u) => (u.list_price ? formatMoney(u.list_price, currency) : '—'), align: 'right' },
                  { header: 'Status', cell: (u) => u.status },
                  { header: 'Website', cell: (u) => (u.live ? 'Live' : '—') },
                ]}
              />
              </>)}
              <InventoryUpload project={project} onDone={() => setTick((t) => t + 1)} />
            </>
          );
        }}
      </DataView>
      <div className="mt-6">
        <SectionHeader title="Your inventory updates" />
        <DataView state={imports} isEmpty={(r) => r.filter((x) => x.project === project).length === 0} empty={{ icon: Upload, title: 'No updates sent yet' }}>
          {(rows) => (
            <DataTable
              rows={rows.filter((x) => x.project === project)}
              rowKey={(r) => r.name}
              columns={[
                { header: 'Sent', cell: (r) => formatDate(r.creation) },
                { header: 'Status', cell: (r) => <>{r.status}{r.rejection_reason ? <span className="block text-xs text-rose-300">{r.rejection_reason}</span> : null}</> },
                { header: 'Rows', cell: (r) => r.rows_total },
                { header: 'New', cell: (r) => r.rows_new },
                { header: 'Updated', cell: (r) => r.rows_updated },
                { header: 'Errors', cell: (r) => r.rows_error },
              ]}
            />
          )}
        </DataView>
      </div>
    </>
  );
}

function InventoryUpload({ project, onDone }: { project: string; onDone: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const template = async () => {
    const text = await callGet<string>('realtor_x.api.portal.inventory_template');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
    a.download = 'realtorx-units-template.csv';
    a.click();
  };
  const send = async (file: File) => {
    setBusy(true);
    setResult(null);
    try {
      const r = await uploadFile<{ new: number; update: number; error: number }>('realtor_x.api.portal.developer_upload_inventory', file, { project });
      setResult({
        tone: r.error ? 'error' : 'success',
        text: r.error
          ? `Sent, but ${r.error} row(s) have errors — RealtorX will ask you for a corrected file.`
          : `Sent for review: ${r.new} new and ${r.update} updated unit(s). RealtorX applies it after checking.`,
      });
      onDone();
    } catch (e: any) {
      setResult({ tone: 'error', text: e?.message || 'Could not send the file.' });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };
  return (
    <div className="mt-6 rounded-xl border border-line bg-panel p-4">
      <p className="font-semibold text-fg">{t("Send an inventory update")}</p>
      <p className="mt-1 text-sm text-fg-2">Add units or change sizes, prices or availability with a CSV or Excel file. RealtorX reviews it before anything changes on the website. Reserved and booked units are managed by RealtorX.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={template} className="inline-flex items-center gap-2 rounded-lg border border-line-2 px-4 py-2.5 text-sm text-fg hover:bg-white/5"><Download className="h-4 w-4" /> Template</button>
        <PrimaryButton busy={busy} onClick={() => input.current?.click()}><Upload className="h-4 w-4" /> Upload file</PrimaryButton>
        <input ref={input} type="file" accept=".csv,.xlsx" className="hidden" onChange={(e) => e.target.files?.[0] && send(e.target.files[0])} aria-label="Inventory file" />
      </div>
      {result && <div className="mt-3"><Notice tone={result.tone}>{result.text}</Notice></div>}
    </div>
  );
}

interface SaleRow { name: string; unit: string; unit_title: string | null; project_name?: string; stage: string; buyer_name: string; agreed_price: number; currency: string | null; reserved_on: string | null; booked_on: string | null; agent_id: string | null }

export function SalesSection() {
  const state = useApi<SaleRow[]>('realtor_x.api.portal.developer_deals');
  const [open, setOpen] = useState<string | null>(new URLSearchParams(window.location.search).get('deal'));
  if (open) {
    return (
      <>
        <BackLink onClick={() => setOpen(null)}>All sales</BackLink>
        <SectionHeader title={`Deal ${open}`} description="Payment schedule and payments received for this unit." />
        <div className="mb-4">
          <DocumentLinks method="realtor_x.api.portal.developer_document" deal={open} stage={state.data?.find((r) => r.name === open)?.stage || ''} kinds={['statement', 'allotment_letter']} />
        </div>
        <StatementView method="realtor_x.api.portal.developer_deal_statement" documentMethod="realtor_x.api.portal.developer_document" deal={open} />
      </>
    );
  }
  return (
    <>
      <SectionHeader title="Sales" description="Bookings of your units by RealtorX, stage by stage up to transfer. Open a deal for its payment schedule." />
      <DataView state={state} isEmpty={(r) => r.length === 0} empty={{ icon: Building2, title: 'No sales yet', description: 'Deals for your units appear here as RealtorX books them.' }}>
        {(rows) => (
          <DataTable
            rows={rows}
            rowKey={(r) => r.name}
            onRowClick={(r) => setOpen(r.name)}
            columns={[
              { header: 'Deal', cell: (r) => <span className="font-semibold text-fg">{r.name}</span> },
              { header: 'Unit', cell: (r) => r.unit_title || r.unit },
              { header: 'Buyer', cell: (r) => r.buyer_name },
              { header: 'Price', cell: (r) => formatMoney(r.agreed_price, r.currency), align: 'right' },
              { header: 'Stage', cell: (r) => r.stage },
              { header: 'Reserved', cell: (r) => formatDate(r.reserved_on) },
              { header: 'Agent', cell: (r) => r.agent_id || 'RealtorX' },
            ]}
          />
        )}
      </DataView>
    </>
  );
}

interface PaymentRow { name: string; deal: string; buyer_name: string; unit: string; amount: number; currency: string | null; paid_on: string; method: string; reference_no: string | null; status: string; paid_to: string; developer_confirmed: number }
interface CommissionRow { name: string; deal: string; unit: string; status: string; currency: string | null; base_value: number; rate: number; total_commission: number; invoiced_on: string | null; received_on: string | null; sales_invoice: string | null }

export function PaymentsSection() {
  const [tick, setTick] = useState(0);
  const payments = useApi<PaymentRow[]>('realtor_x.api.portal.developer_payments', undefined, String(tick));
  const invoices = useApi<CommissionRow[]>('realtor_x.api.portal.developer_commissions');
  const refunds = useApi<RefundRow[]>('realtor_x.api.portal.developer_refunds');
  const [busy, setBusy] = useState<string | null>(null);
  const confirm = async (name: string) => {
    setBusy(name);
    try {
      await callPost('realtor_x.api.portal.developer_confirm_payment', { name });
      setTick((t) => t + 1);
    } finally {
      setBusy(null);
    }
  };
  return (
    <>
      <SectionHeader title="Buyer payments" description="Payments buyers made for your units. Confirm the ones that reached your account; RealtorX Accounts then verifies them." />
      <DataView state={payments} isEmpty={(r) => r.length === 0} empty={{ icon: Building2, title: 'No buyer payments yet' }}>
        {(rows) => (
          <DataTable
            rows={rows}
            rowKey={(r) => r.name}
            columns={[
              { header: 'Paid on', cell: (r) => formatDate(r.paid_on) },
              { header: 'Buyer / deal', cell: (r) => <><span className="text-fg">{r.buyer_name}</span><span className="block text-xs text-fg-3">{r.deal}</span></> },
              { header: 'Amount', cell: (r) => formatMoney(r.amount, r.currency), align: 'right' },
              { header: 'Method', cell: (r) => `${r.method}${r.reference_no ? ` · ${r.reference_no}` : ''}` },
              { header: 'Status', cell: (r) => r.status },
              {
                header: 'Your account',
                cell: (r) =>
                  r.paid_to !== 'Developer account' ? 'Paid to RealtorX'
                    : r.developer_confirmed ? 'Confirmed'
                    : r.status === 'Submitted' ? <button disabled={busy === r.name} onClick={() => confirm(r.name)} className="rounded-full bg-fg text-ink px-3 py-1 text-xs font-bold disabled:opacity-50">{t("Confirm received")}</button>
                    : '—',
              },
            ]}
          />
        )}
      </DataView>
      {!!refunds.data?.length && (
        <div className="mt-8">
          <SectionHeader title="Refunds to buyers" description="Refunds for cancelled deals. Refunds from your account are paid by you and recorded by RealtorX Accounts." />
          <RefundsTable rows={refunds.data} />
        </div>
      )}
      <div className="mt-8">
        <SectionHeader title="RealtorX commission invoices" description="Commission RealtorX has invoiced to you under your contract." />
        <DataView state={invoices} isEmpty={(r) => r.length === 0} empty={{ icon: Building2, title: 'No commission invoices' }}>
          {(rows) => (
            <DataTable
              rows={rows}
              rowKey={(r) => r.name}
              columns={[
                { header: 'Deal', cell: (r) => r.deal },
                { header: 'Property value', cell: (r) => formatMoney(r.base_value, r.currency), align: 'right' },
                { header: 'Rate', cell: (r) => `${r.rate}%` },
                { header: 'Commission', cell: (r) => formatMoney(r.total_commission, r.currency), align: 'right' },
                { header: 'Status', cell: (r) => (r.status === 'Received' ? `Paid ${formatDate(r.received_on)}` : `Due since ${formatDate(r.invoiced_on)}`) },
              ]}
            />
          )}
        </DataView>
      </div>
    </>
  );
}
