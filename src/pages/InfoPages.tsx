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
      q: 'What is RealtorX?',
      a: 'A real estate community: a verified marketplace, a membership of oath-bound professionals, a Solution Desk for problems and the RealtorX Hub where the community meets.',
    },
    {
      q: 'Why are there no phone numbers on listings?',
      a: (
        <>
          Every listing is handled by a RealtorX member realtor. Press <em>I&apos;m interested</em> on a property and the realtor
          calls you. This protects owners and buyers from spam and keeps every conversation accountable.
        </>
      ),
    },
    {
      q: 'How do I post my property?',
      a: (
        <>
          <button className={linkClass} onClick={() => onNavigate('post-listing')}>Post a property</button> after signing in. RealtorX
          checks the documents, owner identity, price, photos and location before the listing goes live, and you are told the reason if
          changes are needed.
        </>
      ),
    },
    {
      q: 'Who handles my listing?',
      a: 'A RealtorX member realtor: one you choose from the member list, or the best available realtor in your area ("Best for me").',
    },
    {
      q: 'How do I become a member?',
      a: (
        <>
          <button className={linkClass} onClick={() => onNavigate('join')}>Apply online</button>: choose your member type, complete your
          profile, read the Manifesto, accept the Code and take the Oath. After verification you attend an orientation at the Hub, then
          you receive your Member ID and digital card.
        </>
      ),
    },
    {
      q: 'What is the Solution Desk?',
      a: (
        <>
          A team that works on real estate problems: stuck investments, delayed projects, mergers, legal and documentation issues.{' '}
          <button className={linkClass} onClick={() => onNavigate('solutions')}>Submit a problem</button> and follow its progress online.
        </>
      ),
    },
    {
      q: 'Can I book a meeting room at the Hub?',
      a: 'Approved members can request meeting rooms, desks and developer pods from their member page. The Hub team confirms each request.',
    },
    {
      q: 'Are payments taken on the website?',
      a: 'No. Membership subscriptions and developer packages are arranged with the RealtorX Community Team.',
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
          <b>Accounts:</b> name, email, mobile number and password (stored in hashed form).
        </p>
        <p>
          <b>Membership applications:</b> member type, company, city, CNIC, experience, areas served, specialization, profile text, the
          date you accepted the Manifesto, Code and Oath, and the verification documents you upload (CNIC copies and business documents,
          stored privately).
        </p>
        <p>
          <b>Listings:</b> the property details, photos and videos you submit, your contact details and the owner&apos;s details that our
          team records during verification.
        </p>
        <p>
          <b>Requests:</b> when you press &quot;I&apos;m interested&quot;, contact us, submit a Solution Desk case or register for an event, we
          store your name, mobile number, optional email, your message, whether you agreed to be contacted, and the page and campaign link
          (UTM parameters) that brought you to us.
        </p>
      </Section>
      <Section heading="Why we use it">
        <p>
          To verify members and listings, connect buyers with the realtor handling a property, work on Solution Desk cases, run the Hub and
          events, and understand which campaigns bring people to RealtorX. We do not sell your information.
        </p>
      </Section>
      <Section heading="Who can see it">
        <p>
          Phone numbers and emails are never published. RealtorX staff see what they need for their role. When you are interested in a
          property, your details go to the RealtorX realtor handling it. The member directory shows only professional profile information.
          Verification documents and owner details are visible to RealtorX staff only.
        </p>
      </Section>
      <Section heading="Cookies">
        <p>
          We use a session cookie to keep you signed in and to protect forms against cross-site requests. Map previews and videos are loaded
          from Google Maps and YouTube when you open a listing that has them.
        </p>
      </Section>
      <Section heading="Your choices">
        <p>
          To access, correct or delete your information, email{' '}
          <a className={linkClass} href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Records needed for legal obligations may have to be
          kept.
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
          Listings must be accurate and be for property you own or are authorised to list. RealtorX may decline, edit the status of or
          remove any listing and will tell you why. Information, images and prices are for guidance; nothing on this website is an offer or
          a binding agreement.
        </p>
      </Section>
      <Section heading="Membership">
        <p>
          Membership is granted after verification, orientation and the RealtorX Oath, and may be suspended for breaches of the RealtorX
          Code. Members must not use RealtorX to bypass the realtor handling a listing.
        </p>
      </Section>
      <Section heading="Solution Desk and Hub">
        <p>
          The Solution Desk works on a best-effort basis and does not give legal or financial advice. Hub bookings are requests until the Hub
          team confirms them.
        </p>
      </Section>
      <Section heading="Accounts">
        <p>Keep your password private. You are responsible for activity under your account.</p>
      </Section>
      <Section heading="Questions">
        <p>
          <button className={linkClass} onClick={() => onNavigate('contact')}>Contact us</button> with any questions about these terms.
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
