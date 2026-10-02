// ═══════════════════════════════════════════════════════
// src/components/WhatsAppWidget.tsx (NEW FILE)
// ═══════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '923049383785';
const WHATSAPP_MESSAGE = "Assalam-o-Alaikum, I'd like to know more about Realtor X properties in Bahria Town Karachi.";

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export const WhatsAppWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [pulse, setPulse] = useState(true);

  // Auto-show bubble after 3s on first visit
  useEffect(() => {
    const shown = sessionStorage.getItem('rx_whatsapp_bubble_shown');
    if (!shown) {
      const t = setTimeout(() => {
        setShowBubble(true);
        sessionStorage.setItem('rx_whatsapp_bubble_shown', '1');
      }, 3000);
      return () => clearTimeout(t);
    }
  }, []);

  // Stop pulse after 10 seconds
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 10000);
    return () => clearTimeout(t);
  }, []);

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  const quickMessages = [
    { label: '💬 Property Inquiry', text: "I'd like to inquire about a property listed on Realtor X." },
    { label: '📅 Book a Site Visit', text: "I'd like to book a guided site visit in Bahria Town Karachi." },
    { label: '🏢 Become a Dealer', text: "I'm interested in becoming a Realtor X dealer." },
    { label: '📄 NDC / Docs Help', text: "I need help verifying plot documents / NDC status." },
  ];

  const handleQuickMessage = (text: string) => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      {/* Floating Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[360px] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#25D366] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                  <WhatsAppIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-tight">Realtor X Support</div>
                  <div className="text-[11px] text-white/90 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Online · Usually replies instantly
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3 bg-slate-950">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Hi there! 👋</strong>
                <br />
                How can we help you today? Choose a quick option or start a chat below.
              </div>

              <div className="space-y-2">
                {quickMessages.map((qm, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickMessage(qm.text)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-[#25D366]/50 text-xs text-slate-200 font-medium transition-all flex items-center justify-between group"
                  >
                    <span>{qm.label}</span>
                    <MessageCircle className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#25D366] transition-colors" />
                  </button>
                ))}
              </div>

              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebe5b] text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>Start Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip Bubble */}
      {showBubble && !open && (
        <div className="fixed bottom-[5.5rem] right-4 sm:right-6 z-[55] max-w-[240px] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl rounded-br-sm px-4 py-3 shadow-2xl">
            <button
              onClick={() => setShowBubble(false)}
              className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
            <p className="text-xs text-slate-200 leading-relaxed pr-2">
              <strong className="text-white">Need help?</strong> Chat with us on WhatsApp 👇
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => {
          setOpen(!open);
          setShowBubble(false);
        }}
        className={`fixed bottom-6 right-4 sm:right-6 z-[58] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white shadow-2xl shadow-[#25D366]/40 flex items-center justify-center transition-all hover:scale-105 ${
          pulse ? 'animate-bounce' : ''
        }`}
        aria-label="Open WhatsApp chat"
        title="Chat with us on WhatsApp"
      >
        {open ? <X className="w-6 h-6 sm:w-7 sm:h-7" /> : <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8" />}
        {/* Notification dot */}
        {!open && (
          <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 border-2 border-slate-950 animate-pulse" />
        )}
      </button>
    </>
  );
};
