// Home (/): the RealtorX community at a glance. Every number shown comes from the live system.
import React, { useEffect, useState } from 'react';
import {
  ArrowRight, BadgeCheck, Building2, CalendarDays, ClipboardCheck, CreditCard, Handshake, LifeBuoy, MapPin, Search, ShieldCheck, UserPlus, Users,
} from 'lucide-react';
import { PageId, Language } from '../types';
import { useAuth } from '../context/AuthContext';
import { callGet } from '../services/api/client';
import InquiryModal from '../components/InquiryModal';
import { ListingCard } from '../features/marketplace/MarketplacePage';
import { PublicListing, searchListings } from '../features/marketplace/api';
import { HubEvent, formatWhen } from '../features/community/HubPage';
import { PHILOSOPHY } from '../features/membership/content';

type Nav = (page: PageId, id?: string) => void;

const PILLARS: { icon: React.ElementType; title: string; text: string; page: PageId; cta: string }[] = [
  { icon: Building2, title: 'Marketplace', text: 'Verified listings for sale and rent. No phone numbers on show: every buyer is handled by a RealtorX member realtor.', page: 'properties', cta: 'Browse properties' },
  { icon: Users, title: 'Membership', text: 'Realtors, agencies, developers, investors and solution partners, verified and bound by the RealtorX Oath.', page: 'join', cta: 'Become a member' },
  { icon: LifeBuoy, title: 'Solution Desk', text: 'Stuck investment, delayed project, merger or legal problem? A case manager takes it from submission to resolution.', page: 'solutions', cta: 'Submit a problem' },
  { icon: CalendarDays, title: 'RealtorX Hub', text: 'Meeting rooms, desks and developer pods for members, plus orientations, trainings and networking events.', page: 'hub', cta: 'See the Hub' },
];

const JOURNEY: { icon: React.ElementType; title: string; text: string }[] = [
  { icon: UserPlus, title: 'Apply', text: 'Tell us who you are: realtor, agency, developer, investor or partner.' },
  { icon: ClipboardCheck, title: 'Verification', text: 'The Community Team checks your identity and profile.' },
  { icon: Users, title: 'Orientation', text: 'Attend an orientation at the RealtorX Hub.' },
  { icon: ShieldCheck, title: 'The Oath', text: 'Read the Manifesto, accept the Code and take the Oath.' },
  { icon: CreditCard, title: 'Member ID', text: 'Receive your digital member card and community access.' },
];

