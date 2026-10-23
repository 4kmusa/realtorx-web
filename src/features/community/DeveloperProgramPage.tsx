// For developers (/for-developers): how a developer partners with RealtorX, who is already on board, and a
// partnership enquiry (goes to the RealtorX team as a contact lead).
import React, { useEffect, useState } from 'react';
import { PageId } from '../../types';
import { callGet, callPost } from '../../services/api/client';
import { imageUrl } from '../marketplace/api';
import { Alert, Button, Container, Eyebrow, Field, Section, SectionHeader, inputClass, useReveal } from '../../components/site/ui';
import PhoneInput from '../../components/site/PhoneInput';

type Nav = (page: PageId, id?: string) => void;

interface Developer {
  name: string;
  company_owner_name: string;
  about: string | null;
  website: string | null;
  logo: string | null;
  projects: { name: string; project_name: string; city: string | null; status: string }[];
}

const BENEFITS: { title: string; text: string }[] = [
  { title: 'One clear contract', text: 'Commission for each project, when it is earned and how buyer payments flow, agreed before a single unit is listed.' },
  { title: 'A verified sales force', text: 'Identity-checked RealtorX Agents across the city sell your inventory. We coordinate them; you deal with one partner.' },
  { title: 'Your units, presented properly', text: 'Each unit is checked and listed with photos, plans and your payment plan, live on RealtorX the moment it is approved.' },
  { title: 'Every deal on record', text: 'Bookings, documents, payments, possession and transfer are tracked stage by stage, and you see each one in your dashboard.' },
  { title: 'Money you can reconcile', text: 'Buyers pay into your account. Every payment is recorded against the schedule, verified by RealtorX and confirmed by you.' },
  { title: 'Your own dashboard', text: 'Projects, availability, reservations, collections and commission invoices, live, in a dashboard made for your team.' },
];

export default function DeveloperProgramPage({ onNavigate }: { onNavigate: Nav }) {
  const [developers, setDevelopers] = useState<Developer[] | null>(null);
  const [form, setForm] = useState({ company: '', name: '', phone: '', email: '', project: '' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useReveal([developers]);
  useEffect(() => {
    callGet<Developer[]>('realtor_x.api.v1.get_public_developers').then(setDevelopers).catch(() => setDevelopers([]));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await callPost('realtor_x.api.v1.submit_contact_form', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        subject: 'Developer partnership',
        message: `Company: ${form.company.trim()}\nProject: ${form.project.trim() || '—'}`.slice(0, 2000),
        consent: 1,
        landing_page: window.location.pathname,
      });
      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Could not send your enquiry. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-ink">
      <header className="relative overflow-hidden border-b border-line">
        <img src="/images/bahria_town_karachi_1790600916751.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
        <Container className="relative pb-20 pt-16 md:pb-28 md:pt-24">
          <Eyebrow className="mb-6 text-fg-2">For developers</Eyebrow>
          <h1 className="max-w-4xl animate-rise text-balance text-[42px] font-medium leading-[1.0] tracking-[-0.035em] text-fg md:text-[76px]">
            A sales partner that <span className="em">answers</span> for the result.
          </h1>
          <p className="mt-6 max-w-xl animate-rise text-base leading-relaxed text-fg-2 md:text-lg">
            Sign with RealtorX and your inventory reaches verified agents and serious buyers, with every deal recorded from reservation to transfer.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#partner" className="inline-flex h-[52px] items-center rounded-full bg-fg px-7 text-[15px] font-medium text-ink hover:bg-white">Talk to our partnerships team</a>
            <a href="/developer/" className="inline-flex h-[52px] items-center rounded-full border border-line-2 px-7 text-[15px] text-fg hover:bg-white/[0.04]">Developer sign in</a>
          </div>
        </Container>
      </header>

      <Section>
        <Container>
          <SectionHeader eyebrow="What you get" title={<>Everything after the contract is <span className="em">ours</span> to run.</>} />
          <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b, i) => (
              <div key={b.title} className="reveal border-t border-line pt-7" style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <p className="text-[11px] tabular-nums tracking-[0.2em] text-fg-3">0{i + 1}</p>
                <h3 className="mt-4 text-xl font-medium tracking-[-0.015em] text-fg">{b.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-fg-2">{b.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {!!developers?.length && (
        <Section tone="ink-2">
          <Container>
            <SectionHeader eyebrow="Partners" title={<>Developers who sell <span className="em">with</span> RealtorX.</>} />
            <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {developers.map((d) => (
                <div key={d.name} className="bg-ink-2 p-8">
                  {d.logo ? <img src={imageUrl(d.logo) || ''} alt="" className="h-10 w-auto object-contain" /> : <p className="font-serif text-3xl italic text-fg-3">{d.company_owner_name.slice(0, 1)}</p>}
                  <h3 className="mt-6 text-lg font-medium text-fg">{d.company_owner_name}</h3>
                  {d.about && <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-fg-2">{d.about}</p>}
                  {!!d.projects.length && (
                    <ul className="mt-5 space-y-1.5 border-t border-line pt-4 text-[14px]">
                      {d.projects.map((p) => (
                        <li key={p.name}>
                          <button onClick={() => onNavigate('project-details', p.name)} className="text-fg-2 underline-offset-4 hover:text-fg hover:underline">
                            {p.project_name}{p.city ? `, ${p.city}` : ''}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section id="partner" className="scroll-mt-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <Eyebrow className="mb-5">Partnerships</Eyebrow>
              <h2 className="text-balance text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-fg md:text-5xl">Tell us about your <span className="em">project</span>.</h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-fg-2">Our partnerships team will call you to understand the inventory, the payment plans and how you would like RealtorX to sell it. No commitment until a contract is signed.</p>
            </div>
            <div className="rounded-3xl border border-line bg-panel p-6 sm:p-8">
              {sent ? (
                <div className="py-6">
                  <p className="font-serif text-5xl italic text-fg">Thank you.</p>
                  <p className="mt-5 text-[15px] leading-relaxed text-fg-2">Our partnerships team will call you within two working days.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
                  <Field label="Company" htmlFor="dv-company" className="sm:col-span-2"><input id="dv-company" required className={inputClass} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
                  <Field label="Your name" htmlFor="dv-name"><input id="dv-name" required minLength={2} className={inputClass} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                  <Field label="Mobile" htmlFor="dv-phone"><PhoneInput id="dv-phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} /></Field>
                  <Field label="Email" htmlFor="dv-email" className="sm:col-span-2"><input id="dv-email" type="email" className={inputClass} autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                  <Field label="Project name and city" htmlFor="dv-project" className="sm:col-span-2"><input id="dv-project" className={inputClass} value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} /></Field>
                  {error && <div className="sm:col-span-2"><Alert>{error}</Alert></div>}
                  <div className="sm:col-span-2">
                    <Button type="submit" size="lg" busy={busy} className="w-full">Request a call</Button>
                    <p className="mt-3 text-center text-xs text-fg-3">By sending this you agree that RealtorX may contact you about a partnership.</p>
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
