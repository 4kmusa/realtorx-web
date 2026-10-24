// Agent dashboard sections: profile and the inventory an agent can sell (with commission estimate and a
// share link carrying the Agent ID, so buyers who come through it are attributed to the agent).
import React, { useState } from 'react';
import { Building2, Calculator, Check, ChevronLeft, ChevronRight, Copy, ExternalLink, Search, UserRound } from 'lucide-react';
import { DataView, SectionHeader, StatCard, copyText, formatMoney, useApi } from '../kit/kit';
import { formatArea, formatPrice, imageUrl } from '../../features/marketplace/api';
import { t } from '../i18n';
import { UnitKitPanel } from './unitKit';

export interface AgentProfile {
  agent: string | null;
  agent_id?: string | null;
  status?: string;
  full_name?: string;
  email?: string;
  mobile?: string;
  country?: string;
  city?: string | null;
  areas_served?: string | null;
  experience_years?: number | null;
  current_agency?: string | null;
  languages?: string | null;
  approved_on?: string | null;
  kyc_result?: string;
  payout_account?: { bank_name: string | null; account_title: string | null; iban_masked: string | null; checked?: boolean };
}

export function ProfileSection({ state }: { state: ReturnType<typeof useApi<AgentProfile>> }) {
  return (
    <>
      <SectionHeader title="My profile" description="To change these details, contact the RealtorX agent team." />
      <DataView state={state} isEmpty={(p) => !p.agent} empty={{ icon: UserRound, title: 'No agent profile', description: 'This login is not linked to an approved RealtorX Agent.' }}>
        {(p) => (
          <div className="grid gap-4 lg:grid-cols-2">
            <dl className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-panel p-5 text-sm">
              {[
                ['Agent ID', p.agent_id], ['Status', p.status], ['Name', p.full_name], ['Email', p.email], ['Mobile', p.mobile], ['City', p.city],
                ['Areas', p.areas_served], ['Experience', p.experience_years != null ? `${p.experience_years} years` : null], ['Agency', p.current_agency],
                ['Languages', p.languages], ['Identity check', p.kyc_result],
              ].map(([k, v]) => (
                <div key={k as string}><dt className="text-xs text-fg-2">{k}</dt><dd className="mt-0.5 text-fg">{(v as string) || '—'}</dd></div>
              ))}
            </dl>
            <div className="rounded-xl border border-line bg-panel p-5 text-sm">
              <p className="font-semibold text-fg">{t("Payout account")}</p>
              {p.payout_account?.iban_masked ? (
                <p className="mt-2 text-fg-2">{p.payout_account.bank_name} · {p.payout_account.account_title} · {p.payout_account.iban_masked}</p>
              ) : (
                <p className="mt-2 text-fg-2">{t('Not added yet. RealtorX will ask for your bank account before your first commission payout.')}</p>
              )}
            </div>
          </div>
        )}
      </DataView>
    </>
  );
}

interface InventoryRow {
  name: string;
  property_title: string;
  project_name: string;
  city: string | null;
  location_area: string | null;
  purpose: string;
  currency?: string | null;
  custom_property_category: string | null;
  size: number | null;
  size_unit: string | null;
  list_price: number | null;
  bedrooms: number | null;
  status: string;
  cover_image: string | null;
  share_link: string;
  commission: { rate: number; agent_share: number; agent_amount: number; currency: string | null; under_contract: boolean } | null;
}
interface InventoryResult { items: InventoryRow[]; total: number; page: number; page_length: number }

