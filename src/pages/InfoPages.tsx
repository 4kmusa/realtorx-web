import React from 'react';
import { PageId } from '../types';
import { Button, Container, Eyebrow } from '../components/site/ui';

// FAQ and 404. The policies (terms, privacy, cookies, bookings, agent and developer terms, disclaimer, complaints)
// are in LegalPages.tsx.

type Nav = (page: PageId, id?: string) => void;

function Shell({ eyebrow, title, intro, children }: { eyebrow: string; title: React.ReactNode; intro?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-ink pb-24">
      <Container narrow className="pt-16 md:pt-24">
        <Eyebrow className="mb-6">{eyebrow}</Eyebrow>
        <h1 className="text-balance text-[40px] font-medium leading-[1.04] tracking-[-0.035em] text-fg md:text-6xl">{title}</h1>
        {intro && <div className="mt-6">{intro}</div>}
        <div className="prose-rx mt-12">{children}</div>
      </Container>
    </div>
  );
}

const linkClass = 'text-fg underline underline-offset-4 hover:text-blue-2';

export function FaqPage({ onNavigate }: { onNavigate: Nav }) {
  const faqs: { q: string; a: React.ReactNode }[] = [
    {
      q: 'What is RealtorX?',
      a: 'A real estate sales company. RealtorX signs contracts with developers, lists their checked inventory and sells it through identity-verified RealtorX Agents.',
    },
    {
      q: 'Do I need an account?',
      a: 'Not to browse. To send an enquiry, book a site visit or request a booking, sign in or create a free account with your email and mobile number. Your details go with every request, and you can follow each one in My account.',
    },
    {
      q: 'Why are there no phone numbers on listings?',
      a: (
        <>
          Every listing is sold by RealtorX. Press <em>Enquire</em> or book a site visit and the RealtorX team calls you back. This
          protects buyers and developers from spam and keeps every conversation accountable.
        </>
      ),
    },
    {
      q: 'How do I become a RealtorX Agent?',
      a: (
        <>
          See <button className={linkClass} onClick={() => onNavigate('become-agent')}>Become an Agent</button>. You apply online with
          your details, verify your email, upload your ID and record a short video identity check. Follow your application on My application
          with the email and password you chose. After approval RealtorX gives you your Agent dashboard password and explains the commission terms.
        </>
      ),
    },
    {
      q: 'I am a developer. How do I list my project?',
      a: (
        <>
          <button className={linkClass} onClick={() => onNavigate('developer-program')}>Partner with RealtorX</button>. After the contract
          is signed, RealtorX loads your inventory and gives you a Developer dashboard.
        </>
      ),
    },
    {
      q: 'I already own a property and have a problem. Can RealtorX help?',
      a: (
        <>
          Yes. <button className={linkClass} onClick={() => onNavigate('solutions')}>Client Services</button> helps when a property is not
          selling, needs maintenance, your investment is stuck in a project, or paperwork is pending.
        </>
      ),
    },
    {
      q: 'Are payments taken on the website?',
      a: 'No. Buyers pay into the developer’s account according to the payment plan in their booking, and RealtorX records and verifies every payment.',
    },
    {
      q: 'Can I see what I have paid and what is still due?',
      a: 'Yes. RealtorX or your agent sends you a private statement link. It shows your schedule, the payments we have checked, and lets you download your statement and allotment letter as PDF. No account is needed.',
    },
    {
      q: 'What happens if I cancel a booking?',
      a: 'Your agent and RealtorX explain the cancellation terms of the developer before you book. If a refund is due, RealtorX records it, the deduction (if any) and the payment, and you see it on your statement.',
    },
    {
      q: 'How is my information used?',
      a: (
        <>
          See our <button className={linkClass} onClick={() => onNavigate('privacy')}>Privacy Policy</button>. All our policies are on the <button className={linkClass} onClick={() => onNavigate('legal')}>policies page</button>.
        </>
      ),
    },
  ];
  return (
    <Shell eyebrow="Questions" title={<>Questions, <span className="em">answered</span>.</>}>
      <div className="not-prose border-t border-line">
        {faqs.map((f) => (
          <details key={f.q} className="group border-b border-line py-6">
            <summary className="cursor-pointer list-none text-lg text-fg marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-6">
                {f.q}
                <span className="text-2xl font-light text-fg-3 transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span>
              </span>
            </summary>
            <div className="mt-4 max-w-2xl text-[15px] leading-relaxed text-fg-2">{f.a}</div>
          </details>
        ))}
      </div>
    </Shell>
  );
}

export function NotFoundPage({ onNavigate }: { onNavigate: Nav }) {
  return (
    <div className="bg-ink">
      <Container className="flex min-h-[70vh] flex-col items-start justify-center py-24">
        <p className="font-serif text-[120px] italic leading-none text-fg-3 md:text-[180px]">404</p>
        <h1 className="mt-6 text-3xl font-medium tracking-[-0.03em] text-fg md:text-5xl">This page has <span className="em">moved</span> or never existed.</h1>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button onClick={() => onNavigate('home')}>Go home</Button>
          <Button variant="secondary" onClick={() => onNavigate('properties')}>Browse properties</Button>
        </div>
      </Container>
    </div>
  );
}
