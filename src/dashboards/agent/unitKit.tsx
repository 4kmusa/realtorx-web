// Agent dashboard: installment calculator and share kit for one unit. Price, plan and dates come from RealtorX;
// the agent picks the booking date, then copies the WhatsApp message, shares the link or QR code, or downloads a
// brochure PDF with their own name and contact.
import React, { useState } from 'react';
import { Check, Copy, FileDown, QrCode, Share2 } from 'lucide-react';
import { methodUrl } from '../../services/api/client';
import { BackLink, DataView, Field, SectionHeader, copyText, formatDate, formatMoney, inputClass, useApi } from '../kit/kit';
import { imageUrl } from '../../features/marketplace/api';
import { t } from '../i18n';
import { localDate } from '../../utils/date';

interface PlanPart {
  label: string;
  percent: number;
  amount: number;
  on_possession: number;
  installments?: number;
  every_months?: number;
  each?: number;
}
interface UnitKit {
  unit: { name: string; property_title: string; project_name: string; city: string | null; location_area: string | null; custom_property_category: string | null;
    size: number | null; size_unit: string | null; bedrooms: number | null; floor: string | null; cover_image: string | null };
  price: number;
  currency: string;
  booking_date: string;
  plan: { name: string; summary: string | null; parts: PlanPart[] } | null;
  schedule: { label: string; due_date: string | null; amount: number; on_possession: number }[];
  commission: { rate: number; agent_share: number; agent_amount: number; under_contract: boolean } | null;
  share_link: string;
  message: string;
  qr_svg: string;
  agent: { agent_id: string; full_name: string; mobile: string | null };
}

const today = () => localDate();

function every(months?: number) {
  return months === 1 ? t('monthly') : months === 3 ? t('quarterly') : `${t('every')} ${months} ${t('months')}`;
}

