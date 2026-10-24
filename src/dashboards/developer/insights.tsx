// Developer dashboard: inventory map (a project's units by block and floor, coloured by status, with the deal on
// each unit) and cash flow (buyer installments still to come in, month by month, next to what was collected).
import React, { useRef, useState } from 'react';
import { LineChart, Map as MapIcon } from 'lucide-react';
import { DataView, SectionHeader, StatCard, formatMoney, useApi } from '../kit/kit';
import { t } from '../i18n';

// ── Inventory map ───────────────────────────────────────────────────────────

type UnitState = 'Available' | 'Reserved' | 'Booked' | 'Sold' | 'Not live';
interface MapUnit {
  name: string;
  code: string;
  title: string;
  category: string | null;
  size: number | null;
  size_unit: string | null;
  bedrooms: number | null;
  price: number | null;
  state: UnitState;
  deal: { name: string; stage: string; buyer: string; balance: number; overdue: boolean } | null;
}
interface InventoryMapData {
  project: { name: string; project_name: string };
  blocks: { block: string; floors: { floor: string; units: MapUnit[] }[] }[];
  counts: Partial<Record<UnitState, number>>;
  value: Partial<Record<UnitState, number>>;
  currency: string;
}

// Status colours; each cell also carries its status in words (never colour alone).
const STATE_STYLE: Record<UnitState, string> = {
  Available: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-100',
  Reserved: 'border-amber-300/40 bg-amber-300/15 text-amber-100',
  Booked: 'border-sky-400/40 bg-sky-400/15 text-sky-100',
  Sold: 'border-white/15 bg-white/[0.06] text-fg-2',
  'Not live': 'border-dashed border-white/20 bg-transparent text-fg-3',
};
const STATES: UnitState[] = ['Available', 'Reserved', 'Booked', 'Sold', 'Not live'];

