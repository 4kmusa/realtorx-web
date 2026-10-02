import React, { useState, useEffect } from 'react';
import { PageId, Language } from '../types';
import { fetchProperty, fetchProperties, Property } from '../services/propertyService';
import {
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Share2,
  Heart,
  Building,
  Check,
  Send,
  Loader2,
  AlertCircle,
  Bed,
  Bath,
  Ruler,
  Tag,
  Wallet,
  FileText,
  ImageOff,
  Sparkles,
  ChevronRight,
  Phone,
  Mail,
  Clock,
} from 'lucide-react';

interface PropertyDetailPageProps {
  propertyId: string;
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
  onOpenSocialModal?: () => void;
}

const ERPNEXT_URL = import.meta.env.VITE_ERPNEXT_URL || 'http://172.23.173.190:8000';
const API_KEY = import.meta.env.VITE_ERPNEXT_API_KEY || '';
const API_SECRET = import.meta.env.VITE_ERPNEXT_API_SECRET || '';
const WHATSAPP_NUMBER = '923008472910';
const FAVORITES_KEY = 'realtorx_favorites';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const hasRealImage = (url?: string): boolean => {
  if (!url) return false;
  return !url.startsWith('data:');
};

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  propertyId,
  onNavigate,
  language,
  onOpenSocialModal,
}) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Booking Form State
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('11:00 AM – 1:00 PM');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch property data from ERPNext
  useEffect(() => {
    async function loadProperty() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProperty(propertyId);
        if (!data) {
          setError('Property not found.');
          setProperty(null);
        } else {
          setProperty(data);

          const all = await fetchProperties();
          const similar = all
            .filter((p) => p.erpCode !== propertyId && p.category === data.category)
            .slice(0, 3);
          setSimilarProperties(similar);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    }
    if (propertyId) loadProperty();
  }, [propertyId]);

  // Check if current property is favorite
  useEffect(() => {
    if (!property) return;
    try {
      const favs = localStorage.getItem(FAVORITES_KEY);
      if (favs) {
        const set = new Set(JSON.parse(favs));
        setIsFavorite(set.has(property.erpCode));
      }
    } catch {}
  }, [property]);

  const toggleFavorite = () => {
    if (!property) return;
    try {
      const favs = localStorage.getItem(FAVORITES_KEY);
      const set = new Set<string>(favs ? JSON.parse(favs) : []);
      if (set.has(property.erpCode)) set.delete(property.erpCode);
      else set.add(property.erpCode);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(set)));
      setIsFavorite(set.has(property.erpCode));
    } catch {}
  };

  // Handle Site Visit booking → creates RX Lead in ERPNext
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorPhone.trim()) {
      setBookingError('Please enter your name and phone number.');
      return;
    }
    if (!property) return;

    setBookingLoading(true);
    setBookingError(null);

    try {
      const leadData = {
        lead_name: visitorName,
        phone: visitorPhone,
        email: visitorEmail || '',
        city: 'Karachi',
        lead_source: 'Website',
        source: 'Online',
        status: 'New',
        priority: 'High',
        notes: `Site Visit request for: ${property.title} (${property.erpCode}). Preferred date: ${preferredDate}, Time: ${timeSlot}`,
      };

      const leadResponse = await fetch(`${ERPNEXT_URL}/api/resource/RX Lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${API_KEY}:${API_SECRET}`,
        },
        body: JSON.stringify(leadData),
      });

      if (!leadResponse.ok) {
        const errData = await leadResponse.json().catch(() => ({}));
        throw new Error(errData?.exception || `Failed to submit (HTTP ${leadResponse.status})`);
      }

      setBookingSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setBookingError(err.message || 'Failed to submit. Please try WhatsApp instead.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    const msg = property
      ? `Hello Realtor X, I'm interested in: ${property.title} (${property.erpCode}) - ${property.priceFormatted}`
      : `Hello Realtor X, I need help with a property.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const isNew = property?.dateAdded &&
    Date.now() - new Date(property.dateAdded).getTime() < 7 * 24 * 60 * 60 * 1000;

  // ═══════════════════════════════════════════════════
  // LOADING
  // ═══════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-4 bg-slate-800/60 rounded w-40 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[420px] bg-slate-800/60 rounded-3xl animate-pulse" />
            <div className="h-10 bg-slate-800/60 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-slate-800/40 rounded w-1/2 animate-pulse" />
            <div className="h-32 bg-slate-800/40 rounded-2xl animate-pulse" />
          </div>
          <div className="lg:col-span-1">
            <div className="h-[520px] bg-slate-800/60 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // ERROR
  // ═══════════════════════════════════════════════════
  if (error || !property) {
    return (
      <div className="py-20 max-w-2xl mx-auto px-4 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Property Not Found</h2>
        <p className="text-slate-400 mb-8">
          {error || 'This property may have been sold or removed.'}
        </p>
        <button
          onClick={() => onNavigate('properties')}
          className="px-6 py-3 bg-[#2490EF] hover:bg-[#1b7ecf] text-white font-semibold rounded-xl transition-colors inline-flex items-center gap-2 shadow-lg shadow-[#2490EF]/25"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // MAIN VIEW
  // ═══════════════════════════════════════════════════
  const images = property.images || [];
  const activeImage = images[activeImageIndex] || images[0];
  const activeImageIsReal = hasRealImage(activeImage);

  // Avoid duplicate project/precinct if same
  const projectDisplay = property.project && property.project !== property.erpCode ? property.project : '';
  const precinctDisplay = property.precinct || '';
  const locationDisplay = property.location || '';

  const whatsappMsg = `Hello Realtor X, I'm interested in: ${property.title} (${property.erpCode}) - ${property.priceFormatted}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

      {/* ═════ BACK + ACTIONS ═════ */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('properties')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenSocialModal?.()}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFavorite}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
              isFavorite
                ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30'
                : 'text-slate-400 hover:text-red-400 bg-slate-800/80 hover:bg-slate-700'
            }`}
            title={isFavorite ? 'Saved' : 'Save'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* ═════ MAIN GRID ═════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: Images + Details */}
        <div className="lg:col-span-2 space-y-6 min-w-0">

          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative h-[420px] sm:h-[500px] w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-950">
              {activeImageIsReal ? (
                <img
                  src={activeImage}
                  alt={property.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/80 to-slate-900">
                  <ImageOff className="w-16 h-16 text-slate-600 mb-3" strokeWidth={1.5} />
                  <span className="text-sm text-slate-500 font-mono">No Image Available</span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

              {/* Top-left badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md border border-white/10 text-white">
                  {property.category}
                </span>
                {property.status && (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#28A745] text-white shadow-md">
                    {property.status}
                  </span>
                )}
                {isNew && (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#F5A623] text-slate-950 shadow-md">
                    <Sparkles className="w-3 h-3" />
                    New
                  </span>
                )}
              </div>

              {/* Property Code */}
              <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Property Code</div>
                <div className="font-mono text-sm font-bold text-white">{property.erpCode}</div>
              </div>

              {/* Photos count */}
              {images.length > 1 && activeImageIsReal && (
                <span className="absolute bottom-4 left-4 text-[11px] bg-slate-950/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg font-mono text-white">
                  {activeImageIndex + 1} / {images.length} photos
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => {
                  const isReal = hasRealImage(img);
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImageIndex === idx
                          ? 'border-[#2490EF] ring-2 ring-[#2490EF]/30'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {isReal ? (
                        <img
                          src={img}
                          alt={`${property.title} ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900">
                          <ImageOff className="w-5 h-5 text-slate-600" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Title + Location */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading leading-tight mb-3">
              {property.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              {(precinctDisplay || projectDisplay) && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F5A623]" />
                  <span>{precinctDisplay || projectDisplay}</span>
                </div>
              )}
              {locationDisplay && locationDisplay !== precinctDisplay && (
                <>
                  <span className="text-slate-600">·</span>
                  <div className="flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#2490EF]" />
                    <span>{locationDisplay}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Price Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-[#0B1A30] border border-[#2490EF]/30 flex flex-wrap items-center justify-between gap-4 shadow-lg">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-1">
                Asking Price
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-[#F5A623] font-mono leading-none">
                {property.priceFormatted}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-slate-400 mb-1">
                Size
              </div>
              <div className="text-2xl font-bold text-white font-heading">
                {property.size} {property.sizeUnit}
              </div>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-1.5">
                <Tag className="w-3 h-3" />
                Category
              </div>
              <div className="text-sm font-semibold text-white truncate">{property.category}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-1.5">
                <FileText className="w-3 h-3" />
                Ownership
              </div>
              <div className="text-sm font-semibold text-white truncate">
                {property.ownership || '—'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-1.5">
                <CheckCircle2 className="w-3 h-3" />
                Status
              </div>
              <div className="text-sm font-semibold text-[#28A745] truncate">
                {property.status || '—'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-1.5">
                <Ruler className="w-3 h-3" />
                Precinct
              </div>
              <div className="text-sm font-semibold text-white truncate">
                {property.precinct || '—'}
              </div>
            </div>

            {property.bedrooms ? (
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-1.5">
                  <Bed className="w-3 h-3" />
                  Bedrooms
                </div>
                <div className="text-sm font-semibold text-white">{property.bedrooms}</div>
              </div>
            ) : null}

            {property.bathrooms ? (
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-1.5">
                  <Bath className="w-3 h-3" />
                  Bathrooms
                </div>
                <div className="text-sm font-semibold text-white">{property.bathrooms}</div>
              </div>
            ) : null}

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-1.5">
                <Wallet className="w-3 h-3" />
                Listing Type
              </div>
              <div className="text-sm font-semibold text-white truncate">
                {property.listing_type || '—'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-1.5">
                <Calendar className="w-3 h-3" />
                Listed On
              </div>
              <div className="text-sm font-semibold text-white truncate">
                {property.dateAdded || '—'}
              </div>
            </div>
          </div>

          {/* Description */}
          {property.description && property.description.trim() ? (
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800">
              <h2 className="text-lg font-bold text-white mb-3 font-heading flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-[#2490EF]" />
                Description
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          ) : null}

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800">
              <h2 className="text-lg font-bold text-white mb-4 font-heading flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-[#F5A623]" />
                Key Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.features.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#28A745] shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust Badge */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#28A745]/10 to-transparent border border-[#28A745]/30 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#28A745]/15 border border-[#28A745]/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#28A745]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white mb-1">
                100% Verified with Bahria Town Records
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                This property's documents, plot map, and NDC status have been verified by Realtor X
                before listing. Zero hidden disputes guaranteed.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Booking + Contact (sticky) */}
        <div className="lg:col-span-1 min-w-0">
          <div className="space-y-4 lg:sticky lg:top-24">

            {/* BOOKING FORM */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/70 border border-[#2490EF]/30 shadow-2xl">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#2490EF]" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading">Book Site Visit</h3>
              </div>

              {bookingSubmitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[#28A745]/15 border-2 border-[#28A745]/40 flex items-center justify-center">
                    <Check className="w-8 h-8 text-[#28A745]" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Request Sent!</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Our dealer will contact you within 24 hours to confirm your site visit.
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#25D366] hover:bg-[#1ebe5b] rounded-xl transition-colors inline-flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/30"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    Continue on WhatsApp
                  </a>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF] focus:ring-2 focus:ring-[#2490EF]/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={visitorPhone}
                      onChange={(e) => setVisitorPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF] focus:ring-2 focus:ring-[#2490EF]/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF] focus:ring-2 focus:ring-[#2490EF]/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                        Date
                      </label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#2490EF] focus:ring-2 focus:ring-[#2490EF]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                        Time
                      </label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#2490EF] focus:ring-2 focus:ring-[#2490EF]/20 transition-all"
                      >
                        <option>11:00 AM – 1:00 PM</option>
                        <option>2:00 PM – 4:00 PM</option>
                        <option>4:00 PM – 6:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {bookingError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                      {bookingError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-[#2490EF] to-[#1b7ecf] hover:brightness-110 rounded-xl transition-all shadow-lg shadow-[#2490EF]/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Request Site Visit
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* WHATSAPP DIRECT */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 text-sm font-bold text-white bg-[#25D366] hover:bg-[#1ebe5b] rounded-2xl transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/30"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Chat on WhatsApp
            </a>

            {/* QUICK CONTACT */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.1em] mb-2">
                Need Help?
              </div>
              <a
                href="tel:+923008472910"
                className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[#2490EF]" />
                </div>
                <span>+92 300 8472910</span>
              </a>
              <a
                href="mailto:info@realtorx.pk"
                className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-[#F5A623]" />
                </div>
                <span>info@realtorx.pk</span>
              </a>
              <div className="flex items-center gap-2.5 text-sm text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-[#28A745]" />
                </div>
                <span>Mon – Sat: 10 AM – 8 PM</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ═════ SIMILAR PROPERTIES ═════ */}
      {similarProperties.length > 0 && (
        <div className="pt-10 border-t border-slate-800">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.15em] text-[#2490EF] mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2490EF]" />
                <span>You may also like</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                Similar Properties
              </h2>
            </div>
            <button
              onClick={() => onNavigate('properties')}
              className="text-xs sm:text-sm font-semibold text-[#2490EF] hover:text-[#1b7ecf] flex items-center gap-1.5"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {similarProperties.map((sp) => {
              const isReal = hasRealImage(sp.images[0]);
              const spIsNew =
                sp.dateAdded &&
                Date.now() - new Date(sp.dateAdded).getTime() < 7 * 24 * 60 * 60 * 1000;

              return (
                <button
                  key={sp.id}
                  onClick={() => onNavigate('property-detail', sp.erpCode)}
                  className="group text-left bg-slate-900/70 border border-slate-800 hover:border-[#2490EF]/60 rounded-3xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-[#2490EF]/10 hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-950">
                    {isReal ? (
                      <img
                        src={sp.images[0]}
                        alt={sp.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/80 to-slate-900">
                        <ImageOff className="w-9 h-9 text-slate-600 mb-2" strokeWidth={1.5} />
                        <span className="text-[11px] text-slate-500 font-mono">No Image</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent pointer-events-none" />

                    {/* Top-left: category */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md border border-white/10 text-white">
                        {sp.category}
                      </span>
                    </div>

                    {/* Bottom overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          {sp.status && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#28A745] text-white shadow-md">
                              {sp.status}
                            </span>
                          )}
                          {spIsNew && (
                            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F5A623] text-slate-950 shadow-md">
                              <Sparkles className="w-2.5 h-2.5" />
                              New
                            </span>
                          )}
                        </div>
                        <div className="text-lg font-bold text-[#F5A623] font-mono leading-none drop-shadow-lg">
                          {sp.priceFormatted}
                        </div>
                      </div>
                      <span className="text-[11px] bg-slate-950/80 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg font-mono text-white shrink-0">
                        {sp.size} {sp.sizeUnit}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="font-heading font-bold text-base text-white group-hover:text-[#2490EF] transition-colors leading-snug line-clamp-2 min-h-[2.6rem]">
                        {sp.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
                        <span className="truncate">
                          {sp.precinct || sp.project || 'Bahria Town Karachi'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="text-[10px] text-slate-500 font-mono truncate min-w-0">
                        {sp.erpCode}
                      </div>
                      <span className="text-xs font-semibold text-[#2490EF] group-hover:text-white flex items-center gap-1">
                        Details
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
