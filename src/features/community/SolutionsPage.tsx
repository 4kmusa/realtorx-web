// Client services (/client-services): owners and investors describe a property problem; RealtorX assigns, tracks and
// resolves it (Solution Desk cases in the back office).
import React, { useEffect, useState } from 'react';
import { PageId } from '../../types';
import { callGet, callPost } from '../../services/api/client';
import { Alert, Button, Container, Field, PageIntro, Section, inputClass, textareaClass } from '../../components/site/ui';
import PhoneInput from '../../components/site/PhoneInput';

type Nav = (page: PageId, id?: string) => void;

const EXAMPLES: [string, string][] = [
  ['Property not selling', 'Your villa, flat or plot has been on the market too long. We review the price, present it properly and put it in front of our agents.'],
  ['Maintenance', 'Repairs and upkeep of a property you own, including while you live abroad.'],
  ['Stuck investment', 'Your money is in a project that is not moving, or a file that nobody answers for.'],
  ['Paperwork and transfer', 'Transfer, title, NOC and the rest of the documentation, followed through.'],
  ['Project delay', 'Possession or development is long overdue and you need someone to follow it up.'],
  ['Legal', 'Disputes and legal questions about your property, with the right people brought in.'],
];

export default function SolutionsPage(_props: { onNavigate: Nav }) {
  const [types, setTypes] = useState<string[]>([]);
  const [typesFailed, setTypesFailed] = useState(false);
  const [typesTry, setTypesTry] = useState(0);
  const [form, setForm] = useState({ case_type: '', subject: '', description: '', contact_name: '', contact_phone: '', contact_email: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    // Without the list the form cannot be sent: say so and offer to try again instead of an empty choice.
    setTypesFailed(false);
    callGet<string[]>('realtor_x.api.community.get_case_types').then((t) => setTypes(t || [])).catch(() => setTypesFailed(true));
  }, [typesTry]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.case_type) return setError('Please choose what kind of help you need.');
    if (form.description.trim().length < 20) return setError('Please describe the problem in at least 20 characters.');
    setBusy(true);
    try {
      const res = await callPost<{ case: string }>('realtor_x.api.community.submit_case', form);
      setDone(res.case);
    } catch (err: any) {
      setError(err?.message || 'Could not submit your case.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-ink">
      <PageIntro eyebrow="Client services" title={<>When something about your property is <span className="em">stuck</span>.</>}
        intro="Tell us what is wrong. A RealtorX case manager reviews it, brings in the right people and keeps you updated until it is resolved." />

      <Section className="!pt-16">
        <Container>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {EXAMPLES.map(([title, text]) => (
              <div key={title} className="bg-ink p-8">
                <h2 className="text-lg font-medium text-fg">{title}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-fg-2">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-24 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="text-balance text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-fg md:text-5xl">Open a <span className="em">case</span>.</h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-fg-2">A case manager will call you within two working days. You get a case reference and updates by phone or email until it is closed.</p>
              <p className="mt-6 max-w-md text-[14px] text-fg-3">RealtorX Agents can open cases for their clients from the Agent dashboard.</p>
            </div>
            <div className="rounded-3xl border border-line bg-panel p-6 sm:p-8">
              {done ? (
                <div className="py-6">
                  <p className="font-serif text-5xl italic text-fg">Thank you.</p>
                  <p className="mt-5 text-[15px] leading-relaxed text-fg-2">Your case is open. A RealtorX case manager will call you within two working days.</p>
                  <p className="mt-6 rounded-xl border border-line px-4 py-3 text-[13px] text-fg-2">Case reference <span className="ml-2 font-medium text-fg">{done}</span></p>
                </div>
              ) : (
                <form onSubmit={submit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="What do you need help with?" htmlFor="cs-type" className="sm:col-span-2">
                    <select id="cs-type" required className={inputClass} value={form.case_type} onChange={(e) => setForm({ ...form, case_type: e.target.value })}>
                      <option value="">Choose…</option>
                      {types.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {typesFailed && (
                      <span className="mt-2 block text-[13px] text-fg-3">
                        The list could not be loaded.{' '}
                        <button type="button" onClick={() => setTypesTry((n) => n + 1)} className="text-fg underline underline-offset-4">Try again</button>
                        {' '}or call us.
                      </span>
                    )}
                  </Field>
                  <Field label="Subject" htmlFor="cs-subject" className="sm:col-span-2"><input id="cs-subject" required minLength={5} className={inputClass} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
                  <Field label="Describe the problem" htmlFor="cs-desc" className="sm:col-span-2"><textarea id="cs-desc" required minLength={20} rows={5} className={textareaClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
                  <Field label="Your name" htmlFor="cs-name"><input id="cs-name" required minLength={2} className={inputClass} autoComplete="name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></Field>
                  <Field label="Mobile" htmlFor="cs-phone"><PhoneInput id="cs-phone" required value={form.contact_phone} onChange={(v) => setForm({ ...form, contact_phone: v })} /></Field>
                  <Field label="Email (optional)" htmlFor="cs-email" className="sm:col-span-2"><input id="cs-email" type="email" className={inputClass} autoComplete="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></Field>
                  {error && <div className="sm:col-span-2"><Alert>{error}</Alert></div>}
                  <div className="sm:col-span-2">
                    <Button type="submit" size="lg" busy={busy} className="w-full">Open my case</Button>
                    <p className="mt-3 text-center text-xs text-fg-3">By sending this you agree that RealtorX may contact you about your case.</p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
