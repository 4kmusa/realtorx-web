// Buyer statement (/statement/<deal>?k=<key>): the buyer's own payment schedule, payments and refunds through the
// secret link from RealtorX or their agent. No login; not indexed (utils/seo.ts, robots.txt, X-Robots-Tag); no contact details.
import React, { useEffect, useState } from 'react';
import { FileDown, FileText, Loader2 } from 'lucide-react';
import { callGet, methodUrl } from '../../services/api/client';
import { Container, Eyebrow } from '../../components/site/ui';

interface BuyerStatement {
  deal: string;
  buyer: string;
  unit: string;
  project: string | null;
  stage: string;
  agent: { name: string; agent_id: string } | null;
  currency: string | null;
  agreed_price: number;
  total_paid: number;
  balance: number;
  next_due_date: string | null;
  next_due_amount: number;
  schedule: { label: string; due_date: string | null; amount: number; paid_amount: number; status: string; on_possession: number }[];
  payments: { amount: number; paid_on: string; method: string; status: string }[];
  refunds: { status: string; refund_amount: number; paid_on: string | null }[];
  link_valid_until: string;
}

const STAGES = ['Reserved', 'Booked', 'Down Payment', 'Allotment', 'Installments', 'Possession', 'Transferred'];
const TONE: Record<string, string> = { Paid: 'text-good', Overdue: 'text-bad', 'Partly Paid': 'text-amber', Due: 'text-fg-2' };

function money(value: number, currency: string | null) {
  const n = Number(value) || 0;
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency: currency || 'PKR', maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${currency || ''} ${n.toLocaleString()}`;
  }
}

function date(value: string | null) {
  if (!value) return '—';
  const d = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function BuyerStatementPage({ dealId }: { dealId: string }) {
  const [data, setData] = useState<BuyerStatement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get('k') || '';
    callGet<BuyerStatement>('realtor_x.api.v1.buyer_statement', { deal: dealId, key })
      .then(setData)
      .catch((e) => setError(e?.message || 'This link is not valid or has expired.'));
  }, [dealId]);

  if (error)
    return (
      <Container narrow className="py-28 text-center">
        <FileText className="mx-auto h-8 w-8 text-fg-3" strokeWidth={1.25} />
        <h1 className="mt-6 text-3xl font-medium tracking-[-0.03em] text-fg">Payment statement</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-fg-2">{error}</p>
      </Container>
    );
  if (!data)
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-fg-3" aria-label="Loading" />
      </div>
    );

  const stageIndex = STAGES.indexOf(data.stage);
  return (
    <Container narrow className="pb-24 pt-14 md:pt-20">
      <Eyebrow className="mb-5">Payment statement</Eyebrow>
      <h1 className="text-balance text-[36px] font-medium leading-[1.05] tracking-[-0.03em] text-fg md:text-5xl">{data.unit}</h1>
      <p className="mt-3 text-[14px] text-fg-3">
        {[data.project, `Deal ${data.deal}`, data.agent ? `Agent ${data.agent.name} (${data.agent.agent_id})` : null].filter(Boolean).join(' · ')}
      </p>
      <p className="mt-6 text-[15px] leading-relaxed text-fg-2">Dear {data.buyer}, this page shows your payment schedule and the payments RealtorX has received and checked.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(['statement', ...(['Allotment', 'Installments', 'Possession', 'Transferred'].includes(data.stage) ? ['allotment_letter'] : [])] as string[]).map((kind) => (
          <a key={kind} target="_blank" rel="noreferrer"
            href={methodUrl('realtor_x.api.v1.buyer_document', { deal: data.deal, key: new URLSearchParams(window.location.search).get('k'), kind })}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-line-2 px-4 text-[13px] text-fg hover:bg-white/[0.04]">
            <FileDown className="h-3.5 w-3.5" strokeWidth={1.5} /> {kind === 'statement' ? 'Download statement (PDF)' : 'Allotment letter (PDF)'}
          </a>
        ))}
      </div>

      {data.stage === 'Cancelled' ? (
        <p className="mt-8 rounded-xl border border-bad/25 px-4 py-3 text-sm text-[#fecaca]">This booking was cancelled.</p>
      ) : (
        <ol className="mt-8 flex flex-wrap gap-1.5 text-xs" aria-label="Stage">
          {STAGES.map((s, i) => (
            <li key={s} className={`rounded-full px-3 py-1.5 ${i < stageIndex ? 'bg-white/[0.06] text-fg-2' : i === stageIndex ? 'bg-fg text-ink' : 'border border-line text-fg-3'}`}>{s}</li>
          ))}
        </ol>
      )}

      <div className="mt-10 grid grid-cols-2 border-t border-line sm:grid-cols-4">
        {[
          ['Price', money(data.agreed_price, data.currency)],
          ['Paid (checked)', money(data.total_paid, data.currency)],
          ['Balance', money(data.balance, data.currency)],
          ['Next payment', data.next_due_date ? `${money(data.next_due_amount, data.currency)} · ${date(data.next_due_date)}` : '—'],
        ].map(([k, v]) => (
          <div key={k} className="border-b border-line py-5 pr-3">
            <p className="text-[13px] text-fg-3">{k}</p>
            <p className="mt-1 text-[17px] text-fg">{v}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">Schedule</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-[14px]">
          <thead className="border-b border-line text-left text-[12px] text-fg-3">
            <tr><th className="py-3 pr-4 font-normal">Payment</th><th className="py-3 pr-4 font-normal">Due</th><th className="py-3 pr-4 font-normal text-right">Amount</th><th className="py-3 pr-4 font-normal text-right">Paid</th><th className="py-3 pr-4 font-normal">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.schedule.map((r, i) => (
              <tr key={i}>
                <td className="py-4 pr-4 text-fg">{r.label}</td>
                <td className="py-4 pr-4 text-fg-2">{r.on_possession ? 'On possession' : date(r.due_date)}</td>
                <td className="py-4 pr-4 text-right tabular-nums text-fg">{money(r.amount, data.currency)}</td>
                <td className="py-4 pr-4 text-right tabular-nums text-fg">{money(r.paid_amount, data.currency)}</td>
                <td className={`px-4 py-3 ${TONE[r.status] || ''}`}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.payments.length > 0 && (
        <>
          <h2 className="mt-14 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">Payments received</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {data.payments.map((p, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-4 text-sm">
                <span className="text-fg-2">{date(p.paid_on)} · {p.method}</span>
                <span className="tabular-nums text-fg">{money(p.amount, data.currency)}</span>
                <span className={p.status === 'Verified' ? 'text-good' : 'text-amber'}>{p.status === 'Verified' ? 'Checked' : 'Being checked'}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {data.refunds.length > 0 && (
        <>
          <h2 className="mt-14 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">Refund</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {data.refunds.map((r, i) => (
              <li key={i} className="flex items-center justify-between py-4 text-sm">
                <span className="text-fg-2">{r.status}{r.paid_on ? ` · ${date(r.paid_on)}` : ''}</span>
                <span className="tabular-nums text-fg">{money(r.refund_amount, data.currency)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="mt-12 text-xs leading-relaxed text-fg-3">
        Keep this link private. It is valid until {date(data.link_valid_until)}. Questions about your payments? Contact your agent or RealtorX Client Services.
      </p>
    </Container>
  );
}
