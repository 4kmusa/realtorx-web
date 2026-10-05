// src/pages/OathPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { PageId, Language } from '../types';
import { RealtorXLogo } from '../components/RealtorXLogo';
import {
  ShieldCheck,
  Check,
  CheckCircle2,
  PenTool,
  RotateCcw,
  Calendar,
  User,
  CreditCard,
  Building2,
  ArrowRight,
  Printer,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Sparkle,
} from 'lucide-react';

interface OathPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

const ERPNEXT_URL = import.meta.env.VITE_ERPNEXT_URL || 'http://172.23.173.190:8000';
const API_BASE = import.meta.env.PROD ? '/api/erp' : `${ERPNEXT_URL}/api`;

const OATH_PROMISES = [
  'I will always place ethics before personal gain.',
  'I will respect every member regardless of their size, experience or background.',
  'I will contribute knowledge, opportunities and support whenever I can.',
  'I will never intentionally mislead, exploit or damage the trust of this community.',
  'I understand that RealtorX is built on collaboration, not selfish competition.',
  'I will protect the reputation of RealtorX through my actions.',
  'I will help solve problems rather than create them.',
  'I will represent professionalism in every interaction.',
  'I join RealtorX not only to grow my own business, but to help strengthen the real estate industry for everyone.',
];

