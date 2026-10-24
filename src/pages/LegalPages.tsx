// Policies (/legal and one page per policy): terms of use, privacy, cookies, bookings / cancellations / refunds,
// RealtorX Agent terms, developer partner terms, disclaimer and complaints. One layout: title, effective date, a
// contents list that stays in view on large screens, numbered sections and the contact block.
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PageId } from '../types';
import { Container, Eyebrow } from '../components/site/ui';
import { SITE } from '../config/site';

type Nav = (page: PageId, id?: string) => void;
type Section = { id: string; heading: string; body: React.ReactNode };

export const EFFECTIVE = '24 October 2026';
const link = 'text-fg underline underline-offset-4 hover:text-blue-2';

function Go({ to, onNavigate, children }: { to: PageId; onNavigate: Nav; children: React.ReactNode }) {
  return <button type="button" className={link} onClick={() => onNavigate(to)}>{children}</button>;
}

function Mail() {
  return <a className={link} href={`mailto:${SITE.email}`}>{SITE.email}</a>;
}

function Layout({ eyebrow, title, intro, sections, onNavigate }: { eyebrow: string; title: string; intro: React.ReactNode; sections: Section[]; onNavigate: Nav }) {
  return (
    <div className="bg-ink pb-24">
      <Container className="pt-14 md:pt-20">
        <button type="button" onClick={() => onNavigate('legal')} className="mb-8 text-[13px] text-fg-3 hover:text-fg">← All policies</button>
        <Eyebrow className="mb-5">{eyebrow}</Eyebrow>
        <h1 className="max-w-4xl text-balance text-[38px] font-medium leading-[1.04] tracking-[-0.035em] text-fg md:text-[56px]">{title}</h1>
        <p className="mt-4 text-[13px] text-fg-3">Effective {EFFECTIVE}</p>
        <div className="mt-6 max-w-3xl text-[16px] leading-relaxed text-fg-2">{intro}</div>
        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[240px_1fr]">
          <nav aria-label="Contents" className="h-fit lg:sticky lg:top-28">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">Contents</p>
            <ol className="space-y-2 text-[14px]">
              {sections.map((s, i) => (
                <li key={s.id}><a href={`#${s.id}`} className="text-fg-2 hover:text-fg">{i + 1}. {s.heading}</a></li>
              ))}
            </ol>
          </nav>
          <div className="min-w-0 max-w-3xl space-y-12">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="mb-4 text-[22px] font-medium tracking-[-0.02em] text-fg">{i + 1}. {s.heading}</h2>
                <div className="space-y-4 text-[15px] leading-[1.75] text-fg-2 [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_b]:text-fg">{s.body}</div>
              </section>
            ))}
            <section className="rounded-2xl border border-line bg-panel p-6 text-[15px] leading-relaxed text-fg-2">
              <p className="font-medium text-fg">Contact RealtorX</p>
              <p className="mt-2">{SITE.address}</p>
              <p>Email: <Mail /> · Phone and WhatsApp: {SITE.phoneDisplay}</p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}

// ── Policy list (the /legal page and the footer) ──────────────────────────

export const POLICIES: { page: PageId; title: string; text: string }[] = [
  { page: 'terms', title: 'Terms of Use', text: 'The rules for using the RealtorX website and your buyer account.' },
  { page: 'privacy', title: 'Privacy Policy', text: 'What information we collect, why, who sees it, how long we keep it and your rights.' },
  { page: 'cookies', title: 'Cookie Policy', text: 'The cookies and browser storage the website uses, and how to control them.' },
  { page: 'booking-policy', title: 'Booking, Cancellation and Refund Policy', text: 'How visit and booking requests, unit holds, payments, cancellations and refunds work.' },
  { page: 'agent-terms', title: 'RealtorX Agent Terms', text: 'The terms for applying as, and working as, a RealtorX Agent.' },
  { page: 'developer-terms', title: 'Developer Partner Terms', text: 'The terms on which developers list and sell their projects through RealtorX.' },
  { page: 'disclaimer', title: 'Disclaimer', text: 'Listings, prices, plans, 3D models and tools are for guidance; what they do and do not promise.' },
  { page: 'complaints', title: 'Complaints Policy', text: 'How to raise a complaint and how and when we answer it.' },
];

