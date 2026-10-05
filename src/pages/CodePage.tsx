// src/pages/CodePage.tsx
import React, { useEffect } from 'react';
import { PageId, Language } from '../types';
import {
  Shield,
  Users,
  Lightbulb,
  Handshake,
  BookOpen,
  Gift,
  Heart,
  TrendingUp,
  ArrowRight,
  Printer,
  Download,
  CheckCircle2,
  Sparkle,
  Award,
  Compass,
} from 'lucide-react';
import { RealtorXLogo } from '../components/RealtorXLogo';

interface CodePageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

interface Principle {
  number: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  motto: string;
  description: string;
  inPractice: string;
  color: string;
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
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
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

const PRINCIPLES: Principle[] = [
  {
    number: '01',
    icon: Shield,
    title: 'Integrity First',
    motto: 'Always tell the truth.',
    description:
      'Transparency in property documentation, realistic timelines, and disclosure of material facts. No false promises to close a sale.',
    inPractice:
      'Never conceal litigation, pending dues, or non-approved status of land. Tell the client the exact state before they hand over a cheque.',
    color: '#2490EF',
  },
  {
    number: '02',
    icon: Users,
    title: 'Collaboration Before Competition',
    motto: 'We grow together.',
    description:
      "Real estate deals are won through shared networks, co-broking with honor, and celebrating another agent's genuine breakthrough.",
    inPractice:
      'Respect commission splits instantly without delays or disputes. Share verified inventories with fellow custodians.',
    color: '#F5A623',
  },
  {
    number: '03',
    icon: Lightbulb,
    title: 'Solutions Over Excuses',
    motto: 'Every problem deserves an honest attempt at a solution.',
    description:
      'When delays, disputes, or documentation issues arise, we become problem-solvers, not blame-shifters. We own the outcome.',
    inPractice:
      'When Bahria Town transfer is delayed, actively follow up with the office daily. Do not leave the client alone with "system issue" excuses.',
    color: '#28A745',
  },
  {
    number: '04',
    icon: Handshake,
    title: 'Respect Every Professional',
    motto: 'Everyone has value.',
    description:
      'Whether a junior agent, senior developer, or a first-time buyer — every person in the transaction deserves dignity and respect.',
    inPractice:
      'Never undermine another agent in front of a client. Speak respectfully about competitors and colleagues.',
    color: '#8B5CF6',
  },
  {
    number: '05',
    icon: BookOpen,
    title: 'Learn Continuously',
    motto: 'Knowledge creates opportunity.',
    description:
      'Real estate laws, market trends, and technology evolve. We commit to staying informed so our clients benefit from expert guidance.',
    inPractice:
      'Attend Realtor X training sessions. Read Bahria Town circulars. Learn about new financing and legal frameworks.',
    color: '#EC4899',
  },
  {
    number: '06',
    icon: Gift,
    title: 'Give Before You Receive',
    motto: 'The strongest communities are built by those who contribute.',
    description:
      'Share knowledge, refer clients, mentor juniors, and contribute to the community — before expecting anything back.',
    inPractice:
      'Refer a deal to a fellow member without asking for a split. Mentor a new dealer for their first Bahria deal.',
    color: '#F5A623',
  },
  {
    number: '07',
    icon: Heart,
    title: 'Protect the Community',
    motto: 'Trust takes years to build and moments to lose.',
    description:
      'One bad actor can damage the entire community. We protect Realtor X reputation through our individual actions.',
    inPractice:
      'Report fraud, fake listings, and unethical behavior — even if it is a friend. Never participate in price manipulation.',
    color: '#EC4899',
  },
  {
    number: '08',
    icon: TrendingUp,
    title: 'Leave the Industry Better Than You Found It',
    motto: 'Every action should improve the profession.',
    description:
      'Real estate in Pakistan has a mixed reputation. We are here to change that — one honest transaction at a time.',
    inPractice:
      'When you retire or leave this industry, the next generation should have a better environment because of your work.',
    color: '#28A745',
  },
];

export const CodePage: React.FC<CodePageProps> = ({ onNavigate, language }) => {
  useScrollReveal([]);

  const handleTakeOath = () => {
    sessionStorage.setItem('realtorx_dealer_flow', 'true');
    onNavigate('oath');
  };

  const handlePrint = () => window.print();

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

      {/* ═════ HERO ═════ */}
      <div className="text-center max-w-4xl mx-auto scroll-reveal">
        <div className="flex justify-center mb-8">
          <RealtorXLogo size="lg" showSubtitle={false} />
        </div>

        <div className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[#F5A623] bg-[#F5A623]/[0.08] border border-[#F5A623]/25 px-4 py-2 rounded-full mb-7 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5A623]" />
          </span>
          <span>Foundational Charter 03 · The 8 Principles</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.03em] text-white font-heading leading-[1.02] mb-6 text-balance">
          The RealtorX <span className="gradient-text">Code</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Eight cardinal principles of ethical practice, collaboration, and client duty that
          govern every Realtor X member, dealer, and custodian.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] rounded-xl transition-all"
          >
            <Printer className="w-4 h-4 text-[#2490EF]" />
            <span>Print Version</span>
          </button>

