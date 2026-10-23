// Sign in (/sign-in): buyers sign in or create a free account here (needed to enquire, book a visit or request a
// booking). Agents and developers use their own dashboards; RealtorX staff use the back office.
import React, { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Container, Eyebrow } from '../components/site/ui';
import { PageId } from '../types';
import AuthForms from '../features/buyer/AuthForms';
import { useBuyer } from '../features/buyer/session';

type Nav = (page: PageId, id?: string) => void;

/** Back office (ERPNext Desk) address: VITE_ERP_DESK_URL, or port 8000 on this host during development. */
export function backOfficeUrl(): string {
  const configured = import.meta.env.VITE_ERP_DESK_URL as string | undefined;
  if (configured) return configured;
  return import.meta.env.DEV ? `${window.location.protocol}//${window.location.hostname}:8000/app` : '/app';
}

export default function SignInPage({ onNavigate }: { onNavigate: Nav }) {
  const { buyer } = useBuyer();
  useEffect(() => {
    if (buyer) onNavigate('account');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyer]);
  const doors = [
    { title: 'RealtorX Agent', text: 'Inventory to sell, your buyers, deals, commission and client cases. Uses the password RealtorX gives you.', href: '/agent/' },
    { title: 'My application', text: 'Applied to become an agent? Follow your application with the password you chose when applying.', href: '/my-application' },
    { title: 'Developer', text: 'Your projects, inventory, reservations, collections and commission invoices.', href: '/developer/' },
    { title: 'RealtorX team', text: 'The back office for RealtorX staff.', href: backOfficeUrl() },
  ];
  return (
    <div className="bg-ink pb-24">
      <Container className="pt-16 md:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_440px] lg:gap-20">
          <div>
            <Eyebrow className="mb-6">Sign in</Eyebrow>
            <h1 className="max-w-3xl text-balance text-[40px] font-medium leading-[1.04] tracking-[-0.035em] text-fg md:text-6xl">Your RealtorX <span className="em">account</span>.</h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-fg-2">
              Browsing is open to everyone. To send an enquiry, book a site visit or request a booking, sign in or create a free account:
              your details go with every request and you can follow them in My account.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-panel p-6 md:p-8"><AuthForms onSignedIn={(b) => b && onNavigate('account')} /></div>
        </div>
        <h2 className="mt-24 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">Agents, developers and the RealtorX team</h2>
        <ul className="mt-6 border-t border-line">
          {doors.map((d) => (
            <li key={d.title}>
              <a href={d.href} className="group grid items-center gap-3 border-b border-line py-8 md:grid-cols-[1fr_2fr_auto] md:gap-10">
                <span className="text-2xl font-medium tracking-[-0.02em] text-fg">{d.title}</span>
                <span className="text-[15px] leading-relaxed text-fg-2">{d.text}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line-2 text-fg transition-colors group-hover:border-fg group-hover:bg-fg group-hover:text-ink">
                  <ArrowUpRight className="h-5 w-5" strokeWidth={1.5} />
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-[14px] text-fg-3">
          Not an agent yet? <button onClick={() => onNavigate('become-agent')} className="text-fg underline underline-offset-4">Apply to become a RealtorX Agent</button>
        </p>
      </Container>
    </div>
  );
}