export function UnitKitPanel({ unit, onBack }: { unit: string; onBack: () => void }) {
  const [booking, setBooking] = useState(today());
  const state = useApi<UnitKit>('realtor_x.api.portal.agent_unit_kit', { unit, booking_date: booking }, `${unit}-${booking}`);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const copy = (key: string, text: string) =>
    copyText(text).then((ok) => {
      if (!ok) return;
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  const share = async (k: UnitKit) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: k.unit.property_title, text: k.message });
        return;
      } catch {
        /* cancelled: fall back to copying */
      }
    }
    copy('message', k.message);
  };
  const btn = 'inline-flex items-center gap-1.5 rounded-full border border-line-2 px-4 py-2 text-sm text-fg hover:bg-white/5';
  return (
    <>
      <BackLink onClick={onBack}>Inventory to sell</BackLink>
      <DataView state={state}>
        {(k) => {
          const qr = `data:image/svg+xml;utf8,${encodeURIComponent(k.qr_svg)}`;
          const rows = showAll ? k.schedule : k.schedule.slice(0, 6);
          return (
            <div className="space-y-6">
              <SectionHeader title={k.unit.property_title} description={[k.unit.project_name, k.unit.location_area, k.unit.city].filter(Boolean).join(' · ')} />
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
                <div className="min-w-0 space-y-5">
                  <div className="overflow-hidden rounded-2xl border border-line bg-panel">
                    {k.unit.cover_image && <img src={imageUrl(k.unit.cover_image) || ''} alt="" className="aspect-[16/8] w-full object-cover" />}
                    <div className="flex flex-wrap items-end justify-between gap-3 p-5">
                      <div>
                        <p className="text-xs text-fg-2">{t('Price')}</p>
                        <p className="text-3xl font-medium tracking-[-0.03em] text-fg tabular-nums" dir="ltr">{formatMoney(k.price, k.currency)}</p>
                      </div>
                      {k.commission && (k.commission.under_contract ? (
                        <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                          {t('Your commission')} ≈ <b dir="ltr">{formatMoney(k.commission.agent_amount, k.currency)}</b>
                        </p>
                      ) : (
                        <p className="rounded-xl bg-white/5 px-3 py-2 text-xs text-fg-2">{t('Commission not agreed yet for this project')}</p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-line bg-panel p-5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="font-medium text-fg">{k.plan ? k.plan.name : t('Full payment')}</p>
                        {k.plan?.summary && <p className="mt-1 text-xs text-fg-2">{k.plan.summary}</p>}
                      </div>
                      <div className="w-44">
                        <Field label="Booking date" htmlFor="kit-date">
                          <input id="kit-date" type="date" min={today()} value={booking} onChange={(e) => e.target.value && setBooking(e.target.value)} className={inputClass} />
                        </Field>
                      </div>
                    </div>
                    {k.plan && (
                      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {k.plan.parts.map((p) => (
                          <li key={p.label} className="rounded-xl bg-white/[0.03] p-3">
                            <p className="text-xs text-fg-2">{p.label} · {p.percent}%</p>
                            {p.installments ? (
                              <p className="mt-1 font-medium text-fg" dir="ltr">{p.installments} × {formatMoney(p.each, k.currency)} <span className="text-xs font-normal text-fg-2">{every(p.every_months)}</span></p>
                            ) : (
                              <p className="mt-1 font-medium text-fg" dir="ltr">{formatMoney(p.amount, k.currency)}{p.on_possession && !/possession/i.test(p.label) ? <span className="text-xs font-normal text-fg-2"> · {t('on possession')}</span> : null}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-start text-[11px] uppercase tracking-[0.14em] text-fg-3">
                          <tr><th className="py-2 text-start font-medium">{t('Payment')}</th><th className="py-2 text-start font-medium">{t('Due')}</th><th className="py-2 text-end font-medium">{t('Amount')}</th></tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {rows.map((r, i) => (
                            <tr key={i}>
                              <td className="py-2 text-fg">{r.label}</td>
                              <td className="py-2 text-fg-2">{r.on_possession ? t('On possession') : formatDate(r.due_date)}</td>
                              <td className="py-2 text-end tabular-nums text-fg" dir="ltr">{formatMoney(r.amount, k.currency)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {k.schedule.length > 6 && (
                        <button onClick={() => setShowAll(!showAll)} className="mt-2 text-xs text-fg-2 underline underline-offset-4 hover:text-fg">
                          {showAll ? t('Show less') : `${t('Show all')} ${k.schedule.length} ${t('payments')}`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="min-w-0 space-y-5">
                  <div className="rounded-2xl border border-line bg-panel p-5">
                    <p className="font-medium text-fg">{t('WhatsApp message')}</p>
                    <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-ink p-4 font-sans text-[13px] leading-relaxed text-fg-2" dir="ltr">{k.message}</pre>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={`https://wa.me/?text=${encodeURIComponent(k.message)}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-fg px-4 py-2 text-sm font-medium text-ink hover:bg-white">
                        <Share2 className="h-4 w-4" /> {t('Send on WhatsApp')}
                      </a>
                      <button onClick={() => copy('message', k.message)} className={btn}>
                        {copied === 'message' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied === 'message' ? t('Copied') : t('Copy message')}
                      </button>
                      {typeof navigator !== 'undefined' && 'share' in navigator && (
                        <button onClick={() => share(k)} className={btn}><Share2 className="h-4 w-4" /> {t('Share')}</button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-5 rounded-2xl border border-line bg-panel p-5">
                    <img src={qr} alt={t('QR code of your share link')} className="h-32 w-32 shrink-0 rounded-lg bg-white p-1.5" />
                    <div className="min-w-0 space-y-2">
                      <p className="font-medium text-fg">{t('Your share link')}</p>
                      <p className="break-all text-xs text-fg-2" dir="ltr">{k.share_link}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button onClick={() => copy('link', k.share_link)} className={btn}>
                          {copied === 'link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied === 'link' ? t('Copied') : t('Copy link')}
                        </button>
                        <a href={qr} download={`realtorx-${k.unit.name}-qr.svg`} className={btn}><QrCode className="h-4 w-4" /> {t('Download QR')}</a>
                      </div>
                    </div>
                  </div>

                  <a href={methodUrl('realtor_x.api.portal.agent_brochure', { unit: k.unit.name })} target="_blank" rel="noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-line bg-panel p-5 text-fg hover:bg-white/[0.03]">
                    <span>
                      <span className="block font-medium">{t('Brochure (PDF)')}</span>
                      <span className="mt-1 block text-xs text-fg-2">{t('One page with photo, price, payment plan, your contact and QR code.')}</span>
                    </span>
                    <FileDown className="h-5 w-5 shrink-0" />
                  </a>
                  <p className="text-xs text-fg-3">{t('Buyers who open your link or scan the QR code are recorded as your buyers. Discounts are approved by RealtorX only.')}</p>
                </div>
              </div>
            </div>
          );
        }}
      </DataView>
    </>
  );
}
