// src/pages/ManifestoPage.tsx
import React, { useState, useEffect } from 'react';
import { PageId, Language } from '../types';
import { MANIFESTO_CONTENT, BRAND_TAGLINES } from '../data/cultureData';
import {
  BookOpen,
  ArrowRight,
  Clock,
  Share2,
  CheckCircle2,
  Sparkle,
  Compass,
  Users,
  Heart,
  Award,
  TrendingUp,
  Handshake,
} from 'lucide-react';

interface ManifestoPageProps {
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

export const ManifestoPage: React.FC<ManifestoPageProps> = ({ onNavigate, language }) => {
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const currentScroll = window.scrollY;
      if (totalScroll > 0) {
        setReadingProgress((currentScroll / totalScroll) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useScrollReveal([]);

  const communityStatements = [
    { text: 'A platform where professionals connect.', icon: Users, color: '#2490EF' },
    { text: 'Where opportunities are created.', icon: TrendingUp, color: '#F5A623' },
    { text: 'Where knowledge is shared.', icon: BookOpen, color: '#8B5CF6' },
    { text: 'Where partnerships are formed.', icon: Handshake, color: '#28A745' },
    { text: 'Where challenges become solutions.', icon: Compass, color: '#EC4899' },
    { text: 'Where trust is earned through actions.', icon: Heart, color: '#F5A623' },
  ];

  return (
    <div className="relative">

      {/* Top Reading Progress Bar */}
      <div className="fixed top-20 left-0 right-0 h-1 bg-slate-900 z-40">
        <div
          className="h-full bg-gradient-to-r from-[#2490EF] via-[#F5A623] to-[#28A745] transition-all duration-150 shadow-lg shadow-[#F5A623]/30"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <article className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* ═════ HEADER ═════ */}
        <div className="text-center space-y-6 max-w-3xl mx-auto scroll-reveal">
          <div className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[#F5A623] bg-[#F5A623]/[0.08] border border-[#F5A623]/25 px-4 py-2 rounded-full backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5A623]" />
            </span>
            <span>Foundational Charter 01 · 2 min read</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.03em] text-white font-heading leading-[1.02] text-balance">
            {language === 'en' ? (
              <>The RealtorX <span className="gradient-text">Manifesto</span></>
            ) : (
              'ریئلٹر ایکس منشور'
            )}
          </h1>

          <p className="text-xl sm:text-2xl font-display italic text-[#2490EF] leading-relaxed text-balance">
            {language === 'en'
              ? 'Building More Than Real Estate'
              : 'صرف ریئل اسٹیٹ نہیں، ایک باوقار مستقبل کی تعمیر'}
          </p>

          <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#F5A623] to-transparent mx-auto mt-4" />
        </div>

        {/* ═════ HERO PHOTO ═════ */}
        <div className="relative rounded-[2rem] overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/40 scroll-reveal group">
          <img
            src="/images/realtorx_founding_ceremony_1790597198456.jpg"
            alt="RealtorX Founding Custodians Assembly"
            referrerPolicy="no-referrer"
            className="w-full h-80 sm:h-96 lg:h-[520px] object-cover group-hover:scale-[1.03] transition-transform duration-[1200ms] ease-out-expo"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/40 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] sm:text-xs">
            <span className="font-display italic text-slate-200">
              Fig 1.0 — The Inaugural Assembly of RealtorX Custodians &amp; Advisors.
            </span>
            <span className="font-mono text-[#F5A623] font-semibold tracking-wider uppercase">
              Connect · Collaborate · Grow
            </span>
          </div>
        </div>

        {/* ═════ EDITORIAL PROSE ═════ */}
        <div className="space-y-12 text-slate-200 text-lg sm:text-xl font-sans leading-relaxed">

          {/* Opening Box */}
          <div className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-white/[0.06] overflow-hidden scroll-reveal">
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5A623]/50 to-transparent" />

            <div className="space-y-5">
              <p className="first-letter:text-6xl sm:first-letter:text-7xl first-letter:font-bold first-letter:text-[#F5A623] first-letter:float-left first-letter:mr-4 first-letter:leading-[0.85] first-letter:mt-1 text-slate-200">
                Real estate is not just about land, buildings or transactions.
              </p>
              <p className="text-xl sm:text-2xl font-display text-white leading-snug">
                It is about <span className="text-[#2490EF]">people</span>. It is about{' '}
                <span className="text-[#F5A623]">dreams</span>. It is about{' '}
                <span className="text-[#28A745]">trust</span>.
              </p>
            </div>
          </div>

          <p className="text-slate-300 scroll-reveal">
            Every investment represents someone's hard-earned savings. Every project carries the
            hopes of families, entrepreneurs and communities. Every realtor, developer and
            investor deserves an ecosystem built on{' '}
            <strong className="text-[#F5A623] font-semibold">integrity, collaboration and opportunity</strong>.
          </p>

          {/* Pull Quote */}
          <div className="py-12 border-y border-white/[0.08] text-center space-y-5 scroll-reveal">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#2490EF] mb-2">
              <span className="w-6 h-[1px] bg-[#2490EF]/60" />
              <span>The Problem</span>
              <span className="w-6 h-[1px] bg-[#2490EF]/60" />
            </div>

            <p className="text-2xl sm:text-3xl lg:text-4xl font-display italic text-white text-balance leading-snug">
              "Yet, too often, people are left alone when projects are delayed, investments
              become uncertain and businesses struggle."
            </p>

            <div className="pt-3 space-y-2">
              <div className="w-16 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5A623] to-transparent mx-auto" />
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F5A623] font-heading pt-2 tracking-[-0.02em]">
                RealtorX was created to change that.
              </div>
            </div>
          </div>

