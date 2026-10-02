import React from 'react';
import { PHILOSOPHY_QUOTE } from '../data/cultureData';
import { Language } from '../types';
import { RealtorXLogo } from './RealtorXLogo';
import { Shield, HeartHandshake, Building2, Quote, CheckCircle2, ArrowRight, BookOpen, Scale } from 'lucide-react';

interface PhilosophyWallProps {
  language: Language;
  onTakeOath: () => void;
  onExploreManifesto: () => void;
  onExploreCode: () => void;
}

export const PhilosophyWall: React.FC<PhilosophyWallProps> = ({
  language,
  onTakeOath,
  onExploreManifesto,
  onExploreCode
}) => {
  return (
    <section className="relative overflow-hidden py-12 lg:py-20 text-slate-100">

      {/* Background radial atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 15%, rgba(14, 165, 233, 0.15) 0%, rgba(245, 158, 11, 0.12) 40%, rgba(6, 11, 25, 0) 75%)'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Executive Header Lockup */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="flex justify-center mb-6">
            <RealtorXLogo size="lg" showSubtitle={false} />
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sky-400 bg-sky-950/40 border border-sky-800/40 px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>The Founding Culture &amp; Inscription</span>
            <span aria-hidden="true">·</span>
            <span>RealtorX Flagship Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight text-balance">
            {language === 'en' ? 'Building More Than Real Estate' : 'صرف ریئل اسٹیٹ نہیں، ایک باوقار مستقبل'}
          </h1>

          <p className="mt-4 text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
            {language === 'en'
              ? 'A community where realtors, developers, and investors collaborate with unyielding ethics to protect investments and elevate the industry.'
              : 'ایک ایسا پلیٹ فارم جہاں ریئلٹرز، ڈویلپرز اور سرمایہ کار باہمی دیانت اور اخوت کے ساتھ کام کرتے ہیں تاکہ عوام کی جمع پونجی محفوظ رہے اور انڈسٹری ترقی کرے۔'}
          </p>
        </div>

        {/* The Flagship Engraved Wall Display Frame */}
        <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl overflow-hidden backdrop-blur-md mb-12">

          {/* Photographic view of the wall */}
          <div className="relative h-80 sm:h-96 lg:h-[480px] w-full overflow-hidden">
            <img
              src="/src/assets/images/realtorx_engraved_wall_1790597184603.jpg"
              alt="The RealtorX Engraved Philosophy Wall in Honed Slate"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover brightness-[0.7] contrast-[1.15]"
            />
            {/* Measured Scrim for contrast readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060b19] via-[#060b19]/65 to-transparent" />

            {/* Brass-lettered floating inscription over photo */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-14">
              <div className="flex items-center gap-2 mb-3">
                <Quote className="w-8 h-8 text-amber-400" />
                <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-semibold">
                  Permanent Hub Inscription
                </span>
              </div>

              <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-amber-100 tracking-wide leading-snug max-w-4xl text-balance drop-shadow-lg">
                "{language === 'en' ? PHILOSOPHY_QUOTE.quote : PHILOSOPHY_QUOTE.quoteUrdu}"
              </blockquote>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
                <span className="font-semibold text-amber-400 font-mono tracking-wider">
                  — {PHILOSOPHY_QUOTE.author}
                </span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span className="text-slate-400">
                  {language === 'en' ? 'Dedicated to Waseem & Allottee Custodians' : 'وسیم اور تمام مخلص الاٹیز کے محافظین کے نام'}
                </span>
              </div>
            </div>
          </div>

          {/* Curatorial Story and Genesis */}
          <div className="p-6 sm:p-10 lg:p-12 bg-[#080d21] border-t border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="text-xs uppercase font-mono tracking-widest text-sky-400 font-semibold">
                {language === 'en' ? 'The Philosophy in Action' : 'اس فلسفے کا پس منظر اور روح'}
              </div>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {language === 'en' ? (
                  <>
                    When someone reads this inscription, they immediately recognize that RealtorX stands for something much greater than closing deals. It represents the journey from safeguarding hundreds of allottees when housing projects stalled, to architecting an ecosystem built on collaboration, institutional transparency, and mutual accountability.
                  </>
                ) : (
                  <>
                    جب کوئی شخص اس عبارت کو پڑھتا ہے، تو وہ جان لیتا ہے کہ ریئلٹر ایکس محض ڈیلز اور وقتی منافع سے کہیں بلند مقصد کے لیے ہے۔ یہ ان سینکڑوں پریشان حال الاٹیز کی ڈوبتی ہوئی بچتوں کو تحفظ فراہم کرنے کی عملی جدوجہد ہے جس سے اس ادارے نے جنم لیا۔
                  </>
                )}
              </p>

              {/* Three Pillared Values */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <HeartHandshake className="w-4 h-4" />
                    <span>Lives Transformed</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Protecting family life-savings from speculative traps and non-approved files.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 transition-colors">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>Businesses Empowered</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Brokers and realtors prospering together through honored co-brokering splits.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Shield className="w-4 h-4" />
                    <span>Investments Secured</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Verified land titles, regulatory NOC verifications, and central registry auditing.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="lg:col-span-4 flex flex-col justify-center items-center text-center p-6 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 shadow-lg">
              <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-white">
                {language === 'en' ? 'Become a Founding Custodian' : 'بانی کسٹوڈین بنیں'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                {language === 'en'
                  ? 'Take the solemn oath, earn your verified credentials, and sync your membership into our central registry.'
                  : 'مقدس حلف اٹھائیں، اپنی سند حاصل کریں، اور ہماری مرکزی رجسٹری میں اپنا نام درج کرائیں۔'}
              </p>
              <button
                onClick={onTakeOath}
                className="w-full py-3 px-4 text-xs font-semibold tracking-wide text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>{language === 'en' ? 'Take the Founding Oath' : 'بانی حلف نامہ پر دستخط کریں'}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Nav Cards: Manifesto & The Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={onExploreManifesto}
            className="group cursor-pointer p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-wider mb-2">
                <BookOpen className="w-4 h-4" />
                <span>Foundational Charter 01</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white group-hover:text-sky-300 transition-colors">
                {language === 'en' ? 'The RealtorX Manifesto' : 'ریئلٹر ایکس منشور (Manifesto)'}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {language === 'en'
                  ? 'Read why we exist, how we move from toxic competition to collaborative strength, and the 6 core pillars of our community.'
                  : 'جانیے کہ ہم کیوں وجود میں آئے، تنہا مقابلے سے نکل کر باہمی تعاون کی طاقت کیسے بنی، اور کمیونٹی کے چھ پائیدار ستون کون سے ہیں۔'}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-sky-400 group-hover:text-sky-300">
              <span>Read Full Manifesto</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={onExploreCode}
            className="group cursor-pointer p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-2">
                <Scale className="w-4 h-4" />
                <span>Foundational Charter 03</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                {language === 'en' ? 'The RealtorX Code (8 Tenets)' : 'ریئلٹر ایکس ضابطہ اخلاق (The Code)'}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {language === 'en'
                  ? 'Integrity First, Collaboration Before Competition, Solutions Over Excuses. Explore real-world dilemmas and behavioral standards.'
                  : 'دیانت سب سے پہلے، مقابلے پر اشتراک، بہانوں پر حل۔ مارکیٹ کے حقیقی کیسز اور اخلاقی معیارات کا تفصیلی جائزہ لیں۔'}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:text-amber-300">
              <span>Explore The 8 Principles</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
