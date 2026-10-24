// Become a RealtorX Agent (/become-an-agent): what the programme offers, how approval works, and the online
// application (email code with account, ID documents, selfie video, terms).
import React from 'react';
import { Loader2 } from 'lucide-react';
import { PageId } from '../types';
import { Container, Eyebrow, Section, SectionHeader, useReveal } from '../components/site/ui';
import { CountUp, Words } from '../components/site/motion';

type Nav = (page: PageId, id?: string) => void;

const AgentApplication = React.lazy(() => import('../features/agents/AgentApplication'));

const OFFER: { figure: string; title: string; text: string }[] = [
  { figure: '100%', title: 'checked inventory', text: 'Every unit comes from a developer under contract with RealtorX and is checked before it is listed.' },
  { figure: 'One', title: 'dashboard for your work', text: 'Inventory, payment plans, share links, your buyers and your deals, in your own Agent dashboard.' },
  { figure: '1', title: 'link that remembers your buyers', text: 'Share a unit with your Agent ID in the link. Buyers who enquire through it are recorded as yours and protected for you.' },
];

const STEPS: { title: string; text: string }[] = [
  { title: 'Apply online', text: 'Your details, experience and the areas you work in. About ten minutes.' },
  { title: 'Verify', text: 'An email code confirms your email; your ID and a 15-second video confirm it is you.' },
  { title: 'Review', text: 'The RealtorX team checks your application and may call you for a short video chat.' },
  { title: 'Start selling', text: 'RealtorX gives you your Agent dashboard password: inventory, share links, buyers and deals.' },
];

export default function BecomeAgentPage(_props: { onNavigate: Nav }) {
  useReveal();
  return (
    <div className="bg-ink">
      <header className="relative overflow-hidden border-b border-line">
        <img src="/images/realtorx_founding_ceremony_1790597198456.webp" alt="" className="rx-kenburns absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
        <Container className="relative pb-20 pt-16 md:pb-28 md:pt-24">
          <Eyebrow className="mb-6 text-fg-2">RealtorX Agent programme</Eyebrow>
          <h1 className="max-w-4xl text-balance text-[42px] font-medium leading-[1.0] tracking-[-0.035em] text-fg md:text-[76px]">
            <Words>Sell verified homes with RealtorX <span className="em">behind</span> you.</Words>
          </h1>
          <p className="mt-6 max-w-xl animate-rise text-base leading-relaxed text-fg-2 md:text-lg">
            Join as an identity-checked RealtorX Agent and sell inventory from developers under contract with RealtorX. Commission terms are explained when you are approved.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#apply" className="inline-flex h-[52px] items-center rounded-full bg-fg px-7 text-[15px] font-medium text-ink hover:bg-white">Apply now</a>
            <a href="/agent/" className="inline-flex h-[52px] items-center rounded-full border border-line-2 px-7 text-[15px] text-fg hover:bg-white/[0.04]">Agent sign in</a>
          </div>
        </Container>
      </header>

      <Section>
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
            {OFFER.map((o, i) => (
              <div key={o.title} className="reveal border-t border-line pt-8" style={{ transitionDelay: `${i * 80}ms` }}>
                <p className="text-[64px] font-medium leading-none tracking-[-0.05em] text-fg tabular-nums"><CountUp value={o.figure} /></p>
                <h2 className="mt-4 text-lg font-medium text-fg">{o.title}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-fg-2">{o.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="ink-2">
        <Container>
          <SectionHeader eyebrow="How approval works" title={<>From application to your first <span className="em">sale</span>.</>} />
          <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="reveal spotlight bg-ink-2 p-8" style={{ transitionDelay: `${i * 90}ms` }}>
                <p className="font-serif text-4xl italic text-fg-3">{i + 1}</p>
                <h3 className="mt-6 text-lg font-medium text-fg">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-fg-2">{s.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section id="apply" className="scroll-mt-20">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.25fr]">
            <div className="lg:sticky lg:top-28 lg:h-fit">
              <Eyebrow className="mb-5">Apply</Eyebrow>
              <h2 className="text-balance text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-fg md:text-5xl">Ten minutes, <span className="em">once</span>.</h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-fg-2">
                Keep your ID card and a phone or laptop camera ready. When you verify your email you choose a password for "My application", so you can stop at any point and continue later, on any device.
              </p>
              <ul className="mt-8 space-y-3 border-t border-line pt-6 text-[14px] text-fg-2">
                <li>Email verification and a password for following your application</li>
                <li>ID card photos, front and back</li>
                <li>A 15-second selfie video saying a code phrase</li>
              </ul>
              <p className="mt-8 text-[14px] text-fg-3">
                Already applied? <a href="/my-application" className="text-fg underline underline-offset-4">Follow your application</a>. Approved agents sign in to the <a href="/agent/" className="text-fg underline underline-offset-4">Agent dashboard</a>.
              </p>
            </div>
            <React.Suspense fallback={<div className="flex h-72 items-center justify-center rounded-3xl border border-line"><Loader2 className="h-5 w-5 animate-spin text-fg-3" /></div>}>
              <AgentApplication />
            </React.Suspense>
          </div>
        </Container>
      </Section>
    </div>
  );
}
