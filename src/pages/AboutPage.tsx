// About (/about): what RealtorX is, how the model works and what we stand for.
import React from 'react';
import { PageId } from '../types';
import { Button, Container, Eyebrow, Section, SectionHeader, useReveal } from '../components/site/ui';

type Nav = (page: PageId, id?: string) => void;

const MODEL: { who: string; text: string }[] = [
  { who: 'Developers', text: 'sign a contract with RealtorX. Their inventory, prices and payment plans come to us, unit by unit.' },
  { who: 'RealtorX Agents', text: 'are independent realtors who applied and passed our identity check. They bring and look after buyers.' },
  { who: 'Buyers', text: 'choose from checked units, pay the developer directly and get a statement for every payment.' },
  { who: 'RealtorX', text: 'brings it together: contracts, checked listings, verified agents and one record of every deal.' },
];

const VALUES: [string, string][] = [
  ['Verified at every step', 'Developers are under contract, inventory is checked before it is listed and every agent is identity-verified.'],
  ['Every deal on record', 'Each deal is recorded from reservation to transfer, so nothing is lost between buyer, agent and developer.'],
  ['Open about money', 'Commission terms are written into the developer contract. Buyers see every payment they make and what is still due.'],
  ['Built to travel', 'One platform for several countries, currencies, languages and area units, starting in Pakistan.'],
];

export default function AboutPage({ onNavigate }: { onNavigate: Nav }) {
  useReveal();
  return (
    <div className="bg-ink">
      <header className="border-b border-line">
        <Container className="pb-16 pt-16 md:pb-24 md:pt-24">
          <Eyebrow className="mb-6">About RealtorX</Eyebrow>
          <h1 className="max-w-5xl animate-rise text-balance text-[40px] font-medium leading-[1.02] tracking-[-0.035em] text-fg md:text-[72px]">
            We take responsibility for the <span className="em">deal</span>, not just the listing.
          </h1>
          <p className="mt-7 max-w-2xl animate-rise text-base leading-relaxed text-fg-2 md:text-lg">
            Most property platforms stop at the introduction. RealtorX signs the developer, checks the inventory, sells it through verified agents and stays with the buyer until the keys and the transfer.
          </p>
        </Container>
        <Container className="pb-4">
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <div className="aspect-[16/9] overflow-hidden rounded-2xl"><img src="/images/realtorx_hub_atrium_1790597209570.webp" alt="" className="h-full w-full object-cover" /></div>
            <div className="hidden aspect-auto overflow-hidden rounded-2xl md:block"><img src="/images/realtorx_engraved_wall_1790597184603.webp" alt="" className="h-full w-full object-cover" /></div>
          </div>
        </Container>
      </header>

      <Section>
        <Container>
          <SectionHeader eyebrow="How it works" title={<>Four parties, <span className="em">one</span> accountable team.</>} />
          <dl className="border-t border-line">
            {MODEL.map((m) => (
              <div key={m.who} className="reveal grid gap-2 border-b border-line py-8 md:grid-cols-[1fr_2fr] md:gap-10">
                <dt className="text-2xl font-medium tracking-[-0.02em] text-fg">{m.who}</dt>
                <dd className="text-[17px] leading-relaxed text-fg-2">{m.text}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section tone="ink-2">
        <Container>
          <SectionHeader eyebrow="What we stand for" title={<>Principles we <span className="em">work</span> by.</>} />
          <div className="grid gap-x-10 gap-y-12 md:grid-cols-2">
            {VALUES.map(([title, text], i) => (
              <div key={title} className="reveal border-t border-line pt-7">
                <p className="font-serif text-4xl italic text-fg-3">0{i + 1}</p>
                <h3 className="mt-5 text-xl font-medium text-fg">{title}</h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-fg-2">{text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-col items-start justify-between gap-8 border-y border-line py-14 md:flex-row md:items-end">
            <h2 className="max-w-xl text-balance text-3xl font-medium leading-[1.1] tracking-[-0.03em] text-fg md:text-[44px]">Ready when you <span className="em">are</span>.</h2>
            <div className="flex flex-wrap gap-3">
              <Button arrow onClick={() => onNavigate('properties')}>Browse properties</Button>
              <Button variant="secondary" onClick={() => onNavigate('become-agent')}>Become an agent</Button>
              <Button variant="secondary" onClick={() => onNavigate('developer-program')}>For developers</Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
