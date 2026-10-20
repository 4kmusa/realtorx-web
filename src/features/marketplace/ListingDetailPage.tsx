// Property detail (/properties/<id>): gallery, key facts, amenities, videos, map and the
// "I'm interested" request. The tagged realtor is named, but no phone number is ever shown.
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BadgeCheck, Bath, BedDouble, Building2, CalendarCheck, Check, ChevronLeft, ChevronRight, Home, MapPin, Ruler, Share2 } from 'lucide-react';
import { PageId } from '../../types';
import InquiryModal from '../../components/InquiryModal';
import RequestModal, { RequestMode } from '../requests/RequestModal';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { PublicListing, formatArea, formatPrice, getListing, imageUrl, mapEmbedUrl, searchListings, youtubeId } from './api';
import { ListingCard } from './MarketplacePage';

type Nav = (page: PageId, id?: string) => void;

export default function ListingDetailPage({ propertyId, onNavigate }: { propertyId: string; onNavigate: Nav }) {
  const [item, setItem] = useState<PublicListing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [interest, setInterest] = useState<PublicListing | null>(null);
  const [request, setRequest] = useState<RequestMode | null>(null);
  const refreshAfter = useRef(false);
  const [similar, setSimilar] = useState<PublicListing[]>([]);
  const [copied, setCopied] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setItem(null);
    setError(null);
    setIndex(0);
    getListing(propertyId)
      .then((r) => {
        if (cancelled) return;
        setItem(r);
        document.title = `${r.property_title} | RealtorX`;
        return searchListings({ purpose: r.purpose || 'Sell', category: r.custom_property_category || undefined, city: r.city || undefined }).then(
          (s) => !cancelled && setSimilar(s.items.filter((x) => x.name !== r.name).slice(0, 3))
        );
      })
      .catch((e) => !cancelled && setError(e?.status === 404 ? 'This property is not available any more.' : e?.message || 'Could not load the property.'));
    return () => {
      cancelled = true;
    };
  }, [propertyId, tick]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <ErrorState message={error} onRetry={() => setTick((t) => t + 1)} />
        <div className="mt-6 text-center">
          <button onClick={() => onNavigate('properties')} className="text-sm text-[#F5A623] hover:underline">Browse other properties</button>
        </div>
      </div>
    );
  }
  if (!item) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Skeleton className="mb-6 h-4 w-60" />
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <Skeleton className="h-[420px] rounded-2xl" />
          <Skeleton className="h-[420px] rounded-2xl" />
        </div>
      </div>
    );
  }

  const images = item.images.map((i) => imageUrl(i)).filter(Boolean) as string[];
  const map = mapEmbedUrl(item);
  const facts: [React.ReactNode, string, string][] = [
    [<Home key="t" className="h-4 w-4" />, 'Type', item.custom_property_category || item.property_type || '—'],
    [<Ruler key="a" className="h-4 w-4" />, 'Area', formatArea(item.size, item.size_unit) || '—'],
  ];
  if (item.category_group === 'Home') {
    facts.push([<BedDouble key="b" className="h-4 w-4" />, 'Bedrooms', item.is_studio ? 'Studio' : item.bedrooms ? `${item.bedrooms}${item.bedrooms >= 10 ? '+' : ''}` : '—']);
    facts.push([<Bath key="ba" className="h-4 w-4" />, 'Bathrooms', item.bathrooms ? String(item.bathrooms) : '—']);
  }
  if (item.project_name) facts.push([<Building2 key="p" className="h-4 w-4" />, 'Project', item.project_name]);
  facts.push([<CalendarCheck key="s" className="h-4 w-4" />, 'Status', item.status === 'Available' ? 'Available' : item.purpose === 'Rent' && item.status === 'Sold' ? 'Rented' : item.status]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1A30] pb-16">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <button onClick={() => onNavigate('properties')} className="mb-5 flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </button>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-800">
              {images.length ? (
                <img src={images[index]} alt={`${item.property_title}, photo ${index + 1}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-600"><Home className="h-16 w-16" /></div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setIndex((index - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white" aria-label="Previous photo">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={() => setIndex((index + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white" aria-label="Next photo">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-0.5 text-xs text-white">{index + 1} / {images.length}</span>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button key={src} onClick={() => setIndex(i)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${i === index ? 'border-[#F5A623]' : 'border-transparent opacity-70'}`} aria-label={`Show photo ${i + 1}`}>
                    <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary + interest */}
          <aside className="h-fit space-y-5 rounded-2xl border border-white/10 bg-[#081221] p-6 lg:sticky lg:top-24">
            <div>
              <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-slate-200">{item.purpose === 'Rent' ? 'For rent' : 'For sale'}</span>
              <p className="mt-3 text-3xl font-bold text-[#F5A623]">{formatPrice(item.list_price, item.purpose)}</p>
              <h1 className="mt-2 text-xl font-semibold text-white">{item.property_title}</h1>
              <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {[item.location_area || item.project_name, item.city].filter(Boolean).join(', ') || '—'}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.installment_available ? <span className="rounded bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">Installments available</span> : null}
              {item.ready_for_possession ? <span className="rounded bg-sky-500/10 px-2 py-1 text-xs text-sky-300">Ready for possession</span> : null}
            </div>
            <div className="rounded-xl border border-[#F5A623]/20 bg-[#F5A623]/5 p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold text-white"><BadgeCheck className="h-4 w-4 text-[#F5A623]" /> RealtorX verified listing</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {item.realtor?.name
                  ? <>Handled by <button className="text-slate-200 underline-offset-2 hover:underline" onClick={() => onNavigate('members', item.realtor?.member_id || undefined)}>{item.realtor.name}</button>{item.realtor.member_id ? ` (${item.realtor.member_id})` : ''}, a RealtorX member realtor.</>
                  : 'Handled by the RealtorX team.'}{' '}
                Contact details stay private; press the button and the realtor will call you.
              </p>
            </div>
            {item.status === 'Available' ? (
              <>
                <button onClick={() => setInterest(item)} className="w-full rounded-xl bg-[#F5A623] py-3 text-sm font-bold text-slate-950 hover:brightness-110">
                  I&apos;m interested
                </button>
                <div className={`grid gap-2 ${item.project ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <button onClick={() => setRequest('visit')} className="rounded-xl border border-white/15 py-2.5 text-xs font-semibold text-white hover:bg-white/5">Request a visit</button>
                  {item.project && <button onClick={() => setRequest('booking')} className="rounded-xl border border-[#F5A623]/50 py-2.5 text-xs font-semibold text-[#F5A623] hover:bg-[#F5A623]/10">Request booking</button>}
                </div>
              </>
            ) : item.status === 'Reserved' ? (
              <>
                <p className="rounded-xl bg-white/5 p-3 text-center text-sm text-slate-300">This property is reserved at the moment.</p>
                <button onClick={() => setRequest('visit')} className="w-full rounded-xl border border-white/15 py-2.5 text-xs font-semibold text-white hover:bg-white/5">Request a visit</button>
              </>
            ) : (
              <p className="rounded-xl bg-white/5 p-3 text-center text-sm text-slate-300">This property is no longer available.</p>
            )}
            <div className="flex gap-2">
              <button onClick={share} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/15 px-3 py-2.5 text-xs text-white hover:bg-white/5" aria-label="Copy link">
                <Share2 className="h-4 w-4" /> {copied ? 'Copied' : 'Share'}
              </button>
            </div>
          </aside>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <section>
              <h2 className="mb-4 text-lg font-semibold text-white">Key facts</h2>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {facts.map(([icon, label, value]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-[#081221] p-3">
                    <dt className="flex items-center gap-1.5 text-xs text-slate-400">{icon} {label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-white">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {item.custom_description && (
              <section>
                <h2 className="mb-3 text-lg font-semibold text-white">Description</h2>
                {/* Sanitised on the server (frappe sanitize_html); listings submitted online are stored escaped. */}
                <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-300" dangerouslySetInnerHTML={{ __html: item.custom_description }} />
              </section>
            )}

            {!!item.amenities?.length && (
              <section>
                <h2 className="mb-3 text-lg font-semibold text-white">Features &amp; amenities</h2>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {item.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-sm text-slate-300"><Check className="h-4 w-4 text-[#F5A623]" /> {a}</li>
                  ))}
                </ul>
              </section>
            )}

            {!!item.videos?.length && (
              <section>
                <h2 className="mb-3 text-lg font-semibold text-white">Videos</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {item.videos.map((v) => {
                    const id = youtubeId(v);
                    return id ? (
                      <div key={v} className="aspect-video overflow-hidden rounded-xl bg-black">
                        <iframe
                          title="Property video"
                          src={`https://www.youtube-nocookie.com/embed/${id}`}
                          className="h-full w-full"
                          loading="lazy"
                          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : null;
                  })}
                </div>
              </section>
            )}
          </div>

          {map && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-white">Location</h2>
              <div className="aspect-square overflow-hidden rounded-2xl border border-white/10 bg-slate-800">
                <iframe title="Map" src={map} className="h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
              {item.map_link && /^https:\/\//.test(item.map_link) && (
                <a href={item.map_link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-[#F5A623] hover:underline">
                  Open in Google Maps
                </a>
              )}
            </section>
          )}
        </div>

        {similar.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-lg font-semibold text-white">Similar properties</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => (
                <ListingCard key={s.name} item={s} onOpen={() => onNavigate('property-detail', s.name)} onInterest={() => setInterest(s)} />
              ))}
            </div>
          </section>
        )}
      </div>

      {request && (
        <RequestModal mode={request} unitId={item.name} projectId={item.project} title={item.property_title}
          onClose={() => {
            setRequest(null);
            if (refreshAfter.current) setTick((t) => t + 1); // show the new status once the confirmation is closed
            refreshAfter.current = false;
          }}
          onDone={() => { refreshAfter.current = request === 'booking'; }} />
      )}
      {interest && <InquiryModal propertyId={interest.name} propertyTitle={interest.property_title} realtorName={interest.realtor?.name} onClose={() => setInterest(null)} />}
    </div>
  );
}
