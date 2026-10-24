// Site footer: a closing call to action, the newsletter, the site map, contact details and legal links.
import React, { useState } from 'react';
import { callPost } from '../services/api/client';
import { PageId } from '../types';
import { SITE, whatsappUrl } from '../config/site';
import { RealtorXLogo } from './RealtorXLogo';
import { Button, Container, XMark, inputClass } from './site/ui';
import { PageLink } from './site/PageLink';

type Nav = (page: PageId) => void;

const COLUMNS: { title: string; links: [PageId, string][] }[] = [
  { title: 'Buy', links: [['properties', 'Properties'], ['projects', 'Projects'], ['solutions', 'Client services']] },
  { title: 'Work with us', links: [['become-agent', 'Become an agent'], ['my-application', 'My application'], ['developer-program', 'For developers'], ['login', 'Sign in']] },
  { title: 'Company', links: [['about', 'About RealtorX'], ['contact', 'Contact'], ['faq', 'Questions'], ['complaints', 'Complaints']] },
  { title: 'Policies', links: [['terms', 'Terms of use'], ['privacy', 'Privacy policy'], ['booking-policy', 'Booking and refunds'], ['agent-terms', 'Agent terms'], ['developer-terms', 'Developer terms'], ['disclaimer', 'Disclaimer']] },
];

export function Footer({ onNavigate }: { onNavigate: Nav }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setState(null);
    try {
      const r = await callPost<{ status: string }>('realtor_x.api.v1.subscribe_newsletter', { email: email.trim() });
      setState({ tone: 'ok', text: r?.status === 'already_subscribed' ? 'You are already on the list.' : 'Thank you. New projects will reach your inbox.' });
      setEmail('');
    } catch (err: any) {
      setState({ tone: 'error', text: err?.message || 'Could not subscribe right now. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="border-t border-line bg-ink">
      <Container>
        <div className="grid gap-12 border-b border-line py-16 md:grid-cols-[1.2fr_1fr] md:py-20">
          <div>
            <h2 className="max-w-md text-balance text-3xl font-medium leading-[1.1] tracking-[-0.03em] text-fg md:text-4xl">
              New projects, before they <span className="em">reach</span> the market.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-fg-2">One short email when a contracted developer releases new inventory. Nothing else.</p>
          </div>
          <form onSubmit={subscribe} className="self-end" aria-label="Newsletter">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="footer-email" className="sr-only">Email</label>
              <input id="footer-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" className={inputClass} />
              <Button type="submit" busy={busy} className="h-12 shrink-0 px-6">Subscribe</Button>
            </div>
            {state && <p className={`mt-3 text-[13px] ${state.tone === 'ok' ? 'text-good' : 'text-bad'}`} role="status">{state.text}</p>}
          </form>
        </div>

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <RealtorXLogo height={40} />
            <p className="mt-6 text-[14px] leading-relaxed text-fg-2">
              Verified homes from contracted developers, sold by identity-checked agents.
            </p>
            <div className="mt-6 space-y-1.5 text-[14px] text-fg-2">
              <a href={`tel:${SITE.phoneTel}`} className="block hover:text-fg">{SITE.phoneDisplay}</a>
              <a href={`mailto:${SITE.email}`} className="block hover:text-fg">{SITE.email}</a>
              <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="block hover:text-fg">WhatsApp</a>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map(([id, label]) => (
                  <li key={id}>
                    <PageLink page={id} onNavigate={onNavigate} className="text-[14px] text-fg-2 transition-colors hover:text-fg">{label}</PageLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-8 text-[12px] text-fg-3 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-2"><XMark className="h-2.5 w-2.5" /> © {new Date().getFullYear()} RealtorX. {SITE.address}</p>
          <div className="flex gap-6">
            <PageLink page="terms" onNavigate={onNavigate} className="hover:text-fg">Terms</PageLink>
            <PageLink page="privacy" onNavigate={onNavigate} className="hover:text-fg">Privacy</PageLink>
            <PageLink page="cookies" onNavigate={onNavigate} className="hover:text-fg">Cookies</PageLink>
            <PageLink page="legal" onNavigate={onNavigate} className="hover:text-fg">All policies</PageLink>
          </div>
        </div>
      </Container>
    </footer>
  );
}
