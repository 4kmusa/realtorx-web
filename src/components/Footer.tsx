import React from 'react';
import { PageId, Language } from '../types';
import { RealtorXLogo } from './RealtorXLogo';
import { BRAND_TAGLINES } from '../data/mockProperties';
import { MapPin, Phone, Mail, Clock, MessageSquare, Share2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  language: Language;
  onOpenSocialModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, language, onOpenSocialModal }) => {
  return (
    <footer className="bg-[#050C16] border-t border-slate-800 text-slate-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <RealtorXLogo size="xl" showSubtitle={false} />
            <p className="text-xs text-slate-300 italic font-serif leading-relaxed max-w-sm">
              "{BRAND_TAGLINES.philosophy}"
            </p>
            <div className="font-mono text-xs text-[#2490EF] font-semibold pt-1">
              Connect. Collaborate. Grow. · 40/60 Fair Dealer Commission
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Realtor X is the trusted real estate ecosystem for Bahria Town Karachi. Built on integrity, transparent verified documentation, and authentic allottee protection.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider text-slate-200 font-semibold mb-4">
              Explore Properties
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('properties')} className="hover:text-[#2490EF] transition-colors">
                  All Bahria Listings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('projects')} className="hover:text-[#2490EF] transition-colors">
                  Bahria Town Karachi (BTK-1)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('projects')} className="hover:text-[#2490EF] transition-colors">
                  Bahria Town Karachi 2 (BTK-2)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('projects')} className="hover:text-[#2490EF] transition-colors">
                  Bahria Heights Luxury Flats
                </button>
              </li>
            </ul>
          </div>

          {/* Community & Culture */}
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider text-slate-200 font-semibold mb-4">
              Culture &amp; Community
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('manifesto')} className="hover:text-[#F5A623] transition-colors font-medium">
                  The RealtorX Manifesto
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('oath')} className="hover:text-[#F5A623] transition-colors font-medium">
                  Founding Member Oath
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('code')} className="hover:text-[#F5A623] transition-colors font-medium">
                  The RealtorX Code (8 Tenets)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('become-dealer')} className="hover:text-[#2490EF] transition-colors">
                  Become a Dealer (40/60 Split)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dealer')} className="hover:text-[#F5A623] transition-colors font-medium">
                  Dealer Portal (Auth)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('portal')} className="hover:text-[#2490EF] transition-colors font-medium">
                  Customer Portal (Auth)
                </button>
              </li>
              {onOpenSocialModal && (
                <li>
                  <button onClick={onOpenSocialModal} className="text-[#2490EF] hover:text-white transition-colors flex items-center gap-1.5 font-medium">
                    <Share2 className="w-3.5 h-3.5 text-[#2490EF]" />
                    <span>Social Media &amp; SEO Preview</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Bahria Office & Contact */}
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider text-slate-200 font-semibold mb-4">
              Bahria Karachi Office
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                <span>Suite 402, Opal Mall &amp; Commercial Square, Main Jinnah Avenue, Bahria Town Karachi, Pakistan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#2490EF] shrink-0" />
                <span>+92 21 3890 2200 / +92 300 8472910</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#28A745] shrink-0" />
                <span>WhatsApp: +92 300 8472910</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>info@realtorx.co</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Mon – Sat: 10:00 AM – 8:00 PM</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} Realtor X. All Rights Reserved. Regulated and operating across Bahria Town Karachi.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#2490EF]">Real Estate. Reimagined.</span>
            <span>·</span>
            <span className="font-urdu text-sm text-slate-400">اعتماد کے ساتھ پراپرٹی کا سفر</span>
            <span>·</span>
            <span className="text-emerald-400">Live Sync Active</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