export function InventoryMap({ project }: { project: string }) {
  const state = useApi<InventoryMapData>('realtor_x.api.portal.developer_inventory_map', { project }, project);
  const [picked, setPicked] = useState<MapUnit | null>(null);
  const detail = useRef<HTMLDivElement>(null);
  const pick = (u: MapUnit) => {
    setPicked(u);
    if (window.innerWidth < 1280) setTimeout(() => detail.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 0); // detail sits below the blocks
  };
  return (
    <DataView state={state} isEmpty={(d) => d.blocks.length === 0} empty={{ icon: MapIcon, title: 'No units yet', description: 'Send an inventory update to add units.' }}>
      {(d) => (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-xs">
            {STATES.filter((s) => d.counts[s]).map((s) => (
              <span key={s} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${STATE_STYLE[s]}`}>
                {t(s)} · {d.counts[s]}{d.value[s] ? <span className="opacity-70" dir="ltr">· {formatMoney(d.value[s], d.currency)}</span> : null}
              </span>
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
            <div className="flex flex-wrap content-start gap-4">
              {d.blocks.map((b) => (
                <div key={b.block || 'units'} className="min-w-[180px] rounded-2xl border border-line bg-panel p-3">
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-fg-3">{b.block ? `${t('Block')} ${b.block}` : t('Units')}</p>
                  <div className="space-y-1.5">
                    {b.floors.map((f) => (
                      <div key={f.floor || 'none'} className="flex items-stretch gap-2">
                        <span className="w-14 shrink-0 pt-2 text-end text-[11px] text-fg-3">{f.floor ? (/^\d+$/.test(f.floor) ? `${t('Floor')} ${f.floor}` : f.floor) : ''}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {f.units.map((u) => (
                            <button key={u.name} onClick={() => pick(u)} title={`${u.code} · ${t(u.state)}`}
                              className={`relative min-w-[64px] rounded-lg border px-2 py-1.5 text-start text-xs transition hover:brightness-125 ${STATE_STYLE[u.state]} ${picked?.name === u.name ? 'ring-2 ring-fg' : ''}`}>
                              <span className="block font-medium">{u.code}</span>
                              <span className="block text-[10px] opacity-75">{t(u.state)}</span>
                              {u.deal?.overdue && <span className="absolute -end-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose-400 ring-2 ring-ink" aria-label={t('Payment overdue')} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div ref={detail} className="rounded-2xl border border-line bg-panel p-4 text-sm">
              {picked ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-fg">{picked.code}</p>
                  <p className="text-fg-2">{picked.title}</p>
                  <p className="text-fg-2">{[picked.category, picked.size ? `${picked.size} ${picked.size_unit || ''}` : null, picked.bedrooms ? `${picked.bedrooms} bed` : null].filter(Boolean).join(' · ')}</p>
                  <p className="font-medium text-fg" dir="ltr">{picked.price ? formatMoney(picked.price, d.currency) : '—'}</p>
                  <p><span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${STATE_STYLE[picked.state]}`}>{t(picked.state)}</span></p>
                  {picked.deal && (
                    <div className="mt-3 space-y-1 border-t border-line pt-3 text-xs text-fg-2">
                      <p>{t('Deal')} {picked.deal.name} · {t(picked.deal.stage)}</p>
                      <p>{t('Buyer')}: {picked.deal.buyer}</p>
                      <p>{t('Balance')}: <span dir="ltr">{formatMoney(picked.deal.balance, d.currency)}</span></p>
                      {picked.deal.overdue && <p className="text-rose-300">{t('A buyer payment is overdue. RealtorX follows up.')}</p>}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-fg-2">{t('Tap a unit to see its price, status and deal.')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </DataView>
  );
}

// ── Cash flow ───────────────────────────────────────────────────────────────

interface CashCurrency {
  currency: string;
  overdue: number;
  later: number;
  on_possession: number;
  months: { month: string; expected: number }[];
  collected: { month: string; amount: number }[];
  next_90_by_project: { project: string; amount: number }[];
}
interface Cashflow { today: string; currencies: CashCurrency[] }

const monthLabel = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });

function Bars({ c }: { c: CashCurrency }) {
  const bars = [
    ...c.collected.map((p) => ({ month: p.month, value: p.amount, kind: 'collected' as const })), // the current month shows both: collected so far and still expected
    ...c.months.map((m) => ({ month: m.month, value: m.expected, kind: 'expected' as const })),
  ];
  const max = Math.max(1, ...bars.map((b) => b.value));
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="rounded-2xl border border-line bg-panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium text-fg">{t('Buyer money by month')}</p>
        <div className="flex gap-4 text-xs text-fg-2">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-fg-3" />{t('Collected (verified)')}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue-2" />{t('Expected from schedules')}</span>
        </div>
      </div>
      <div className="relative">
        <div className="flex h-48 items-end gap-[2px] border-b border-line" role="img" aria-label={t('Buyer money by month')}>
          {bars.map((b, i) => (
            <div key={`${b.kind}-${b.month}`} className="flex h-full flex-1 items-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <div className={`w-full rounded-t-[4px] transition-opacity ${b.kind === 'collected' ? 'bg-fg-3' : 'bg-blue-2'} ${hover !== null && hover !== i ? 'opacity-50' : ''}`}
                style={{ height: `${Math.max(b.value ? 2 : 0, (b.value / max) * 100)}%` }} />
            </div>
          ))}
        </div>
        {hover !== null && (
          <div className="pointer-events-none absolute -top-2 start-0 rounded-lg border border-line bg-ink px-3 py-1.5 text-xs text-fg shadow-lg">
            {monthLabel(bars[hover].month)} · {t(bars[hover].kind === 'collected' ? 'Collected (verified)' : 'Expected from schedules')} · <span dir="ltr">{formatMoney(bars[hover].value, c.currency)}</span>
          </div>
        )}
        <div className="mt-1.5 flex gap-[2px] text-[10px] text-fg-3">
          {bars.map((b, i) => <span key={`${b.kind}-${b.month}-l`} className="flex-1 truncate text-center">{i % 2 === 0 ? monthLabel(b.month) : ''}</span>)}
        </div>
      </div>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-xs text-fg-2">{t('Show as table')}</summary>
        <table className="mt-2 w-full text-xs">
          <tbody className="divide-y divide-line">
            {bars.map((b) => (
              <tr key={`${b.kind}-${b.month}-t`}><td className="py-1 text-fg-2">{monthLabel(b.month)}</td><td className="py-1 text-fg-2">{t(b.kind === 'collected' ? 'Collected (verified)' : 'Expected from schedules')}</td>
                <td className="py-1 text-end tabular-nums text-fg" dir="ltr">{formatMoney(b.value, c.currency)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

export function CashflowSection() {
  const state = useApi<Cashflow>('realtor_x.api.portal.developer_cashflow', { months: 12 }, 'cashflow');
  return (
    <>
      <SectionHeader title="Cash flow" description="Buyer installments still to come in, from every open deal's payment schedule, and what was collected in the last months." />
      <DataView state={state} isEmpty={(d) => d.currencies.length === 0} empty={{ icon: LineChart, title: 'No payments expected', description: 'Open deals with payment schedules appear here.' }}>
        {(d) => (
          <div className="space-y-6">
            {d.currencies.map((c) => {
              const next90 = c.next_90_by_project.reduce((s, p) => s + p.amount, 0);
              const next12 = c.months.reduce((s, m) => s + m.expected, 0);
              return (
                <div key={c.currency} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Next 90 days" value={formatMoney(next90, c.currency)} />
                    <StatCard label="Next 12 months" value={formatMoney(next12, c.currency)} />
                    <StatCard label="Overdue now" value={formatMoney(c.overdue, c.currency)} tone={c.overdue ? 'warn' : 'default'} hint="RealtorX follows up with the buyers" />
                    <StatCard label="Later and on possession" value={formatMoney(c.later + c.on_possession, c.currency)} hint={`${t('On possession')}: ${formatMoney(c.on_possession, c.currency)}`} />
                  </div>
                  <Bars c={c} />
                  {c.next_90_by_project.length > 0 && (
                    <div className="rounded-2xl border border-line bg-panel p-5 text-sm">
                      <p className="mb-3 font-medium text-fg">{t('Next 90 days by project')}</p>
                      <ul className="space-y-2">
                        {c.next_90_by_project.map((p) => (
                          <li key={p.project} className="flex justify-between gap-3"><span className="text-fg-2">{p.project}</span><span className="tabular-nums text-fg" dir="ltr">{formatMoney(p.amount, c.currency)}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
            <p className="text-xs text-fg-3">{t('Expected amounts follow the agreed schedules; only payments verified by RealtorX count as collected.')}</p>
          </div>
        )}
      </DataView>
    </>
  );
}
