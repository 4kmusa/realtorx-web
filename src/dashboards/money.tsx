// Money views shared by the Agent and Developer dashboards: a deal's payment statement.
import React from 'react';
import { FileDown } from 'lucide-react';
import { methodUrl } from '../services/api/client';
import { DataTable, DataView, formatDate, formatMoney, useApi } from './kit/kit';
import { t } from './i18n';

export interface Statement {
  deal: string;
  currency: string | null;
  agreed_price: number;
  total_paid: number;
  balance: number;
  next_due_date: string | null;
  next_due_amount: number;
  schedule: { label: string; due_date: string | null; amount: number; paid_amount: number; status: string; on_possession: number }[];
  payments: { name: string; amount: number; paid_on: string; method: string; reference_no: string | null; status: string; developer_confirmed: number; paid_to: string }[];
  refunds?: RefundRow[];
}

export interface RefundRow {
  name: string;
  deal: string;
  buyer_name: string;
  status: string;
  currency: string | null;
  amount_paid: number;
  deduction: number;
  refund_amount: number;
  paid_from: string;
  paid_on: string | null;
  payment_reference: string | null;
}

export function RefundsTable({ rows }: { rows: RefundRow[] }) {
  return (
    <DataTable
      rows={rows}
      rowKey={(r) => r.name}
      columns={[
        { header: 'Refund', cell: (r) => <><span className="text-fg">{r.name}</span><span className="block text-xs text-fg-3">{r.buyer_name} · {r.deal}</span></> },
        { header: 'Paid by the buyer', cell: (r) => formatMoney(r.amount_paid, r.currency), align: 'right' },
        { header: 'Deduction', cell: (r) => formatMoney(r.deduction, r.currency), align: 'right' },
        { header: 'Refund', cell: (r) => formatMoney(r.refund_amount, r.currency), align: 'right' },
        { header: 'Status', cell: (r) => (r.status === 'Paid' ? `${t('Paid')} ${formatDate(r.paid_on)}${r.payment_reference ? ` · ${r.payment_reference}` : ''}` : t(r.status)) },
      ]}
    />
  );
}

const TONE: Record<string, string> = { Paid: 'text-emerald-300', Overdue: 'text-rose-300', 'Partly Paid': 'text-amber-200', Due: 'text-fg-2' };

const ALLOTTED = ['Allotment', 'Installments', 'Possession', 'Transferred'];

/** PDF links of a deal: statement, booking form (agents) and allotment letter (from Allotment on). */
export function DocumentLinks({ method, deal, stage, kinds }: { method: string; deal: string; stage: string; kinds: ('statement' | 'booking_form' | 'allotment_letter')[] }) {
  const labels = { statement: 'Statement (PDF)', booking_form: 'Booking form (PDF)', allotment_letter: 'Allotment letter (PDF)' };
  return (
    <div className="flex flex-wrap gap-2">
      {kinds.filter((k) => k !== 'allotment_letter' || ALLOTTED.includes(stage)).map((k) => (
        <a key={k} href={methodUrl(method, { deal, kind: k })} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line-2 px-3 py-1.5 text-xs text-fg hover:bg-white/5">
          <FileDown className="h-3.5 w-3.5 text-fg" /> {t(labels[k])}
        </a>
      ))}
    </div>
  );
}

export function StatementView({ method, deal, documentMethod }: { method: string; deal: string; documentMethod?: string }) {
  const state = useApi<Statement>(method, { deal }, deal);
  return (
    <DataView state={state}>
      {(s) => (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-4">
            {[['Agreed price', formatMoney(s.agreed_price, s.currency)], ['Paid (verified)', formatMoney(s.total_paid, s.currency)], ['Balance', formatMoney(s.balance, s.currency)],
              ['Next due', s.next_due_date ? `${formatMoney(s.next_due_amount, s.currency)} · ${formatDate(s.next_due_date)}` : '—']].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-white/[0.03] p-3"><p className="text-xs text-fg-2">{k}</p><p className="mt-0.5 font-semibold text-fg">{v}</p></div>
            ))}
          </div>
          <DataTable
            rows={s.schedule}
            rowKey={(r) => `${r.label}-${r.due_date}`}
            columns={[
              { header: 'Payment', cell: (r) => r.label },
              { header: 'Due', cell: (r) => (r.on_possession ? 'On possession' : formatDate(r.due_date)) },
              { header: 'Amount', cell: (r) => formatMoney(r.amount, s.currency), align: 'right' },
              { header: 'Paid', cell: (r) => formatMoney(r.paid_amount, s.currency), align: 'right' },
              { header: 'Status', cell: (r) => <span className={TONE[r.status] || ''}>{r.status}</span> },
            ]}
          />
          {s.payments.length > 0 && (
            <DataTable
              rows={s.payments}
              rowKey={(r) => r.name}
              columns={[
                { header: 'Received', cell: (r) => formatDate(r.paid_on) },
                { header: 'Amount', cell: (r) => formatMoney(r.amount, s.currency), align: 'right' },
                { header: 'Method', cell: (r) => `${t(r.method)}${r.reference_no ? ` · ${r.reference_no}` : ''}` },
                {
                  header: 'Status',
                  cell: (r) =>
                    r.status === 'Verified' && documentMethod ? (
                      <a href={methodUrl(documentMethod, { deal, kind: 'receipt', payment: r.name })} target="_blank" rel="noreferrer" className="text-fg hover:underline">
                        {t('Verified')} · {t('Receipt')}
                      </a>
                    ) : (
                      t(r.status)
                    ),
                },
              ]}
            />
          )}
          {!!s.refunds?.length && <RefundsTable rows={s.refunds} />}
        </div>
      )}
    </DataView>
  );
}