          <button
            onClick={handleTakeOath}
            className="relative inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] via-[#FFB84D] to-[#F5A623] hover:brightness-110 rounded-xl shadow-xl shadow-[#F5A623]/30 hover:shadow-[#F5A623]/50 transition-all overflow-hidden group active:scale-[0.98]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Award className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Take the Oath</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* ═════ PRINCIPLES GRID ═════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {PRINCIPLES.map((principle, idx) => {
          const Icon = principle.icon;
          return (
            <div
              key={principle.number}
              className="group relative p-7 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 border border-white/[0.06] hover:border-white/[0.15] transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 overflow-hidden scroll-reveal"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Ambient glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 0% 0%, ${principle.color}15 0%, transparent 60%)`,
                }}
              />

              {/* Giant number watermark */}
              <div
                className="absolute -top-6 -right-4 text-[8rem] sm:text-[10rem] font-black leading-none opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none select-none"
                style={{ color: principle.color }}
              >
                {principle.number}
              </div>

              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      backgroundColor: `${principle.color}18`,
                      border: `1px solid ${principle.color}35`,
                    }}
                  >
                    <Icon
                      className="w-7 h-7"
                      style={{ color: principle.color }}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.15em] text-slate-500">
                    <span className="w-6 h-[1px] bg-slate-600" />
                    <span>Rule #{principle.number}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-[-0.02em] leading-tight mb-3">
                  <span className="text-slate-500 font-mono mr-2 text-lg">
                    {principle.number}.
                  </span>
                  {principle.title}
                </h3>

                {/* Motto */}
                <p
                  className="text-sm font-display italic mb-4 leading-relaxed"
                  style={{ color: principle.color }}
                >
                  "{principle.motto}"
                </p>

                {/* Description */}
                <p className="text-sm text-slate-300 leading-relaxed mb-5">
                  {principle.description}
                </p>

                {/* In Practice */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-[#28A745]/15 border border-[#28A745]/40 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-[#28A745]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#28A745] uppercase tracking-[0.15em] font-mono">
                      In Practice
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    {principle.inPractice}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
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

        <div className="relative p-10 sm:p-14 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#FFA500] flex items-center justify-center shadow-xl shadow-[#F5A623]/30">
            <Shield className="w-7 h-7 text-slate-950" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white font-heading tracking-[-0.02em] leading-tight max-w-3xl mx-auto text-balance">
            Ready to Live by This Code?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Taking the Realtor X Oath is a personal commitment to uphold these eight principles
            in every transaction, every relationship, and every interaction.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handleTakeOath}
              className="relative px-7 py-3.5 rounded-2xl text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] via-[#FFB84D] to-[#F5A623] hover:brightness-110 transition-all duration-300 shadow-xl shadow-[#F5A623]/30 hover:shadow-[#F5A623]/50 flex items-center gap-2 overflow-hidden group active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Award className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Take the Oath</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('manifesto')}
              className="px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/[0.2] backdrop-blur-md transition-all duration-300 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#2490EF]" />
              <span>Read the Manifesto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
