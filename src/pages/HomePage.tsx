// Home (/): what RealtorX is, live inventory, how a deal runs from booking to the keys, and who we work with.
// Everything listed comes from the live system; nothing is shown when there is nothing to show.
import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, MapPin, Search } from 'lucide-react';
import { PageId, Language } from '../types';
import InquiryModal from '../components/InquiryModal';
import { ListingCard } from '../features/marketplace/ListingCard';
import { PublicListing, getFeatured, searchListings } from '../features/marketplace/api';
import { PublicProject, getProjects, projectStage } from '../features/projects/api';
import { imageUrl } from '../features/marketplace/api';
import { callGet } from '../services/api/client';
import { PageLink } from '../components/site/PageLink';
import { Button, ButtonLink, Container, Eyebrow, Section, SectionHeader, TextLink, XMark, useReveal } from '../components/site/ui';
import { SITE, whatsappUrl } from '../config/site';
import { CountUp, Words, useScrollProgress } from '../components/site/motion';

type Nav = (page: PageId, id?: string) => void;

const JOURNEY: { stage: string; text: string }[] = [
  { stage: 'Reserved', text: 'Your unit is held for you while the booking is prepared.' },
  { stage: 'Booked', text: 'Booking form signed, first payment received and checked.' },
  { stage: 'Down payment', text: 'Paid to the developer’s account and verified by RealtorX.' },
  { stage: 'Allotment', text: 'Your allotment letter is issued for the exact unit.' },
  { stage: 'Installments', text: 'A clear schedule, reminders, and a receipt for every payment.' },
  { stage: 'Possession', text: 'Handover checked with you, unit by unit.' },
  { stage: 'Transferred', text: 'Ownership transferred into your name. Deal closed.' },
];

/** Live counts for the hero and the type / city tiles (realtor_x.api.v1.home_stats). */
interface HomeStats { units: number; projects: number; types: Record<string, number>; cities: { city: string; units: number }[] }

const TYPES: { key: string; title: string; img: string; query: string; unit: [string, string] }[] = [
  { key: 'apartments', title: 'Apartments', img: '/images/tile-apartment.webp', query: '?category=Flat,Penthouse', unit: ['apartment', 'apartments'] },
  { key: 'houses', title: 'Houses & villas', img: '/images/tile-villa.webp', query: '?category=House,Farm%20House', unit: ['home', 'homes'] },
  { key: 'plots', title: 'Plots', img: '/images/tile-plot.webp', query: '?group=Plots', unit: ['plot', 'plots'] },
  { key: 'commercial', title: 'Commercial', img: '/images/tile-commercial.webp', query: '?group=Commercial', unit: ['shop or office', 'shops & offices'] },
];
const CITY_CODES: Record<string, string> = { Karachi: 'KHI', Lahore: 'LHR', Islamabad: 'ISB', Rawalpindi: 'RWP', Peshawar: 'PEW', Multan: 'MUX', Faisalabad: 'LYP' };

const PROMISES: { title: string; text: string }[] = [
  { title: 'Only contracted developers', text: 'We list a project only after the developer has signed with RealtorX. Prices, plans and availability come straight from them, unit by unit.' },
  { title: 'Every rupee accounted for', text: 'Buyers pay into the developer’s account. RealtorX checks each payment against the schedule and gives you a statement you can open any time.' },
  { title: 'Clear at every stage', text: 'Every deal moves through the same stages, from reservation to transfer, and you can see where yours stands at any time.' },
];

