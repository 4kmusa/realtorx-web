// Property detail (/properties/<id>): gallery, key facts, 3D, its type's floor plan, payment plan, amenities, videos,
// map with the project's nearby places, the enquiry panel (enquire, visit, booking request) and a card of its project.
// No phone number is ever shown.
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Box, Building2, Check, ChevronLeft, ChevronRight, DoorOpen, Home, Maximize2, MessageCircle, Rotate3d, Share2 } from 'lucide-react';
import Lightbox, { LightboxImage } from '../../components/ui/Lightbox';
import { projectStage } from '../projects/api';
import { PageId } from '../../types';
import InquiryModal from '../../components/InquiryModal';
import RequestModal, { RequestMode } from '../requests/RequestModal';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button, Container, Eyebrow, Tag, XMark } from '../../components/site/ui';
import { FEATURES, whatsappUrl } from '../../config/site';
import { PublicListing, formatArea, formatPrice, getListing, imageUrl, mapEmbedUrl, planLineAmount, searchListings, youtubeId } from './api';
import { ListingCard } from './ListingCard';
import { markNotFound } from '../../utils/seo';

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
  const [viewer, setViewer] = useState<LightboxImage[] | null>(null);

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
      .catch((e) => {
        if (cancelled) return;
        if (e?.status === 404) markNotFound();
        setError(e?.status === 404 ? 'This property is not available any more.' : e?.message || 'Could not load the property.');
      });
    return () => {
      cancelled = true;
    };
  }, [propertyId, tick]);

  if (error) {
    return (
      <Container className="py-24">
        <ErrorState title="This property is not available" message={error} onRetry={() => setTick((t) => t + 1)} />
        <div className="mt-6 text-center">
          <Button variant="secondary" onClick={() => onNavigate('properties')}>Browse other properties</Button>
        </div>
      </Container>
    );
  }
  if (!item) {
    return (
      <Container className="py-14">
        <Skeleton className="mb-6 h-4 w-60" />
        <Skeleton className="mb-10 h-14 w-2/3" />
        <Skeleton className="aspect-[16/9] rounded-2xl" />
      </Container>
    );
  }

  const images = item.images.map((i) => imageUrl(i)).filter(Boolean) as string[];
  const ctx = item.project_context || null;
  // The unit's own map point, else its project's.
  const map = mapEmbedUrl(item.latitude || item.longitude || !ctx ? item : { latitude: ctx.location.latitude ?? null, longitude: ctx.location.longitude ?? null, location_area: ctx.location.address, city: ctx.location.city });
  const mapLink = item.map_link && /^https:\/\//.test(item.map_link) ? item.map_link : ctx?.location.map_link || null;
  const facts: [string, string][] = [
    ['Type', item.custom_property_category || item.property_type || '—'],
    ['Area', formatArea(item.size, item.size_unit) || '—'],
  ];
  if (item.category_group === 'Home') {
    facts.push(['Bedrooms', item.is_studio ? 'Studio' : item.bedrooms ? `${item.bedrooms}${item.bedrooms >= 10 ? '+' : ''}` : '—']);
    facts.push(['Bathrooms', item.bathrooms ? String(item.bathrooms) : '—']);
  }
  if (item.project_name) facts.push(['Project', item.project_name]);
  if (ctx?.type && ctx.type !== item.custom_property_category) facts.push(['Unit type', ctx.type]);
  facts.push(['Status', item.status === 'Available' ? 'Available' : item.purpose === 'Rent' && item.status === 'Sold' ? 'Rented' : item.status]);
  const place = [item.location_area || item.project_name, item.city].filter(Boolean).join(', ');

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: item.property_title, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* share cancelled or clipboard unavailable */
    }
  };

  return (
    <div className="min-h-screen bg-ink pb-24">
      <Container className="pt-10 md:pt-14">
        <button onClick={() => onNavigate('properties')} className="mb-8 flex items-center gap-2 text-[13px] text-fg-3 transition-colors hover:text-fg">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> All properties
        </button>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <Eyebrow className="mb-4">{[item.purpose === 'Rent' ? 'For rent' : 'For sale', place].filter(Boolean).join('  ·  ')}</Eyebrow>
            <h1 className="text-balance text-[34px] font-medium leading-[1.05] tracking-[-0.03em] text-fg md:text-[52px]">{item.property_title}</h1>
          </div>
          <p className="text-3xl font-medium tracking-[-0.02em] text-fg md:text-4xl">{formatPrice(item.list_price, item.purpose, item.currency)}</p>
        </div>

        {/* Gallery */}
        <div className="mt-10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-panel md:aspect-[16/8]">
            {images.length ? (
              <img src={images[index]} alt={`${item.property_title}, photo ${index + 1}`} className="h-full w-full object-cover animate-fade" key={images[index]} />
            ) : (
              <div className="flex h-full items-center justify-center text-fg-3"><Home className="h-14 w-14" strokeWidth={1} /></div>
            )}
            {FEATURES.tours3d && (item.has_tour || item.unit_3d) && (
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {item.unit_3d && (
                  <button onClick={() => onNavigate('project-3d', `${item.unit_3d!.project}?unit=${encodeURIComponent(item.name)}`)} className="flex h-10 items-center gap-2 rounded-full bg-fg px-4 text-sm text-ink">
                    <Box className="h-4 w-4" /> 3D & 360°
                  </button>
                )}
                {item.has_tour && (
                  <button onClick={() => onNavigate('virtual-tour', `property/${item.name}`)} className="flex h-10 items-center gap-2 rounded-full bg-fg px-4 text-sm text-ink">
                    <Rotate3d className="h-4 w-4" /> 360° photos
                  </button>
                )}
              </div>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setIndex((index - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-fg backdrop-blur hover:bg-ink/80" aria-label="Previous photo">
                  <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
                </button>
                <button onClick={() => setIndex((index + 1) % images.length)} className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-fg backdrop-blur hover:bg-ink/80" aria-label="Next photo">
                  <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
                </button>
                <span className="absolute bottom-4 right-4 rounded-full bg-ink/60 px-3 py-1 text-xs tabular-nums text-fg backdrop-blur">{index + 1} / {images.length}</span>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, i) => (
                <button key={`${i}-${src}`} onClick={() => setIndex(i)} aria-label={`Show photo ${i + 1}`}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg transition-opacity md:h-20 md:w-32 ${i === index ? 'opacity-100 ring-1 ring-fg' : 'opacity-50 hover:opacity-80'}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-[1fr_380px]">
          <div className="space-y-14">
            <section>
              <h2 className="mb-6 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">Key facts</h2>
              <dl className="grid grid-cols-2 border-t border-line sm:grid-cols-3">
                {facts.map(([label, value]) => (
                  <div key={label} className="border-b border-line py-5 pr-4">
                    <dt className="text-[13px] text-fg-3">{label}</dt>
                    <dd className="mt-1.5 text-[17px] text-fg">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {FEATURES.tours3d && item.unit_3d && (
              <section>
                <h2 className="mb-6 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">See it in 3D</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button onClick={() => onNavigate('project-3d', `${item.unit_3d!.project}?unit=${encodeURIComponent(item.name)}`)}
                    className="flex items-start gap-4 rounded-2xl border border-line-2 bg-ink-2 p-5 text-left transition-colors hover:border-fg-3">
                    <Building2 className="mt-0.5 h-6 w-6 shrink-0 text-blue-2" strokeWidth={1.5} />
                    <span>
                      <span className="block text-[16px] text-fg">This flat in the building</span>
                      <span className="mt-1 block text-[13px] text-fg-3">Its tower and floor, with live availability around it.</span>
                    </span>
                  </button>
                  {item.unit_3d.interior && (
                    <button onClick={() => onNavigate('project-3d', `${item.unit_3d!.project}?unit=${encodeURIComponent(item.name)}&inside=1`)}
                      className="flex items-start gap-4 rounded-2xl border border-line-2 bg-ink-2 p-5 text-left transition-colors hover:border-fg-3">
                      <DoorOpen className="mt-0.5 h-6 w-6 shrink-0 text-blue-2" strokeWidth={1.5} />
                      <span>
                        <span className="block text-[16px] text-fg">Walk through the apartment</span>
                        <span className="mt-1 block text-[13px] text-fg-3">A furnished 3D model of this layout. Step into every room and look around 360°.</span>
                      </span>
                    </button>
                  )}
                </div>
                <p className="mt-3 text-xs text-fg-3">Illustrative model; finishes and furniture may differ.</p>
              </section>
            )}

            {ctx?.floor_plan && (
              <section>
                <h2 className="mb-6 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">Floor plan</h2>
                <button onClick={() => setViewer([{ src: imageUrl(ctx.floor_plan!.image) || '', caption: `${ctx.type} floor plan` }])}
                  className="group relative block w-full overflow-hidden rounded-2xl border border-line bg-white">
                  <img src={imageUrl(ctx.floor_plan.image) || ''} alt={`${ctx.type} floor plan`} className="mx-auto max-h-[560px] w-full object-contain p-3" loading="lazy" />
                  <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white"><Maximize2 className="h-3.5 w-3.5" /> Full size</span>
                </button>
                <p className="mt-3 text-xs text-fg-3">Plan of the {ctx.type} type; your unit may be mirrored or differ slightly.</p>
              </section>
            )}

            {item.custom_description && (
              <section>
                <h2 className="mb-6 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">About this property</h2>
                {/* Sanitised on the server (frappe sanitize_html). */}
                <div className="prose-rx max-w-none" dangerouslySetInnerHTML={{ __html: item.custom_description }} />
              </section>
            )}

            {item.payment_plan && (
              <section>
                <h2 className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">Payment plan</h2>
                <p className="mb-6 text-[15px] text-fg-2">{item.payment_plan.name} · {item.payment_plan.summary}</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead className="text-left text-[12px] text-fg-3">
                      <tr className="border-b border-line"><th className="py-3 pr-4 font-normal">Payment</th><th className="hidden py-3 pr-4 font-normal sm:table-cell">When</th><th className="py-3 pr-4 text-right font-normal">Share</th><th className="py-3 text-right font-normal">Amount</th></tr>
                    </thead>
                    <tbody className="text-fg">
                      {item.payment_plan.lines.map((l, i) => {
                        const amount = planLineAmount(item.list_price, l);
                        const when = l.kind === 'Installments'
                          ? `${l.installments} × every ${l.every_months === 1 ? 'month' : `${l.every_months} months`}`
                          : l.on_possession ? 'On possession' : l.due_after_days ? `${l.due_after_days} days after booking` : 'On booking';
                        return (
                          <tr key={i} className="border-b border-line">
                            <td className="py-4 pr-4">{l.label}<span className="mt-1 block text-[12px] text-fg-3 sm:hidden">{when}</span></td>
                            <td className="hidden py-4 pr-4 text-fg-2 sm:table-cell">{when}</td>
                            <td className="py-4 pr-4 text-right tabular-nums text-fg-2">{l.percent}%</td>
                            <td className="py-4 text-right tabular-nums">{amount ? `${formatPrice(Math.round(amount), null, item.currency)}${l.kind === 'Installments' ? ' each' : ''}` : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-fg-3">Indicative. Your exact schedule is set in your booking.</p>
              </section>
            )}

            {!!item.amenities?.length && (
              <section>
                <h2 className="mb-6 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">Features and amenities</h2>
                <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-3">
                  {item.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-3 text-[15px] text-fg-2"><Check className="h-4 w-4 text-blue-2" strokeWidth={1.75} /> {a}</li>
                  ))}
                </ul>
              </section>
            )}

            {!!item.videos?.length && (
              <section>
                <h2 className="mb-6 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">Videos</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {item.videos.map((v) => {
                    const id = youtubeId(v);
                    return id ? (
                      <div key={v} className="aspect-video overflow-hidden rounded-xl bg-black">
                        <iframe title="Property video" src={`https://www.youtube-nocookie.com/embed/${id}`} className="h-full w-full" loading="lazy"
                          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </div>
                    ) : null;
                  })}
                </div>
              </section>
            )}

            {map && (
              <section>
                <h2 className="mb-6 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">Location</h2>
                <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-line bg-panel">
                  <iframe title="Map" src={map} className="h-full w-full grayscale invert-[0.92] hue-rotate-180" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
                {mapLink && (
                  <a href={mapLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[13px] text-fg-2 underline underline-offset-4 hover:text-fg">Open in Google Maps</a>
                )}
                {!!ctx?.nearby.length && (
                  <ul className="mt-8 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                    {ctx.nearby.map((n, i) => (
                      <li key={i} className="flex items-center justify-between gap-4 border-b border-line py-3.5">
                        <span className="text-[15px] text-fg">{n.place}<span className="ml-2 text-[12px] text-fg-3">{n.kind}</span></span>
                        <span className="shrink-0 text-[14px] tabular-nums text-fg-2">{n.distance || ''}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="rounded-2xl border border-line bg-panel p-7">
              <p className="text-[13px] text-fg-3">{item.purpose === 'Rent' ? 'Monthly rent' : 'Price'}</p>
              <p className="mt-1 text-3xl font-medium tracking-[-0.02em] text-fg">{formatPrice(item.list_price, item.purpose, item.currency)}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.installment_available ? <Tag tone="blue">Installments available</Tag> : null}
                {item.ready_for_possession ? <Tag tone="good">Ready for possession</Tag> : null}
              </div>
              <div className="my-6 h-px bg-line" />
              {item.status === 'Available' ? (
                <div className="grid gap-2.5">
                  <Button size="lg" onClick={() => setInterest(item)}>Enquire about this home</Button>
                  <Button size="lg" variant="secondary" onClick={() => setRequest('visit')}>Book a site visit</Button>
                  {item.project && <Button variant="ghost" onClick={() => setRequest('booking')}>Request a booking</Button>}
                </div>
              ) : item.status === 'Reserved' ? (
                <div className="grid gap-3">
                  <p className="text-sm text-fg-2">This unit is reserved at the moment. You can still visit and ask about similar units.</p>
                  <Button variant="secondary" onClick={() => setRequest('visit')}>Book a site visit</Button>
                </div>
              ) : (
                <p className="text-sm text-fg-2">This property is no longer available.</p>
              )}
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-white/[0.03] p-4 text-[13px] leading-relaxed text-fg-2">
                <XMark className="mt-1 h-3 w-3 shrink-0" />
                <span>Checked by RealtorX. Your contact details stay private until you ask us to call.</span>
              </div>
              <button onClick={share} className="mt-5 flex w-full items-center justify-center gap-2 text-[13px] text-fg-3 transition-colors hover:text-fg">
                <Share2 className="h-4 w-4" strokeWidth={1.5} /> {copied ? 'Link copied' : 'Share this property'}
              </button>
            </div>
            {ctx && (
              <button onClick={() => onNavigate('project-details', ctx.project.name)} className="group mt-4 block w-full overflow-hidden rounded-2xl border border-line bg-panel text-left">
                {ctx.project.cover_image && (
                  <div className="aspect-[16/9] overflow-hidden"><img src={imageUrl(ctx.project.cover_image) || ''} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" /></div>
                )}
                <div className="p-5">
                  <p className="text-[12px] uppercase tracking-[0.16em] text-fg-3">Part of</p>
                  <p className="mt-1 text-[18px] font-medium text-fg">{ctx.project.project_name}</p>
                  <p className="mt-0.5 text-[13px] text-fg-3">{[projectStage(ctx.project.status), ctx.project.city, ctx.project.completion ? `Possession ${new Date(`${ctx.project.completion}T00:00:00`).getFullYear()}` : null].filter(Boolean).join(' · ')}</p>
                  {ctx.project.developer && (
                    <p className="mt-3 flex items-center gap-2 text-[13px] text-fg-2">
                      {ctx.project.developer_logo && <img src={imageUrl(ctx.project.developer_logo) || ''} alt="" className="h-6 w-6 rounded bg-white object-contain p-0.5" />}
                      {ctx.project.developer}
                    </p>
                  )}
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-[13px]">
                    <div><dt className="text-fg-3">{ctx.type}</dt><dd className="mt-0.5 text-fg">{ctx.project.type_available} of {ctx.project.type_units} available</dd></div>
                    <div><dt className="text-fg-3">Whole project</dt><dd className="mt-0.5 text-fg">{ctx.project.available} of {ctx.project.units} available</dd></div>
                  </dl>
                  <p className="mt-4 text-[13px] text-fg-2 underline underline-offset-4 group-hover:text-fg">View the project</p>
                </div>
              </button>
            )}
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-24 border-t border-line pt-16">
            <h2 className="mb-10 text-3xl font-medium tracking-[-0.03em] text-fg">Similar <span className="em">homes</span></h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((sm) => (
                <ListingCard key={sm.name} item={sm} onOpen={() => onNavigate('property-detail', sm.name)} onInterest={() => setInterest(sm)} />
              ))}
            </div>
          </section>
        )}
      </Container>

      {/* Phones: price and the main actions stay at the bottom of the screen while the buyer scrolls. */}
      {(item.status === 'Available' || item.status === 'Reserved') && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-line bg-ink/95 p-3 backdrop-blur lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-medium text-fg">{formatPrice(item.list_price, item.purpose, item.currency)}</p>
            <p className="truncate text-[12px] text-fg-3">{item.status === 'Reserved' ? 'Reserved at the moment' : item.property_title}</p>
          </div>
          {item.status === 'Available' && <Button size="sm" variant="secondary" className="h-11" onClick={() => setInterest(item)}>Enquire</Button>}
          <Button size="sm" className="h-11" onClick={() => setRequest('visit')}>Site visit</Button>
          <a href={whatsappUrl(`Hello RealtorX, I am interested in ${item.property_title} (${item.name}).`)} target="_blank" rel="noopener noreferrer"
            aria-label="WhatsApp RealtorX" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-2 text-fg">
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      )}
      {request && (
        <RequestModal mode={request} unitId={item.name} projectId={item.project} title={item.property_title}
          onClose={() => {
            setRequest(null);
            if (refreshAfter.current) setTick((t) => t + 1); // show the new status once the confirmation is closed
            refreshAfter.current = false;
          }}
          onDone={() => { refreshAfter.current = request === 'booking'; }} />
      )}
      {interest && <InquiryModal propertyId={interest.name} propertyTitle={interest.property_title} onClose={() => setInterest(null)} />}
      {viewer && <Lightbox images={viewer} start={0} onClose={() => setViewer(null)} />}
    </div>
  );
}
