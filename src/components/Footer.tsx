// src/components/Footer.tsx
import React, { useState, useEffect } from 'react';
import { callPost } from '../services/api/client';
import { PageId, Language } from '../types';
import { RealtorXLogo } from './RealtorXLogo';
import { PHILOSOPHY } from '../features/membership/content';
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
  CheckCircle2,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  language: Language;
  onOpenSocialModal?: () => void;
}

// ═══════════════════════════════════════════════════════
// Scroll Reveal Hook
// ═══════════════════════════════════════════════════════
function useScrollReveal() {
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
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );
    document.querySelectorAll('.footer-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, language, onOpenSocialModal }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState<'' | 'subscribed' | 'already_subscribed'>('');
  const [subscribeError, setSubscribeError] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useScrollReveal();

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    setSubscribeError('');
    try {
      const result = await callPost<{ status: 'subscribed' | 'already_subscribed' }>(
        'realtor_x.api.v1.subscribe_newsletter',
        { email: email.trim() }
      );
      setSubscribed(result?.status === 'already_subscribed' ? 'already_subscribed' : 'subscribed');
      setEmail('');
    } catch (err: any) {
      // Only confirm a subscription the server actually stored.
      setSubscribeError(err?.message || 'Could not subscribe right now. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://facebook.com',
      icon: Facebook,
      hoverBg: 'hover:bg-[#1877F2]',
      hoverBorder: 'hover:border-[#1877F2]',
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com',
      icon: Instagram,
      hoverBg: 'hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF]',
      hoverBorder: 'hover:border-transparent',
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: Linkedin,
      hoverBg: 'hover:bg-[#0A66C2]',
      hoverBorder: 'hover:border-[#0A66C2]',
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com',
      icon: Youtube,
      hoverBg: 'hover:bg-red-600',
      hoverBorder: 'hover:border-red-600',
    },
  ];

  return (
    <>
      <footer className="relative bg-gradient-to-b from-[#0B1A30] to-[#0B1A30] border-t border-white/[0.06] text-slate-400 overflow-hidden">
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
          <div className="pt-14 pb-12 border-b border-white/[0.06] footer-reveal scroll-reveal">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#F5A623] mb-3">
                  <Send className="w-3.5 h-3.5" />
                  <span>Stay Updated</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-heading leading-tight tracking-[-0.02em]">
                  New listings, straight to your inbox.
                </h3>
                <p className="text-sm text-slate-400 mt-2 max-w-lg leading-relaxed">
                  Be the first to know about new verified listings, Hub events and community news.
                </p>
              </div>

              <div className="lg:col-span-6">
                {subscribed ? (
                  <div className="p-5 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center gap-3 animate-fade-in">
                    <div className="w-10 h-10 rounded-full bg-[#22C55E]/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {subscribed === 'already_subscribed' ? 'You are already subscribed' : 'Subscribed!'}
                      </div>
                      <div className="text-xs text-slate-400">
                        We'll email you when we publish new listings.
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
                        className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#94A3B8]/60 focus:bg-white/[0.05] focus:ring-4 focus:ring-[#94A3B8]/10 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={subscribing}
                      className="relative px-6 py-3.5 rounded-xl text-sm font-bold text-slate-950 bg-[#F5A623] hover:bg-[#E59615] transition-all shadow-lg shadow-[#F5A623]/20 hover:shadow-[#F5A623]/40 flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden group active:scale-[0.98]"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative z-10">Subscribe</span>
                      <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </form>
                )}
                {subscribeError && (
                  <p role="alert" className="mt-2 text-xs text-rose-400">
                    {subscribeError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ═════ Main Grid ═════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 py-14 border-b border-white/[0.06]">

            {/* Brand Column */}
            <div className="lg:col-span-3 space-y-5 footer-reveal scroll-reveal scroll-reveal">
              <RealtorXLogo size="xl" showSubtitle={false} />

              <p className="text-xs text-slate-300 italic font-heading leading-relaxed max-w-sm">
                "{PHILOSOPHY}"
              </p>

              <div className="text-xs text-slate-400 font-medium">
                CONNECT · COLLABORATE · GROW
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                RealtorX is a real estate community: a verified marketplace, oath-bound members, a
                Solution Desk and the RealtorX Hub, starting in Bahria Town Karachi.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-2 pt-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className={`w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] ${social.hoverBg} ${social.hoverBorder} flex items-center justify-center transition-all duration-300 group`}
                      aria-label={social.name}
                    >
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Explore Properties */}
            <div className="lg:col-span-2 footer-reveal scroll-reveal">
              <div className="flex items-center gap-2 mb-5">
                <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                <h4 className="text-sm font-semibold text-white">
                  Explore
                </h4>
              </div>
              <ul className="space-y-3 text-xs">
                {[
                  { label: 'Marketplace', route: 'properties' as PageId },
                  { label: 'Post a Property', route: 'post-listing' as PageId },
                  { label: 'Projects', route: 'projects' as PageId },
                  { label: 'Developer Program', route: 'developer-program' as PageId },
                  { label: 'Solution Desk', route: 'solutions' as PageId },
                  { label: 'RealtorX Hub', route: 'hub' as PageId },
                  { label: 'FAQ', route: 'faq' as PageId },
                  { label: 'Contact', route: 'contact' as PageId },
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => onNavigate(item.route)}
                      className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <span className="w-0 h-[1px] bg-[#F5A623] group-hover:w-3 transition-all duration-300" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community & Culture */}
            <div className="lg:col-span-2 footer-reveal scroll-reveal">
              <div className="flex items-center gap-2 mb-5">
                <Users className="w-3.5 h-3.5 text-[#F5A623]" />
                <h4 className="text-sm font-semibold text-white">
                  Community
                </h4>
              </div>
              <ul className="space-y-3 text-xs">
                {[
                  { label: 'Join RealtorX', route: 'join' as PageId },
                  { label: 'Member Directory', route: 'members' as PageId },
                  { label: 'Manifesto', route: 'manifesto' as PageId },
                  { label: 'The Code & Oath', route: 'code' as PageId },
                  { label: 'About Us', route: 'about' as PageId },
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => onNavigate(item.route)}
                      className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <span className="w-0 h-[1px] bg-[#F5A623] group-hover:w-3 transition-all duration-300" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="lg:col-span-2 footer-reveal scroll-reveal">
              <div className="flex items-center gap-2 mb-5">
                <Scale className="w-3.5 h-3.5 text-[#22C55E]" />
                <h4 className="text-sm font-semibold text-white">
                  Legal
                </h4>
              </div>
              <ul className="space-y-3 text-xs">
                {[
                  { label: 'Privacy Notice', route: 'privacy' as PageId },
                  { label: 'Terms of Use', route: 'terms' as PageId },
                ].map(({ label, route }) => (
                  <li key={label}>
                    <button
                      onClick={() => onNavigate(route)}
                      className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <span className="w-0 h-[1px] bg-[#22C55E] group-hover:w-3 transition-all duration-300" />
                      <span>{label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-3 footer-reveal scroll-reveal">
              <div className="flex items-center gap-2 mb-5">
                <Compass className="w-3.5 h-3.5 text-[#94A3B8]" />
                <h4 className="text-sm font-semibold text-white">
                  Contact
                </h4>
              </div>
              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-2.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-[#F5A623] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Suite 402, Opal Mall, Jinnah Avenue, Bahria Town Karachi
                  </span>
                </div>
                <a
                  href="tel:+923049383785"
                  className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                  <span>+92 304 9383785</span>
                </a>
                <a
                  href="https://wa.me/923049383785"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
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
          <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs footer-reveal scroll-reveal">
            <div className="text-slate-500 text-center sm:text-left">
              © {currentYear} Realtor X. All Rights Reserved.
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <span className="text-[#94A3B8] font-medium">Real Estate. Reimagined.</span>
              <span className="text-slate-700 hidden sm:inline">·</span>
              <span className="font-urdu text-sm text-slate-400">اعتماد کے ساتھ پراپرٹی کا سفر</span>
              {onOpenSocialModal && (
                <>
                  <span className="text-slate-700 hidden sm:inline">·</span>
                  <button
                    onClick={onOpenSocialModal}
                    className="text-slate-400 hover:text-[#F5A623] transition-colors flex items-center gap-1.5"
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
        className={`fixed bottom-24 right-4 sm:right-6 z-40 w-11 h-11 rounded-full bg-[#0B1A30]/85 hover:bg-[#E59615] backdrop-blur-md border border-white/[0.1] hover:border-[#F5A623] flex items-center justify-center text-slate-300 hover:text-white transition-all duration-500 group shadow-2xl shadow-black/40 ${
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </>
  );
};
