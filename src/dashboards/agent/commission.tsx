// Agent dashboard: commission per deal (pending → earned → paid) and the payout bank account.
import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import { callPost } from '../../services/api/client';
import { DataTable, DataView, Field, MoneyAmount, Notice, PrimaryButton, SectionHeader, StatCard, formatDate, formatMoney, formatMoneyList, inputClass, useApi } from '../kit/kit';
import { AgentProfile } from './sections';
import { t } from '../i18n';

interface Row {
  name: string;
  deal: string;
  unit_title: string | null;
  status: string;
  currency: string | null;
  base_value: number;
  rate: number;
  agent_share: number;
  agent_amount: number;
  withholding_amount: number;
  net_payout: number;
  earned_date: string | null;
  paid_out_on: string | null;
}
interface Data { rows: Row[]; totals: { pending: MoneyAmount[]; earned: MoneyAmount[]; paid: MoneyAmount[] } } // one amount per currency

const STATUS_TEXT: Record<string, string> = {
  Pending: 'Waiting for the buyer’s payment',
  Earned: 'Earned — RealtorX is invoicing',
  Invoiced: 'Invoiced to the payer',
  Received: 'Received by RealtorX — payout next',
  'Paid Out': 'Paid to you',
  Reversed: 'Reversed',
};

export function CommissionSection({ profile, onProfile }: { profile: AgentProfile | null; onProfile: () => void }) {
  const state = useApi<Data>('realtor_x.api.portal.agent_commissions');
  return (
    <>
      <SectionHeader title="Commission" description="Set for each project in RealtorX’s contract with the developer; you receive your share after RealtorX receives the commission." />
      <DataView state={state} isEmpty={(d) => d.rows.length === 0} empty={{ icon: Wallet, title: 'No commission yet', description: 'Each deal of your buyers creates a commission here.' }}>
        {(d) => (
          <>
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <StatCard label="Pending (net)" value={formatMoneyList(d.totals.pending)} />
              <StatCard label="Earned, to be paid (net)" value={formatMoneyList(d.totals.earned)} tone="good" />
              <StatCard label="Paid to you (net)" value={formatMoneyList(d.totals.paid)} />
            </div>
            <DataTable
              rows={d.rows}
              rowKey={(r) => r.name}
              columns={[
                { header: 'Deal', cell: (r) => <><span className="font-semibold text-fg">{r.unit_title || r.deal}</span><span className="block text-xs text-fg-3">{r.deal}</span></> },
                { header: 'Value', cell: (r) => formatMoney(r.base_value, r.currency), align: 'right' },
                { header: 'Your share', cell: (r) => (r.rate ? `${r.agent_share}% of ${r.rate}%` : t('Not agreed yet')) }, // 0% = no commission agreed for the project
                { header: 'Net to you', cell: (r) => formatMoney(r.net_payout, r.currency), align: 'right' },
                { header: 'Status', cell: (r) => STATUS_TEXT[r.status] || r.status },
                { header: 'Paid on', cell: (r) => formatDate(r.paid_out_on) },
              ]}
            />
          </>
        )}
      </DataView>
      <PayoutAccount profile={profile} onSaved={onProfile} />
    </>
  );
}

function PayoutAccount({ profile, onSaved }: { profile: AgentProfile | null; onSaved: () => void }) {
  const [form, setForm] = useState({ bank_name: '', account_title: '', iban: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const acct = profile?.payout_account;
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await callPost('realtor_x.api.portal.agent_update_payout_account', form);
      setMsg({ tone: 'success', text: 'Saved. RealtorX will check the account before your next payout.' });
      setForm({ bank_name: '', account_title: '', iban: '' });
      onSaved();
    } catch (err: any) {
      setMsg({ tone: 'error', text: err?.message || 'Could not save.' });
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={save} className="mt-6 max-w-lg space-y-3 rounded-xl border border-line bg-panel p-5">
      <p className="font-semibold text-fg">{t("Payout account")}</p>
      <p className="text-sm text-fg-2">
        {acct?.iban_masked ? `${acct.bank_name} · ${acct.account_title} · ${acct.iban_masked} · ${acct.checked ? 'checked by RealtorX' : 'waiting for RealtorX to check'}` : 'Add the bank account your commission should be paid to (in your own name).'}
      </p>
      <Field label="Bank" htmlFor="po-bank"><input id="po-bank" required value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} className={inputClass} /></Field>
      <Field label="Account title" htmlFor="po-title"><input id="po-title" required value={form.account_title} onChange={(e) => setForm({ ...form, account_title: e.target.value })} className={inputClass} /></Field>
      <Field label="IBAN / account number" htmlFor="po-iban"><input id="po-iban" required value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} className={inputClass} /></Field>
      <PrimaryButton type="submit" busy={busy}>{acct?.iban_masked ? 'Change account' : 'Save account'}</PrimaryButton>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
    </form>
  );
}
