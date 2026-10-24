// Visit request and booking request forms. The server validates the unit/project, re-checks the unit
// status under a lock and returns a reference. A booking request holds the unit while RealtorX reviews
// it; it is not a confirmed booking.
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Sent } from '../../components/site/Modal';
import { Alert, Button, Checkbox, Field, inputClass, textareaClass } from '../../components/site/ui';
import { callPost } from '../../services/api/client';
import { agentRef } from '../../utils/agentRef';
import AuthForms from '../buyer/AuthForms';
import { useBuyer } from '../buyer/session';
import { localDate } from '../../utils/date';

export type RequestMode = 'visit' | 'booking';

interface Props {
  mode: RequestMode;
  unitId?: string | null;
  projectId?: string | null;
  title: string;
  onClose: () => void;
  onDone?: (reference: string) => void;
}

const SLOTS = ['Morning', 'Afternoon', 'Evening'];

function utm(): Record<string, string> {
  const out: Record<string, string> = {};
  const params = new URLSearchParams(window.location.search);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign']) {
    const v = params.get(key);
    if (v) out[key] = v.slice(0, 140);
  }
  return out;
}

export default function RequestModal({ mode, unitId, projectId, title, onClose, onDone }: Props) {
  const { buyer, loading: sessionLoading } = useBuyer();
  const [form, setForm] = useState({ visit_date: '', visit_slot: 'Morning', message: '', consent: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reference: string; hours?: number } | null>(null);
  const first = useRef<HTMLTextAreaElement>(null);
  const tomorrow = localDate(1);

  useEffect(() => {
    first.current?.focus();
  }, [buyer]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.consent) return setError('Please agree that RealtorX may contact you about this request.');
    if (mode === 'visit' && !form.visit_date) return setError('Please choose a preferred visit date.');
    setBusy(true);
    try {
      const payload = {
        property_id: unitId || undefined,
        project_id: projectId || undefined,
        message: form.message.trim() || undefined,
        consent: 1,
        landing_page: window.location.pathname.slice(0, 500),
        ...(mode === 'visit' ? { visit_date: form.visit_date, visit_slot: form.visit_slot } : {}),
        ...utm(),
        agent_ref: agentRef(),
      };
      const res = await callPost<{ reference: string; hold_hours?: number }>(
        mode === 'visit' ? 'realtor_x.api.v1.request_visit' : 'realtor_x.api.v1.request_booking',
        payload
      );
      setDone({ reference: res.reference, hours: res.hold_hours });
      onDone?.(res.reference);
    } catch (err: any) {
      setError(err?.message || 'Could not send your request.');
    } finally {
      setBusy(false);
    }
  };

  const visit = mode === 'visit';
  return (
    <Modal title={visit ? 'Book a site visit' : 'Request a booking'} subtitle={title} onClose={onClose} labelId="request-title">
      {done ? (
        <Sent title={visit ? 'Your visit request is in' : 'The unit is held for you'} reference={done.reference} onClose={onClose}>
          {visit
            ? 'A RealtorX advisor will call to confirm the time. Please bring your CNIC to the site office.'
            : `RealtorX holds this unit for you${done.hours ? ` for ${done.hours} hours` : ''} while our team reviews the request and calls you with the booking steps. It is not a confirmed booking yet.`}
        </Sent>
      ) : !buyer ? (
        sessionLoading ? <p className="py-6 text-sm text-fg-3">Loading…</p> : (
          <AuthForms compact intro={visit ? 'Sign in or create a free account to book your site visit. You can follow it in My account.'
            : 'Sign in or create a free account to request this booking. You can follow it in My account.'} />
        )
      ) : (
        <form onSubmit={submit} className="space-y-5">
          {!visit && <Alert tone="info">A booking request holds the unit while RealtorX checks it with the developer. We call you before anything is paid. See the <a href="/booking-policy" target="_blank" rel="noreferrer" className="underline underline-offset-4">Booking Policy</a>.</Alert>}
          <p className="rounded-xl bg-white/[0.03] px-4 py-3 text-[13px] text-fg-2">Requesting as <b className="text-fg">{buyer.full_name}</b> · {buyer.phone || buyer.email}. Change your details in My account.</p>
          {visit && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preferred date" htmlFor="rq-date">
                <input id="rq-date" type="date" min={tomorrow} required className={inputClass} value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} />
              </Field>
              <Field label="Time of day" htmlFor="rq-slot">
                <select id="rq-slot" className={inputClass} value={form.visit_slot} onChange={(e) => setForm({ ...form, visit_slot: e.target.value })}>
                  {SLOTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          )}
          <Field label="Message (optional)" htmlFor="rq-msg">
            <textarea id="rq-msg" ref={first} rows={3} className={textareaClass} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </Field>
          <Checkbox id="rq-consent" checked={form.consent} onChange={(v) => setForm({ ...form, consent: v })}>
            RealtorX may contact me by phone, WhatsApp or email about this request.
          </Checkbox>
          {error && <Alert>{error}</Alert>}
          <Button type="submit" size="lg" busy={busy} className="w-full">{visit ? 'Request the visit' : 'Request the booking'}</Button>
        </form>
      )}
    </Modal>
  );
}
