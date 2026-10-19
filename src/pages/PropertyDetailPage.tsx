import React, { useCallback, useEffect, useState } from 'react';
import {
  MapPin,
  Bed,
  Bath,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  Layers,
  Shield,
  Home,
  Tag,
  FileText,
  ArrowLeft,
  BadgeCheck,
  Share2,
} from 'lucide-react';
import InquiryModal from '../components/InquiryModal';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

interface SimilarProperty {
  name: string;
  property_title: string;
  list_price?: number;
  size?: number;
  size_unit?: string;
  bedrooms?: number;
  bathrooms?: number;
  status?: string;
  custom_image_1?: string;
}

const formatPrice = (price?: number) => {
  if (!price) return 'Price on Call';
  if (price >= 10000000) return `PKR ${(price / 10000000).toFixed(2)} Crore`;
  if (price >= 100000) return `PKR ${(price / 100000).toFixed(2)} Lakh`;
  return `PKR ${price.toLocaleString()}`;
};

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B1A30]">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <Skeleton className="mb-6 h-4 w-72" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="h-[400px] rounded-2xl md:h-[500px]" />
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-24" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-28 rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
            <Skeleton className="h-14 rounded-xl" />
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetailPage({
  propertyId,
  onNavigate,
}: {
  propertyId: string;
  onNavigate: (page: string, id?: string) => void;
}) {
  const [prop, setProp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [similar, setSimilar] = useState<SimilarProperty[]>([]);

  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInquiry, setShowInquiry] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    if (!propertyId) return;
    setLoading(true);
    setError('');
    fetch(`/api/erp/method/realtor_x.api.v1.get_public_property_details?property_id=${encodeURIComponent(propertyId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.message && !data.exception) {
          setProp(data.message);
          const imgs = [
            data.message.custom_image_1,
            data.message.custom_image_2,
            data.message.custom_image_3,
          ].filter(Boolean) as string[];
          setGalleryImages(imgs);
          setCurrentIndex(0);
        } else {
          setError(data?.exception || 'Property details not found.');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load property details.');
        setLoading(false);
      });
  }, [propertyId]);

  useEffect(() => {
    load();
  }, [load]);

  // Similar properties in the same project
  useEffect(() => {
    if (!prop?.project || !prop?.name) {
      setSimilar([]);
      return;
    }
    let cancelled = false;
    fetch(
      `/api/erp/method/realtor_x.api.v1.get_project_properties?project_id=${encodeURIComponent(prop.project)}`
    )
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (cancelled) return;
        const items: SimilarProperty[] = Array.isArray(d?.message) ? d.message : [];
        setSimilar(items.filter((p) => p.name !== prop.name).slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setSimilar([]);
      });
    return () => {
      cancelled = true;
    };
  }, [prop?.project, prop?.name]);

  // Gallery keyboard navigation
  useEffect(() => {
    if (galleryImages.length < 2 || showInquiry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setCurrentIndex((p) => (p === 0 ? galleryImages.length - 1 : p - 1));
      if (e.key === 'ArrowRight') setCurrentIndex((p) => (p === galleryImages.length - 1 ? 0 : p + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [galleryImages.length, showInquiry]);

  const nextImage = () =>
    setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  const prevImage = () =>
    setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));

  const shareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (loading) return <DetailSkeleton />;

  if (error || !prop) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B1A30] px-4">
        <ErrorState
          title="Property unavailable"
          message={error || 'This listing could not be loaded.'}
          onRetry={load}
          className="w-full max-w-lg"
        />
        <button
          type="button"
          onClick={() => onNavigate('properties')}
          className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </button>
      </div>
    );
  }

  const description = prop.custom_description || prop.description || '';
  const features = prop.custom_features
    ? prop.custom_features.split('\n').filter((f: string) => f.trim() !== '')
    : [];
  const category = prop.custom_property_category || 'Property';
  const ownership = prop.custom_ownership || 'N/A';
  const propertyType = prop.property_type || 'N/A';
  const status = prop.status || 'Available';
  const bedrooms = prop.bedrooms || 0;
  const bathrooms = prop.bathrooms || 0;

  const openInquiry = () => setShowInquiry(true);

  return (
    <div className="min-h-screen bg-[#0B1A30] pb-28 lg:pb-20">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        {/* Breadcrumbs + share */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-slate-400">
            <button
              type="button"
              onClick={() => onNavigate('properties')}
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Properties
            </button>
            {prop.project && (
              <>
                <span className="text-slate-600">/</span>
                <button
                  type="button"
                  onClick={() => onNavigate('project-details', prop.project)}
                  className="truncate transition-colors hover:text-white"
                >
                  {prop.project_name || 'Project'}
                </button>
                <span className="text-slate-600">/</span>
              </>
            )}
            <span className="truncate font-medium text-slate-500">{prop.property_title}</span>
          </nav>

          <button
            type="button"
            onClick={shareLink}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-white/20 hover:text-white"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            {copied ? 'Link copied' : 'Share'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* LEFT: GALLERY */}
          <div className="space-y-4">
            <div className="group relative h-[400px] overflow-hidden rounded-2xl border border-white/10 bg-slate-800 md:h-[500px]">
              {/* Branded fallback (behind image) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0E2849] to-[#081221]">
                <Building2 className="h-14 w-14 text-slate-600" />
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  No imagery available
                </span>
              </div>

              {galleryImages[currentIndex] && (
                <img
                  key={currentIndex}
                  src={galleryImages[currentIndex]}
                  alt={prop.property_title}
                  className="relative h-full w-full object-cover transition-all duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}

              <div className="absolute left-4 top-4 z-10">
                <Badge className="border-black/30 bg-[#F5A623] text-black shadow-lg">
                  {category}
                </Badge>
              </div>
              <div className="absolute right-4 top-4 z-10">
                <StatusBadge status={status} />
              </div>

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-100 backdrop-blur-sm transition-all hover:bg-[#F5A623] hover:text-black md:opacity-0 md:group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-100 backdrop-blur-sm transition-all hover:bg-[#F5A623] hover:text-black md:opacity-0 md:group-hover:opacity-100"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <div className="absolute bottom-4 right-4 z-10 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {currentIndex + 1} / {galleryImages.length}
                  </div>
                </>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`View image ${idx + 1}`}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      currentIndex === idx
                        ? 'border-[#F5A623]'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS */}
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className="border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
                  <BadgeCheck className="h-3 w-3" /> Verified Listing
                </Badge>
              </div>
              <h1 className="font-heading mb-2 text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">
                {prop.property_title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {prop.project_name || 'Karachi'}
                </span>
                {prop.unit_number && (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                    <span className="flex items-center gap-1.5">
                      <Home className="h-4 w-4" /> Unit {prop.unit_number}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#081221] p-6 shadow-lg">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Asking Price
                </p>
                <p className="text-3xl font-bold text-[#F5A623]">{formatPrice(prop.list_price)}</p>
              </div>
              <div className="text-right">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Size
                </p>
                <p className="text-2xl font-bold text-white">
                  {prop.size || 0}{' '}
                  <span className="text-sm font-normal text-slate-400">{prop.size_unit || 'Sq.Yd'}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#081221] p-4 shadow-lg">
                <div className="rounded-full bg-[#0B1A30] p-3">
                  <Bed className="h-5 w-5 text-[#F5A623]" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{bedrooms}</p>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Bedrooms</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#081221] p-4 shadow-lg">
                <div className="rounded-full bg-[#0B1A30] p-3">
                  <Bath className="h-5 w-5 text-[#F5A623]" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{bathrooms}</p>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Bathrooms</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={openInquiry}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] py-4 font-bold text-black shadow-lg transition-colors hover:bg-[#d98c15]"
              >
                <CheckCircle2 className="h-5 w-5" /> Contact Agent for Inquiry
              </button>
              <button
                type="button"
                onClick={() => onNavigate('site-visit', prop.name)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 py-3 font-semibold text-white transition-colors hover:bg-white/5"
              >
                Request a site visit
              </button>
              <p className="mt-4 text-center text-xs text-slate-500">
                Speak with a RealtorX agent — no obligation.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {description && (
              <section className="rounded-2xl border border-white/10 bg-[#081221] p-8 shadow-lg">
                <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-white">
                  <FileText className="h-5 w-5 text-[#F5A623]" /> Property Description
                </h2>
                <div
                  className="whitespace-pre-line text-sm leading-relaxed text-slate-300 md:text-base"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </section>
            )}

            {features.length > 0 && (
              <section className="rounded-2xl border border-white/10 bg-[#081221] p-8 shadow-lg">
                <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-white">
                  <CheckCircle2 className="h-5 w-5 text-[#F5A623]" /> Key Features
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {features.map((feature: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-lg border border-white/5 bg-[#0B1A30] px-4 py-3"
                    >
                      <Check className="h-4 w-4 shrink-0 text-[#F5A623]" />
                      <span className="text-sm font-medium text-slate-300">{feature.trim()}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div>
            <section className="rounded-2xl border border-white/10 bg-[#081221] p-8 shadow-lg">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
                <Layers className="h-5 w-5 text-[#F5A623]" /> Property Details
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="flex items-center gap-2 text-sm text-slate-400">
                    <Tag className="h-4 w-4" /> Property Type
                  </span>
                  <span className="text-right font-medium text-white">{propertyType}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="flex items-center gap-2 text-sm text-slate-400">
                    <Building2 className="h-4 w-4" /> Project
                  </span>
                  <span className="text-right font-medium text-white">{prop.project_name || 'N/A'}</span>
                </div>

                {prop.tower && (
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="flex items-center gap-2 text-sm text-slate-400">
                      <Layers className="h-4 w-4" /> Tower / Building
                    </span>
                    <span className="text-right font-medium text-white">{prop.tower}</span>
                  </div>
                )}

                {prop.floor && (
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="flex items-center gap-2 text-sm text-slate-400">
                      <Layers className="h-4 w-4" /> Floor
                    </span>
                    <span className="text-right font-medium text-white">{prop.floor}</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="flex items-center gap-2 text-sm text-slate-400">
                    <Home className="h-4 w-4" /> Category
                  </span>
                  <span className="text-right font-medium text-white">{category}</span>
                </div>

                {ownership && ownership !== 'N/A' && (
                  <div className="flex items-center justify-between pb-3">
                    <span className="flex items-center gap-2 text-sm text-slate-400">
                      <Shield className="h-4 w-4" /> Ownership
                    </span>
                    <span className="text-right font-medium text-white">{ownership}</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* SIMILAR PROPERTIES */}
        {similar.length > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Similar in {prop.project_name || 'this project'}
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('properties')}
                className="text-sm font-semibold text-[#F5A623] transition-colors hover:text-[#d98c15]"
              >
                View all →
              </button>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => onNavigate('property-detail', p.name)}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-[#081221] text-left transition-all hover:-translate-y-1 hover:border-[#F5A623]/40"
                >
                  <div className="relative h-36 overflow-hidden bg-slate-800">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0E2849] to-[#081221]">
                      <Building2 className="h-8 w-8 text-slate-600" />
                    </div>
                    {p.custom_image_1 && (
                      <img
                        src={p.custom_image_1}
                        alt={p.property_title}
                        className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="absolute right-2 top-2 z-10">
                      <StatusBadge status={p.status} className="!text-[10px]" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 truncate text-sm font-semibold text-white transition-colors group-hover:text-[#F5A623]">
                      {p.property_title}
                    </h3>
                    <p className="text-sm font-bold text-[#F5A623]">{formatPrice(p.list_price)}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {p.size || 0} {p.size_unit || 'Sq.Yd'}
                      {p.bedrooms ? ` · ${p.bedrooms} Bed` : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky CTA */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#081221]/95 px-4 py-3 backdrop-blur lg:hidden"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#F5A623]">{formatPrice(prop.list_price)}</p>
            <p className="truncate text-[11px] text-slate-500">
              {prop.size || 0} {prop.size_unit || 'Sq.Yd'} · {prop.name}
            </p>
          </div>
          <button
            type="button"
            onClick={openInquiry}
            className="ml-auto flex shrink-0 items-center gap-2 rounded-xl bg-[#F5A623] px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-[#d98c15]"
          >
            <CheckCircle2 className="h-4 w-4" /> Contact Agent
          </button>
        </div>
      </div>

      {showInquiry && <InquiryModal propertyId={prop.name} onClose={() => setShowInquiry(false)} />}
    </div>
  );
}
