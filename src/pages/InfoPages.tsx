import React from 'react';
import { PageId } from '../types';

// FAQ, privacy notice, terms and 404. Content only describes what the system actually
// does today; commercial and legal commitments are left to the owner (see
// the decision log in the private realtorx-erp-backend repo) and the policy pages are marked as drafts.

type Nav = (page: PageId, id?: string) => void;

const CONTACT_EMAIL = 'info@realtorx.co';

function Shell({ title, intro, children }: { title: string; intro?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      {intro && <div className="mt-3 text-sm text-slate-400">{intro}</div>}
      <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-300">{children}</div>
    </div>
  );
}

function DraftNotice() {
  return (
    <div role="note" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
      Draft pending legal review. This page describes how the website currently handles information and is not yet a
      final legal document.
    </div>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold text-white">{heading}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

const linkClass = 'text-[#F5A623] hover:underline';

export function FaqPage({ onNavigate }: { onNavigate: Nav }) {
  const faqs: { q: string; a: React.ReactNode }[] = [
    {
      q: 'How do I ask about a property?',
      a: (
        <>
          Open the property and use <em>Contact Agent</em>, or send a message from the{' '}
          <button className={linkClass} onClick={() => onNavigate('contact')}>contact page</button>. Your request is saved
          to our CRM with the property you were viewing, and an advisor calls you back.
        </>
      ),
    },
    {
      q: 'Can I book a site visit online?',
      a: (
        <>
          You can <button className={linkClass} onClick={() => onNavigate('site-visit')}>request a visit</button> with a
          preferred date and time. It is not confirmed until our team calls you to agree the appointment.
        </>
      ),
    },
    {
      q: 'Is the price on the website final?',
      a: 'Prices shown are the current list prices. The price you pay is the one recorded in your approved booking and contract.',
    },
    {
      q: 'Why does a unit show as reserved or disappear from the list?',
      a: 'Inventory is updated as soon as a unit is booked, so a unit you saw earlier may already be reserved for another buyer. Ask us about similar units.',
    },
    {
      q: 'How do I become a RealtorX dealer?',
      a: (
        <>
          Submit the <button className={linkClass} onClick={() => onNavigate('become-dealer')}>dealer application</button>.
          Our team reviews it and completes verification with you (CNIC, bank details and video KYC) before dealer access is
          activated. Commission terms are set out in your dealer agreement.
        </>
      ),
    },
    {
      q: 'How do I access my customer portal?',
      a: 'After your booking is recorded, our team sets up portal access for your email address. The portal shows your bookings, payment schedule and receipts.',
    },
    {
      q: 'How should I make payments?',
      a: 'Use only the payment details given in your official booking documents and keep every receipt. Payments are credited to your account after our finance team verifies them.',
    },
    {
      q: 'How is my information used?',
      a: (
        <>
          See our <button className={linkClass} onClick={() => onNavigate('privacy')}>privacy notice</button>.
        </>
      ),
    },
  ];
  return (
    <Shell title="Frequently asked questions">
      <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#0B1A30]">
        {faqs.map((f) => (
          <details key={f.q} className="group p-5">
            <summary className="cursor-pointer list-none font-medium text-white marker:hidden">
              <span className="flex items-center justify-between gap-4">
                {f.q}
                <span className="text-slate-500 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </span>
            </summary>
            <div className="mt-3 text-slate-400">{f.a}</div>
          </details>
        ))}
      </div>
    </Shell>
  );
}

export function PrivacyPage() {
  return (
    <Shell title="Privacy notice" intro={<DraftNotice />}>
      <Section heading="What we collect">
        <p>
          When you send an inquiry, contact request or site-visit request we store your name, mobile number, optional email,
          your message, the property or project you asked about, your preferred visit date and time, whether you agreed to
          be contacted (and when), and the page and campaign link (UTM parameters) that brought you to us.
        </p>
        <p>
          If you create an account we store your name, email, mobile number and password (stored in hashed form). Dealer
          applicants also provide CNIC, city and, during verification, identity documents and bank details.
        </p>
      </Section>
      <Section heading="Why we use it">
        <p>
          To respond to your request, arrange visits, process bookings and payments, verify dealers, and understand which
          campaigns bring us inquiries. We do not sell your information.
        </p>
      </Section>
      <Section heading="Who can see it">
        <p>
          RealtorX staff who handle your request and, where a lead is assigned to a dealer, that dealer only. Customers and
          dealers can only see their own records in the portals.
        </p>
      </Section>
      <Section heading="Cookies">
        <p>
          We use a session cookie to keep you signed in and to protect forms against cross-site requests. Saved favourites
          are stored only in your browser.
        </p>
      </Section>
      <Section heading="Your choices">
        <p>
          To access, correct or delete your information, email{' '}
          <a className={linkClass} href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Records needed for contracts,
          payments or legal obligations may have to be kept.
        </p>
      </Section>
    </Shell>
  );
}

export function TermsPage({ onNavigate }: { onNavigate: Nav }) {
  return (
    <Shell title="Terms of use" intro={<DraftNotice />}>
      <Section heading="Listings">
        <p>
          Property information, images and prices are provided for guidance and may change. Availability is confirmed only
          when a booking is approved by RealtorX. Nothing on this website is an offer or a binding agreement.
        </p>
      </Section>
      <Section heading="Bookings and payments">
        <p>
          Bookings, payment plans, cancellations and refunds are governed by the booking and contract documents you sign, not
          by this website.
        </p>
      </Section>
      <Section heading="Accounts">
        <p>
          Keep your password private. You are responsible for activity under your account. Dealer access requires approval
          and may be suspended in line with the dealer agreement.
        </p>
      </Section>
      <Section heading="Questions">
        <p>
          <button className={linkClass} onClick={() => onNavigate('contact')}>Contact us</button> with any questions about
          these terms.
        </p>
      </Section>
    </Shell>
  );
}

export function NotFoundPage({ onNavigate }: { onNavigate: Nav }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-sm font-semibold text-[#F5A623]">404</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Page not found</h1>
      <p className="mt-3 text-sm text-slate-400">The page you are looking for does not exist or has moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={() => onNavigate('home')} className="rounded-lg bg-[#F5A623] px-5 py-2.5 font-semibold text-black hover:bg-[#d98c15]">
          Go home
        </button>
        <button onClick={() => onNavigate('properties')} className="rounded-lg border border-white/15 px-5 py-2.5 text-white hover:bg-white/5">
          Browse properties
        </button>
      </div>
    </div>
  );
}