export function LegalHubPage({ onNavigate }: { onNavigate: Nav }) {
  return (
    <div className="bg-ink pb-24">
      <Container className="pt-14 md:pt-20">
        <Eyebrow className="mb-5">Legal</Eyebrow>
        <h1 className="text-[38px] font-medium tracking-[-0.035em] text-fg md:text-[56px]">Policies and <span className="em">terms</span>.</h1>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-fg-2">How RealtorX works with buyers, agents and developers, in plain language. Effective {EFFECTIVE}.</p>
        <ul className="mt-12 border-t border-line">
          {POLICIES.map((p) => (
            <li key={p.page}>
              <button type="button" onClick={() => onNavigate(p.page)} className="group grid grid-cols-1 w-full items-center gap-3 border-b border-line py-7 text-left md:grid-cols-[1fr_2fr_auto] md:gap-10">
                <span className="text-xl font-medium tracking-[-0.02em] text-fg">{p.title}</span>
                <span className="text-[15px] leading-relaxed text-fg-2">{p.text}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line-2 text-fg transition-colors group-hover:border-fg group-hover:bg-fg group-hover:text-ink">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

// ── Terms of Use ──────────────────────────────────────────────────────────

export function TermsPage({ onNavigate }: { onNavigate: Nav }) {
  const sections: Section[] = [
    { id: 'about', heading: 'About these terms', body: <>
      <p>These terms apply to everyone who uses the RealtorX website, including visitors who only browse and buyers who create an account. By using the website you agree to them. If you do not agree, please do not use the website.</p>
      <p>RealtorX Agents and developers also agree to the <Go to="agent-terms" onNavigate={onNavigate}>RealtorX Agent Terms</Go> or the <Go to="developer-terms" onNavigate={onNavigate}>Developer Partner Terms</Go> and to their signed agreements with RealtorX. Where those say something different, they apply to that agent or developer.</p>
      <p>How we use personal information is explained in the <Go to="privacy" onNavigate={onNavigate}>Privacy Policy</Go>.</p>
    </> },
    { id: 'what', heading: 'What RealtorX does', body: <>
      <p>RealtorX lists property from developers who have signed a contract with RealtorX, and connects buyers with RealtorX and its identity-checked RealtorX Agents. The developer of a project is the seller of its units. RealtorX is not the developer, builder or owner of any listed project unless a listing clearly says so.</p>
    </> },
    { id: 'account', heading: 'Your account', body: <>
      <ul>
        <li>Browsing is open to everyone. To send an enquiry, request a site visit or request a booking you need a free buyer account.</li>
        <li>You must be at least 18 years old and able to enter into a contract to create an account.</li>
        <li>Give your real name, an email address you use and a mobile number where we can reach you, and keep them up to date in My account. Every request you send uses these details.</li>
        <li>Keep your password private. You are responsible for what is done with your account. Tell us at once at <Mail /> if you think someone else has used it.</li>
        <li>One account per person. We may suspend or close an account that gives false details, is used to block units or harass people, or breaks these terms.</li>
      </ul>
    </> },
    { id: 'listings', heading: 'Listings and information', body: <>
      <p>Prices, availability, sizes, floor plans, payment plans, photos, renders and 3D models come from the developer and are checked before they go live, but they can change or contain mistakes. They are a guide, not an offer. The terms that bind you are only those in the booking form, allotment letter and other documents you sign for a unit. Please read the <Go to="disclaimer" onNavigate={onNavigate}>Disclaimer</Go>.</p>
    </> },
    { id: 'requests', heading: 'Enquiries, visits and booking requests', body: <>
      <ul>
        <li>An enquiry asks RealtorX to contact you about a property.</li>
        <li>A site visit request asks for a visit on a day and time of day you choose; it becomes an appointment only when RealtorX confirms it with you.</li>
        <li>A booking request asks RealtorX to start booking a unit for you. While RealtorX reviews it, the unit may be held for you for a limited time; it is not a booking until the booking documents are signed and the first payment is received and verified.</li>
      </ul>
      <p>The details are in the <Go to="booking-policy" onNavigate={onNavigate}>Booking, Cancellation and Refund Policy</Go>.</p>
    </> },
    { id: 'payments', heading: 'Payments', body: <>
      <p>Pay only through the payment route stated in your booking documents and buyer statement. RealtorX Agents and RealtorX staff never ask you to pay into a personal account. If anyone does, do not pay and tell us at once.</p>
    </> },
    { id: 'use', heading: 'Using the website properly', body: <>
      <p>You must not:</p>
      <ul>
        <li>send false requests, use someone else&apos;s details, or request bookings you do not intend to make;</li>
        <li>copy listings, photos, plans, 3D models or data from the website in bulk, or use automated tools to do so;</li>
        <li>try to get into accounts, data or systems that are not yours, test our security without written permission, or disrupt the website;</li>
        <li>upload anything unlawful, misleading or harmful, or that breaks someone else&apos;s rights.</li>
      </ul>
    </> },
    { id: 'ip', heading: 'Content and trademarks', body: <>
      <p>The RealtorX name and logo, the website and its design, text, 3D models and software belong to RealtorX or the people who licensed them to RealtorX. Project names, logos, photos and plans belong to their developers. You may view and share listings for your own property search; any other use needs written permission.</p>
    </> },
    { id: 'links', heading: 'Other websites and services', body: <>
      <p>The website links to or shows content from other services, such as Google Maps, YouTube and WhatsApp. Their own terms and privacy policies apply to them, and RealtorX is not responsible for them.</p>
    </> },
    { id: 'liability', heading: 'Responsibility', body: <>
      <p>We work to keep the website accurate, available and secure, but we cannot promise that it will always be available or free of errors. As far as the law allows, RealtorX is not responsible for loss caused by relying on information on the website instead of your signed documents, by the website being unavailable, or by events outside our reasonable control. Nothing in these terms limits any right you have under law that cannot be limited.</p>
    </> },
    { id: 'changes', heading: 'Changes to these terms', body: <>
      <p>We may update these terms. The date at the top shows when they last changed. If a change is important we will also tell account holders by email or on the website. Using the website after a change means you accept the new terms.</p>
    </> },
    { id: 'law', heading: 'Law and disputes', body: <>
      <p>These terms are governed by the laws of Pakistan. We will first try to resolve any problem through our <Go to="complaints" onNavigate={onNavigate}>Complaints Policy</Go>. If it cannot be resolved, the courts at Karachi have jurisdiction.</p>
    </> },
  ];
  return <Layout eyebrow="Terms" title="Terms of Use" onNavigate={onNavigate} sections={sections}
    intro={<p>The rules for using the RealtorX website and your RealtorX buyer account.</p>} />;
}

// ── Privacy Policy ────────────────────────────────────────────────────────

export function PrivacyPage({ onNavigate }: { onNavigate: Nav }) {
  const sections: Section[] = [
    { id: 'who', heading: 'Who we are', body: <>
      <p>RealtorX ({SITE.address}) decides how and why the personal information described here is used. You can reach us about privacy at <Mail />.</p>
    </> },
    { id: 'collect', heading: 'What we collect', body: <>
      <ul>
        <li><b>Buyer account:</b> your name, email address, mobile number (with its country code) and password. The password is stored only in a protected (hashed) form that no one at RealtorX can read.</li>
        <li><b>Requests:</b> the property or project, your message, the visit date and time of day you choose, your agreement to be contacted, and the agent link or campaign link (such as UTM parameters) that brought you to us.</li>
        <li><b>Deals:</b> when you book, the booking documents, payment schedule, payments, receipts you upload and the records RealtorX keeps to verify them. You get a private statement link; we store only a scrambled form of its key.</li>
        <li><b>Client Services:</b> what you tell us about your property issue and any documents you send.</li>
        <li><b>Agent applicants and agents:</b> your details, experience and areas, ID number and ID photos, a photo and a short identity-check video, your bank details for payouts, and your activity in the Agent dashboard.</li>
        <li><b>Developers:</b> company and contact details, signatories, contracts, bank details for buyer payments and the inventory you provide.</li>
        <li><b>Technical:</b> the address your device connects from (IP address), browser and device details and the time of each request, kept in server logs and used to protect sign-in and forms against abuse. To pre-select your country for phone numbers we use the country our network provider reports for your connection or, if none, your device&apos;s time zone; this is not stored.</li>
      </ul>
    </> },
    { id: 'why', heading: 'Why we use it', body: <>
      <ul>
        <li>To run your account and answer your enquiries, visit requests and booking requests (to take steps you asked for before a contract).</li>
        <li>To prepare and manage bookings, payment schedules, statements, allotment, possession and transfer (to perform the contract with you).</li>
        <li>To verify the identity of agents, pay commissions, keep accounts and meet tax and legal duties (legal obligations).</li>
        <li>To keep the platform secure, prevent fraud and misuse, and improve our service and campaigns (our legitimate interests).</li>
        <li>To send you news about new projects only if you subscribe; you can unsubscribe at any time (your consent).</li>
      </ul>
      <p>We do not sell personal information.</p>
    </> },
    { id: 'share', heading: 'Who sees it', body: <>
      <ul>
        <li><b>RealtorX staff</b> see what their role needs.</li>
        <li><b>The RealtorX Agent</b> working with you sees your name, contact details and requests.</li>
        <li><b>The developer</b> of the unit you request or book receives what is needed for the booking and the sale.</li>
        <li><b>Service providers</b> who host and run our systems, send our emails and messages, or provide maps and video, under agreements that let them use the information only for us.</li>
        <li><b>Authorities</b> when the law requires it, or to protect people and property against fraud.</li>
      </ul>
      <p>Phone numbers and email addresses are never published on the website. Agent ID documents and identity videos are seen only by the RealtorX verification team.</p>
    </> },
    { id: 'abroad', heading: 'Information stored abroad', body: <>
      <p>Some of our service providers may store or process information outside Pakistan. When they do, we use providers that protect it to a standard comparable to this policy.</p>
    </> },
    { id: 'keep', heading: 'How long we keep it', body: <>
      <p>We keep information only for as long as we need it for the purposes above. Records of deals, payments and commissions are kept for as long as tax, accounting and property laws require. Enquiries that do not lead to a deal, and applications that are not approved, are deleted or anonymised when they are no longer needed. You can ask us to close your account at any time.</p>
    </> },
    { id: 'security', heading: 'Security', body: <>
      <p>Passwords are stored in hashed form; ID documents, receipts and identity videos are stored privately and are not available on the public website; sign-in and forms are protected against repeated attempts; and staff access depends on their role. No system is completely secure, so please keep your password private and tell us at once if you suspect misuse.</p>
    </> },
    { id: 'rights', heading: 'Your rights', body: <>
      <p>You can ask to see the information we hold about you, to correct it, to delete it, or to stop or limit how we use it. You can correct your name and mobile number yourself in My account. To make a request, email <Mail /> from the address on your account; we may ask you to confirm your identity and will answer within 30 days. We may have to keep some records when the law requires it.</p>
    </> },
    { id: 'children', heading: 'Children', body: <>
      <p>The website is not intended for anyone under 18, and we do not knowingly collect their information.</p>
    </> },
    { id: 'cookies', heading: 'Cookies', body: <>
      <p>See the <Go to="cookies" onNavigate={onNavigate}>Cookie Policy</Go>.</p>
    </> },
    { id: 'changes', heading: 'Changes', body: <>
      <p>We will update this policy when our use of information changes. The date at the top shows the latest version; important changes are also announced to account holders.</p>
    </> },
  ];
  return <Layout eyebrow="Privacy" title="Privacy Policy" onNavigate={onNavigate} sections={sections}
    intro={<p>What personal information RealtorX collects, why, who sees it, how long we keep it and the choices you have.</p>} />;
}

// ── Cookie Policy ─────────────────────────────────────────────────────────

export function CookiePage({ onNavigate }: { onNavigate: Nav }) {
  const row = (name: string, purpose: string, kept: string) => (
    <tr className="border-b border-line align-top"><td className="py-3 pr-4 font-mono text-[13px] text-fg">{name}</td><td className="py-3 pr-4">{purpose}</td><td className="py-3">{kept}</td></tr>
  );
  const sections: Section[] = [
    { id: 'what', heading: 'What cookies are', body: <>
      <p>Cookies are small files a website stores in your browser. Websites can also keep small amounts of information in your browser&apos;s storage. RealtorX uses only what is needed for the website to work. We do not use advertising cookies, and we do not sell information collected through cookies.</p>
    </> },
    { id: 'ours', heading: 'Cookies RealtorX sets', body: <>
      <p>When you are not signed in, RealtorX sets no account cookies. When you sign in (as a buyer, agent, applicant or developer):</p>
      <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-[14px]"><thead className="text-[12px] text-fg-3"><tr className="border-b border-line"><th className="py-2 pr-4 font-normal">Name</th><th className="py-2 pr-4 font-normal">Purpose</th><th className="py-2 font-normal">Kept</th></tr></thead><tbody>
        {row('sid', 'Keeps you signed in and protects forms against cross-site requests.', 'Until you sign out or the session ends')}
        {row('user_id, full_name, system_user, user_image', 'Show who is signed in and which pages your account may open.', 'Same as the session')}
      </tbody></table></div>
    </> },
    { id: 'storage', heading: 'Information kept in your browser', body: <>
      <ul>
        <li><b>Agent link:</b> if you arrive through a RealtorX Agent&apos;s link, the agent&apos;s ID is kept for that visit so your request reaches them.</li>
        <li><b>Agent application:</b> an unfinished application and the sign-in for My application are kept on your device so you can continue later.</li>
        <li><b>Dashboard language:</b> the language you choose in a dashboard.</li>
      </ul>
    </> },
    { id: 'others', heading: 'Other services', body: <>
      <p>Map previews are loaded from Google Maps and videos from YouTube when you open a listing or project that has them, and WhatsApp opens when you choose to message us. These services may set their own cookies under their own policies.</p>
    </> },
    { id: 'control', heading: 'Your choices', body: <>
      <p>You can delete or block cookies and stored information in your browser settings. If you block the session cookie you will not be able to sign in, and blocking Google Maps or YouTube hides maps and videos.</p>
      <p>More about personal information is in the <Go to="privacy" onNavigate={onNavigate}>Privacy Policy</Go>.</p>
    </> },
  ];
  return <Layout eyebrow="Cookies" title="Cookie Policy" onNavigate={onNavigate} sections={sections}
    intro={<p>The cookies and browser storage the RealtorX website uses, and how to control them.</p>} />;
}

// ── Booking, Cancellation and Refund Policy ──────────────────────────────

export function BookingPolicyPage({ onNavigate }: { onNavigate: Nav }) {
  const sections: Section[] = [
    { id: 'visits', heading: 'Site visit requests', body: <>
      <p>Choose a day and a time of day and RealtorX calls you to confirm an appointment. A request is not an appointment until we confirm it. Please bring your CNIC (or passport) to the site office. Visits are free. If you cannot come, tell us or your agent so the slot can be given to someone else.</p>
    </> },
    { id: 'requests', heading: 'Booking requests and unit holds', body: <>
      <ul>
        <li>You can request a booking for a unit shown as Available. The request is free.</li>
        <li>While RealtorX reviews the request with the developer, the unit is held for you for up to 48 hours and is shown as Reserved to other buyers.</li>
        <li>RealtorX calls you before anything is paid, explains the price, the payment plan and the documents, and checks the details with you.</li>
        <li>If the request is not taken forward within the hold time, or is declined or withdrawn, the hold ends and the unit becomes available again. A request does not oblige you or the developer to complete a booking.</li>
        <li>Holding units without a real intention to buy may lead to the account being closed.</li>
      </ul>
    </> },
    { id: 'booking', heading: 'When a booking is made', body: <>
      <p>A unit is booked for you only when the booking form is signed and the booking payment is received and verified. The price, the payment plan, the schedule and the cancellation terms for your unit are those in your signed booking documents. After booking you receive a private statement link that shows your schedule, the payments verified and what is still due.</p>
    </> },
    { id: 'pay', heading: 'Paying safely', body: <>
      <ul>
        <li>Pay only by bank transfer, cheque or pay order to the account named in your booking documents and statement.</li>
        <li>Never pay cash to anyone, and never pay into the personal account of an agent or a member of staff. RealtorX Agents never collect payments.</li>
        <li>Upload or send the receipt for every payment; RealtorX verifies it and it appears on your statement.</li>
        <li>If someone asks you to pay in any other way, do not pay and tell us at <Mail /> or on WhatsApp {SITE.phoneDisplay}.</li>
      </ul>
    </> },
    { id: 'late', heading: 'Instalments', body: <>
      <p>Your statement and reminders show each instalment and its due date. Late or missed instalments are handled under the terms of your booking documents, which may include late payment charges and, after notice, cancellation of the booking. If you expect a problem, talk to us early: we will try to agree a solution with the developer.</p>
    </> },
    { id: 'cancel', heading: 'Cancelling a booking', body: <>
      <ul>
        <li>To cancel, send a written request to RealtorX with your booking reference.</li>
        <li>The amount refunded and any deduction are set by the cancellation terms in your booking documents, which follow the developer&apos;s contract with RealtorX.</li>
        <li>A booking cancelled by the developer for a reason that is not your fault is refunded in full, as set out in your booking documents.</li>
        <li>Possession, allotment and transfer fees and government charges that have already been paid to third parties may not be refundable.</li>
      </ul>
    </> },
    { id: 'refund', heading: 'How refunds are paid', body: <>
      <p>An approved refund is paid by bank transfer to the buyer named on the booking, to an account in that buyer&apos;s name. RealtorX tells you the amount, the deduction (if any) and the expected date in writing. Refunds are usually paid within 30 working days of approval, or within the time stated in your booking documents. You can follow the refund on your statement.</p>
    </> },
    { id: 'transfer', heading: 'Transferring a unit', body: <>
      <p>If you want to sell or transfer a booked unit to someone else before possession, contact RealtorX. Transfers need the developer&apos;s approval and follow its transfer procedure and fees.</p>
    </> },
    { id: 'help', heading: 'Questions and complaints', body: <>
      <p>Your agent and RealtorX are there to help at every step. If something goes wrong, use the <Go to="complaints" onNavigate={onNavigate}>Complaints Policy</Go>.</p>
    </> },
  ];
  return <Layout eyebrow="Bookings" title="Booking, Cancellation and Refund Policy" onNavigate={onNavigate} sections={sections}
    intro={<p>How site visits, booking requests, unit holds, payments, cancellations and refunds work on RealtorX.</p>} />;
}

// ── RealtorX Agent Terms ──────────────────────────────────────────────────

export function AgentTermsPage({ onNavigate }: { onNavigate: Nav }) {
  const sections: Section[] = [
    { id: 'scope', heading: 'Scope', body: <>
      <p>These terms apply to anyone who applies to become, or works as, a RealtorX Agent. Approved agents also sign the RealtorX Agent Agreement; where it says something different, the Agreement applies.</p>
    </> },
    { id: 'apply', heading: 'Applying', body: <>
      <ul>
        <li>You apply online with your details, verify your email, upload your ID and a photo, and record a short identity-check video.</li>
        <li>Everything you provide must be true and your own. A false or borrowed identity ends the application and may be reported.</li>
        <li>RealtorX reviews every application, may call you for a short interview, and may approve or decline it. You can follow it on My application.</li>
      </ul>
    </> },
    { id: 'status', heading: 'Your status', body: <>
      <p>A RealtorX Agent is an independent professional, not an employee, partner or legal representative of RealtorX, and may not sign or promise anything in RealtorX&apos;s or a developer&apos;s name except as RealtorX authorises in writing.</p>
    </> },
    { id: 'dashboard', heading: 'Your Agent dashboard', body: <>
      <p>RealtorX gives you your Agent ID and your dashboard password. Keep the password private; only RealtorX can issue a new one. The dashboard shows inventory to sell, share links that record buyers as yours, your buyers, deals and earnings.</p>
    </> },
    { id: 'conduct', heading: 'How agents work', body: <>
      <ul>
        <li>Sell only units listed by RealtorX, at RealtorX&apos;s prices and payment plans, and describe them honestly.</li>
        <li>Never take payments from buyers, in cash or into any account; buyers pay only through the official payment route.</li>
        <li>Do not offer discounts, gifts or terms that RealtorX has not approved.</li>
        <li>Keep buyers&apos; information private and use it only for their purchase.</li>
        <li>Register your buyers through your share links or your dashboard, and do not try to deal with a developer directly for a buyer introduced through RealtorX.</li>
        <li>Follow the law, including the rules on advertising and on money laundering.</li>
      </ul>
    </> },
    { id: 'commission', heading: 'Commission', body: <>
      <p>Commission is agreed separately for each project. Your share, when it is earned and when it is paid are set out in your RealtorX Agent Agreement and shown in your dashboard. Commission is paid to your bank account in your name after RealtorX receives the commission for the sale, less any tax the law requires RealtorX to withhold.</p>
    </> },
    { id: 'privacy', heading: 'Your information', body: <>
      <p>Your ID documents and identity video are used only to verify you and are seen only by the RealtorX verification team. See the <Go to="privacy" onNavigate={onNavigate}>Privacy Policy</Go>.</p>
    </> },
    { id: 'end', heading: 'Suspension and ending', body: <>
      <p>RealtorX may suspend or end an agent&apos;s access for breaking these terms or the Agent Agreement, for misconduct with buyers, or for false information. You can stop working with RealtorX at any time by telling us in writing. Commission earned on sales completed before the end is paid under the Agent Agreement.</p>
    </> },
  ];
  return <Layout eyebrow="Agents" title="RealtorX Agent Terms" onNavigate={onNavigate} sections={sections}
    intro={<p>The terms for applying as, and working as, a RealtorX Agent.</p>} />;
}

// ── Developer Partner Terms ───────────────────────────────────────────────

export function DeveloperTermsPage({ onNavigate }: { onNavigate: Nav }) {
  const sections: Section[] = [
    { id: 'scope', heading: 'Scope', body: <>
      <p>These terms describe how developers work with RealtorX. Each developer also signs a contract with RealtorX; the contract sets the commercial terms and, where it says something different, it applies.</p>
    </> },
    { id: 'contract', heading: 'The contract', body: <>
      <p>Before any unit is listed, the developer and RealtorX agree in writing the projects covered, the commission for each project, when it is earned and who pays it, how buyer payments flow, cancellation terms and the developer&apos;s bank account for buyer payments.</p>
    </> },
    { id: 'listings', heading: 'Listings and inventory', body: <>
      <ul>
        <li>The developer provides accurate units, prices, payment plans, plans, photos and approvals, and keeps availability up to date.</li>
        <li>RealtorX checks inventory before it goes live and may decline or remove a listing that is inaccurate or not approved.</li>
        <li>The developer confirms it has the rights to the material it provides and lets RealtorX use it, including in 3D models made from it, to market the project.</li>
      </ul>
    </> },
    { id: 'sales', heading: 'Sales and buyer payments', body: <>
      <p>RealtorX and its agents present units, take booking requests and prepare bookings. Buyer payments follow the route in the contract and are recorded against each buyer&apos;s schedule. The developer confirms receipt of payments and honours bookings made at its published prices and plans.</p>
    </> },
    { id: 'dashboard', heading: 'Developer dashboard', body: <>
      <p>RealtorX issues dashboard logins for the developer&apos;s team; passwords are set only by RealtorX. The dashboard shows projects, availability, reservations, collections and commission invoices.</p>
    </> },
    { id: 'commission', heading: 'Commission and invoices', body: <>
      <p>Commission is charged at the rate agreed for each project in the contract and invoiced by RealtorX when it is earned. Invoices are payable within the period stated on them.</p>
    </> },
    { id: 'data', heading: 'Buyers’ information', body: <>
      <p>The developer uses buyers&apos; information only for their purchase and keeps it secure, and does not contact buyers introduced by RealtorX to sell outside RealtorX.</p>
    </> },
    { id: 'end', heading: 'Ending', body: <>
      <p>Ending the contract does not affect bookings already made or commission already earned; those continue under the contract. See also the <Go to="terms" onNavigate={onNavigate}>Terms of Use</Go>.</p>
    </> },
  ];
  return <Layout eyebrow="Developers" title="Developer Partner Terms" onNavigate={onNavigate} sections={sections}
    intro={<p>The terms on which developers list and sell their projects through RealtorX.</p>} />;
}

// ── Disclaimer ────────────────────────────────────────────────────────────

export function DisclaimerPage({ onNavigate }: { onNavigate: Nav }) {
  const sections: Section[] = [
    { id: 'listings', heading: 'Listings', body: <>
      <p>Prices, sizes, availability, amenities and completion dates come from the developer and can change. Sizes may be rounded. The binding terms are only those in your signed booking documents.</p>
    </> },
    { id: 'images', heading: 'Photos, renders, plans and 3D models', body: <>
      <p>Renders, floor plans and 3D models, including the 3D buildings and furnished apartments on RealtorX, are illustrations. Finishes, furniture, colours, views, landscaping and surroundings may differ from what is built. A unit may be a mirror image of the plan shown.</p>
    </> },
    { id: 'tools', heading: 'Payment plans and calculators', body: <>
      <p>Payment plan tables, instalment amounts and calculators are estimates for guidance. Your actual schedule is the one in your booking documents and your statement.</p>
    </> },
    { id: 'checked', heading: '"Checked by RealtorX"', body: <>
      <p>It means the developer is under contract with RealtorX and the listing was reviewed before going live. It is not a guarantee of the project&apos;s approvals, title, construction or completion; you should review the project documents yourself or with your adviser.</p>
    </> },
    { id: 'advice', heading: 'No financial or legal advice', body: <>
      <p>Information on the website, including about expected returns, rental income or price increases, is general and is not financial, legal or tax advice. Property values can go down as well as up.</p>
    </> },
    { id: 'more', heading: 'More', body: <>
      <p>See the <Go to="terms" onNavigate={onNavigate}>Terms of Use</Go> and the <Go to="booking-policy" onNavigate={onNavigate}>Booking, Cancellation and Refund Policy</Go>.</p>
    </> },
  ];
  return <Layout eyebrow="Disclaimer" title="Disclaimer" onNavigate={onNavigate} sections={sections}
    intro={<p>What listings, images, 3D models and tools on RealtorX promise, and what they do not.</p>} />;
}

// ── Complaints Policy ─────────────────────────────────────────────────────

export function ComplaintsPage({ onNavigate }: { onNavigate: Nav }) {
  const sections: Section[] = [
    { id: 'how', heading: 'How to complain', body: <>
      <p>Email <Mail />, message us on WhatsApp {SITE.phoneDisplay}, or use the <Go to="contact" onNavigate={onNavigate}>contact form</Go>. Please include your name, your booking or request reference if you have one, what happened and what you would like us to do, with any documents.</p>
    </> },
    { id: 'when', heading: 'What happens next', body: <>
      <ul>
        <li>We confirm that we received your complaint within 2 working days and tell you who is handling it.</li>
        <li>We aim to give you a full answer within 15 working days. If we need longer, for example because we need the developer&apos;s answer, we tell you why and when to expect it.</li>
        <li>Complaints about an agent are handled by the RealtorX agent team, independently of the agent.</li>
      </ul>
    </> },
    { id: 'escalate', heading: 'If you are not satisfied', body: <>
      <p>Ask for your complaint to be reviewed by RealtorX management by replying to our answer. Management reviews it and gives you a final answer within 10 working days. You keep any right you have to go to the relevant authority or court.</p>
    </> },
    { id: 'fraud', heading: 'Urgent: payment fraud', body: <>
      <p>If someone has asked you to pay into a personal account or claims to act for RealtorX without proof, contact us at once and do not pay. See <Go to="booking-policy" onNavigate={onNavigate}>Paying safely</Go>.</p>
    </> },
  ];
  return <Layout eyebrow="Complaints" title="Complaints Policy" onNavigate={onNavigate} sections={sections}
    intro={<p>How to raise a complaint with RealtorX and how and when we answer it.</p>} />;
}
