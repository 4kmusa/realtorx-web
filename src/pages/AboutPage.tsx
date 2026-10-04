// src/pages/AboutPage.tsx
import React, { useEffect } from 'react';
import { PageId, Language } from '../types';
import { BRAND_TAGLINES } from '../data/mockProperties';
import { RealtorXLogo } from '../components/RealtorXLogo';
import {
  Users,
  Heart,
  ShieldCheck,
  Target,
  Award,
  ArrowRight,
  Sparkle,
  Compass,
  TrendingUp,
  Handshake,
  Building2,
  CheckCircle2,
  Star,
  Percent,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

// ═══════════════════════════════════════════════════════
// Scroll Reveal Hook
// ═══════════════════════════════════════════════════════
function useScrollReveal(deps: React.DependencyList = []) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    const checkAndObserve = () => {
      document.querySelectorAll('.scroll-reveal:not(.is-visible)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) el.classList.add('is-visible');
        else observer.observe(el);
      });
    };

    checkAndObserve();

    const mutationObserver = new MutationObserver(() => checkAndObserve());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  useScrollReveal([]);

  const values = [
    {
      icon: ShieldCheck,
      color: '#2490EF',
      title: 'Integrity First',
      desc: 'Every transaction is documented, verified, and transparent. No shortcuts, no hidden clauses.',
    },
    {
      icon: Handshake,
      color: '#F5A623',
      title: 'Collaboration Over Competition',
      desc: 'We share leads, listings, and legal knowledge freely. A rising tide lifts all boats.',
    },
    {
      icon: Heart,
      color: '#EC4899',
      title: 'Allottee Protection',
      desc: 'The family saving their life savings for a dream home always comes first — always.',
    },
    {
      icon: Award,
      color: '#28A745',
      title: 'Verified Credentials',
      desc: 'Every dealer takes the Founding Oath. Every property passes our documentation audit.',
    },
    {
      icon: TrendingUp,
      color: '#8B5CF6',
      title: 'Market Intelligence',
      desc: 'Data-driven guidance. Honest valuations. No speculative hype or hidden pressure.',
    },
    {
      icon: Users,
      color: '#F5A623',
      title: 'Community Growth',
      desc: 'Dedicated advocacy desk for allottees. We grow when the community grows with us.',
    },
  ];

  const milestones = [
    { value: '2024', label: 'Founded', icon: Compass, color: '#2490EF' },
    { value: '500+', label: 'Allottees Helped', icon: Users, color: '#F5A623' },
    { value: '100%', label: 'Document Verified', icon: ShieldCheck, color: '#28A745' },
    { value: '40/60', label: 'Fair Split', icon: Percent, color: '#8B5CF6' },
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

      {/* ═════ HERO ═════ */}
      <div className="text-center max-w-3xl mx-auto scroll-reveal">
        <div className="flex justify-center mb-8">
          <RealtorXLogo size="lg" showSubtitle={false} />
        </div>

        <div className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[#2490EF] bg-[#2490EF]/[0.08] border border-[#2490EF]/25 px-4 py-2 rounded-full mb-7 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5A623]" />
          </span>
          <span>Our Story &amp; Purpose</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-heading tracking-[-0.03em] leading-[1.05] mb-6 text-balance">
          Real Estate.{' '}
          <span className="gradient-text">Reimagined.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Realtor X was born out of a real problem in Bahria Town Karachi: when projects faced
          delays and files became uncertain, ordinary families were left alone with no one
          advocating for their hard-earned life savings.
        </p>
      </div>

      {/* ═════ PHILOSOPHY CALLOUT ═════ */}
      <div className="relative rounded-[2rem] overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/30 scroll-reveal">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050C16] via-[#0B1A30] to-[#050C16]" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at 30% 20%, rgba(36, 144, 239, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(245, 166, 35, 0.10) 0%, transparent 50%)',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5A623]/50 to-transparent" />

        <div className="relative p-10 sm:p-16 text-center">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#F5A623] bg-[#F5A623]/[0.08] border border-[#F5A623]/25 px-4 py-1.5 rounded-full mb-7">
            <Star className="w-3.5 h-3.5" />
            <span>The Realtor X Founding Core Belief</span>
          </div>

          <blockquote className="text-2xl sm:text-3xl lg:text-[2.25rem] font-display italic text-white max-w-4xl mx-auto leading-[1.25] tracking-[-0.01em] text-balance">
            "{BRAND_TAGLINES.philosophy}"
          </blockquote>

          <div className="mt-8 font-urdu text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-loose">
            {BRAND_TAGLINES.philosophyUrdu}
          </div>
        </div>
      </div>

      {/* ═════ STORY SECTION ═════ */}
      <div className="scroll-reveal">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[#F5A623] mb-5">
              <span className="w-6 h-[1px] bg-[#F5A623]/60" />
              <span>Our Origin</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading tracking-[-0.02em] leading-tight mb-6">
              The <span className="text-[#F5A623]">'Bahria Ka Dost'</span> Spirit
            </h2>
            <div className="text-xs text-slate-500 font-mono uppercase tracking-[0.1em] mb-4">
              Rooted in Solidarity, Not Competition
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Through years of standing beside allottees in Bahria Town Karachi, our convener{' '}
              <strong className="text-white">Waseem</strong> and the founding team realized that
              the real estate industry was suffering from broken trust. Dealers were fighting
              each other over fractional margins, while buyers were anxious about duplicate
              files or delayed utility connections.
            </p>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Realtor X changed this by creating an open brotherhood. We introduced the{' '}
              <strong className="text-[#F5A623]">40/60 commission split</strong> where closing
              agents keep 60% of the commission, legal assistance is shared freely, and verified
              listings are accessible to all member custodians without hidden fees.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              {['Transparent Documents', 'Fair 40/60 Split', 'Verified Custodians'].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.04] border border-white/[0.08] text-slate-300"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#28A745]" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═════ MISSION / VISION / PROMISE ═════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 scroll-reveal">
        {[
          {
            icon: Target,
            color: '#2490EF',
            title: 'Our Mission',
            text: 'Connect, collaborate, and grow the real estate fraternity with unconditional ethics.',
          },
          {
            icon: Compass,
            color: '#F5A623',
            title: 'Our Vision',
            text: 'Make Bahria Town Karachi the most transparent and secure property investment corridor in Pakistan.',
          },
          {
            icon: ShieldCheck,
            color: '#28A745',
            title: 'Our Promise',
            text: 'Protect the allottee first, empower the dealer second, and earn trust through actions.',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="group relative p-8 rounded-3xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 border border-white/[0.06] hover:border-white/[0.15] transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 overflow-hidden scroll-reveal"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${item.color}15 0%, transparent 60%)`,
                }}
              />

              <div className="relative">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    backgroundColor: `${item.color}18`,
                    border: `1px solid ${item.color}35`,
                  }}
                >
                  <Icon className="w-7 h-7" style={{ color: item.color }} />
                </div>
                <h3 className="font-heading font-bold text-xl text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═════ STATS ═════ */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/30 scroll-reveal">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1A30] via-slate-900 to-[#0B1A30]" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(ellipse at 20% 50%, rgba(36, 144, 239, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(245, 166, 35, 0.12) 0%, transparent 50%)',
          }}
        />

        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 p-10 sm:p-12 text-center">
          {milestones.map((m, idx) => {
            const MIcon = m.icon;
            return (
              <div key={idx} className="space-y-3">
                <div
                  className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${m.color}18`,
                    border: `1px solid ${m.color}35`,
                  }}
                >
                  <MIcon className="w-5 h-5" style={{ color: m.color }} />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-[-0.02em]">
                  {m.value}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400">
                  {m.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═════ VALUES GRID ═════ */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-14 scroll-reveal">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#2490EF] mb-4">
            <span className="w-6 h-[1px] bg-[#2490EF]/60" />
            <span>What We Stand For</span>
            <span className="w-6 h-[1px] bg-[#2490EF]/60" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading tracking-[-0.02em] leading-tight">
            Our Core <span className="gradient-text-blue">Values</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed max-w-xl mx-auto">
            Six principles that guide every transaction, every conversation, and every decision we make.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div
                key={idx}
                className="group relative p-6 rounded-3xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 border border-white/[0.06] hover:border-white/[0.15] transition-all duration-500 hover:-translate-y-1 shadow-lg hover:shadow-xl scroll-reveal"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      backgroundColor: `${v.color}18`,
                      border: `1px solid ${v.color}35`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: v.color }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading font-bold text-base text-white mb-1.5">
                      {v.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═════ BOTTOM CTA ═════ */}
      <div className="relative rounded-[2rem] overflow-hidden border border-[#F5A623]/20 shadow-2xl shadow-[#F5A623]/10 scroll-reveal">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0E2849] via-[#0B1A30] to-[#0E2849]" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at 30% 50%, rgba(245, 166, 35, 0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(36, 144, 239, 0.12) 0%, transparent 60%)',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5A623]/60 to-transparent" />

        <div className="relative p-10 sm:p-14 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#FFA500] flex items-center justify-center shadow-xl shadow-[#F5A623]/30">
            <Sparkle className="w-7 h-7 text-slate-950" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white font-heading tracking-[-0.02em] leading-tight max-w-3xl mx-auto text-balance">
            Read the full RealtorX Manifesto
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Six foundational pillars that define why we exist, how we work, and what we promise.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('manifesto')}
              className="relative px-7 py-3.5 rounded-2xl text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] via-[#FFB84D] to-[#F5A623] hover:brightness-110 transition-all duration-300 shadow-xl shadow-[#F5A623]/30 hover:shadow-[#F5A623]/50 flex items-center gap-2 overflow-hidden group active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10">Read The Manifesto</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('contact')}
              className="px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/[0.2] backdrop-blur-md transition-all duration-300 flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-[#2490EF]" />
              <span>Contact Our Team</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
