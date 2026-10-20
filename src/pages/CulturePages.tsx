// The founding texts of RealtorX (owner-provided): Manifesto, Code and About.
import React from 'react';
import { ArrowRight, BadgeCheck, Handshake, LifeBuoy, ScrollText, ShieldCheck, Users } from 'lucide-react';
import { PageId } from '../types';
import { CODE, MANIFESTO, OATH, PHILOSOPHY } from '../features/membership/content';

type Nav = (page: PageId, id?: string) => void;

function Hero({ eyebrow, title, image }: { eyebrow: string; title: string; image: string }) {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06]">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A30]/70 to-[#0B1A30]" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5A623]">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">{title}</h1>
      </div>
    </section>
  );
}

function JoinCta({ onNavigate }: { onNavigate: Nav }) {
  return (
    <div className="mt-14 rounded-2xl border border-[#F5A623]/30 bg-[#F5A623]/5 p-8 text-center">
      <p className="text-lg font-semibold text-white">Ready to become a custodian of the RealtorX mission?</p>
      <button onClick={() => onNavigate('join')} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F5A623] px-6 py-3 text-sm font-bold text-slate-950 hover:brightness-110">
        Join RealtorX <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ManifestoPage({ onNavigate }: { onNavigate: Nav }) {
  return (
    <div className="min-h-screen bg-[#0B1A30] pb-20">
      <Hero eyebrow="The RealtorX Manifesto" title="Building more than real estate" image="/images/realtorx_founding_ceremony_1790597198456.webp" />
      <article className="mx-auto max-w-3xl space-y-5 px-4 pt-14 text-lg leading-relaxed text-slate-300 sm:px-6">
        {MANIFESTO.map((p) => <p key={p}>{p}</p>)}
        <blockquote className="border-l-4 border-[#F5A623] pl-5 text-xl font-semibold italic text-white">{PHILOSOPHY}</blockquote>
        <div className="flex flex-wrap gap-3 pt-4 text-sm">
          <button onClick={() => onNavigate('code')} className="rounded-xl border border-white/15 px-5 py-2.5 text-white hover:bg-white/5">The RealtorX Code</button>
        </div>
        <JoinCta onNavigate={onNavigate} />
      </article>
    </div>
  );
}

export function CodePage({ onNavigate }: { onNavigate: Nav }) {
  return (
    <div className="min-h-screen bg-[#0B1A30] pb-20">
      <Hero eyebrow="The RealtorX Code" title="How every member behaves" image="/images/realtorx_engraved_wall_1790597184603.webp" />
      <div className="mx-auto max-w-5xl px-4 pt-14 sm:px-6">
        <ol className="grid gap-4 sm:grid-cols-2">
          {CODE.map(([title, text], i) => (
            <li key={title} className="rounded-2xl border border-white/10 bg-[#081221] p-6">
              <span className="text-sm font-bold text-[#F5A623]">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-2 text-lg font-semibold text-white">{title}</p>
              <p className="mt-1 text-sm text-slate-400">{text}</p>
            </li>
          ))}
        </ol>
        <section className="mt-14">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-white"><ShieldCheck className="h-6 w-6 text-[#F5A623]" /> The Founding Member Oath</h2>
          <div className="mt-5 space-y-2 rounded-2xl border border-[#F5A623]/20 bg-[#F5A623]/5 p-6 text-slate-200">
            {OATH.map((line) => <p key={line}>{line}</p>)}
          </div>
        </section>
        <JoinCta onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export function AboutPage({ onNavigate }: { onNavigate: Nav }) {
  const values: [React.ElementType, string, string][] = [
    [ShieldCheck, 'Trust first', 'Every member is verified and takes the Oath. Every listing is checked before it goes live.'],
    [Handshake, 'Collaboration', 'Realtors, agencies, developers, investors and partners work together instead of against each other.'],
    [LifeBuoy, 'Solutions', 'When projects are delayed or investments get stuck, the Solution Desk works on them until they are resolved.'],
    [Users, 'Community', 'The RealtorX Hub is the physical home of the community: meetings, trainings, orientations and events.'],
  ];
  return (
    <div className="min-h-screen bg-[#0B1A30] pb-20">
      <Hero eyebrow="About RealtorX" title="A community, not just a marketplace" image="/images/realtorx_hub_atrium_1790597209570.webp" />
      <div className="mx-auto max-w-5xl px-4 pt-14 sm:px-6">
        <div className="space-y-4 text-lg leading-relaxed text-slate-300">
          <p>
            Real estate is about people, dreams and trust. Too often, allottees and investors are left alone when projects are delayed, and
            professionals compete instead of collaborating. RealtorX was created to change that.
          </p>
          <p>
            RealtorX brings the real estate ecosystem into one community: a verified marketplace where every listing is handled by a member
            realtor, a membership built on the Manifesto, the Code and the Oath, a Solution Desk for problems nobody else solves, and a Hub
            where the community meets.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {values.map(([Icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-[#081221] p-6">
              <Icon className="h-6 w-6 text-[#F5A623]" />
              <p className="mt-3 text-lg font-semibold text-white">{title}</p>
              <p className="mt-1 text-sm text-slate-400">{text}</p>
            </div>
          ))}
        </div>
        <blockquote className="mt-12 flex gap-3 border-l-4 border-[#F5A623] pl-5 text-xl font-semibold italic text-white">
          <BadgeCheck className="mt-1 h-6 w-6 shrink-0 text-[#F5A623]" /> {PHILOSOPHY}
        </blockquote>
        <div className="mt-10 flex flex-wrap gap-3">
          <button onClick={() => onNavigate('manifesto')} className="flex items-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/5">
            <ScrollText className="h-4 w-4" /> Read the Manifesto
          </button>
          <button onClick={() => onNavigate('members')} className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/5">Meet the members</button>
        </div>
        <JoinCta onNavigate={onNavigate} />
      </div>
    </div>
  );
}
