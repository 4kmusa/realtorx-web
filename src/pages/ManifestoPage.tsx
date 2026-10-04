import React, { useState, useEffect } from 'react';
import { PageId, Language } from '../types';
import { MANIFESTO_CONTENT, BRAND_TAGLINES } from '../data/cultureData';
import { BookOpen, Sparkles, ArrowRight, Clock, Share2, CheckCircle2 } from 'lucide-react';

interface ManifestoPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative">
      
      {/* Top Reading Progress Bar */}
      <div className="fixed top-20 left-0 right-0 h-1 bg-slate-900 z-40">
        <div
          className="h-full bg-gradient-to-r from-[#2490EF] via-[#F5A623] to-[#28A745] transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <article className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Curatorial Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/30 px-3.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>Foundational Charter 01 · 2 min read</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white font-heading">
            {language === 'en' ? 'THE REALTORX MANIFESTO' : 'ریئلٹر ایکس منشور'}
          </h1>

          <p className="text-xl sm:text-2xl font-serif italic text-[#2490EF]">
            {language === 'en' ? 'Building More Than Real Estate' : 'صرف ریئل اسٹیٹ نہیں، ایک باوقار مستقبل کی تعمیر'}
          </p>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#F5A623] to-transparent mx-auto mt-4" />
        </div>

        {/* Hero Photo: Founding Gathering */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          <img
            src="/images/realtorx_founding_ceremony_1790597198456.jpg"
            alt="RealtorX Founding Custodians Assembly"
            referrerPolicy="no-referrer"
            className="w-full h-80 sm:h-96 lg:h-[460px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-300">
            <span className="font-serif italic">
              Fig 1.0 — The Inaugural Assembly of RealtorX Custodians &amp; Advisors.
            </span>
            <span className="font-mono text-[#F5A623] mt-1 sm:mt-0 font-semibold">
              Connect · Collaborate · Grow
            </span>
          </div>
        </div>

        {/* Editorial Prose: Generous Whitespace & Key Highlights */}
        <div className="space-y-12 text-slate-200 text-lg sm:text-xl font-sans leading-relaxed">
          
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <p className="first-letter:text-5xl sm:first-letter:text-6xl first-letter:font-bold first-letter:text-[#F5A623] first-letter:float-left first-letter:mr-3 first-letter:leading-none">
              Real estate is not just about land, buildings or transactions.
            </p>
            <p className="text-xl sm:text-2xl font-serif text-white font-medium">
              It is about people. It is about dreams. It is about trust.
            </p>
          </div>

          <p className="text-slate-300">
            Every investment represents someone's hard-earned savings. Every project carries the hopes of families, entrepreneurs and communities. Every realtor, developer and investor deserves an ecosystem built on <strong className="text-[#F5A623] font-semibold">integrity, collaboration and opportunity</strong>.
          </p>

          {/* High-Impact Pull Quote */}
          <div className="py-10 border-y border-slate-800 text-center space-y-3">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-serif italic text-white text-balance leading-snug">
              “Yet, too often, people are left alone when projects are delayed, investments become uncertain and businesses struggle.”
            </p>
            <div className="text-2xl sm:text-3xl font-bold text-[#F5A623] font-heading pt-2">
              RealtorX was created to change that.
            </div>
          </div>

          <p className="text-slate-300">
            We believe the future of real estate is not competition alone—<strong className="text-[#2490EF] font-semibold">it is collaboration</strong>.
            We are building more than a marketplace. We are building a community.
          </p>

          {/* The 6 Community Statements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {[
              "A platform where professionals connect.",
              "Where opportunities are created.",
              "Where knowledge is shared.",
              "Where partnerships are formed.",
              "Where challenges become solutions.",
              "Where trust is earned through actions."
            ].map((text, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#28A745] shrink-0 mt-0.5" />
                <span className="font-heading font-semibold text-white text-base">{text}</span>
              </div>
            ))}
          </div>

          <p className="text-slate-300 leading-relaxed">
            Every member of RealtorX carries the responsibility to strengthen this community. Because our success will never be measured only by properties sold. It will be measured by lives improved, businesses empowered, investments protected and relationships built.
          </p>

          <p className="text-xl sm:text-2xl font-serif text-white">
            Together, we are creating the future of real estate.
          </p>

          {/* Final Large Bold Banner */}
          <div className="p-10 rounded-3xl bg-gradient-to-r from-[#0E2849] via-[#0B1A30] to-[#0E2849] border border-[#2490EF]/40 text-center space-y-4 shadow-2xl">
            <div className="text-3xl sm:text-5xl font-black text-[#F5A623] font-heading tracking-wider">
              Connect. Collaborate. Grow.
            </div>
            <div className="font-urdu text-xl text-slate-300">
              جڑیں۔ اشتراک کریں۔ ترقی کریں۔
            </div>
          </div>

        </div>

        {/* CTA At Bottom */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white font-heading">
              Ready to Join the Movement?
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Become a verified Realtor X dealer or take the Founding Member Oath.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('become-dealer')}
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 shadow-lg transition-all flex items-center gap-2"
            >
              <span>Join the Movement (Become a Dealer)</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={() => onNavigate('oath')}
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-700"
            >
              Take the Oath
            </button>
          </div>
        </div>

      </article>

    </div>
  );
};
