// Contact (/contact): office, phone, WhatsApp and email, and a message form that reaches the RealtorX team.
import React, { useState } from 'react';
import { PageId } from '../types';
import { callPost } from '../services/api/client';
import { SITE, whatsappUrl } from '../config/site';
import { Alert, Button, ButtonLink, Checkbox, Container, Field, PageIntro, inputClass, textareaClass } from '../components/site/ui';
import PhoneInput from '../components/site/PhoneInput';
import { useBuyer } from '../features/buyer/session';

const SUBJECTS = ['Property enquiry', 'Site visit', 'Agent programme', 'Developer partnership', 'Help with my property', 'Something else'];
// Enquiries about a property and site visits need a free buyer account (the server refuses them from guests).
const SIGNED_IN_ONLY = ['Property enquiry', 'Site visit'];

export function ContactPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const { buyer } = useBuyer();
  const subjects = buyer ? SUBJECTS : SUBJECTS.filter((s) => !SIGNED_IN_ONLY.includes(s));
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: SUBJECTS[2], message: '' });
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ duplicate: boolean } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return setError('Please confirm that we may contact you about your message.');
    setSending(true);
    setError(null);
    try {
      const r = await callPost<{ lead: string; duplicate: boolean }>('realtor_x.api.v1.submit_contact_form', {
        name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), subject: form.subject, message: form.message.trim(),
        consent: 1, landing_page: window.location.pathname.slice(0, 500),
      });
      if (!r?.lead) throw new Error('We could not send your message. Please try again or call us.');
      setSent({ duplicate: !!r.duplicate });
    } catch (err: any) {
      setError(err?.message || 'We could not send your message. Please try again or call us.'); // never report success when nothing was saved
    } finally {
      setSending(false);
    }
  };

  const details: [string, React.ReactNode][] = [
    ['Office', SITE.address],
    ['Phone', <a href={`tel:${SITE.phoneTel}`} className="hover:text-fg">{SITE.phoneDisplay}</a>],
    ['WhatsApp', <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="hover:text-fg">{SITE.phoneDisplay}</a>],
    ['Email', <><a href={`mailto:${SITE.email}`} className="block hover:text-fg">{SITE.email}</a><a href={`mailto:${SITE.salesEmail}`} className="block hover:text-fg">{SITE.salesEmail}</a></>],
    ['Hours', SITE.hours],
  ];

  return (
    <div className="bg-ink pb-24">
      <PageIntro eyebrow="Contact" title={<>Speak to a <span className="em">person</span>, not a form.</>}
        intro="Call or message us on WhatsApp during office hours, or leave a message and the right person will call you back.">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={whatsappUrl()} target="_blank" rel="noreferrer" arrow>WhatsApp us</ButtonLink>
          <ButtonLink href={`tel:${SITE.phoneTel}`} variant="secondary">Call {SITE.phoneDisplay}</ButtonLink>
        </div>
      </PageIntro>

      <Container className="pt-16">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <dl className="border-t border-line">
            {details.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[100px_1fr] gap-4 border-b border-line py-6 text-[15px]">
                <dt className="text-fg-3">{label}</dt>
                <dd className="leading-relaxed text-fg-2">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="rounded-3xl border border-line bg-panel p-6 sm:p-8">
            {sent ? (
              <div className="py-6">
                <p className="font-serif text-5xl italic text-fg">Thank you.</p>
                <p className="mt-5 text-[15px] leading-relaxed text-fg-2">
                  {sent.duplicate ? 'We already had a message from you and added this one to it.' : 'Your message is with our team.'} Someone will call you, usually within a few working hours.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name" htmlFor="ct-name"><input id="ct-name" required minLength={2} className={inputClass} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                <Field label="Mobile" htmlFor="ct-phone"><PhoneInput id="ct-phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} /></Field>
                <Field label="Email (optional)" htmlFor="ct-email"><input id="ct-email" type="email" className={inputClass} autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                <Field label="About" htmlFor="ct-subject">
                  <select id="ct-subject" className={inputClass} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                    {subjects.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                {!buyer && (
                  <p className="text-[13px] leading-relaxed text-fg-3 sm:col-span-2">
                    Asking about a property or a site visit?{' '}
                    <button type="button" onClick={() => onNavigate('login')} className="text-fg underline underline-offset-4">Sign in or create a free account</button>
                    , then use the buttons on the property page.
                  </p>
                )}
                <Field label="Message" htmlFor="ct-msg" className="sm:col-span-2"><textarea id="ct-msg" rows={5} className={textareaClass} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field>
                <div className="sm:col-span-2"><Checkbox id="ct-consent" checked={consent} onChange={setConsent}>RealtorX may contact me by phone, WhatsApp or email about this message.</Checkbox></div>
                {error && <div className="sm:col-span-2"><Alert>{error}</Alert></div>}
                <div className="sm:col-span-2"><Button type="submit" size="lg" busy={sending} className="w-full">Send message</Button></div>
              </form>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
