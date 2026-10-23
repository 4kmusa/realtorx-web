import React, { useEffect, useRef, useState } from 'react';
import { Modal, Sent } from './site/Modal';
import { Alert, Button, Checkbox, Field, textareaClass } from './site/ui';
import { callPost } from '../services/api/client';
import { agentRef } from '../utils/agentRef';
import AuthForms from '../features/buyer/AuthForms';
import { useBuyer } from '../features/buyer/session';

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
  message: string;
  consent: boolean;
}

export default function InquiryModal({
  propertyId,
  propertyTitle,
  onClose,
}: {
  propertyId: string;
  propertyTitle?: string;
  onClose: () => void;
}) {
  const { buyer, loading: sessionLoading } = useBuyer();
  const [formData, setFormData] = useState<FormData>({ message: '', consent: false });
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [leadRef, setLeadRef] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState(false);
  const [error, setError] = useState('');
  const firstFieldRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, [buyer]);

  const errors: Partial<Record<keyof FormData, string>> = {};
  if (formData.message.trim().length < 5)
    errors.message = 'Tell us a little about your requirement';
  if (!formData.consent) errors.consent = 'Please confirm we may contact you';

  const fieldError = (field: keyof FormData) =>
    touched[field] && errors[field] ? errors[field] : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ message: true, consent: true });
    setError('');
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const result = await callPost<{ lead: string; duplicate: boolean }>(
        'realtor_x.api.v1.create_property_inquiry',
        {
          property_id: propertyId,
          message: formData.message.trim(),
          consent: formData.consent ? 1 : 0,
          landing_page: `${window.location.pathname}${window.location.hash}`.slice(0, 500),
          ...readAttribution(),
          agent_ref: agentRef(),
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
    <Modal title="Enquire" subtitle={propertyTitle} onClose={onClose} labelId="inquiry-title">
      {leadRef ? (
        <Sent title={duplicate ? 'We already have your enquiry' : 'Your enquiry is with our sales team'} reference={leadRef} onClose={onClose}>
          {duplicate ? 'We added this message to your earlier enquiry. A RealtorX advisor will call you shortly.' : 'A RealtorX advisor will call you, usually within a few working hours.'}
        </Sent>
      ) : !buyer ? (
        sessionLoading ? <p className="py-6 text-sm text-fg-3">Loading…</p> : <AuthForms compact intro="Sign in or create a free account to send your enquiry. It takes a minute, and you can follow every request in My account." />
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <p className="rounded-xl bg-white/[0.03] px-4 py-3 text-[13px] text-fg-2">Sending as <b className="text-fg">{buyer.full_name}</b> · {buyer.phone || buyer.email}. Change your details in My account.</p>
          <Field label="What would you like to know?" htmlFor="inq-message" error={fieldError('message')}>
            <textarea id="inq-message" ref={firstFieldRef} rows={4} className={textareaClass} value={formData.message} placeholder="Budget, payment plan, when you would like to visit…"
              onChange={(e) => setFormData({ ...formData, message: e.target.value })} onBlur={() => setTouched((t) => ({ ...t, message: true }))} aria-invalid={!!fieldError('message')} />
          </Field>
          <div>
            <Checkbox id="inq-consent" checked={formData.consent} onChange={(v) => setFormData({ ...formData, consent: v })}>
              RealtorX may contact me by phone, WhatsApp or email about this property.
            </Checkbox>
            {fieldError('consent') && <p className="mt-1.5 text-xs text-bad">{errors.consent}</p>}
          </div>
          {error && <Alert>{error}</Alert>}
          <Button type="submit" size="lg" busy={loading} className="w-full">Send enquiry</Button>
          <p className="text-center text-xs text-fg-3">Your number is only shared with the RealtorX sales team.</p>
        </form>
      )}
    </Modal>
  );
}
