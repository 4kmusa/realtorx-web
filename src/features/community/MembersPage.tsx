// Member directory (/members[/<member>]): verified, oath-bound members. No phone numbers or emails;
// people reach a member through RealtorX (listings, Solution Desk or the contact page).
import React, { useEffect, useState } from 'react';
import { ArrowLeft, BadgeCheck, Building2, Search, Users } from 'lucide-react';
import { PageId } from '../../types';
import { callGet } from '../../services/api/client';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { imageUrl } from '../marketplace/api';

type Nav = (page: PageId, id?: string) => void;

interface PublicMember {
  name: string;
  member_id: string | null;
  full_name: string;
  firm_name: string | null;
  member_type: string;
  city: string | null;
  membership_tier: string | null;
  oath_date: string | null;
  approved_on: string | null;
  bio: string | null;
  areas_served: string | null;
  specialization: string | null;
  experience_years: number | null;
  website: string | null;
  profile_image: string | null;
  performance: { live_listings: number; leads_received: number; deals_closed: number; events_attended: number } | null;
}

const TYPES = ['Realtor', 'Agency', 'Developer', 'Investor', 'Solution Partner'];

function Avatar({ m, size = 'h-14 w-14 text-lg' }: { m: PublicMember; size?: string }) {
  const src = imageUrl(m.profile_image);
  return src ? (
    <img src={src} alt="" className={`${size} shrink-0 rounded-full object-cover`} />
  ) : (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-full bg-[#F5A623]/15 font-bold text-[#F5A623]`}>{m.full_name.charAt(0)}</span>
  );
}

export default function MembersPage({ memberId, onNavigate }: { memberId: string | null; onNavigate: Nav }) {
  const [rows, setRows] = useState<PublicMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState('');
  const [query, setQuery] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setError(null);
      callGet<PublicMember[]>('realtor_x.api.v1.get_public_members', { member_type: type || undefined, search: query || undefined })
        .then(setRows)
        .catch((e) => setError(e?.message || 'Could not load members.'));
    }, 250);
    return () => clearTimeout(t);
  }, [type, query, tick]);

  if (memberId) return <MemberProfile memberId={memberId} onNavigate={onNavigate} />;

  return (
    <div className="min-h-screen bg-[#0B1A30] pb-16">
      <section className="border-b border-white/[0.06] bg-gradient-to-b from-[#081221] to-[#0B1A30]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Member directory</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">Every member here is verified by RealtorX and has taken the RealtorX Oath.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <label htmlFor="mem-q" className="sr-only">Search members</label>
              <input id="mem-q" value={query} onChange={(e) => setQuery(e.target.value)} maxLength={100} placeholder="Name, agency, area or member ID"
                className="w-full rounded-lg border border-white/10 bg-[#081221] py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-[#F5A623]/60 focus:outline-none" />
            </div>
            <div className="flex flex-wrap gap-2">
              {['', ...TYPES].map((t) => (
                <button key={t || 'all'} onClick={() => setType(t)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${type === t ? 'border-[#F5A623] bg-[#F5A623]/15 text-[#F5A623]' : 'border-white/10 text-slate-300 hover:text-white'}`}>
                  {t || 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {error ? (
          <ErrorState message={error} onRetry={() => setTick((t) => t + 1)} />
        ) : !rows ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Users} title="No members found" description="Try another name or type." actionLabel="Become a member" onAction={() => onNavigate('join')} />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((m) => (
              <li key={m.name}>
                <button onClick={() => onNavigate('members', m.member_id || m.name)} className="flex h-full w-full flex-col rounded-2xl border border-white/10 bg-[#081221] p-5 text-left hover:border-[#F5A623]/40">
                  <span className="flex items-center gap-3">
                    <Avatar m={m} />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1 truncate font-semibold text-white">{m.full_name} <BadgeCheck className="h-4 w-4 shrink-0 text-[#F5A623]" /></span>
                      <span className="block truncate text-xs text-slate-400">{[m.member_type, m.firm_name, m.city].filter(Boolean).join(' · ')}</span>
                      {m.member_id && <span className="font-mono text-[11px] text-[#F5A623]">{m.member_id}</span>}
                    </span>
                  </span>
                  {m.areas_served && <span className="mt-3 line-clamp-2 text-xs text-slate-400">Areas: {m.areas_served}</span>}
                  {m.performance && (
                    <span className="mt-auto flex gap-4 pt-4 text-xs text-slate-300">
                      <span><b className="text-white">{m.performance.live_listings}</b> live listings</span>
                      <span><b className="text-white">{m.performance.deals_closed}</b> deals closed</span>
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function MemberProfile({ memberId, onNavigate }: { memberId: string; onNavigate: Nav }) {
  const [m, setM] = useState<PublicMember | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    callGet<PublicMember>('realtor_x.api.v1.get_public_member', { member: memberId })
      .then((r) => {
        setM(r);
        document.title = `${r.full_name} | RealtorX member`;
      })
      .catch((e) => setError(e?.status === 404 ? 'This member was not found.' : e?.message || 'Could not load the member.'));
  }, [memberId]);
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-6">
      <button onClick={() => onNavigate('members')} className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> All members</button>
      {error ? <ErrorState message={error} /> : !m ? <Skeleton className="h-72 rounded-2xl" /> : (
        <div className="rounded-2xl border border-white/10 bg-[#081221] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar m={m} size="h-20 w-20 text-2xl" />
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-white">{m.full_name} <BadgeCheck className="h-5 w-5 text-[#F5A623]" /></h1>
              <p className="text-sm text-slate-400">{[m.member_type, m.firm_name, m.city].filter(Boolean).join(' · ')}</p>
              <p className="mt-1 font-mono text-sm text-[#F5A623]">{m.member_id}</p>
            </div>
          </div>
          {m.bio && <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-slate-300">{m.bio}</p>}
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            {[
              ['Areas served', m.areas_served], ['Specialization', m.specialization],
              ['Experience', m.experience_years ? `${m.experience_years} years` : null], ['Oath taken', m.oath_date],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k as string}><dt className="text-xs text-slate-500">{k}</dt><dd className="text-white">{v}</dd></div>
            ))}
          </dl>
          {m.performance && (
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[['Live listings', m.performance.live_listings], ['Deals closed', m.performance.deals_closed], ['Events attended', m.performance.events_attended]].map(([k, v]) => (
                <div key={k as string} className="rounded-xl bg-white/5 p-3"><p className="text-2xl font-bold text-white">{v}</p><p className="text-xs text-slate-400">{k}</p></div>
              ))}
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {(m.member_type === 'Realtor' || m.member_type === 'Agency') && (
              <button onClick={() => onNavigate('properties')} className="flex items-center gap-2 rounded-xl bg-[#F5A623] px-5 py-2.5 text-sm font-bold text-slate-950"><Building2 className="h-4 w-4" /> Browse listings</button>
            )}
            <button onClick={() => onNavigate('contact')} className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/5">Ask RealtorX to connect you</button>
          </div>
          <p className="mt-4 text-xs text-slate-500">RealtorX does not publish members&apos; phone numbers or emails.</p>
        </div>
      )}
    </div>
  );
}