export function HomePage({ onNavigate }: { onNavigate: Nav; language?: Language }) {
  const { user } = useAuth();
  const [purpose, setPurpose] = useState('Sell');
  const [location, setLocation] = useState('');
  const [latest, setLatest] = useState<PublicListing[]>([]);
  const [totals, setTotals] = useState<{ listings: number | null; members: number | null }>({ listings: null, members: null });
  const [events, setEvents] = useState<HubEvent[]>([]);
  const [interest, setInterest] = useState<PublicListing | null>(null);

  useEffect(() => {
    searchListings({ sort: 'newest' })
      .then((r) => {
        setLatest(r.items.slice(0, 6));
        setTotals((t) => ({ ...t, listings: r.total }));
      })
      .catch(() => setLatest([]));
    callGet<unknown[]>('realtor_x.api.v1.get_public_members')
      .then((rows) => setTotals((t) => ({ ...t, members: rows?.length ?? 0 })))
      .catch(() => undefined);
    callGet<HubEvent[]>('realtor_x.api.community.get_events').then((e) => setEvents((e || []).slice(0, 3))).catch(() => setEvents([]));
  }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ purpose });
    if (location.trim()) params.set('location', location.trim());
    window.history.pushState(null, '', `/properties?${params.toString()}`);
    onNavigate('properties');
  };

  return (
    <div className="bg-[#0B1A30]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src="/images/realtorx_hub_atrium_1790597209570.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A30]/60 via-[#0B1A30]/80 to-[#0B1A30]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5A623]">RealtorX · Connect. Collaborate. Grow.</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            The real estate community built on trust.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
            A verified marketplace, a community of oath-bound professionals, a desk that solves problems and a Hub where it all meets.
          </p>

          <form onSubmit={search} className="mt-8 max-w-3xl rounded-2xl border border-white/10 bg-[#081221]/90 p-3 shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex shrink-0 rounded-xl bg-white/5 p-1" role="tablist" aria-label="Purpose">
                {[['Sell', 'Buy'], ['Rent', 'Rent']].map(([value, label]) => (
                  <button key={value} type="button" role="tab" aria-selected={purpose === value} onClick={() => setPurpose(value)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${purpose === value ? 'bg-[#F5A623] text-slate-950' : 'text-slate-300'}`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="relative flex-1">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <label htmlFor="home-location" className="sr-only">Location</label>
                <input id="home-location" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={140}
                  placeholder="City, area or project"
                  className="w-full rounded-xl border border-white/10 bg-[#0B1A30] py-3 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-[#F5A623]/60 focus:outline-none" />
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-6 py-3 text-sm font-bold text-slate-950 hover:brightness-110">
                <Search className="h-4 w-4" /> Search
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => onNavigate(user?.member ? 'member' : 'join')} className="flex items-center gap-2 rounded-xl border border-[#F5A623]/50 bg-[#F5A623]/10 px-5 py-3 text-sm font-semibold text-[#F5A623] hover:bg-[#F5A623]/20">
              {user?.member ? 'My membership' : 'Join RealtorX'} <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => onNavigate('post-listing')} className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5">
              Post your property
            </button>
          </div>

          {(totals.listings !== null || totals.members !== null) && (
            <dl className="mt-12 grid max-w-xl grid-cols-2 gap-6">
              {totals.listings !== null && (
                <div><dt className="text-xs uppercase tracking-wider text-slate-400">Verified listings</dt><dd className="mt-1 text-3xl font-bold text-white">{totals.listings}</dd></div>
              )}
              {totals.members !== null && (
                <div><dt className="text-xs uppercase tracking-wider text-slate-400">Oath-bound members</dt><dd className="mt-1 text-3xl font-bold text-white">{totals.members}</dd></div>
              )}
            </dl>
          )}
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">One platform for the whole real estate ecosystem</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">RealtorX is not just a listing website. It is a community with its own marketplace, solutions and home.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, text, page, cta }) => (
            <button key={title} onClick={() => onNavigate(page)} className="group flex flex-col rounded-2xl border border-white/10 bg-[#081221] p-6 text-left transition-colors hover:border-[#F5A623]/40">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5A623]/10 text-[#F5A623]"><Icon className="h-5 w-5" /></span>
              <span className="mt-4 text-lg font-semibold text-white">{title}</span>
              <span className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{text}</span>
              <span className="mt-5 flex items-center gap-1 text-sm font-semibold text-[#F5A623]">{cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </button>
          ))}
        </div>
      </section>

      {/* Latest listings */}
      <section className="border-y border-white/[0.06] bg-[#081221]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Latest verified listings</h2>
              <p className="mt-2 text-sm text-slate-400">Checked by RealtorX before going live. Press &quot;I&apos;m interested&quot; and the realtor calls you.</p>
            </div>
            <button onClick={() => onNavigate('properties')} className="flex items-center gap-1 text-sm font-semibold text-[#F5A623] hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {latest.length ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((item) => (
                <ListingCard key={item.name} item={item} onOpen={() => onNavigate('property-detail', item.name)} onInterest={() => setInterest(item)} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-white/15 p-10 text-center">
              <p className="text-sm text-slate-400">New listings appear here as soon as RealtorX approves them.</p>
              <button onClick={() => onNavigate('post-listing')} className="mt-4 rounded-xl bg-[#F5A623] px-5 py-2.5 text-sm font-bold text-slate-950">Post the first property</button>
            </div>
          )}
        </div>
      </section>

      {/* How the marketplace works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">A marketplace with a realtor behind every listing</h2>
            <ol className="mt-6 space-y-4">
              {[
                ['Post', 'Owners, members and developers post with photos, videos and a map location.'],
                ['Verify', 'RealtorX checks documents, owner identity, price and photos before approval.'],
                ['Tag', 'Each listing is tagged to a RealtorX member realtor, chosen by the owner or by RealtorX.'],
                ['Connect', 'Buyers press "I\'m interested". Numbers stay private; the realtor calls back.'],
              ].map(([title, text], i) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5A623] text-sm font-bold text-slate-950">{i + 1}</span>
                  <span><span className="block font-semibold text-white">{title}</span><span className="text-sm text-slate-400">{text}</span></span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">The membership journey</h2>
            <ol className="mt-6 space-y-3">
              {JOURNEY.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-4 rounded-xl border border-white/10 bg-[#081221] p-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#F5A623]" />
                  <span><span className="block font-semibold text-white">{title}</span><span className="text-sm text-slate-400">{text}</span></span>
                </li>
              ))}
            </ol>
            <button onClick={() => onNavigate('join')} className="mt-5 rounded-xl bg-[#F5A623] px-5 py-3 text-sm font-bold text-slate-950 hover:brightness-110">Start your application</button>
          </div>
        </div>
      </section>

      {/* Developers + Solution Desk */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#13294a] to-[#081221] p-8">
          <Handshake className="h-8 w-8 text-[#F5A623]" />
          <h3 className="mt-4 text-xl font-bold text-white">Developer Program</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">Showcase projects and brochures, get assigned RealtorX realtors, a dedicated desk at the Hub and live buyer-interest numbers.</p>
          <button onClick={() => onNavigate('developer-program')} className="mt-5 flex items-center gap-1 text-sm font-semibold text-[#F5A623] hover:underline">Learn more <ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#13294a] to-[#081221] p-8">
          <LifeBuoy className="h-8 w-8 text-[#F5A623]" />
          <h3 className="mt-4 text-xl font-bold text-white">Problems deserve solutions</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">Allottees, investors and developers bring stuck files, delayed projects and disputes to the Solution Desk. A case manager follows each one to resolution.</p>
          <button onClick={() => onNavigate('solutions')} className="mt-5 flex items-center gap-1 text-sm font-semibold text-[#F5A623] hover:underline">Submit a problem <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>

      {/* Events */}
      {events.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-white">Upcoming at the Hub</h2>
            <button onClick={() => onNavigate('hub')} className="text-sm font-semibold text-[#F5A623] hover:underline">All events</button>
          </div>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {events.map((e) => (
              <li key={e.name} className="rounded-2xl border border-white/10 bg-[#081221] p-5">
                <span className="rounded bg-[#F5A623]/15 px-2 py-0.5 text-xs font-semibold text-[#F5A623]">{e.event_type}</span>
                <p className="mt-3 font-semibold text-white">{e.title}</p>
                <p className="mt-1 text-sm text-slate-400">{formatWhen(e.starts_on)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Philosophy */}
      <section className="relative overflow-hidden border-t border-white/[0.06]">
        <img src="/images/realtorx_engraved_wall_1790597184603.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <BadgeCheck className="mx-auto h-8 w-8 text-[#F5A623]" />
          <blockquote className="mt-6 text-2xl font-semibold leading-snug text-white sm:text-3xl">&ldquo;{PHILOSOPHY}&rdquo;</blockquote>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => onNavigate('manifesto')} className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/5">Read the Manifesto</button>
            <button onClick={() => onNavigate('code')} className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/5">The RealtorX Code</button>
          </div>
        </div>
      </section>

      {interest && <InquiryModal propertyId={interest.name} propertyTitle={interest.property_title} realtorName={interest.realtor?.name} onClose={() => setInterest(null)} />}
    </div>
  );
}

export default HomePage;
