import React from 'react';
import { MANIFESTO_CONTENT } from '../data/cultureData';
import { Language } from '../types';
import { RealtorXLogo } from './RealtorXLogo';
import { ArrowRight, BookOpen, Quote, ShieldCheck } from 'lucide-react';

interface ManifestoSectionProps {
  language: Language;
  onTakeOath: () => void;
  onViewPhilosophy: () => void;
}

export const ManifestoSection: React.FC<ManifestoSectionProps> = ({
  language,
  onTakeOath,
  onViewPhilosophy
}) => {
  return (
    <article className="py-12 lg:py-20 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Curatorial Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex justify-center mb-6">
            <RealtorXLogo size="md" showSubtitle={false} />
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sky-400 bg-sky-950/40 border border-sky-800/40 px-3 py-1 rounded-full mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Foundational Charter 01</span>
            <span aria-hidden="true">·</span>
            <span>Why We Exist</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white text-balance">
            {language === 'en' ? MANIFESTO_CONTENT.title : MANIFESTO_CONTENT.titleUrdu}
          </h1>

          <p className="mt-4 text-xl sm:text-2xl font-serif italic text-amber-300">
            {language === 'en' ? MANIFESTO_CONTENT.subtitle : MANIFESTO_CONTENT.subtitleUrdu}
          </p>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-6" />
        </div>

        {/* Hero Photo: Founding Gathering */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 mb-14 shadow-2xl">
          <img
            src="/src/assets/images/realtorx_founding_ceremony_1790597198456.jpg"
            alt="RealtorX Founding Assembly"
            referrerPolicy="no-referrer"
            className="w-full h-72 sm:h-96 lg:h-[440px] object-cover brightness-[0.8]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060b19] via-[#060b19]/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-300">
            <span className="font-serif italic">
              Fig 1.0 — The Inaugural Assembly of RealtorX Custodians & Advisors.
            </span>
            <span className="font-mono text-amber-400 mt-1 sm:mt-0 font-semibold">
              Connect · Collaborate · Grow
            </span>
          </div>
        </div>

        {/* Editorial Prose with Drop Cap */}
        <div className="max-w-prose mx-auto font-sans leading-relaxed text-slate-300 text-base sm:text-lg space-y-6">
          <p className="first-letter:text-5xl sm:first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:text-amber-400 first-letter:float-left first-letter:mr-3 first-letter:leading-none">
            {language === 'en' ? (
              <>
                Real estate is not just about land, buildings or transactions. It is about people. It is about dreams. It is about trust. Every investment represents someone's hard-earned savings. Every project carries the hopes of families, entrepreneurs and communities.
              </>
            ) : (
              <>
                ریئل اسٹیٹ صرف زمین، عمارتوں یا سودوں (Transactions) کا نام نہیں ہے۔ یہ جڑی ہے انسانوں سے۔ خوابوں سے۔ اور باہمی اعتماد سے۔ ہر ایک انویسٹمنٹ کسی کے خون پسینے کی عمر بھر کی جمع پونجی کی ترجمان ہوتی ہے۔ ہر پروجیکٹ کے ساتھ خاندانوں، نئے کاروباری افراد اور پوری کمیونٹی کے روشن خواب وابستہ ہوتے ہیں۔
              </>
            )}
          </p>

          <p>
            {language === 'en' ? (
              <>
                Every realtor, developer and investor deserves an ecosystem built on integrity, collaboration and opportunity. Yet, too often, people are left alone when projects are delayed, investments become uncertain and businesses struggle.
              </>
            ) : (
              <>
                ہر ریئلٹر، ڈویلپر اور سرمایہ کار ایک ایسے ماحول کا حقدار ہے جو دیانت، باہمی اشتراک اور شفاف مواقع پر کھڑا ہو۔ مگر تلخ حقیقت یہ ہے کہ جب پروجیکٹس تاخیر کا شکار ہوتے ہیں، انویسٹمنٹ خطرے میں پڑتی ہے یا کاروبار ڈگمگاتے ہیں، تو لوگ اکیلے رہ جاتے ہیں۔
              </>
            )}
          </p>

          {/* Pull Quote */}
          <div className="py-8 my-8 border-y border-slate-800 text-center">
            <p className="font-serif text-2xl sm:text-3xl text-amber-300 italic tracking-wide">
              {language === 'en'
                ? '“RealtorX was created to change that.”'
                : '”ریئلٹر ایکس (RealtorX) اسی بے حسی اور تنہائی کو بدلنے کے لیے وجود میں آیا ہے۔“'}
            </p>
            <p className="text-xs font-mono uppercase tracking-widest text-sky-400 mt-2 font-semibold">
              The Turning Point
            </p>
          </div>

          <p>
            {language === 'en' ? (
              <>
                We believe the future of real estate is not competition alone—it is collaboration. We are building more than a marketplace. We are building a community.
              </>
            ) : (
              <>
                ہمارا غیر متزلزل یقین ہے کہ ریئل اسٹیٹ کا مستقبل بے رحمانہ مقابلے میں نہیں، بلکہ باہمی تعاون اور اتحاد میں ہے۔ ہم صرف ایک مارکیٹ پلیس نہیں بنا رہے، ہم ایک مخلص کمیونٹی تعمیر کر رہے ہیں۔
              </>
            )}
          </p>
        </div>

        {/* The 6 Pillars */}
        <div className="my-16">
          <div className="text-center mb-8">
            <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-semibold">
              {language === 'en' ? 'The Six Tenets of Our Gathering' : 'کمیونٹی کے چھ پائیدار ستون'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MANIFESTO_CONTENT.pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono text-sky-400 font-bold">0{idx + 1}.</span>
                  <p className="mt-3 font-serif text-lg text-slate-100 font-medium leading-snug">
                    {language === 'en' ? pillar.en : pillar.ur}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px]">RealtorX Standard</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Closing Responsibility Callout */}
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-slate-900 to-[#080d21] border border-amber-500/30 text-center relative overflow-hidden shadow-xl">
          <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium">
              {language === 'en' ? 'Our Responsibility' : 'ہم میں سے ہر ایک کی ذمہ داری'}
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {language === 'en' ? MANIFESTO_CONTENT.closing.en : MANIFESTO_CONTENT.closing.ur}
            </p>
            <div className="pt-2">
              <span className="font-serif text-2xl sm:text-3xl tracking-wider text-amber-300 font-bold">
                {language === 'en' ? MANIFESTO_CONTENT.motto : MANIFESTO_CONTENT.mottoUrdu}
              </span>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onTakeOath}
                className="px-6 py-3 rounded-lg text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 transition-all shadow-md flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>{language === 'en' ? 'Pledge the Founding Oath' : 'بانی حلف نامہ پر دستخط کریں'}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
              <button
                onClick={onViewPhilosophy}
                className="px-5 py-3 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-2"
              >
                <Quote className="w-4 h-4 text-amber-400" />
                <span>{language === 'en' ? 'Read Engraved Hub Philosophy' : 'ہب کی مرکزی دیوار دیکھیں'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </article>
  );
};
