// Agent dashboard: client cases. An agent asks RealtorX Client Services to solve a problem for their client
// (resale, paperwork, delays…) and follows the updates here.
import React, { useState } from 'react';
import { LifeBuoy, Plus } from 'lucide-react';
import { callPost } from '../../services/api/client';
import { BackLink, DataTable, DataView, Field, Notice, PrimaryButton, SectionHeader, formatDate, inputClass, useApi } from '../kit/kit';
import { t } from '../i18n';
import PhoneInput from '../../components/site/PhoneInput';

interface CaseRow {
  name: string;
  subject: string;
  case_type: string;
  status: string;
  creation: string;
  modified: string;
}
interface CaseDetail {
  name: string;
  subject: string;
  case_type: string;
  status: string;
  description: string;
  resolution: string | null;
  rejection_reason: string | null;
  created: string;
  updates: { text: string; from_you: boolean; posted_on: string }[];
}
interface DealOption {
  name: string;
  unit_title: string | null;
  buyer_name: string;
  stage: string;
}

const CLOSED = ['Resolved', 'Closed', 'Rejected'];

export function CasesSection() {
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [tick, setTick] = useState(0);
  const state = useApi<{ cases: CaseRow[]; case_types: string[] }>('realtor_x.api.portal.agent_cases', undefined, String(tick));
  if (open) return <CasePanel name={open} onBack={() => { setOpen(null); setTick((t) => t + 1); }} />;
  if (adding) return <NewCase types={state.data?.case_types || []} onDone={(name) => { setAdding(false); setOpen(name); }} onCancel={() => setAdding(false)} />;
  return (
    <>
      <SectionHeader
        title="Client cases"
        description="Ask RealtorX Client Services to help your client: resale, paperwork and transfer, project delays, maintenance."
        action={<PrimaryButton onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> New case</PrimaryButton>}
      />
      <DataView state={state} isEmpty={(d) => d.cases.length === 0} empty={{ icon: LifeBuoy, title: 'No cases yet', description: 'Open a case when a client needs RealtorX to solve something.' }}>
        {(d) => (
          <DataTable
            rows={d.cases}
            rowKey={(r) => r.name}
            onRowClick={(r) => setOpen(r.name)}
            columns={[
              { header: 'Case', cell: (r) => <span className="font-semibold text-fg">{r.subject}</span> },
              { header: 'Type', cell: (r) => r.case_type },
              { header: 'Status', cell: (r) => <span className={CLOSED.includes(r.status) ? 'text-fg-2' : 'text-amber-300'}>{r.status}</span> },
              { header: 'Opened', cell: (r) => formatDate(r.creation) },
              { header: 'Last update', cell: (r) => formatDate(r.modified) },
            ]}
          />
        )}
      </DataView>
    </>
  );
}