          <p className="text-slate-300 scroll-reveal">
            We believe the future of real estate is not competition alone—{' '}
            <strong className="text-[#2490EF] font-semibold">it is collaboration</strong>. We are
            building more than a marketplace. We are building a community.
          </p>

          {/* ═════ 6 COMMUNITY STATEMENTS ═════ */}
          <div className="scroll-reveal">
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#F5A623] mb-3">
                <span className="w-6 h-[1px] bg-[#F5A623]/60" />
                <span>Six Commitments</span>
                <span className="w-6 h-[1px] bg-[#F5A623]/60" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-[-0.02em]">
                We are building a community
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {communityStatements.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="group relative p-5 rounded-2xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 border border-white/[0.06] hover:border-white/[0.15] transition-all duration-500 hover:-translate-y-0.5 shadow-lg hover:shadow-xl overflow-hidden scroll-reveal"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at 0% 50%, ${item.color}12 0%, transparent 70%)`,
                      }}
                    />

                    <div className="relative flex items-start gap-3.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                        style={{
                          backgroundColor: `${item.color}18`,
                          border: `1px solid ${item.color}35`,
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ color: item.color }} />
                      </div>
                      <span className="font-heading font-semibold text-white text-base leading-snug pt-1.5">
                        {item.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed scroll-reveal">
            Every member of RealtorX carries the responsibility to strengthen this community.
            Because our success will never be measured only by properties sold. It will be
            measured by <strong className="text-white">lives improved</strong>,{' '}
            <strong className="text-white">businesses empowered</strong>,{' '}
            <strong className="text-white">investments protected</strong> and{' '}
            <strong className="text-white">relationships built</strong>.
          </p>

          <p className="text-2xl sm:text-3xl font-display text-white italic text-center pt-4 scroll-reveal">
            Together, we are creating the future of real estate.
          </p>

          {/* ═════ FINAL BANNER ═════ */}
          <div className="relative rounded-[2rem] overflow-hidden border border-[#F5A623]/25 shadow-2xl shadow-[#F5A623]/10 scroll-reveal">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0E2849] via-[#0B1A30] to-[#0E2849]" />
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background:
                  'radial-gradient(ellipse at 30% 50%, rgba(245, 166, 35, 0.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(36, 144, 239, 0.15) 0%, transparent 60%)',
              }}
            />
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5A623]/60 to-transparent" />

            <div className="relative p-12 sm:p-16 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#FFA500] flex items-center justify-center shadow-xl shadow-[#F5A623]/30">
                <Sparkle className="w-7 h-7 text-slate-950" />
              </div>

              <div className="text-3xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FFB84D] to-[#F5A623] font-heading tracking-[-0.02em] leading-tight">
                Connect. Collaborate. Grow.
              </div>

              <div className="font-urdu text-xl sm:text-2xl text-slate-300 leading-loose pt-2">
                جڑیں۔ اشتراک کریں۔ ترقی کریں۔
              </div>
            </div>
          </div>
        </div>

        {/* ═════ BOTTOM CTA ═════ */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-6 scroll-reveal">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-[-0.02em]">
              Ready to Join the Movement?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
              Become a verified Realtor X dealer or take the Founding Member Oath.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('become-dealer')}
              className="relative px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] via-[#FFB84D] to-[#F5A623] hover:brightness-110 shadow-xl shadow-[#F5A623]/30 hover:shadow-[#F5A623]/50 transition-all flex items-center gap-2 overflow-hidden group active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10">Join the Movement</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('oath')}
              className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/[0.2] transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-[#F5A623]" />
              <span>Take the Oath</span>
            </button>
          </div>
        </div>

      </article>

    </div>
  );
};
