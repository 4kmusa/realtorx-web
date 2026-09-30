import React, { useState, useEffect } from 'react';
import { PageId, Language } from '../types';
import { fetchProperty, fetchProperties, Property } from '../services/propertyService';
import {
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ArrowLeft,
  Share2,
  Heart,
  Building,
  Check,
  Send,
  Loader2,
  AlertCircle,
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

          // Fetch similar properties (same category)
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
      // Create RX Lead in ERPNext with all details
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

      const leadResult = await leadResponse.json();
      console.log('✅ RX Lead created in ERPNext:', leadResult.data?.name);

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
    window.open(`https://wa.me/923008472910?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ─────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-slate-800/60 rounded w-48" />
          <div className="h-96 bg-slate-800/60 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-10 bg-slate-800/60 rounded w-3/4" />
            <div className="h-6 bg-slate-800/40 rounded w-1/2" />
            <div className="h-24 bg-slate-800/40 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────
  if (error || !property) {
    return (
      <div className="py-20 max-w-2xl mx-auto px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Property Not Found</h2>
        <p className="text-slate-400 mb-6">{error || 'This property may have been sold or removed.'}</p>
        <button
          onClick={() => onNavigate('properties')}
          className="px-6 py-3 bg-[#2490EF] hover:bg-[#1b7ecf] text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // MAIN VIEW
  // ─────────────────────────────────────────────
  const images = property.images.length > 0
    ? property.images
    : ['/src/assets/images/bahria_town_karachi_1790600916751.jpg'];
  const activeImage = images[activeImageIndex] || images[0];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Back Button + Actions */}
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
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-slate-400 hover:text-red-400 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors"
            title="Save"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Images + Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative h-[420px] sm:h-[500px] w-full rounded-2xl overflow-hidden border border-slate-800">
              <img
                src={activeImage}
                alt={property.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#2490EF] text-white">
                  {property.category}
                </span>
                {property.status === 'Hot Deal' && (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FFA500] text-slate-950">
                    Hot Deal
                  </span>
                )}
              </div>
              <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400">Property Code</div>
                <div className="font-mono text-sm font-bold text-white">{property.erpCode}</div>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-24 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#2490EF]'
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${property.title} ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + Location */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading leading-tight mb-3">
              {property.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#F5A623]" />
                <span>{property.location}</span>
              </div>
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#2490EF]" />
                <span>{property.project}</span>
              </div>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0B1A30] border border-[#2490EF]/30 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                Asking Price
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-[#F5A623] font-heading">
                {property.priceFormatted}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                Size
              </div>
              <div className="text-2xl font-bold text-white font-heading">
                {property.size} {property.sizeUnit}
              </div>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Category</div>
              <div className="text-sm font-semibold text-white">{property.category}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Ownership</div>
              <div className="text-sm font-semibold text-white">{property.ownership}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Status</div>
              <div className="text-sm font-semibold text-[#28A745]">{property.status}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Precinct</div>
              <div className="text-sm font-semibold text-white">{property.precinct}</div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3 font-heading">Description</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{property.description}</p>
          </div>

          {/* Features */}
          {property.features.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-4 font-heading">Key Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.features.map((f, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#28A745] shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust Badge */}
          <div className="p-5 rounded-2xl bg-[#28A745]/5 border border-[#28A745]/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#28A745] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-white mb-1">
                100% Verified with Bahria Town Records
              </div>
              <p className="text-xs text-slate-400">
                This property's documents, plot map, and NDC status have been verified by Realtor X
                before listing. Zero hidden disputes guaranteed.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Booking Form + Dealer Info */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* BOOKING FORM */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-[#2490EF]/30 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#2490EF]" />
              <h3 className="text-lg font-bold text-white font-heading">Book Site Visit</h3>
            </div>

            {bookingSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#28A745]/15 border-2 border-[#28A745]/40 flex items-center justify-center">
                  <Check className="w-8 h-8 text-[#28A745]" />
                </div>
                <h4 className="text-lg font-bold text-white">Request Sent!</h4>
                <p className="text-sm text-slate-400">
                  Our dealer will contact you within 24 hours to confirm your site visit.
                </p>
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#28A745] hover:bg-[#218838] rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Continue on WhatsApp
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                      Date
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                      Time
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#2490EF]"
                    >
                      <option>11:00 AM – 1:00 PM</option>
                      <option>2:00 PM – 4:00 PM</option>
                      <option>4:00 PM – 6:00 PM</option>
                    </select>
                  </div>
                </div>

                {bookingError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                    {bookingError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-[#2490EF] to-[#1b7ecf] hover:brightness-110 rounded-lg transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          {/* WhatsApp Direct */}
          <button
            onClick={handleWhatsAppClick}
            className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#25D366] hover:bg-[#20bd5a] rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <MessageSquare className="w-5 h-5" />
            Chat on WhatsApp
          </button>

          {/* Dealer Info */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              Verified Dealer
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-[#2490EF]/20 border border-[#2490EF]/40 flex items-center justify-center text-[#2490EF] font-bold text-lg">
                {property.dealer.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {property.dealer.name}
                </div>
                <div className="text-xs text-slate-400 truncate">{property.dealer.firm}</div>
              </div>
            </div>
            {property.dealer.isVerified && (
              <div className="flex items-center gap-1.5 text-xs text-[#28A745] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Realtor X Verified Member
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
              Commission:{' '}
              <span className="text-[#F5A623] font-semibold">{property.commissionSplit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <div className="pt-8 border-t border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-6 font-heading">
            Similar Properties
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {similarProperties.map((sp) => (
              <button
                key={sp.id}
                onClick={() => onNavigate('property-detail', sp.erpCode)}
                className="group text-left bg-slate-900/70 border border-slate-800 hover:border-[#2490EF]/60 rounded-2xl overflow-hidden transition-all"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={sp.images[0]}
                    alt={sp.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-semibold bg-[#2490EF] text-white">
                    {sp.category}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-[#2490EF] transition-colors line-clamp-2">
                    {sp.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3 h-3 text-[#F5A623]" />
                    <span className="truncate">{sp.precinct}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-base font-bold text-[#F5A623] font-mono">
                      {sp.priceFormatted}
                    </span>
                    <span className="text-xs text-slate-400">
                      {sp.size} {sp.sizeUnit}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
