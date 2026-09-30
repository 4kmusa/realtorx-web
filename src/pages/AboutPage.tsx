import React from 'react';
import { PageId, Language } from '../types';
import { BRAND_TAGLINES } from '../data/mockProperties';
import { RealtorXLogo } from '../components/RealtorXLogo';
import { Users, Heart, ShieldCheck, Target, Award, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, language }) => {
  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="flex justify-center mb-4">
          <RealtorXLogo size="lg" showSubtitle={false} />
        </div>

        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#2490EF] bg-[#2490EF]/10 border border-[#2490EF]/30 px-3.5 py-1 rounded-full">
          <span>Our Story &amp; Purpose</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold text-white font-heading">
          Real Estate. Reimagined.
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Realtor X was born out of a real problem in Bahria Town Karachi: when projects faced delays and files became uncertain, ordinary families were left alone with no one advocating for their hard-earned life savings.
        </p>
      </div>

      {/* Philosophy Callout */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-950 via-[#0B1A30] to-slate-950 border border-slate-800 text-center space-y-4 shadow-xl">
        <span className="text-xs font-mono uppercase text-[#F5A623] tracking-widest block font-semibold">
          The Realtor X Founding Core Belief
        </span>
        <blockquote className="text-xl sm:text-3xl font-serif italic text-white max-w-3xl mx-auto leading-snug">
          "{BRAND_TAGLINES.philosophy}"
        </blockquote>
        <div className="font-urdu text-lg text-slate-300">
          {BRAND_TAGLINES.philosophyUrdu}
        </div>
      </div>

      {/* Bahria Ka Dost Community Connection */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#F5A623]/20 border border-[#F5A623]/40 flex items-center justify-center text-[#F5A623]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">
              The 'Bahria Ka Dost' Community Spirit
            </h2>
            <div className="text-xs text-slate-400 font-mono">
              Rooted in Solidarity, Not Selfish Competition
            </div>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Through years of standing beside allottees in Bahria Town Karachi, our convener Waseem and the founding team realized that the real estate industry was suffering from broken trust. Dealers were fighting each other over fractional margins, while buyers were anxious about duplicate files or delayed utility connections.
        </p>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Realtor X changed this by creating an open brotherhood. We introduced the <strong>40/60 commission split</strong> where closing agents keep 60% of the commission, legal assistance is shared freely, and verified listings are accessible to all member custodians without hidden fees.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="font-bold text-white text-sm mb-1">Our Mission</h4>
            <p className="text-xs text-slate-400">Connect, collaborate, and grow the real estate fraternity with unconditional ethics.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="font-bold text-white text-sm mb-1">Our Vision</h4>
            <p className="text-xs text-slate-400">Make Bahria Town Karachi the most transparent and secure property investment corridor in Pakistan.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="font-bold text-white text-sm mb-1">Our Promise</h4>
            <p className="text-xs text-slate-400">Protect the allottee first, empower the dealer second, and earn trust through actions.</p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('manifesto')}
          className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 shadow-lg inline-flex items-center gap-2"
        >
          <span>Read The Complete RealtorX Manifesto</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>

    </div>
  );
};
