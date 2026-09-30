import React, { useState, useRef, useEffect } from 'react';
import { PageId, Language } from '../types';
import { RealtorXLogo } from '../components/RealtorXLogo';
import {
  ShieldCheck,
  Check,
  CheckCircle2,
  PenTool,
  RotateCcw,
  Sparkles,
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
} from 'lucide-react';

interface OathPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

const ERPNEXT_URL = import.meta.env.VITE_ERPNEXT_URL || 'http://172.23.173.190:8000';
const API_KEY = import.meta.env.VITE_ERPNEXT_API_KEY || '';
const API_SECRET = import.meta.env.VITE_ERPNEXT_API_SECRET || '';

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
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

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

  const stopDrawing = () => {
    setIsDrawing(false);
  };

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

  const allPromisesChecked = OATH_PROMISES.every((_, i) => checkedPromises[i]);
  const isFormValid =
    fullName.trim() &&
    cnic.trim() &&
    email.trim() &&
    phone.trim() &&
    allPromisesChecked &&
    hasSignature;

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

      const response = await fetch(`${ERPNEXT_URL}/api/resource/RealtorX Member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${API_KEY}:${API_SECRET}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData?.exception || errData?.message || `Failed (HTTP ${response.status})`
        );
      }

      const result = await response.json();
      const createdName = result.data?.name || memberId;

      setMemberName(createdName);
      setStatusMessage(`Registered as ${createdName}`);
      setSubmitted(true);
      console.log('✅ RealtorX Member created:', createdName);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ─────────────────────────────────────────────
  // SUCCESS SCREEN
  // ─────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0E2849] to-[#0A1628] border border-[#28A745]/40 shadow-2xl">
          <div className="w-24 h-24 mx-auto rounded-full bg-[#28A745]/15 border-2 border-[#28A745]/40 flex items-center justify-center">
            <Check className="w-12 h-12 text-[#28A745]" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5A623] mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Founding Member Registered</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading mb-3">
              Welcome to Realtor X, {fullName.split(' ')[0]}!
            </h1>
            <p className="text-slate-300 max-w-xl mx-auto leading-relaxed">
              Your oath has been recorded in the RealtorX community registry. Your
              Founding Member Custodian ID: <span className="text-[#F5A623] font-mono font-bold">{memberName}</span>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-left space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Member ID</span>
              <span className="text-white font-mono font-bold">{memberName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Full Name</span>
              <span className="text-white font-semibold">{fullName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Email</span>
              <span className="text-white">{email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">City</span>
              <span className="text-white">{city}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Tier</span>
              <span className="text-[#F5A623] font-bold">Founding Member</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Oath Date</span>
              <span className="text-white">{date}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Status</span>
              <span className="flex items-center gap-1.5 text-[#28A745] font-bold">
                <CheckCircle2 className="w-4 h-4" /> Verified
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Certificate
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 rounded-xl shadow-md transition-all"
            >
              Back to Home
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // MAIN OATH FORM
  // ─────────────────────────────────────────────
  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="flex justify-center mb-6">
          <RealtorXLogo size="lg" showSubtitle={false} />
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/30 px-3.5 py-1.5 rounded-full mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Foundational Charter 02 · The Oath</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white font-heading leading-tight mb-4">
          THE REALTORX OATH
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          By taking this oath, you commit to upholding the values of Realtor X. This is
          a personal promise — a custodian's covenant with the community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Personal Info */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center">
              <User className="w-5 h-5 text-[#2490EF]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">
                Step 1 — Your Details
              </h2>
              <p className="text-xs text-slate-400">All fields are required</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Muhammad Ahmed Khan"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                CNIC / ID Number *
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  placeholder="42101-1234567-1"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                Phone / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                City *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Karachi"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                Agency / Firm (Optional)
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Your agency or firm name"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                Realtor License / Broker ID (Optional)
              </label>
              <input
                type="text"
                value={licenseNo}
                onChange={(e) => setLicenseNo(e.target.value)}
                placeholder="License number"
                className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#2490EF]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Promises */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#F5A623]/15 border border-[#F5A623]/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#F5A623]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">
                Step 2 — Affirm Every Promise
              </h2>
              <p className="text-xs text-slate-400">
                Check each box to acknowledge your commitment
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {OATH_PROMISES.map((promise, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => togglePromise(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                  checkedPromises[idx]
                    ? 'bg-[#28A745]/10 border-[#28A745]/40'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    checkedPromises[idx]
                      ? 'bg-[#28A745] border-[#28A745]'
                      : 'border-slate-600'
                  }`}
                >
                  {checkedPromises[idx] && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  )}
                </div>
                <span
                  className={`text-sm leading-relaxed ${
                    checkedPromises[idx] ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {promise}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Signature */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center">
                <PenTool className="w-5 h-5 text-[#2490EF]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-heading">
                  Step 3 — Sign Below
                </h2>
                <p className="text-xs text-slate-400">Draw your signature with mouse or touch</p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearSignature}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
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
              className="w-full h-[200px] bg-slate-950 border-2 border-dashed border-slate-700 rounded-xl cursor-crosshair touch-none"
            />
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-sm text-slate-600 italic">Sign here...</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              By signing, you agree to all 9 promises above
            </span>
            <span className="text-[#28A745] font-mono">
              🔒 Digital signature stored securely
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm text-red-300">{error}</div>
          </div>
        )}

        {/* Submit */}
        <div className="text-center space-y-4">
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 rounded-xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting Oath...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Take the Realtor X Oath
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your oath will be permanently recorded in the Realtor X community registry.
            You will receive a Founding Member Custodian ID.
          </p>
        </div>
      </form>
    </div>
  );
};