export function HomePage({ onNavigate }: { onNavigate: Nav; language?: Language }) {
  const [purpose, setPurpose] = useState('Sell');
  const [location, setLocation] = useState('');
  const [listings, setListings] = useState<PublicListing[] | null>(null);
  const [projects, setProjects] = useState<PublicProject[] | null>(null);
  const [interest, setInterest] = useState<PublicListing | null>(null);
  const [stats, setStats] = useState<HomeStats | null>(null);
  useReveal([listings, projects, stats]);
  const journey = useRef<HTMLOListElement>(null);
  useScrollProgress(journey, (p) => {
    const el = journey.current;
    if (!el) return;
    el.style.setProperty('--p', String(p));
    el.querySelectorAll<HTMLElement>('.rx-stage').forEach((li, i) => li.classList.toggle('is-lit', p >= (i + 0.35) / JOURNEY.length));
  });

  useEffect(() => {
    // RealtorX's Featured Listings first, topped up from the mixed (recommended) order.
    Promise.all([getFeatured().catch(() => []), searchListings({ sort: 'recommended' }).then((r) => r.items).catch(() => [])])
      .then(([top, more]) => setListings([...top, ...more.filter((m) => !top.some((t) => t.name === m.name))].slice(0, 6)));
    getProjects().then(setProjects).catch(() => setProjects([]));
    callGet<HomeStats>('realtor_x.api.v1.home_stats').then(setStats).catch(() => setStats(null));
  }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ purpose });
    if (location.trim()) params.set('location', location.trim());
    onNavigate('properties', `?${params.toString()}`);
  };

  return (
    <div className="bg-ink">
      {/* ── Hero ── */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden">
        <img src="/images/apartment_bahria_heights_1790600970754.webp" alt="" className="rx-kenburns absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/35 to-ink" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/20 to-transparent" aria-hidden="true" />
        <div className="rx-hero-glow absolute inset-0" aria-hidden="true" />
        <Container className="relative pb-14 pt-36 md:pb-20">
          <Eyebrow className="mb-7 animate-fade text-fg-2">Verified developer homes · Pakistan</Eyebrow>
          <h1 className="max-w-4xl text-balance text-[46px] font-medium leading-[0.98] tracking-[-0.04em] text-fg sm:text-7xl lg:text-[96px]">
            <Words delay={60}>Property, <span className="em rx-grad">properly</span> handled.</Words>
          </h1>
          <p className="mt-7 max-w-xl animate-rise text-pretty text-base leading-relaxed text-fg-2 md:text-lg" style={{ animationDelay: '200ms' }}>
            RealtorX sells homes from developers under contract with us. Every unit checked, every payment verified, and one team running your deal from booking to the keys.
          </p>

          <form onSubmit={search} className="mt-10 flex max-w-2xl animate-rise flex-col gap-2 rounded-[22px] border border-line-2 bg-ink/70 p-2 backdrop-blur-xl sm:flex-row sm:items-center sm:rounded-full" style={{ animationDelay: '300ms' }}>
            <div className="flex shrink-0 rounded-full bg-white/[0.05] p-1" role="tablist" aria-label="Buy or rent">
              {[['Sell', 'Buy'], ['Rent', 'Rent']].map(([value, label]) => (
                <button key={value} type="button" role="tab" aria-selected={purpose === value} onClick={() => setPurpose(value)}
                  className={`h-9 flex-1 rounded-full px-5 text-sm transition-colors sm:flex-none ${purpose === value ? 'bg-fg text-ink' : 'text-fg-2 hover:text-fg'}`}>
                  {label}
                </button>
              ))}
            </div>
            <label className="flex min-w-0 flex-1 items-center gap-2 px-3">
              <MapPin className="h-4 w-4 shrink-0 text-fg-3" strokeWidth={1.5} />
              <span className="sr-only">City, area or project</span>
              <input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={140} placeholder="City, area or project"
                className="h-11 w-full bg-transparent text-[15px] text-fg placeholder:text-fg-3 outline-none" />
            </label>
            <Button type="submit" variant="gradient" className="magnetic h-11 px-6"><Search className="h-4 w-4" strokeWidth={1.75} /> Search</Button>
          </form>

          {/* Live numbers from the system (nothing shown until they arrive). */}
          {stats && stats.units > 0 && (
            <dl className="mt-6 grid max-w-2xl animate-rise grid-cols-3 divide-x divide-line overflow-hidden rounded-2xl border border-line bg-panel/60 backdrop-blur-md" style={{ animationDelay: '420ms' }}>
              {[[stats.units, stats.units === 1 ? 'verified unit live' : 'verified units live'], [stats.projects, stats.projects === 1 ? 'project under contract' : 'projects under contract'],
                [stats.cities.length, stats.cities.length === 1 ? 'city' : 'cities']].map(([n, label]) => (
                <div key={label as string} className="px-4 py-3.5 sm:px-5">
                  <dt className="sr-only">{label}</dt>
                  <dd className="text-2xl font-medium tracking-[-0.02em] text-fg sm:text-[28px]"><CountUp value={String(n)} /></dd>
                  <p className="mt-0.5 text-[12px] leading-snug text-fg-2">{label}</p>
                </div>
              ))}
            </dl>
          )}

          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[13px] text-fg-2">
            {['Contracted developers only', 'Identity-checked agents', 'Payments verified by RealtorX'].map((t, i) => (
              <li key={t} className="flex animate-fade items-center gap-2.5" style={{ animationDelay: `${400 + i * 100}ms` }}><XMark draw delay={450 + i * 100} className="h-2.5 w-2.5" /> {t}</li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── Browse by type and city ── */}
      <Section>
        <Container>
          <SectionHeader eyebrow="Browse" title={<>What are you <span className="em">looking</span> for?</>}
            action={<TextLink onClick={() => onNavigate('properties')}>All properties</TextLink>} />
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {TYPES.map((t, i) => {
              const n = stats?.types[t.key];
              return (
                <PageLink key={t.key} page="properties" id={t.query} onNavigate={onNavigate}
                  className="rx-tile reveal block aspect-[4/5] rounded-2xl bg-panel" style={{ transitionDelay: `${i * 70}ms` }}>
                  <img src={t.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/20 to-ink/95" aria-hidden="true" />
                  <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 md:inset-x-5 md:bottom-5">
                    <span>
                      <span className="block text-lg font-medium tracking-[-0.02em] text-fg md:text-2xl">{t.title}</span>
                      {n != null && <span className="mt-0.5 block text-[13px] text-fg-2">{n} {n === 1 ? t.unit[0] : t.unit[1]}</span>}
                    </span>
                    <span className="rx-arrow hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-fg backdrop-blur sm:flex"><ArrowUpRight className="h-4 w-4" /></span>
                  </span>
                </PageLink>
              );
            })}
          </div>
          {!!stats?.cities.length && (
            <div className="reveal mt-5 flex flex-wrap gap-2.5">
              {[...stats.cities].sort((a, b) => b.units - a.units).map((c) => (
                <PageLink key={c.city} page="properties" id={`?city=${encodeURIComponent(c.city)}`} onNavigate={onNavigate}
                  className="flex h-12 items-center gap-3 rounded-full border border-line bg-panel py-1.5 pl-1.5 pr-5 text-[14px] text-fg transition-colors hover:border-fg/30">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue to-flame text-[11px] font-semibold text-white">{CITY_CODES[c.city] || c.city.slice(0, 3).toUpperCase()}</span>
                  {c.city} <span className="text-fg-3">{c.units}</span>
                </PageLink>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* ── Available now ── */}
      {!!listings?.length && (
        <Section tone="ink-2">
          <Container>
            <SectionHeader eyebrow="Available now" title={<>Homes and plots, <span className="em">checked</span> before they go live.</>}
              action={<TextLink onClick={() => onNavigate('properties')}>All properties</TextLink>} />
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((item, i) => (
                <div key={item.name} className="reveal" style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                  <ListingCard item={item} featured={item.featured_badge !== undefined} onOpen={() => onNavigate('property-detail', item.name)} onInterest={() => setInterest(item)} />
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ── Journey ── */}
      <Section id="journey">
        <Container>
          <SectionHeader eyebrow="How a deal works" title={<>From booking to the keys, with <span className="em">one</span> accountable partner.</>}
            intro="Every RealtorX deal moves through the same seven stages. Nothing moves forward until the documents and payments for that stage are in and checked." />
          <ol ref={journey} className="relative grid grid-cols-1 gap-0 md:grid-cols-7">
            <span className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-line-2 md:left-0 md:top-[7px] md:h-px md:w-full" aria-hidden="true">
              <span className="rx-journey-fill absolute inset-0 bg-gradient-to-b from-blue to-flame md:bg-gradient-to-r" />
            </span>
            {JOURNEY.map((s, i) => (
              <li key={s.stage} className="rx-stage relative pb-10 pl-10 md:pb-0 md:pl-0 md:pr-6 md:pt-12">
                <span className="rx-dot absolute left-0 top-1 h-[15px] w-[15px] rounded-full border border-line-2 bg-ink md:top-0" aria-hidden="true">
                  <span className="rx-dot-core absolute inset-[4px] rounded-full" style={{ background: i < 3 ? 'var(--color-blue)' : i > 4 ? 'var(--color-flame)' : '#9b7cff' }} />
                </span>
                <p data-step className="text-[11px] font-medium tabular-nums tracking-[0.2em] text-fg-3">0{i + 1}</p>
                <div className="rx-stage-text">
                  <p className="mt-2 text-lg font-medium tracking-[-0.01em] text-fg">{s.stage}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-fg-2">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ── Projects: one large and two smaller tiles (a simple grid when there are fewer) ── */}
      {!!projects?.length && (
        <Section tone="ink-2" className="border-t border-line">
          <Container>
            <SectionHeader eyebrow="Projects" title={<>Projects <span className="em">now selling</span>.</>}
              action={<TextLink onClick={() => onNavigate('projects')}>All projects</TextLink>} />
            <div className={`grid grid-cols-1 gap-3 md:gap-4 ${projects.length >= 3 ? 'md:grid-cols-[1.4fr_1fr] md:grid-rows-[300px_300px]' : 'md:grid-cols-2'}`}>
              {projects.slice(0, 3).map((p, i) => {
                const big = i === 0 && projects.length >= 3;
                return (
                  <PageLink key={p.name} page="project-details" id={p.name} onNavigate={onNavigate}
                    className={`rx-tile reveal block rounded-2xl bg-panel ${big ? 'aspect-[4/3] md:row-span-2 md:aspect-auto' : 'aspect-[16/10] md:aspect-auto md:min-h-[300px]'}`}>
                    {p.cover_image && <img src={imageUrl(p.cover_image) || ''} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
                    <span className="absolute inset-0 bg-gradient-to-b from-ink/10 via-ink/25 to-ink/95" aria-hidden="true" />
                    <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/15 bg-ink/70 px-3 py-1 text-[11px] text-fg backdrop-blur">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{[projectStage(p.status), p.city].filter(Boolean).join(' · ')}
                    </span>
                    <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 md:inset-x-6 md:bottom-6">
                      <span className="min-w-0">
                        <span className={`block font-medium tracking-[-0.03em] text-fg ${big ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>{p.project_name}</span>
                        <span className="mt-1 block text-[13px] text-fg-2">
                          {[p.developer_name && `by ${p.developer_name}`, p.available_units ? `${p.available_units} ${p.available_units === 1 ? 'unit' : 'units'} available` : null].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <span className="rx-arrow flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-fg backdrop-blur"><ArrowUpRight className="h-4 w-4" /></span>
                    </span>
                  </PageLink>
                );
              })}
            </div>
          </Container>
        </Section>
      )}

      {/* ── Promises ── */}
      <Section>
        <Container>
          <SectionHeader eyebrow="What we promise" title={<>Three things we will <span className="em">never</span> compromise on.</>} />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            {PROMISES.map((p, i) => (
              <div key={p.title} className="rx-glow-card reveal spotlight rounded-2xl border border-line p-6 md:p-8" style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-blue/25 to-flame/25 font-serif text-xl italic text-fg">0{i + 1}</span>
                <h3 className="mt-6 text-xl font-medium tracking-[-0.015em] text-fg">{p.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-fg-2">{p.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── Agents and developers ── */}
      <Section tone="ink-2" className="!py-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {[
            { img: '/images/realtorx_hub_atrium_1790597209570.webp', eyebrow: 'For agents', title: <>Sell verified inventory with RealtorX <span className="em">behind</span> you.</>,
              text: 'Apply online with your ID and a short video. Once approved you get your own Agent ID, share links, a buyer pipeline and a clear record of every deal.', cta: 'Become an agent', page: 'become-agent' as PageId },
            { img: '/images/plot_precinct_bahria_1790600998798.webp', eyebrow: 'For developers', title: <>A sales force that <span className="em">answers</span> to you.</>,
              text: 'Sign with RealtorX and your units reach identity-checked agents across the city. You see every reservation, payment and handover in your own dashboard.', cta: 'Partner with RealtorX', page: 'developer-program' as PageId },
          ].map((b) => (
            <div key={b.eyebrow} className="group relative flex min-h-[560px] items-end overflow-hidden">
              <img src={b.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
              <div className="relative p-8 md:p-12 lg:p-16">
                <Eyebrow className="mb-5 text-fg-2">{b.eyebrow}</Eyebrow>
                <h3 className="max-w-md text-balance text-3xl font-medium leading-[1.1] tracking-[-0.03em] text-fg md:text-[40px]">{b.title}</h3>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-fg-2">{b.text}</p>
                <Button className="mt-8" arrow onClick={() => onNavigate(b.page)}>{b.cta}</Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Client services ── */}
      <Section>
        <Container>
          <div className="reveal grid grid-cols-1 items-end gap-10 border-y border-line py-14 md:grid-cols-[2fr_1fr]">
            <div>
              <Eyebrow className="mb-5">Client services</Eyebrow>
              <p className="max-w-2xl text-balance text-[26px] font-medium leading-[1.2] tracking-[-0.025em] text-fg md:text-4xl">
                Already own property? We help with resale, transfers, maintenance and investments that are <span className="em">stuck</span>.
              </p>
            </div>
            <div className="md:justify-self-end">
              <Button variant="secondary" arrow onClick={() => onNavigate('solutions')}>Ask for help</Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Talk to us ── */}
      <Section className="!pt-0">
        <Container>
          <div className="reveal spotlight relative overflow-hidden rounded-3xl border border-line bg-panel px-8 py-14 md:px-16 md:py-20">
            <div className="x-rule absolute inset-x-0 top-0" />
            <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="text-balance text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-fg md:text-[56px]"><Words onScroll>Talk to a RealtorX <span className="em">advisor</span>.</Words></h2>
                <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-fg-2">Tell us what you are looking for and your budget. We will come back with units that fit, the payment plan, and a time to visit.</p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <ButtonLink href={whatsappUrl()} target="_blank" rel="noreferrer" arrow>WhatsApp us</ButtonLink>
                <ButtonLink href={`tel:${SITE.phoneTel}`} variant="secondary">{SITE.phoneDisplay}</ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {interest && <InquiryModal propertyId={interest.name} propertyTitle={interest.property_title} onClose={() => setInterest(null)} />}
    </div>
  );
}

export default HomePage;
