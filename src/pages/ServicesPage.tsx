// src/pages/ServicesPage.tsx
import React, { useEffect } from 'react';
import { PageId, Language } from '../types';
import {
  Home,
  Key,
  TrendingUp,
  Building2,
  Scale,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Compass,
  Award,
  Users,
  Clock,
  Percent,
} from 'lucide-react';

interface ServicesPageProps {
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

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  useScrollReveal([]);

  const services = [
    {
      icon: Home,
      color: '#2490EF',
      title: 'Property Buying & Allotment Advisory',
      desc: 'Comprehensive guidance on purchasing residential plots, built villas, and apartments across Bahria Town Karachi. 100% legal document audit and clear title verification.',
    },
    {
      icon: Key,
      color: '#F5A623',
      title: 'Property Selling & Resale Representation',
      desc: 'Fast, dignified property liquidations with verified buyers. Professional 4K photo coverage, transparent valuation, and zero hidden charges.',
    },
    {
      icon: Building2,
      color: '#8B5CF6',
      title: 'Commercial & High-Yield Retail Spaces',
      desc: 'Prime shops, offices, and showrooms on Jinnah Avenue and Liberty Commercial. Strategic tenant sourcing and rental yield optimization.',
    },
    {
      icon: TrendingUp,
      color: '#28A745',
      title: 'Strategic Investment & Capital Planning',
      desc: 'Data-driven feasibility studies for overseas Pakistanis and corporate entities looking for capital appreciation across BTK-1, BTK-2, and M-9 corridor.',
    },
    {
      icon: Scale,
      color: '#F5A623',
      title: 'Legal Title Verification & Allottee Advocacy',
      desc: 'In-house legal team auditing Bahria NDC letters, transfer documents, power of attorney verifications, and resolution of stalled allotment disputes.',
    },
    {
      icon: ShieldCheck,
      color: '#2490EF',
      title: 'Site Visit Concierge & Transfer Escrow',
      desc: 'Dedicated chauffeured inspection tours with seasoned precinct custodians. Secure token escrow handling through official Bahria transfer windows.',
    },
  ];

  const stats = [
    { value: '6', label: 'Core Services', icon: Compass, color: '#2490EF' },
    { value: '48h', label: 'Response Time', icon: Clock, color: '#F5A623' },
    { value: '40/60', label: 'Commission Split', icon: Percent, color: '#28A745' },
    { value: '100%', label: 'Verified Documents', icon: ShieldCheck, color: '#8B5CF6' },
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

      {/* ═════ HEADER ═════ */}
      <div className="text-center max-w-3xl mx-auto scroll-reveal">
        <div className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[#2490EF] bg-[#2490EF]/[0.08] border border-[#2490EF]/25 px-4 py-2 rounded-full mb-7 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5A623]" />
          </span>
          <span>Professional Excellence</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-heading tracking-[-0.03em] leading-[1.05] mb-5 text-balance">
          Our Real Estate <span className="gradient-text">Services</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Tailored advisory for homebuyers, corporate investors, and commercial entrepreneurs in
          Bahria Town Karachi.
        </p>
      </div>

      {/* ═════ SERVICES GRID ═════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv, idx) => {
          const Icon = srv.icon;
          return (
            <div
              key={idx}
              className="group relative p-8 rounded-3xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 border border-white/[0.06] hover:border-white/[0.15] transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden scroll-reveal"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Ambient glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${srv.color}15 0%, transparent 60%)`,
                }}
              />

              <div className="relative space-y-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    backgroundColor: `${srv.color}18`,
                    border: `1px solid ${srv.color}35`,
                  }}
                >
                  <Icon className="w-7 h-7" style={{ color: srv.color }} />
                </div>

                <h3 className="font-heading font-bold text-lg text-white leading-snug min-h-[3.5rem]">
                  {srv.title}
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed">
                  {srv.desc}
                </p>
              </div>

              <div className="relative pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.1em] text-[#28A745]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
                <button
                  onClick={() => onNavigate('contact')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold transition-all duration-300 group/btn"
                  style={{ color: srv.color }}
                >
                  <span>Inquire Now</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═════ STATS BAR ═════ */}
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
          {stats.map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
              <div key={idx} className="space-y-3">
                <div
                  className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${stat.color}18`,
                    border: `1px solid ${stat.color}35`,
                  }}
                >
                  <StatIcon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-[-0.02em]">
                  {stat.value}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═════ WHY US ═════ */}
      <div className="scroll-reveal">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#2490EF] mb-4">
            <span className="w-6 h-[1px] bg-[#2490EF]/60" />
            <span>Why Realtor X</span>
            <span className="w-6 h-[1px] bg-[#2490EF]/60" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading tracking-[-0.02em] leading-tight">
            The Realtor X <span className="gradient-text-blue">Difference</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: ShieldCheck,
              color: '#2490EF',
              title: 'Document Verified',
              desc: 'Every property is audited with Bahria Town transfer records before listing.',
            },
            {
              icon: Users,
              color: '#F5A623',
              title: 'Founding Custodians',
              desc: 'Dealers who took the oath — committed to honesty and client-first service.',
            },
            {
              icon: Award,
              color: '#28A745',
              title: 'Fair 40/60 Split',
              desc: 'Highest dealer commission in the market. Empowering realtor fraternity.',
            },
            {
              icon: Compass,
              color: '#8B5CF6',
              title: 'Full-Service Care',
              desc: 'From site visit to transfer — we handle every step of the journey.',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group p-6 rounded-3xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 shadow-lg scroll-reveal"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    backgroundColor: `${item.color}18`,
                    border: `1px solid ${item.color}35`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <h3 className="font-heading font-bold text-base text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═════ BOTTOM CTA ═════ */}
      <div className="relative rounded-[2rem] overflow-hidden border border-[#2490EF]/20 shadow-2xl shadow-[#2490EF]/10 scroll-reveal">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0E2849] via-[#0B1A30] to-[#0E2849]" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at 30% 50%, rgba(36, 144, 239, 0.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(245, 166, 35, 0.12) 0%, transparent 60%)',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#2490EF]/60 to-transparent" />

        <div className="relative p-10 sm:p-14 text-center space-y-7">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#FFA500] flex items-center justify-center shadow-xl shadow-[#F5A623]/30">
            <Award className="w-7 h-7 text-slate-950" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white font-heading tracking-[-0.02em] leading-tight max-w-3xl mx-auto text-balance">
            Need a Custom Real Estate Consultation?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Our senior property advisors and allottee custodians are available 6 days a week at
            our Opal Mall office on Jinnah Avenue.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <button
              onClick={() => onNavigate('contact')}
              className="relative px-7 py-3.5 rounded-2xl text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] via-[#FFB84D] to-[#F5A623] hover:brightness-110 transition-all duration-300 shadow-xl shadow-[#F5A623]/30 hover:shadow-[#F5A623]/50 flex items-center gap-2 overflow-hidden group active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10">Schedule a Consultation</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('properties')}
              className="px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/[0.2] backdrop-blur-md transition-all duration-300 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#2490EF]" />
              <span>Browse Properties</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
