// Properties (/properties): search with filters kept in the URL; no phone numbers anywhere: buyers press
// "Enquire" and the request goes to the RealtorX sales team.
import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Home, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { PageId } from '../../types';
import InquiryModal from '../../components/InquiryModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button, Container, Eyebrow, inputClass } from '../../components/site/ui';
import { ListingCard } from './ListingCard';
import { FormOptions, PublicListing, SearchFilters, SearchResult, getFeatured, getFormOptions, searchListings } from './api';

type Nav = (page: PageId, id?: string) => void;

const FILTER_KEYS: (keyof SearchFilters)[] = [
  'purpose', 'group', 'category', 'city', 'location', 'min_price', 'max_price', 'min_area', 'max_area', 'area_unit', 'beds', 'baths',
  'installment', 'possession', 'sort', 'project',
];
const BEDS = ['Studio', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
const BATHS = ['1', '2', '3', '4', '5', '6+'];
const SORTS: [string, string][] = [
  ['recommended', 'Recommended'],
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
  `h-9 rounded-full border px-4 text-[13px] transition-colors ${active ? 'border-fg bg-fg text-ink' : 'border-line-2 text-fg-2 hover:border-fg/40 hover:text-fg'}`;
const field = `${inputClass} h-11 text-sm`;

export default function MarketplacePage({ onNavigate }: { onNavigate: Nav }) {
  const [filters, setFilters] = useState<SearchFilters>(() => readFilters());
  const [draft, setDraft] = useState<SearchFilters>(() => readFilters());
  const [options, setOptions] = useState<FormOptions | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [featured, setFeatured] = useState<PublicListing[]>([]);
  useEffect(() => {
    getFeatured().then(setFeatured).catch(() => setFeatured([]));
  }, []);
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
  const purpose = draft.purpose || 'Sell';
  const featuredHere = activeCount === 0 && (filters.page || 1) <= 1 ? featured.filter((f) => (f.purpose || 'Sell') === (filters.purpose || 'Sell')).slice(0, 6) : [];

  return (
    <div className="min-h-screen bg-ink pb-24">
      <header className="border-b border-line">
        <Container className="pb-10 pt-14 md:pt-20">
          <Eyebrow className="mb-6">Properties</Eyebrow>
          <h1 className="text-balance text-[40px] font-medium leading-[1.02] tracking-[-0.035em] text-fg md:text-[64px]">
            {purpose === 'Rent' ? <>Homes to <span className="em">rent</span>.</> : <>Find a home worth <span className="em">owning</span>.</>}
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-fg-2">Every listing comes from a developer under contract with RealtorX and is checked before it goes live.</p>

          <form className="mt-10" onSubmit={(e) => { e.preventDefault(); apply(); }}>
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex shrink-0 rounded-full border border-line p-1" role="tablist" aria-label="Buy or rent">
                {[['Sell', 'Buy'], ['Rent', 'Rent']].map(([value, label]) => (
                  <button key={value} type="button" role="tab" aria-selected={purpose === value} onClick={() => apply({ purpose: value })}
                    className={`h-9 flex-1 rounded-full px-6 text-sm transition-colors md:flex-none ${purpose === value ? 'bg-fg text-ink' : 'text-fg-2 hover:text-fg'}`}>
                    {label}
                  </button>
                ))}
              </div>
              <label className="sr-only" htmlFor="mk-city">City</label>
              <select id="mk-city" className={`${field} md:w-48`} value={draft.city || ''} onChange={(e) => set({ city: e.target.value })}>
                <option value="">All cities</option>
                {(options?.cities || []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="relative flex-1">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" strokeWidth={1.5} />
                <label className="sr-only" htmlFor="mk-location">Area or project</label>
                <input id="mk-location" className={`${field} pl-10`} placeholder="Area or project" value={draft.location || ''} maxLength={140} onChange={(e) => set({ location: e.target.value })} />
              </div>
              <Button type="submit" className="h-11 px-6"><Search className="h-4 w-4" strokeWidth={1.75} /> Search</Button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {Object.keys(groups).map((g) => (
                <button key={g} type="button" className={chip(activeGroup === g && !!draft.group)} onClick={() => apply({ group: draft.group === g ? undefined : g, category: undefined })}>{g}</button>
              ))}
              {draft.group && (groups[activeGroup] || []).length > 0 && <span className="mx-1 h-5 w-px bg-line-2" aria-hidden="true" />}
              {draft.group && (groups[activeGroup] || []).map((c) => (
                <button key={c} type="button" className={chip(draft.category === c)} onClick={() => apply({ group: activeGroup, category: draft.category === c ? undefined : c })}>{c}</button>
              ))}
              <button type="button" onClick={() => setShowMore((v) => !v)} aria-expanded={showMore} className="ml-auto flex h-9 items-center gap-2 rounded-full px-3 text-[13px] text-fg-2 hover:text-fg">
                <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} /> More filters
                {activeCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue px-1.5 text-[11px] text-white">{activeCount}</span>}
              </button>
              {activeCount > 0 && (
                <button type="button" onClick={clear} className="flex h-9 items-center gap-1 rounded-full px-3 text-[13px] text-fg-3 hover:text-fg"><X className="h-3.5 w-3.5" /> Clear</button>
              )}
            </div>

            {showMore && (
              <div className="mt-6 grid gap-6 rounded-2xl border border-line bg-panel p-6 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="mb-2 text-[13px] text-fg-2">Price (PKR)</p>
                  <div className="flex gap-2">
                    <input className={field} inputMode="numeric" placeholder="Min" value={draft.min_price || ''} onChange={(e) => set({ min_price: e.target.value.replace(/\D/g, '') })} aria-label="Minimum price" />
                    <input className={field} inputMode="numeric" placeholder="Max" value={draft.max_price || ''} onChange={(e) => set({ max_price: e.target.value.replace(/\D/g, '') })} aria-label="Maximum price" />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[13px] text-fg-2">Area</p>
                  <div className="flex gap-2">
                    <input className={field} inputMode="decimal" placeholder="Min" value={draft.min_area || ''} onChange={(e) => set({ min_area: e.target.value.replace(/[^\d.]/g, '') })} aria-label="Minimum area" />
                    <input className={field} inputMode="decimal" placeholder="Max" value={draft.max_area || ''} onChange={(e) => set({ max_area: e.target.value.replace(/[^\d.]/g, '') })} aria-label="Maximum area" />
                    <select className={`${field} w-28`} value={draft.area_unit || 'Marla'} onChange={(e) => set({ area_unit: e.target.value })} aria-label="Area unit">
                      {(options?.area_units || ['Marla', 'Kanal', 'Sq.Ft', 'Sq.Yd']).map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[13px] text-fg-2">Bedrooms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {BEDS.map((b) => {
                      const value = b === 'Studio' ? 'studio' : b.replace('+', '');
                      return <button key={b} type="button" className={chip(draft.beds === value)} onClick={() => set({ beds: draft.beds === value ? undefined : value })}>{b}</button>;
                    })}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[13px] text-fg-2">Bathrooms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {BATHS.map((b) => {
                      const value = b.replace('+', '');
                      return <button key={b} type="button" className={chip(draft.baths === value)} onClick={() => set({ baths: draft.baths === value ? undefined : value })}>{b}</button>;
                    })}
                  </div>
                </div>
                <label className="flex items-center gap-3 text-sm text-fg-2">
                  <input type="checkbox" className="h-4 w-4 accent-[#2d6cf6]" checked={draft.installment === '1'} onChange={(e) => set({ installment: e.target.checked ? '1' : undefined })} />
                  Installments available
                </label>
                <label className="flex items-center gap-3 text-sm text-fg-2">
                  <input type="checkbox" className="h-4 w-4 accent-[#2d6cf6]" checked={draft.possession === '1'} onChange={(e) => set({ possession: e.target.checked ? '1' : undefined })} />
                  Ready for possession
                </label>
                <div className="flex items-end justify-end md:col-span-2">
                  <Button type="submit">Apply filters</Button>
                </div>
              </div>
            )}
          </form>
        </Container>
      </header>

      {/* Featured Listings (chosen and ordered by RealtorX in Desk), on the first page of an unfiltered search. */}
      {featuredHere.length > 0 && (
        <Container className="pt-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-medium tracking-[-0.03em] text-fg md:text-[34px]">Featured <span className="em">listings</span></h2>
            <p className="hidden text-[13px] text-fg-3 sm:block">Picked by RealtorX</p>
          </div>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featuredHere.map((item) => (
              <ListingCard key={item.name} item={item} featured onOpen={() => onNavigate('property-detail', item.name)} onInterest={() => setInterest(item)} />
            ))}
          </div>
          <div className="mt-14 h-px bg-line" />
        </Container>
      )}

      <Container className="pt-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-fg-3" aria-live="polite">
            {loading ? 'Searching…' : result ? `${result.total} ${result.total === 1 ? 'property' : 'properties'}` : ''}
          </p>
          <label className="flex items-center gap-2 text-[13px] text-fg-3">
            Sort
            <select className="h-9 rounded-full border border-line bg-transparent px-3 text-[13px] text-fg outline-none" value={filters.sort || 'recommended'} onChange={(e) => apply({ sort: e.target.value })}>
              {SORTS.map(([v, l]) => <option key={v} value={v} className="bg-ink">{l}</option>)}
            </select>
          </label>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => setFilters({ ...filters })} />
        ) : loading && !result ? (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-xl" />)}
          </div>
        ) : result && result.items.length === 0 ? (
          <EmptyState icon={Home} title="Nothing matches yet" description="Try a wider area, another city or fewer filters. New units are added as developers release them." actionLabel="Clear filters" onAction={clear} />
        ) : (
          <div className={`grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
            {result?.items.map((item) => (
              <ListingCard key={item.name} item={item} onOpen={() => onNavigate('property-detail', item.name)} onInterest={() => setInterest(item)} />
            ))}
          </div>
        )}

        {result && pages > 1 && (
          <nav className="mt-16 flex items-center justify-center gap-4" aria-label="Pagination">
            <Button variant="secondary" size="sm" disabled={(filters.page || 1) <= 1} onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-[13px] text-fg-3">Page {filters.page || 1} of {pages}</span>
            <Button variant="secondary" size="sm" disabled={(filters.page || 1) >= pages} onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        )}
      </Container>

      {interest && <InquiryModal propertyId={interest.name} propertyTitle={interest.property_title} onClose={() => setInterest(null)} />}
    </div>
  );
}

export { ListingCard };
