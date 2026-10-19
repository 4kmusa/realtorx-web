import React, { useEffect, useRef, useState } from 'react';
import { X, Send, CheckCircle2, Hash, ShieldCheck, Loader2 } from 'lucide-react';
import { callPost } from '../services/api/client';

const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'] as const;

/** UTM parameters from the current URL (query string or the part after '?' in the hash). */
function readAttribution(): Record<string, string> {
  const out: Record<string, string> = {};
  const sources = [window.location.search, window.location.hash.split('?')[1] || ''];
  for (const src of sources) {
    const params = new URLSearchParams(src);
    for (const key of ATTRIBUTION_KEYS) {
      const value = params.get(key);
      if (value && !out[key]) out[key] = value.slice(0, 140);
    }
  }
  return out;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  message: string;
  consent: boolean;
}

const PK_MOBILE = /^0?3\d{9}$/;

export default function InquiryModal({
  propertyId,
  onClose,
}: {
  propertyId: string;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    message: '',
    consent: false,
  });
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [leadRef, setLeadRef] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState(false);
  const [error, setError] = useState('');
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    firstFieldRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const phoneDigits = formData.phone.replace(/[\s-]/g, '');
  const errors: Partial<Record<keyof FormData, string>> = {};
  if (formData.name.trim().length < 2) errors.name = 'Please enter your full name';
  if (!PK_MOBILE.test(phoneDigits))
    errors.phone = 'Enter a valid mobile number, e.g. 0300 1234567';
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
    errors.email = 'Enter a valid email address';
  if (formData.message.trim().length < 5)
    errors.message = 'Tell us a little about your requirement';
  if (!formData.consent) errors.consent = 'Please confirm we may contact you';

  const fieldError = (field: keyof FormData) =>
    touched[field] && errors[field] ? errors[field] : undefined;

  const inputBase =
    'w-full rounded-lg border bg-[#081221] p-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-[#F5A623]';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true, message: true, consent: true });
    setError('');
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const result = await callPost<{ lead: string; duplicate: boolean }>(
        'realtor_x.api.v1.create_property_inquiry',
        {
          property_id: propertyId,
          name: formData.name.trim(),
          phone: phoneDigits,
          email: formData.email.trim(),
          message: formData.message.trim(),
          consent: formData.consent ? 1 : 0,
          landing_page: `${window.location.pathname}${window.location.hash}`.slice(0, 500),
          ...readAttribution(),
        }
      );
      if (!result?.lead) throw new Error('We could not send your inquiry. Please try again.');
      setDuplicate(!!result.duplicate);
      setLeadRef(result.lead);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-title"
    >
      <div
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0B1A30] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-[#081221] p-6">
          <div>
            <h2 id="inquiry-title" className="text-xl font-bold text-white">
              Contact Agent
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
              <Hash className="h-3 w-3" /> {propertyId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {leadRef ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h3 className="text-xl font-bold text-white">Inquiry Received</h3>
            <p className="mt-2 text-sm text-slate-400">
              {duplicate
                ? 'We already have your inquiry for this property and have added your new message to it. A RealtorX agent will contact you shortly.'
                : 'Thank you for your interest. A RealtorX agent will contact you shortly.'}
            </p>
            <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#081221] px-4 py-2">
              <span className="text-xs text-slate-500">Reference</span>
              <span className="font-mono text-sm font-semibold text-[#F5A623]">{leadRef}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-7 w-full rounded-lg bg-[#F5A623] py-3 font-bold text-black transition-colors hover:bg-[#d98c15]"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="inq-name" className="mb-1 block text-xs font-medium text-slate-400">
                Your Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="inq-name"
                ref={firstFieldRef}
                required
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                aria-invalid={!!fieldError('name')}
                className={`${inputBase} ${
                  fieldError('name') ? 'border-rose-500/50' : 'border-white/10'
                }`}
              />
              {fieldError('name') && (
                <p className="mt-1 text-xs text-rose-400">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="inq-phone" className="mb-1 block text-xs font-medium text-slate-400">
                Mobile Number <span className="text-rose-400">*</span>
              </label>
              <div>
                <input
                  id="inq-phone"
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={14}
                  placeholder="0300 1234567"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value.replace(/[^\d\s-]/g, '') })
                  }
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  aria-invalid={!!fieldError('phone')}
                  className={`${inputBase} ${
                    fieldError('phone') ? 'border-rose-500/50' : 'border-white/10'
                  }`}
                />
              </div>
              {fieldError('phone') ? (
                <p className="mt-1 text-xs text-rose-400">{errors.phone}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-600">Format: 0300 1234567</p>
              )}
            </div>

            <div>
              <label htmlFor="inq-email" className="mb-1 block text-xs font-medium text-slate-400">
                Email <span className="font-normal text-slate-600">(optional)</span>
              </label>
              <input
                id="inq-email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                aria-invalid={!!fieldError('email')}
                className={`${inputBase} ${
                  fieldError('email') ? 'border-rose-500/50' : 'border-white/10'
                }`}
              />
              {fieldError('email') && (
                <p className="mt-1 text-xs text-rose-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="inq-message" className="mb-1 block text-xs font-medium text-slate-400">
                Message <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="inq-message"
                required
                rows={3}
                placeholder="I am interested in this property..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                aria-invalid={!!fieldError('message')}
                className={`${inputBase} resize-none ${
                  fieldError('message') ? 'border-rose-500/50' : 'border-white/10'
                }`}
              />
              {fieldError('message') && (
                <p className="mt-1 text-xs text-rose-400">{errors.message}</p>
              )}
            </div>

            <div>
              <label className="flex items-start gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  onBlur={() => setTouched((t) => ({ ...t, consent: true }))}
                  className="mt-0.5 h-4 w-4 accent-[#F5A623]"
                  aria-invalid={!!fieldError('consent')}
                />
                <span>I agree that RealtorX may contact me by phone, WhatsApp or email about this inquiry.</span>
              </label>
              {fieldError('consent') && <p className="mt-1 text-xs text-rose-400">{errors.consent}</p>}
            </div>

            <button
              disabled={loading}
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F5A623] py-3.5 font-bold text-black transition-colors hover:bg-[#d98c15] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Send Inquiry
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              Your details are used only to respond to this inquiry.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