function NewCase({ types, onDone, onCancel }: { types: string[]; onDone: (name: string) => void; onCancel: () => void }) {
  const deals = useApi<DealOption[]>('realtor_x.api.portal.agent_deals');
  const [form, setForm] = useState({ case_type: '', deal: '', contact_name: '', contact_phone: '', contact_email: '', subject: '', description: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });
  const pickDeal = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deal = (deals.data || []).find((d) => d.name === e.target.value);
    setForm({ ...form, deal: e.target.value, contact_name: form.contact_name || deal?.buyer_name || '' });
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await callPost<{ case: string }>('realtor_x.api.portal.agent_submit_case', form);
      onDone(r.case);
    } catch (err: any) {
      setError(err?.message || 'Could not open the case.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <BackLink onClick={onCancel}>Client cases</BackLink>
      <SectionHeader title="New client case" description="RealtorX contacts your client directly and keeps you updated here." />
      <form onSubmit={submit} className="max-w-lg space-y-3 rounded-xl border border-line bg-panel p-5">
        <Field label="What does the client need?" htmlFor="nc-type">
          <select id="nc-type" required value={form.case_type} onChange={set('case_type')} className={inputClass}>
            <option value="">{t('Choose…')}</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Deal (optional)" htmlFor="nc-deal" hint="Link the case to one of your deals so RealtorX knows the unit.">
          <select id="nc-deal" value={form.deal} onChange={pickDeal} className={inputClass}>
            <option value="">{t('No deal')}</option>
            {(deals.data || []).map((d) => <option key={d.name} value={d.name}>{d.name} · {d.buyer_name} · {d.unit_title || ''}</option>)}
          </select>
        </Field>
        <Field label="Client name" htmlFor="nc-name"><input id="nc-name" required value={form.contact_name} onChange={set('contact_name')} className={inputClass} /></Field>
        <Field label="Client mobile" htmlFor="nc-phone"><PhoneInput id="nc-phone" required value={form.contact_phone} onChange={(v) => setForm({ ...form, contact_phone: v })} /></Field>
        <Field label="Client email (optional)" htmlFor="nc-email"><input id="nc-email" type="email" value={form.contact_email} onChange={set('contact_email')} className={inputClass} /></Field>
        <Field label="Subject" htmlFor="nc-subject"><input id="nc-subject" required minLength={5} value={form.subject} onChange={set('subject')} className={inputClass} /></Field>
        <Field label="Describe the problem" htmlFor="nc-desc"><textarea id="nc-desc" required minLength={20} rows={4} value={form.description} onChange={set('description')} className={inputClass} /></Field>
        {error && <Notice tone="error">{error}</Notice>}
        <PrimaryButton type="submit" busy={busy}>Open case</PrimaryButton>
      </form>
    </>
  );
}

function CasePanel({ name, onBack }: { name: string; onBack: () => void }) {
  const state = useApi<CaseDetail>('realtor_x.api.portal.agent_case', { name }, name);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      state.setData(await callPost<CaseDetail>('realtor_x.api.portal.agent_case_reply', { name, text }));
      setText('');
    } catch (err: any) {
      setError(err?.message || 'Could not send the message.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <BackLink onClick={onBack}>Client cases</BackLink>
      <DataView state={state}>
        {(c) => (
          <div className="space-y-4">
            <SectionHeader title={c.subject} description={`${c.name} · ${c.case_type} · opened ${formatDate(c.created)}`} />
            <div className="rounded-xl border border-line bg-panel p-5 text-sm">
              <p className="text-xs text-fg-2">{t("Status")}</p>
              <p className="mt-0.5 font-semibold text-fg">{c.status}</p>
              <p className="mt-3 whitespace-pre-line text-fg-2">{c.description}</p>
              {c.resolution && <Notice tone="success">{c.resolution}</Notice>}
              {c.rejection_reason && <Notice tone="error">{c.rejection_reason}</Notice>}
            </div>
            <ul className="space-y-2">
              {c.updates.map((u, i) => (
                <li key={i} className={`rounded-lg p-3 text-sm ${u.from_you ? 'ms-8 bg-white/[0.06] text-amber-100' : 'me-8 bg-white/5 text-fg'}`}>
                  <p className="whitespace-pre-line">{u.text}</p>
                  <p className="mt-1 text-[11px] text-fg-3">{u.from_you ? 'You' : 'RealtorX'} · {formatDate(u.posted_on)}</p>
                </li>
              ))}
            </ul>
            {!CLOSED.includes(c.status) && (
              <form onSubmit={send} className="space-y-2">
                <textarea aria-label={t('Message to RealtorX')} required rows={3} value={text} onChange={(e) => setText(e.target.value)} className={inputClass} placeholder="Write to RealtorX Client Services…" />
                {error && <Notice tone="error">{error}</Notice>}
                <PrimaryButton type="submit" busy={busy}>Send</PrimaryButton>
              </form>
            )}
          </div>
        )}
      </DataView>
    </>
  );
}
