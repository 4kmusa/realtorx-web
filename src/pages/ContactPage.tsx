// src/pages/ContactPage.tsx
import React, { useState } from 'react';
import { PageId, Language } from '../types';
import { callPost } from '../services/api/client';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  CheckCircle2,
  Send,
  Building,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

const PHONE_DISPLAY = '+92 304 9383785';
const PHONE_TEL = '+923049383785';
const WHATSAPP_NUMBER = '923049383785';
const EMAIL_PRIMARY = 'info@realtorx.co';
const EMAIL_SALES = 'sales@realtorx.co';


const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Property Inquiry');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [duplicate, setDuplicate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    if (!consent) {
      setError('Please confirm that we may contact you about your request.');
      return;
    }

    setSending(true);
    setError(null);
    try {
      const result = await callPost<{ lead: string; duplicate: boolean }>('realtor_x.api.v1.submit_contact_form', {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
        consent: 1,
        landing_page: window.location.pathname.slice(0, 500),
      });
      if (!result?.lead) throw new Error('We could not send your message. Please try again or call us.');
      setDuplicate(!!result.duplicate);
      setSent(true);
    } catch (err: any) {
      // Never report success when the request was not saved.
      setError(err?.message || 'We could not send your message. Please try again or call us.');
    } finally {
      setSending(false);
    }
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Assalam-o-Alaikum, I would like to connect with Realtor X Bahria Town'
  )}`;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#94A3B8] bg-[#94A3B8]/10 border border-[#94A3B8]/30 px-4 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>Bahria Town Karachi Hub</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-heading leading-tight">
          Get in Touch With <span className="text-[#94A3B8]">Realtor X</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Whether you want to verify a plot NDC, book a guided site visit, or visit our
          headquarters, our team is at your service.
        </p>

        {/* Quick contact chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#25D366] hover:bg-[#22C55E] transition-all shadow-md shadow-[#25D366]/30"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>WhatsApp Now</span>
          </a>

          <a
            href={`tel:${PHONE_TEL}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <Phone className="w-4 h-4 text-[#94A3B8]" />
            <span>Call {PHONE_DISPLAY}</span>
          </a>

          <a
            href={`mailto:${EMAIL_PRIMARY}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <Mail className="w-4 h-4 text-[#F5A623]" />
            <span>Email Us</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Office Details */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/70 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-11 h-11 rounded-2xl bg-[#94A3B8]/15 border border-[#94A3B8]/30 flex items-center justify-center">
                <Building className="w-5 h-5 text-[#94A3B8]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-white leading-tight">
                  Bahria Town Head Office
                </h3>
                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                  Karach · Pakistan
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#F5A623]" />
                </div>
                <div>
                  <strong className="text-white block text-xs uppercase tracking-wider mb-1 font-medium">
                    Physical Address
                  </strong>
                  <span className="leading-relaxed text-xs">
                    Suite 402, Opal Mall &amp; Commercial Square, Main Jinnah Avenue
                    (Near Carnival), Bahria Town Karachi, Pakistan
                  </span>
                </div>
              </div>

              <a href={`tel:${PHONE_TEL}`} className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-[#F5A623]/50 transition-colors">
                  <Phone className="w-4 h-4 text-[#94A3B8]" />
                </div>
                <div>
                  <strong className="text-white block text-xs uppercase tracking-wider mb-1 font-medium">
                    Telephone
                  </strong>
                  <span className="leading-relaxed text-xs group-hover:text-white transition-colors">
                    {PHONE_DISPLAY}
                  </span>
                </div>
              </a>

              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-[#25D366]/50 transition-colors">
                  <MessageSquare className="w-4 h-4 text-[#22C55E]" />
                </div>
                <div>
                  <strong className="text-white block text-xs uppercase tracking-wider mb-1 font-medium">
                    Official WhatsApp
                  </strong>
                  <span className="leading-relaxed text-xs group-hover:text-white transition-colors">
                    {PHONE_DISPLAY} · 24/7 Response
                  </span>
                </div>
              </a>

              <a href={`mailto:${EMAIL_PRIMARY}`} className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-[#F5A623]/50 transition-colors">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <strong className="text-white block text-xs uppercase tracking-wider mb-1 font-medium">
                    Email Inquiries
                  </strong>
                  <span className="leading-relaxed text-xs group-hover:text-white transition-colors">
                    {EMAIL_PRIMARY}
                    <br />
                    {EMAIL_SALES}
                  </span>
                </div>
              </a>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <strong className="text-white block text-xs uppercase tracking-wider mb-1 font-medium">
                    Business Hours
                  </strong>
                  <span className="leading-relaxed text-xs">
                    Mon – Sat: 10:00 AM – 8:00 PM
                    <br />
                    Friday break: 1:00 – 3:00 PM
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#25D366] hover:bg-[#22C55E] shadow-lg shadow-[#25D366]/25 transition-all flex items-center justify-center gap-2.5"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>Instant WhatsApp Live Chat</span>
              </a>
            </div>
          </div>

          {/* Map / Landmark Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#94A3B8]/15 border border-[#94A3B8]/30 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6 text-[#94A3B8]" />
            </div>
            <h4 className="font-heading font-bold text-white text-sm">
              Main Jinnah Avenue Landmark
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Opposite Bahria Carnival &amp; Danzoo entrance. Ample visitor parking available.
            </p>
            <button
              onClick={() => onNavigate('properties')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#F5A623] pt-1"
            >
              <span>Browse Properties</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Message Form */}
        <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 to-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">

          {sent ? (
            <div className="text-center py-12 space-y-5">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#22C55E]/15 border border-[#22C55E]/40 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-[#22C55E]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white font-heading mb-2">
                  Message Received!
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-white">{name}</strong>.{' '}
                  {duplicate
                    ? 'We already had a recent request from this number, so we added your new message to it.'
                    : 'Your message has been saved for our relationship desk.'}{' '}
                  An advisor will get back to you shortly.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#25D366] hover:bg-[#22C55E] transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
                <button
                  onClick={() => {
                    setSent(false);
                    setName('');
                    setPhone('');
                    setEmail('');
                    setSubject('Property Purchase Inquiry');
                    setMessage('');
                    setConsent(false);
                    setDuplicate(false);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-[#F5A623]" />
                  Send Us a Direct Message
                </h3>
                <p className="text-xs text-slate-400 mt-2">
                  Fill the form and our team will respond within 24 hours.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Asim Raza"
                    className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#94A3B8] focus:ring-2 focus:ring-[#94A3B8]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#94A3B8] focus:ring-2 focus:ring-[#94A3B8]/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="asim@gmail.com"
                    className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#94A3B8] focus:ring-2 focus:ring-[#94A3B8]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    Inquiry Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#94A3B8] focus:ring-2 focus:ring-[#94A3B8]/20 transition-all cursor-pointer"
                  >
                    <option>Property Inquiry</option>
                    <option>Listing My Property</option>
                    <option>Membership</option>
                    <option>Developer Program</option>
                    <option>Connect Me With a Member</option>
                    <option>Hub Booking or Event</option>
                    <option>General Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Your Message or Requirements
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what precinct or property you are looking for..."
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#94A3B8] focus:ring-2 focus:ring-[#94A3B8]/20 transition-all resize-none"
                />
              </div>

              <label className="flex items-start gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#F5A623]"
                />
                <span>I agree that RealtorX may contact me by phone, WhatsApp or email about this request.</span>
              </label>

              {error && (
                <div role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#F5A623] to-[#E59615] hover:brightness-110 shadow-lg shadow-[#F5A623]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Inquiry
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                By submitting, you agree to be contacted by our team regarding your inquiry.
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
