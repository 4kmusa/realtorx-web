// Marketplace search (/properties). Zameen-style filters; no phone numbers anywhere:
// buyers press "I'm interested" and the request goes to the listing's RealtorX realtor.
import React, { useEffect, useMemo, useState } from 'react';
import { Bath, BedDouble, BadgeCheck, ChevronLeft, ChevronRight, Home, MapPin, Ruler, Search, SlidersHorizontal, X } from 'lucide-react';
import { PageId } from '../../types';
import InquiryModal from '../../components/InquiryModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  FormOptions, PublicListing, SearchFilters, SearchResult, formatArea, formatPrice, getFormOptions, imageUrl, searchListings,
} from './api';

type Nav = (page: PageId, id?: string) => void;

const FILTER_KEYS: (keyof SearchFilters)[] = [
  'purpose', 'group', 'category', 'city', 'location', 'min_price', 'max_price', 'min_area', 'max_area', 'area_unit', 'beds', 'baths',
  'installment', 'possession', 'sort', 'project',
];
const BEDS = ['Studio', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
const BATHS = ['1', '2', '3', '4', '5', '6+'];
const SORTS: [string, string][] = [
  ['newest', 'Newest'],
  ['price_asc', 'Price (low to high)'],
  ['price_desc', 'Price (high to low)'],
  ['size_desc', 'Area (largest)'],
];

function readFilters(): SearchFilters {
  const params = new URLSearchParams(window.location.search);
  const out: SearchFilters = {};
  for (const key of FILTER_KEYS) {
    const value = params.get(key);
    if (value) (out as any)[key] = value;
  }
  const page = Number(params.get('page'));
  if (page > 1) out.page = page;
  return out;
}

function writeFilters(filters: SearchFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '' && !(key === 'page' && Number(value) <= 1)) params.set(key, String(value));
  }
  const qs = params.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
}

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
    active ? 'border-[#F5A623] bg-[#F5A623]/15 text-[#F5A623]' : 'border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
  }`;
const field = 'w-full rounded-lg border border-white/10 bg-[#081221] px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F5A623]/60 focus:outline-none';

export default function MarketplacePage({ onNavigate }: { onNavigate: Nav }) {
  const [filters, setFilters] = useState<SearchFilters>(() => readFilters());
  const [draft, setDraft] = useState<SearchFilters>(() => readFilters());
  const [options, setOptions] = useState<FormOptions | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [interest, setInterest] = useState<PublicListing | null>(null);

  useEffect(() => {
    getFormOptions().then(setOptions).catch(() => setOptions(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    writeFilters(filters);
    searchListings(filters)
      .then((r) => !cancelled && setResult(r))
      .catch((e) => !cancelled && setError(e?.message || 'Could not load properties.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const set = (patch: SearchFilters) => setDraft((d) => ({ ...d, ...patch }));
  const apply = (patch: SearchFilters = {}) => {
    const next = { ...draft, ...patch, page: 1 };
    setDraft(next);
    setFilters(next);
  };
  const clear = () => {
    const next: SearchFilters = { purpose: draft.purpose };
    setDraft(next);
    setFilters(next);
  };
  const groups = options?.category_groups || { Home: [], Plots: [], Commercial: [] };
  const activeGroup = draft.group || 'Home';
  const pages = result ? Math.max(Math.ceil(result.total / result.page_length), 1) : 1;
  const activeCount = useMemo(
    () => FILTER_KEYS.filter((k) => !['purpose', 'sort', 'area_unit'].includes(k) && (filters as any)[k]).length,
    [filters]
  );

  return (
    <div className="min-h-screen bg-[#0B1A30] pb-16">
      {/* Search panel */}
      <section className="border-b border-white/[0.06] bg-gradient-to-b from-[#081221] to-[#0B1A30]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Find your next property</h1>
          <p className="mt-2 text-sm text-slate-400">Every listing is verified by RealtorX and handled by a RealtorX realtor.</p>

          <form
            className="mt-6 rounded-2xl border border-white/10 bg-[#0B1A30]/80 p-4 shadow-xl sm:p-5"
            onSubmit={(e) => {
              e.preventDefault();
              apply();
            }}
          >
            <div className="mb-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="Purpose">
              {[['Sell', 'Buy'], ['Rent', 'Rent']].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={(draft.purpose || 'Sell') === value}
                  onClick={() => apply({ purpose: value })}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
                    (draft.purpose || 'Sell') === value ? 'bg-[#F5A623] text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr_auto]">
              <label className="sr-only" htmlFor="mk-city">City</label>
              <select id="mk-city" className={field} value={draft.city || ''} onChange={(e) => set({ city: e.target.value })}>
                <option value="">All cities</option>
                {(options?.cities || []).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <label className="sr-only" htmlFor="mk-location">Location</label>
                <input
                  id="mk-location"
                  className={`${field} pl-9`}
                  placeholder="Location, area or project (e.g. Bahria Town Precinct 10)"
                  value={draft.location || ''}
                  maxLength={140}
                  onChange={(e) => set({ location: e.target.value })}
                />
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-[#F5A623] px-6 py-2.5 text-sm font-bold text-slate-950 hover:brightness-110">
                <Search className="h-4 w-4" /> Search
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {Object.keys(groups).map((g) => (
                <button key={g} type="button" className={chip(activeGroup === g && !!draft.group)} onClick={() => apply({ group: draft.group === g ? undefined : g, category: undefined })}>
                  {g}
                </button>
              ))}
              <span className="mx-1 h-5 w-px bg-white/10" aria-hidden="true" />
              {(groups[activeGroup] || []).map((c) => (
                <button key={c} type="button" className={chip(draft.category === c)} onClick={() => apply({ group: activeGroup, category: draft.category === c ? undefined : c })}>
                  {c}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => setShowMore((v) => !v)} className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white" aria-expanded={showMore}>
                <SlidersHorizontal className="h-4 w-4" /> More filters {activeCount > 0 && <span className="rounded-full bg-[#F5A623] px-2 text-xs text-slate-950">{activeCount}</span>}
              </button>
              {activeCount > 0 && (
                <button type="button" onClick={clear} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
                  <X className="h-3.5 w-3.5" /> Clear filters
                </button>
              )}
            </div>

            {showMore && (
              <div className="mt-4 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="mb-1.5 text-xs font-medium text-slate-400">Price (PKR)</p>
                  <div className="flex gap-2">
                    <input className={field} inputMode="numeric" placeholder="Min" value={draft.min_price || ''} onChange={(e) => set({ min_price: e.target.value.replace(/\D/g, '') })} aria-label="Minimum price" />
                    <input className={field} inputMode="numeric" placeholder="Max" value={draft.max_price || ''} onChange={(e) => set({ max_price: e.target.value.replace(/\D/g, '') })} aria-label="Maximum price" />
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-slate-400">Area</p>
                  <div className="flex gap-2">
                    <input className={field} inputMode="decimal" placeholder="Min" value={draft.min_area || ''} onChange={(e) => set({ min_area: e.target.value.replace(/[^\d.]/g, '') })} aria-label="Minimum area" />
                    <input className={field} inputMode="decimal" placeholder="Max" value={draft.max_area || ''} onChange={(e) => set({ max_area: e.target.value.replace(/[^\d.]/g, '') })} aria-label="Maximum area" />
                    <select className={`${field} w-28`} value={draft.area_unit || 'Marla'} onChange={(e) => set({ area_unit: e.target.value })} aria-label="Area unit">
                      {(options?.area_units || ['Marla', 'Kanal', 'Sq.Ft', 'Sq.Yd']).map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-slate-400">Bedrooms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {BEDS.map((b) => {
                      const value = b === 'Studio' ? 'studio' : b.replace('+', '');
                      return (
                        <button key={b} type="button" className={chip(draft.beds === value)} onClick={() => set({ beds: draft.beds === value ? undefined : value })}>
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-slate-400">Bathrooms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {BATHS.map((b) => {
                      const value = b.replace('+', '');
                      return (
                        <button key={b} type="button" className={chip(draft.baths === value)} onClick={() => set({ baths: draft.baths === value ? undefined : value })}>
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" className="h-4 w-4 accent-[#F5A623]" checked={draft.installment === '1'} onChange={(e) => set({ installment: e.target.checked ? '1' : undefined })} />
                  Installments available
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" className="h-4 w-4 accent-[#F5A623]" checked={draft.possession === '1'} onChange={(e) => set({ possession: e.target.checked ? '1' : undefined })} />
                  Ready for possession
                </label>
                <div className="md:col-span-2 lg:col-span-2 flex items-end justify-end">
                  <button type="submit" className="rounded-lg bg-[#F5A623] px-6 py-2.5 text-sm font-bold text-slate-950 hover:brightness-110">
                    Apply filters
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400" aria-live="polite">
            {loading ? 'Searching…' : result ? `${result.total} ${result.total === 1 ? 'property' : 'properties'} found` : ''}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('post-listing')} className="rounded-lg border border-[#F5A623]/40 px-4 py-2 text-xs font-semibold text-[#F5A623] hover:bg-[#F5A623]/10">
              + Post your property
            </button>
            <label className="sr-only" htmlFor="mk-sort">Sort</label>
            <select id="mk-sort" className="rounded-lg border border-white/10 bg-[#081221] px-3 py-2 text-xs text-white" value={filters.sort || 'newest'} onChange={(e) => apply({ sort: e.target.value })}>
              {SORTS.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => setFilters({ ...filters })} />
        ) : loading && !result ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : result && result.items.length === 0 ? (
          <EmptyState icon={Home} title="No properties match your search" description="Try a wider area, another city or fewer filters." actionLabel="Clear filters" onAction={clear} />
        ) : (
          <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
            {result?.items.map((item) => (
              <ListingCard key={item.name} item={item} onOpen={() => onNavigate('property-detail', item.name)} onInterest={() => setInterest(item)} />
            ))}
          </div>
        )}

        {result && pages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
            <button
              disabled={(filters.page || 1) <= 1}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm text-slate-400">
              Page {filters.page || 1} of {pages}
            </span>
            <button
              disabled={(filters.page || 1) >= pages}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </section>

      {interest && (
        <InquiryModal propertyId={interest.name} propertyTitle={interest.property_title} realtorName={interest.realtor?.name} onClose={() => setInterest(null)} />
      )}
    </div>
  );
}

export function ListingCard({ item, onOpen, onInterest }: { item: PublicListing; onOpen: () => void; onInterest: () => void }) {
  const cover = imageUrl(item.cover_image);
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#081221] transition-colors hover:border-[#F5A623]/40">
      <button onClick={onOpen} className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-800 text-left" aria-label={`Open ${item.property_title}`}>
        {cover ? (
          <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-600">
            <Home className="h-12 w-12" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
          {item.purpose === 'Rent' ? 'For rent' : 'For sale'}
        </span>
        {item.images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-0.5 text-[11px] text-white">{item.images.length} photos</span>
        )}
      </button>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-lg font-bold text-[#F5A623]">{formatPrice(item.list_price, item.purpose)}</p>
        <button onClick={onOpen} className="mt-1 line-clamp-2 text-left text-sm font-semibold text-white hover:underline">
          {item.property_title}
        </button>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{[item.location_area || item.project_name, item.city].filter(Boolean).join(', ') || '—'}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-300">
          {item.custom_property_category && <span>{item.custom_property_category}</span>}
          {item.is_studio ? (
            <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> Studio</span>
          ) : item.bedrooms ? (
            <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {item.bedrooms}{item.bedrooms >= 10 ? '+' : ''}</span>
          ) : null}
          {item.bathrooms ? <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {item.bathrooms}</span> : null}
          {item.size ? <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {formatArea(item.size, item.size_unit)}</span> : null}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.installment_available ? <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">Installments</span> : null}
          {item.ready_for_possession ? <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-300">Ready for possession</span> : null}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="flex items-center gap-1 text-[11px] text-slate-400" title="Listing checked and approved by RealtorX">
            <BadgeCheck className="h-3.5 w-3.5 text-[#F5A623]" /> RealtorX verified
          </span>
          <button onClick={onInterest} className="rounded-lg bg-[#F5A623] px-4 py-2 text-xs font-bold text-slate-950 hover:brightness-110">
            I&apos;m interested
          </button>
        </div>
      </div>
    </article>
  );
}
