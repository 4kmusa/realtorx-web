// ═══════════════════════════════════════════════════════
// src/components/Footer.tsx
// Premium 5-column footer with newsletter & back-to-top
// ═══════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { PageId, Language } from '../types';
import { RealtorXLogo } from './RealtorXLogo';
import { BRAND_TAGLINES } from '../data/mockProperties';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Share2,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  ArrowUp,
  Send,
  Building2,
  Users,
  Scale,
  Compass,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  language: Language;
  onOpenSocialModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, language, onOpenSocialModal }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="relative bg-gradient-to-b from-[#050C16] to-[#02060C] border-t border-white/[0.06] text-slate-400 overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute inset-x-0 top-0 h-96 pointer-events-none opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 30% 0%, rgba(36, 144, 239, 0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 0%, rgba(245, 166, 35, 0.08) 0%, transparent 60%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ═════ Newsletter Band ═════ */}
          <div className="pt-14 pb-12 border-b border-white/[0.06]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.15em] text-[#F5A623] mb-3">
                  <Send className="w-3.5 h-3.5" />
                  <span>Stay Updated</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-heading leading-tight">
                  New listings, straight to your inbox.
                </h3>
                <p className="text-sm text-slate-400 mt-2 max-w-lg">
                  Be the first to know about verified Bahria Town properties, price drops, and
                  exclusive Realtor X listings.
                </p>
              </div>

              <div className="lg:col-span-6">
                {subscribed ? (
                  <div className="p-5 rounded-2xl bg-[#28A745]/10 border border-[#28A745]/30 flex items-center gap-3 animate-fade-in">
                    <div className="w-10 h-10 rounded-full bg-[#28A745]/20 flex items-center justify-center shrink-0">
                      <Send className="w-5 h-5 text-[#28A745]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Subscribed!</div>
                      <div className="text-xs text-slate-400">
                        We'll send you the next update.
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]/60 focus:bg-white/[0.05] focus:ring-4 focus:ring-[#2490EF]/10 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="relative px-6 py-3.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 transition-all shadow-lg shadow-[#F5A623]/20 hover:shadow-[#F5A623]/40 flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden group active:scale-[0.98]"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative z-10">Subscribe</span>
                      <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* ═════ Main Grid ═════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 py-14 border-b border-white/[0.06]">
            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-5">
              <RealtorXLogo size="xl" showSubtitle={false} />

              <p className="text-xs text-slate-300 italic font-display leading-relaxed max-w-sm">
                "{BRAND_TAGLINES.philosophy}"
              </p>

              <div className="font-mono text-[11px] text-[#2490EF] font-semibold tracking-wider">
                CONNECT · COLLABORATE · GROW
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Realtor X is the trusted real estate ecosystem for Bahria Town Karachi. Built on
                integrity, transparent verified documentation, and authentic allottee protection.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-2 pt-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-[#1877F2] border border-white/[0.06] hover:border-[#1877F2] flex items-center justify-center transition-all duration-300 group"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] border border-white/[0.06] hover:border-transparent flex items-center justify-center transition-all duration-300 group"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-[#0A66C2] border border-white/[0.06] hover:border-[#0A66C2] flex items-center justify-center transition-all duration-300 group"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-red-600 border border-white/[0.06] hover:border-red-600 flex items-center justify-center transition-all duration-300 group"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>

            {/* Explore Properties */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <Building2 className="w-3.5 h-3.5 text-[#2490EF]" />
                <h4 className="text-[11px] uppercase font-mono tracking-[0.12em] text-white font-semibold">
                  Explore
                </h4>
              </div>
              <ul className="space-y-3 text-xs">
                {[
                  { label: 'All Listings', route: 'properties' as PageId },
                  { label: 'Projects', route: 'projects' as PageId },
                  { label: 'Services', route: 'services' as PageId },
                  { label: 'About Us', route: 'about' as PageId },
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => onNavigate(item.route)}
                      className="text-slate-400 hover:text-white transition-colors relative group inline-flex items-center gap-1.5"
                    >
                      <span className="w-0 h-[1px] bg-[#2490EF] group-hover:w-3 transition-all duration-300" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community & Culture */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <Users className="w-3.5 h-3.5 text-[#F5A623]" />
                <h4 className="text-[11px] uppercase font-mono tracking-[0.12em] text-white font-semibold">
                  Community
                </h4>
              </div>
              <ul className="space-y-3 text-xs">
                {[
                  { label: 'Manifesto', route: 'manifesto' as PageId },
                  { label: 'Founding Oath', route: 'oath' as PageId },
                  { label: 'The Code', route: 'code' as PageId },
                  { label: 'Become a Dealer', route: 'become-dealer' as PageId },
                  { label: 'Members', route: 'community' as PageId },
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => onNavigate(item.route)}
                      className="text-slate-400 hover:text-white transition-colors relative group inline-flex items-center gap-1.5"
                    >
                      <span className="w-0 h-[1px] bg-[#F5A623] group-hover:w-3 transition-all duration-300" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <Scale className="w-3.5 h-3.5 text-[#28A745]" />
                <h4 className="text-[11px] uppercase font-mono tracking-[0.12em] text-white font-semibold">
                  Legal
                </h4>
              </div>
              <ul className="space-y-3 text-xs">
                {[
                  'Privacy Policy',
                  'Terms of Service',
                  'Cookie Policy',
                  'Disclaimer',
                ].map((label) => (
                  <li key={label}>
                    <button
                      className="text-slate-400 hover:text-white transition-colors relative group inline-flex items-center gap-1.5"
                    >
                      <span className="w-0 h-[1px] bg-[#28A745] group-hover:w-3 transition-all duration-300" />
                      <span>{label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <Compass className="w-3.5 h-3.5 text-[#2490EF]" />
                <h4 className="text-[11px] uppercase font-mono tracking-[0.12em] text-white font-semibold">
                  Get in Touch
                </h4>
              </div>
              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-2.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-[#F5A623] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Suite 402, Opal Mall, Main Jinnah Avenue, Bahria Town Karachi
                  </span>
                </div>
                <a
                  href="tel:+923049383785"
                  className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#2490EF] shrink-0" />
                  <span>+92 304 9383785</span>
                </a>
                <a
                  href="https://wa.me/923049383785"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#28A745] shrink-0" />
                  <span>Chat on WhatsApp</span>
                </a>
                <a
                  href="mailto:info@realtorx.co"
                  className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>info@realtorx.co</span>
                </a>
                <div className="flex items-center gap-2.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Mon – Sat: 10 AM – 8 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* ═════ Bottom Bar ═════ */}
          <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-slate-500 text-center sm:text-left">
              © {currentYear} Realtor X. All Rights Reserved.
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <span className="text-[#2490EF] font-medium">Real Estate. Reimagined.</span>
              <span className="text-slate-700 hidden sm:inline">·</span>
              <span className="font-urdu text-sm text-slate-400">اعتماد کے ساتھ پراپرٹی کا سفر</span>
              {onOpenSocialModal && (
                <>
                  <span className="text-slate-700 hidden sm:inline">·</span>
                  <button
                    onClick={onOpenSocialModal}
                    className="text-slate-400 hover:text-[#2490EF] transition-colors flex items-center gap-1.5"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Share</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* ═════ Back to Top ═════ */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-24 right-4 sm:right-6 z-40 w-11 h-11 rounded-full bg-white/[0.06] hover:bg-[#2490EF] backdrop-blur-md border border-white/[0.1] hover:border-[#2490EF] flex items-center justify-center text-slate-300 hover:text-white transition-all duration-500 group ${
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </>
  );
};
