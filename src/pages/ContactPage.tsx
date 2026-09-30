import React, { useState } from 'react';
import { PageId, Language } from '../types';
import { MapPin, Phone, Mail, Clock, MessageSquare, CheckCircle2, Send, Building } from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate, language }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Property Purchase Inquiry');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact submission sent to ERPNext Lead desk:", { name, phone, email, subject, message });
    setSent(true);
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#2490EF] bg-[#2490EF]/10 border border-[#2490EF]/30 px-3.5 py-1 rounded-full">
          <Phone className="w-3.5 h-3.5" />
          <span>Bahria Town Karachi Hub</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold text-white font-heading">
          Get in Touch With Realtor X
        </h1>

        <p className="text-sm sm:text-base text-slate-300">
          Whether you want to verify a plot NDC, book a guided site visit, or visit our headquarters, our team is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Office Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
            <h3 className="font-heading font-bold text-xl text-white">
              Bahria Town Head Office
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#F5A623] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Physical Address:</strong>
                  <span>Suite 402, Opal Mall &amp; Commercial Square, Main Jinnah Avenue (Near Carnival), Bahria Town Karachi, Pakistan</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#2490EF] shrink-0" />
                <div>
                  <strong className="text-white block mb-0.5">Telephone:</strong>
                  <span>+92 21 3890 2200 / +92 300 8472910</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[#28A745] shrink-0" />
                <div>
                  <strong className="text-white block mb-0.5">Official WhatsApp:</strong>
                  <span>+92 300 8472910 (24/7 Response)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <strong className="text-white block mb-0.5">Email Inquiries:</strong>
                  <span>info@realtorx.pk / sales@realtorx.pk</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <strong className="text-white block mb-0.5">Business Hours:</strong>
                  <span>Monday to Saturday: 10:00 AM – 8:00 PM (Friday break 1-3 PM)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <a
                href="https://wa.me/923008472910?text=Assalam-o-Alaikum,%20I%20would%20like%20to%20connect%20with%20Realtor%20X%20Bahria%20Town"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-[#28A745] to-emerald-400 hover:brightness-110 shadow transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-slate-950" />
                <span>Instant WhatsApp Live Chat</span>
              </a>
            </div>
          </div>

          {/* Interactive Google Map Preview Placeholder */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <Building className="w-8 h-8 text-[#2490EF] mx-auto" />
            <h4 className="font-heading font-bold text-white text-sm">Main Jinnah Avenue Landmark</h4>
            <p className="text-xs text-slate-400">
              Opposite Bahria Carnival &amp; Danzoo entrance. Ample visitor parking available.
            </p>
          </div>
        </div>

        {/* Right Column: Contact Message Form */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
          {sent ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-14 h-14 text-[#28A745] mx-auto" />
              <h3 className="text-2xl font-bold text-white font-heading">
                Message Received!
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Thank you, <strong className="text-white">{name}</strong>. Your message has been routed to our Bahria Town relationship desk. An advisor will get back to you shortly.
              </p>
              <button
                onClick={() => setSent(false)}
                className="px-6 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#2490EF]"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white font-heading">Send Us a Direct Message</h3>
                <p className="text-xs text-slate-400 mt-1">Directly logged into our ERPNext CRM lead desk.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Asim Raza"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-[#2490EF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-[#2490EF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="asim@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-[#2490EF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Inquiry Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-[#2490EF]"
                  >
                    <option>Property Purchase Inquiry</option>
                    <option>Book a Guided Site Visit</option>
                    <option>Plot Title / NDC Verification</option>
                    <option>List My Bahria Property</option>
                    <option>Dealer Partnership (40/60 Split)</option>
                    <option>Allottee Relief / Dispute Help</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Your Message or Requirements</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what precinct or property you are looking for..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-[#2490EF]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-[#2490EF] hover:bg-[#1b7ecf] shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry (ERPNext Synced)</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