// ═══════════════════════════════════════════════════════
// Scroll Reveal Hook
// ═══════════════════════════════════════════════════════
function useScrollReveal(deps: React.DependencyList = []) {
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
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );

    const checkAndObserve = () => {
      document.querySelectorAll('.scroll-reveal:not(.is-visible)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) el.classList.add('is-visible');
        else observer.observe(el);
      });
    };

    checkAndObserve();

    const mutationObserver = new MutationObserver(() => checkAndObserve());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export const OathPage: React.FC<OathPageProps> = ({ onNavigate, language }) => {
  const [checkedPromises, setCheckedPromises] = useState<Record<number, boolean>>({});
  const [fullName, setFullName] = useState('');
  const [cnic, setCnic] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Karachi');
  const [agencyName, setAgencyName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useScrollReveal([submitted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2490EF';
  }, []);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const togglePromise = (index: number) => {
    setCheckedPromises((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const checkedCount = OATH_PROMISES.filter((_, i) => checkedPromises[i]).length;
  const allPromisesChecked = checkedCount === OATH_PROMISES.length;

  const isFormValid =
    fullName.trim() && cnic.trim() && email.trim() && phone.trim() && allPromisesChecked && hasSignature;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      setError('Please fill all required fields, check all promises, and sign.');
      return;
    }

    setIsSubmitting(true);

    try {
      const memberId = `RX-MEM-${Date.now().toString().slice(-5)}`;

      const payload = {
        member_id: memberId,
        full_name: fullName,
        firm_name: agencyName || 'Independent Custodian',
        role: 'Custodian Realtor',
        city: city,
        email: email,
        phone: phone,
        license_no: licenseNo || '',
        membership_tier: 'Founding Member',
        oath_accepted: 1,
        code_agreed: 1,
        oath_date: date,
        custodian_hash: `RX-VERIFIED-${Date.now()}`,
        bio: 'Founding member dedicated to collaboration, ethics and allottee protection.',
      };

      const response = await fetch(`${API_BASE}/resource/RealtorX Member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData?.exception || errData?.message || `Failed (HTTP ${response.status})`
        );
      }

      const result = await response.json();
      setMemberName(result.data?.name || memberId);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => window.print();

  // ═══════════════════════════════════════════════════════
  // SUCCESS SCREEN
  // ═══════════════════════════════════════════════════════
  if (submitted) {
    return (
      <div className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2rem] overflow-hidden border border-[#28A745]/30 shadow-2xl shadow-[#28A745]/10 scroll-reveal">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0E2849] via-[#0B1A30] to-[#0E2849]" />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                'radial-gradient(ellipse at 30% 30%, rgba(40, 167, 69, 0.20) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(245, 166, 35, 0.12) 0%, transparent 60%)',
            }}
          />
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#28A745]/60 to-transparent" />

          <div className="relative p-8 sm:p-12 text-center space-y-7">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-[#28A745]/15 border-2 border-[#28A745]/40 flex items-center justify-center shadow-xl shadow-[#28A745]/20">
              <Check className="w-12 h-12 text-[#28A745] stroke-[3]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#F5A623] mb-3">
                <Sparkle className="w-3 h-3" />
                <span>Founding Member Registered</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading tracking-[-0.02em] leading-tight mb-3">
                Welcome to Realtor X, {fullName.split(' ')[0]}!
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
                Your oath has been recorded in the RealtorX community registry. Your Founding
                Member Custodian ID:{' '}
                <span className="text-[#F5A623] font-mono font-bold">{memberName}</span>
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/[0.06] text-left space-y-3">
              {[
                { label: 'Member ID', value: memberName, mono: true, highlight: true },
                { label: 'Full Name', value: fullName },
                { label: 'Email', value: email },
                { label: 'City', value: city },
                { label: 'Tier', value: 'Founding Member', highlight: true },
                { label: 'Oath Date', value: date },
              ].map((row, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm gap-3">
                  <span className="text-slate-400 shrink-0">{row.label}</span>
                  <span
                    className={`truncate ${row.mono ? 'font-mono' : ''} ${
                      row.highlight ? 'text-[#F5A623] font-bold' : 'text-white font-semibold'
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm pt-3 border-t border-white/[0.06]">
                <span className="text-slate-400">Status</span>
                <span className="flex items-center gap-1.5 text-[#28A745] font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Verified
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/[0.2] rounded-2xl transition-all"
              >
                <Printer className="w-4 h-4" />
                Print Certificate
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="relative inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] via-[#FFB84D] to-[#F5A623] hover:brightness-110 rounded-2xl shadow-xl shadow-[#F5A623]/30 transition-all overflow-hidden group active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10">Back to Home</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // MAIN OATH FORM
  // ═══════════════════════════════════════════════════════
  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* ═════ HERO ═════ */}
      <div className="text-center max-w-3xl mx-auto mb-14 scroll-reveal">
        <div className="flex justify-center mb-8">
          <RealtorXLogo size="lg" showSubtitle={false} />
        </div>

        <div className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[#F5A623] bg-[#F5A623]/[0.08] border border-[#F5A623]/25 px-4 py-2 rounded-full mb-7 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5A623]" />
          </span>
          <span>Foundational Charter 02 · The Oath</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] text-white font-heading leading-[1.05] mb-6 text-balance">
          The RealtorX <span className="gradient-text">Oath</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          By taking this oath, you commit to upholding the values of Realtor X. This is a
          personal promise — a custodian's covenant with the community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ═════ STEP 1: PERSONAL DETAILS ═════ */}
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-xl shadow-black/20 scroll-reveal">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900/40" />
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#2490EF]/50 to-transparent" />

          <div className="relative p-6 sm:p-8">
            <div className="flex items-center gap-3.5 mb-7 pb-5 border-b border-white/[0.06]">
              <div className="w-12 h-12 rounded-2xl bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center">
                <User className="w-6 h-6 text-[#2490EF]" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#2490EF] mb-1">
                  Step 01
                </div>
                <h2 className="text-xl font-bold text-white font-heading tracking-[-0.01em]">
                  Your Details
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Required fields are marked with *
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.12em]">
                  Full Name *
                </label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#2490EF] transition-colors" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Muhammad Ahmed Khan"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]/60 focus:ring-4 focus:ring-[#2490EF]/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.12em]">
                  CNIC / ID Number *
                </label>
                <div className="relative group">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#2490EF] transition-colors" />
                  <input
                    type="text"
                    required
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                    placeholder="42101-1234567-1"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]/60 focus:ring-4 focus:ring-[#2490EF]/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.12em]">
                  Email *
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#2490EF] transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]/60 focus:ring-4 focus:ring-[#2490EF]/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.12em]">
                  Phone / WhatsApp *
                </label>
                <div className="relative group">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#2490EF] transition-colors" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]/60 focus:ring-4 focus:ring-[#2490EF]/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.12em]">
                  City *
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#2490EF] transition-colors" />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Karachi"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]/60 focus:ring-4 focus:ring-[#2490EF]/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.12em]">
                  Agency / Firm (Optional)
                </label>
                <div className="relative group">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#2490EF] transition-colors" />
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="Your agency name"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]/60 focus:ring-4 focus:ring-[#2490EF]/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.12em]">
                  Realtor License / Broker ID (Optional)
                </label>
                <input
                  type="text"
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  placeholder="License number"
                  className="w-full px-4 py-3 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]/60 focus:ring-4 focus:ring-[#2490EF]/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.12em]">
                  Date
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#2490EF] transition-colors" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white focus:outline-none focus:border-[#2490EF]/60 focus:ring-4 focus:ring-[#2490EF]/10 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═════ STEP 2: PROMISES ═════ */}
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-xl shadow-black/20 scroll-reveal">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900/40" />
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5A623]/50 to-transparent" />

          <div className="relative p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-7 pb-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/15 border border-[#F5A623]/30 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-[#F5A623]" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#F5A623] mb-1">
                    Step 02
                  </div>
                  <h2 className="text-xl font-bold text-white font-heading tracking-[-0.01em]">
                    Affirm Every Promise
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Check each box to acknowledge your commitment
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center min-w-[80px]">
                  <div className="text-lg font-bold text-white tabular-nums leading-none">
                    {checkedCount}
                    <span className="text-slate-500">/{OATH_PROMISES.length}</span>
                  </div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mt-1">
                    Affirmed
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden mb-6">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#28A745] to-[#20c997] transition-all duration-500"
                style={{ width: `${(checkedCount / OATH_PROMISES.length) * 100}%` }}
              />
            </div>

            <div className="space-y-3">
              {OATH_PROMISES.map((promise, idx) => {
                const isChecked = !!checkedPromises[idx];
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => togglePromise(idx)}
                    className={`group w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 ${
                      isChecked
                        ? 'bg-[#28A745]/[0.08] border-[#28A745]/40 shadow-lg shadow-[#28A745]/5'
                        : 'bg-slate-950/50 border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.03]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${
                        isChecked
                          ? 'bg-[#28A745] border-[#28A745] scale-105'
                          : 'border-slate-600 group-hover:border-slate-500'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>

                    <span
                      className={`flex-1 min-w-0 pt-0.5 text-sm leading-relaxed transition-colors ${
                        isChecked ? 'text-white font-medium' : 'text-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-slate-500 mr-2">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      {promise}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═════ STEP 3: SIGNATURE ═════ */}
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-xl shadow-black/20 scroll-reveal">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900/40" />
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#2490EF]/50 to-transparent" />

          <div className="relative p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-7 pb-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center">
                  <PenTool className="w-6 h-6 text-[#2490EF]" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#2490EF] mb-1">
                    Step 03
                  </div>
                  <h2 className="text-xl font-bold text-white font-heading tracking-[-0.01em]">
                    Sign Below
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Draw your signature with mouse or touch
                  </p>
                </div>
              </div>
              {hasSignature && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] rounded-xl transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className={`w-full h-[200px] bg-slate-950/80 border-2 border-dashed rounded-2xl cursor-crosshair touch-none transition-colors ${
                  hasSignature
                    ? 'border-[#2490EF]/40'
                    : 'border-white/[0.1] hover:border-white/[0.2]'
                }`}
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center space-y-2">
                    <PenTool className="w-8 h-8 text-slate-700 mx-auto" />
                    <span className="text-sm text-slate-600 italic block">Sign here...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">
                By signing, you agree to all 9 promises above
              </span>
              <span className="flex items-center gap-1.5 text-[#28A745] font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                Digital signature stored securely
              </span>
            </div>
          </div>
        </div>

        {/* ═════ ERROR ═════ */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm text-red-300 leading-relaxed">{error}</div>
          </div>
        )}

        {/* ═════ SUBMIT ═════ */}
        <div className="text-center space-y-5 scroll-reveal">
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="relative inline-flex items-center gap-2.5 px-8 py-4 text-base font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] via-[#FFB84D] to-[#F5A623] hover:brightness-110 rounded-2xl shadow-xl shadow-[#F5A623]/30 hover:shadow-[#F5A623]/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 overflow-hidden group active:scale-[0.98]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                <span className="relative z-10">Submitting Oath...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Take the Realtor X Oath</span>
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Your oath will be permanently recorded in the Realtor X community registry. You will
            receive a Founding Member Custodian ID.
          </p>
        </div>
      </form>
    </div>
  );
};