export function InventorySection() {
  const [draft, setDraft] = useState({ location: '', purpose: '', max_price: '' });
  const [filters, setFilters] = useState(draft);
  const [page, setPage] = useState(1);
  const params = { ...filters, page };
  const state = useApi<InventoryResult>('realtor_x.api.portal.agent_inventory', params, JSON.stringify(params));
  const [copied, setCopied] = useState<string | null>(null);
  const [kit, setKit] = useState<string | null>(null);
  const copy = (row: InventoryRow) => {
    const url = row.share_link.startsWith('http') ? row.share_link : `${window.location.origin}${row.share_link}`;
    copyText(url).then((ok) => {
      if (!ok) return;
      setCopied(row.name);
      setTimeout(() => setCopied(null), 1500);
    });
  };
  const inputCls = 'rounded-lg border border-line bg-ink px-3 py-2 text-sm text-fg';
  if (kit) return <UnitKitPanel unit={kit} onBack={() => setKit(null)} />;
  return (
    <>
      <SectionHeader title="Inventory to sell" description="Live units from RealtorX. Share a unit's link: buyers who enquire through it are recorded as yours." />
      <form onSubmit={(e) => { e.preventDefault(); setFilters(draft); setPage(1); }} className="mb-4 flex flex-wrap gap-2">
        <input placeholder={t('Area, project or city')} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} className={inputCls} aria-label="Location" />
        <select value={draft.purpose} onChange={(e) => setDraft({ ...draft, purpose: e.target.value })} className={inputCls} aria-label="Purpose">
          <option value="">{t('Sale or rent')}</option><option value="Sell">{t('For sale')}</option><option value="Rent">{t('For rent')}</option>
        </select>
        <input type="number" placeholder={t('Max price')} value={draft.max_price} onChange={(e) => setDraft({ ...draft, max_price: e.target.value })} className={`${inputCls} w-36`} aria-label="Maximum price" />
        <button className="flex items-center gap-1.5 rounded-full bg-fg text-ink px-4 py-2 text-sm font-bold"><Search className="h-4 w-4" /> {t('Search')}</button>
      </form>
      <DataView state={state} isEmpty={(r) => r.items.length === 0} empty={{ icon: Building2, title: 'No units match', description: 'Try other filters.' }}>
        {(r) => (
          <>
            <p className="mb-3 text-xs text-fg-2">{t(r.total === 1 ? '{0} unit' : '{0} units').replace('{0}', String(r.total))}</p>
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {r.items.map((u) => (
                <li key={u.name} className="overflow-hidden rounded-xl border border-line bg-panel">
                  <div className="aspect-[16/9] bg-panel-2">{u.cover_image && <img src={imageUrl(u.cover_image) || ''} alt="" className="h-full w-full object-cover" loading="lazy" />}</div>
                  <div className="space-y-2 p-4">
                    <p className="font-semibold text-fg">{u.property_title}</p>
                    <p className="text-xs text-fg-2">{[u.project_name, u.location_area, u.city].filter(Boolean).join(' · ')}</p>
                    <p className="text-sm text-fg-2">{[u.custom_property_category, formatArea(u.size, u.size_unit), u.bedrooms ? `${u.bedrooms} bed` : null].filter(Boolean).join(' · ')}</p>
                    <p className="text-lg font-bold text-fg">{formatPrice(u.list_price, u.purpose, u.currency)}</p>
                    {u.commission && (u.commission.under_contract ? (
                      <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                        Your commission ≈ <b>{formatMoney(u.commission.agent_amount, u.commission.currency)}</b> ({u.commission.agent_share}% of {u.commission.rate}%)
                      </p>
                    ) : (
                      <p className="rounded-lg bg-white/5 px-3 py-2 text-xs text-fg-2">{t('Commission not agreed yet for this project')}</p>
                    ))}
                    <button onClick={() => setKit(u.name)} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-fg px-3 py-2 text-xs font-medium text-ink hover:bg-white">
                      <Calculator className="h-3.5 w-3.5" /> {t('Payment plan & share kit')}
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => copy(u)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line-2 px-3 py-2 text-xs text-fg hover:bg-white/5">
                        {copied === u.name ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {t(copied === u.name ? 'Copied' : 'Copy share link')}
                      </button>
                      <a href={u.share_link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-lg border border-line-2 px-3 py-2 text-xs text-fg hover:bg-white/5" aria-label="Open listing"><ExternalLink className="h-3.5 w-3.5" /></a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Pager page={r.page} pages={Math.ceil(r.total / r.page_length)} loading={state.loading} onPage={(p) => { setPage(p); window.scrollTo({ top: 0 }); }} />
          </>
        )}
      </DataView>
    </>
  );
}

function Pager({ page, pages, loading, onPage }: { page: number; pages: number; loading: boolean; onPage: (page: number) => void }) {
  if (pages <= 1) return null;
  const btn = 'flex items-center gap-1 rounded-full border border-line-2 px-4 py-2 text-sm text-fg hover:bg-white/5 disabled:opacity-40';
  return (
    <nav className="mt-6 flex items-center justify-center gap-3" aria-label={t('Pages')}>
      <button type="button" className={btn} disabled={loading || page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft className="h-4 w-4 rtl:rotate-180" /> {t('Previous')}</button>
      <span className="text-sm text-fg-2">{t('Page {0} of {1}').replace('{0}', String(page)).replace('{1}', String(pages))}</span>
      <button type="button" className={btn} disabled={loading || page >= pages} onClick={() => onPage(page + 1)}>{t('Next')} <ChevronRight className="h-4 w-4 rtl:rotate-180" /></button>
    </nav>
  );
}

export function AgentStats({ profile }: { profile: AgentProfile | null }) {
  if (!profile?.agent) return null;
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <StatCard label="Agent ID" value={profile.agent_id || '—'} />
      <StatCard label="Status" value={profile.status || '—'} tone={profile.status === 'Approved' ? 'good' : 'default'} />
      <StatCard label="City" value={profile.city || '—'} />
    </div>
  );
}
