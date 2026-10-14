// src/pages/HomePage.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PageId, Language } from '../types';
import { BRAND_TAGLINES, HOW_IT_WORKS_STEPS, TESTIMONIALS } from '../data/mockProperties';
import { fetchProperties, fetchDealers, Property, Dealer } from '../services/propertyService';
import {
  Search,
  MapPin,
  Building,
  Bed,
  Bath,
  ArrowRight,
  ShieldCheck,
  Users,
  Percent,
  Award,
  CheckCircle2,
  ChevronRight,
  Heart,
  Star,
  BadgeCheck,
  Compass,
  Zap,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { AnimatedNumber } from '../components/AnimatedNumber';

interface HomePageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

// ═══════════════════════════════════════════════════════
// Scroll Reveal Hook
// ═══════════════════════════════════════════════════════
function useScrollReveal(deps: React.DependencyList = []) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );

    const checkAndObserve = () => {
      document.querySelectorAll('.scroll-reveal:not(.is-visible)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) el.classList.add('is-visible');
        else observer.observe(el);
      });
    };

    checkAndObserve();

    const mutationObserver = new MutationObserver(() => checkAndObserve());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ═══════════════════════════════════════════════════════
// Animated counter
// ═══════════════════════════════════════════════════════

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, language }) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [budgetRange, setBudgetRange] = useState<string>('All');

  const [properties, setProperties] = useState<Property[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const featuredRef = useRef<HTMLElement>(null);

  useScrollReveal([properties.length, dealers.length, loading]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [props, dealerList] = await Promise.all([fetchProperties(), fetchDealers()]);
        setProperties(props);
        setDealers(dealerList);
        if (props.length === 0) {
          setError('No properties available yet. Please check back soon.');
        }
      } catch (err) {
        setError('Unable to load properties. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (selectedType !== 'All') {
        const catMap: Record<string, string> = {
          'Residential Plot': 'Residential Plot',
          'Commercial Plot': 'Commercial Plot',
          House: 'House',
          Flat: 'Apartment',
          Shop: 'Commercial Shop',
        };
        const target = catMap[selectedType];
        if (target && p.category !== target) return false;
      }
      if (selectedProject !== 'All') {
        const haystack = `${p.precinct || ''} ${p.title || ''} ${p.project || ''}`.toUpperCase();
        if (!haystack.includes(selectedProject.toUpperCase())) return false;
      }
      if (budgetRange !== 'All') {
        const price = p.pricePkr || 0;
        if (budgetRange === 'under-50-lakh' && price >= 5000000) return false;
        if (budgetRange === '50-to-1-crore' && (price < 5000000 || price >= 10000000)) return false;
        if (budgetRange === '1-to-3-crore' && (price < 10000000 || price >= 30000000)) return false;
        if (budgetRange === 'above-3-crore' && price < 30000000) return false;
      }
      return true;
    });
  }, [properties, selectedType, selectedProject, budgetRange]);

  const hasActiveFilters =
    selectedType !== 'All' || selectedProject !== 'All' || budgetRange !== 'All';

  const resetFilters = () => {
    setSelectedType('All');
    setSelectedProject('All');
    setBudgetRange('All');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    featuredRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };


  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20">

      {/* ═══════════════════════════════════════════════════
          1. HERO
         ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[600px] lg:min-h-[680px] flex items-center">
        {/* ── Background image ── */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/bahria_town_karachi_1790600916751.webp"
            alt="Bahria Town Karachi"
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Dark overlay for text readability */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(11, 26, 48, 0.85) 0%, rgba(11, 26, 48, 0.75) 40%, rgba(11, 26, 48, 0.92) 100%)',
            }}
          />
          {/* Subtle orange glow at top */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(245, 166, 35, 0.12) 0%, transparent 60%)',
            }}
          />
        </div>

        {/* ── Content ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-16 lg:py-20">

          {/* Headline */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-bold tracking-[-0.03em] text-white leading-[1.05] font-heading drop-shadow-2xl">
              Real Estate.{' '}
              <span className="text-[#F5A623]">Reimagined.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-200 max-w-xl mx-auto leading-relaxed">
              Connect with verified dealers, explore real properties, and invest with complete trust in Bahria Town Karachi.
            </p>

            <div className="mt-4 font-urdu text-lg text-[#F5A623]">
              {BRAND_TAGLINES.urduTagline}
            </div>
          </div>

          {/* Search pill */}
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row items-stretch gap-1.5 p-1.5 rounded-2xl bg-[#0B1A30]/95 backdrop-blur-xl border border-white/[0.12] shadow-2xl shadow-black/50"
            >
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="flex-1 min-w-0 px-4 py-3 bg-transparent text-sm text-white focus:outline-none cursor-pointer rounded-xl hover:bg-white/[0.05] transition-colors w-full"
              >
                <option value="All" className="bg-[#0B1A30]">All Categories</option>
                <option value="Residential Plot" className="bg-[#0B1A30]">Residential Plots</option>
                <option value="Commercial Plot" className="bg-[#0B1A30]">Commercial Plots</option>
                <option value="House" className="bg-[#0B1A30]">Houses</option>
                <option value="Flat" className="bg-[#0B1A30]">Apartments</option>
                <option value="Shop" className="bg-[#0B1A30]">Commercial Shops</option>
              </select>

              <div className="hidden sm:block w-px my-2.5 bg-white/[0.12]" />

              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="flex-1 min-w-0 px-4 py-3 bg-transparent text-sm text-white focus:outline-none cursor-pointer rounded-xl hover:bg-white/[0.05] transition-colors w-full"
              >
                <option value="All" className="bg-[#0B1A30]">All Projects</option>
                <option value="BTK-1" className="bg-[#0B1A30]">Bahria Town Karachi</option>
                <option value="BTK-2" className="bg-[#0B1A30]">Bahria Town Karachi 2</option>
                <option value="Bahria Heights" className="bg-[#0B1A30]">Bahria Heights</option>
                <option value="Jinnah Avenue" className="bg-[#0B1A30]">Jinnah Avenue</option>
              </select>

              <div className="hidden sm:block w-px my-2.5 bg-white/[0.12]" />

              <select
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="flex-1 min-w-0 px-4 py-3 bg-transparent text-sm text-white focus:outline-none cursor-pointer rounded-xl hover:bg-white/[0.05] transition-colors w-full"
              >
                <option value="All" className="bg-[#0B1A30]">Any Price</option>
                <option value="under-50-lakh" className="bg-[#0B1A30]">Under 50 Lakh</option>
                <option value="50-to-1-crore" className="bg-[#0B1A30]">50 Lakh – 1 Crore</option>
                <option value="1-to-3-crore" className="bg-[#0B1A30]">1 – 3 Crore</option>
                <option value="above-3-crore" className="bg-[#0B1A30]">3 Crore +</option>
              </select>

              <button
                type="submit"
                className="shrink-0 px-5 py-3 rounded-xl bg-[#F5A623] hover:bg-[#E59615] text-[#0B1A30] font-semibold text-sm transition-colors flex items-center justify-center gap-2 sm:w-auto w-full"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {/* Meta row */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>100% Verified plots & NDC status</span>
              </span>
              <span className="w-px h-3 bg-slate-500" />
              <button
                onClick={() => onNavigate('become-dealer')}
                type="button"
                className="text-[#F5A623] hover:text-[#E59615] font-medium inline-flex items-center gap-1 group transition-colors"
              >
                <span>Earn 80% commission</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('properties')}
              className="px-6 py-3 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/[0.16] border border-white/[0.15] hover:border-white/[0.25] backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Properties</span>
            </button>

            <button
              onClick={() => onNavigate('become-dealer')}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-[#0B1A30] bg-[#F5A623] hover:bg-[#E59615] transition-colors shadow-lg shadow-[#F5A623]/30 flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>Become a Dealer</span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          2. PHILOSOPHY BANNER
         ═══════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal">
        <div className="relative rounded-[2rem] overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/30">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1A30] via-[#0B1A30] to-[#0B1A30]" />
          <div
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background:
                'radial-gradient(ellipse at 30% 20%, rgba(36, 144, 239, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(245, 166, 35, 0.10) 0%, transparent 50%)',
            }}
          />
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5A623]/50 to-transparent" />

          <div className="relative p-8 sm:p-12 lg:p-14 text-center">
            <div className="inline-flex items-center gap-3 mb-5">
                <span className="w-6 h-[1px] bg-current" style={{ color: '#F5A623' }} />
                <span className="text-xs font-semibold tracking-wide text-[#F5A623]">The Heart of Realtor X</span>
              </div>

            <blockquote className="text-xl sm:text-2xl lg:text-3xl font-heading italic text-white max-w-4xl mx-auto leading-[1.25] tracking-[-0.01em] text-balance">
              "{BRAND_TAGLINES.philosophy}"
            </blockquote>

            <div className="mt-6 font-urdu text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-loose">
              {BRAND_TAGLINES.philosophyUrdu}
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-slate-500">
              <span className="text-[#94A3B8] font-semibold">CONNECT.</span>
              <span className="text-slate-600">·</span>
              <span className="text-[#94A3B8] font-semibold">COLLABORATE.</span>
              <span className="text-slate-600">·</span>
              <span className="text-[#F5A623] font-semibold">GROW.</span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <button
                onClick={() => onNavigate('manifesto')}
                className="text-[#F5A623] hover:text-[#F5A623] flex items-center gap-1.5 font-semibold group"
              >
                <span>Read The Manifesto</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          3. FEATURED PROPERTIES
         ═══════════════════════════════════════════════════ */}
      <section ref={featuredRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#94A3B8] mb-3">
              <span className="w-6 h-[1px] bg-[#94A3B8]/60" />
              <span>Prime Inventory</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading tracking-[-0.02em] leading-tight">
              {hasActiveFilters ? 'Matching Properties' : 'Featured Properties'}
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
              {hasActiveFilters
                ? `${filteredProperties.length} properties match your filters`
                : 'Hand-picked verified villas, commercial shops, plots, and apartments ready for immediate transfer.'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('properties')}
            className="text-xs sm:text-sm font-semibold text-[#94A3B8] hover:text-white flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-xl border border-[#94A3B8]/30 hover:border-[#F5A623] hover:bg-[#E59615]/10 transition-all group whitespace-nowrap"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden animate-pulse"
              >
                <div className="h-56 w-full bg-slate-800/50" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-slate-800/60 rounded w-3/4" />
                  <div className="h-4 bg-slate-800/40 rounded w-1/2" />
                  <div className="h-4 bg-slate-800/40 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : properties.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-slate-900/40 border border-slate-800 rounded-3xl">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                <Building className="w-9 h-9 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Properties Coming Soon</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-7">
                {error || 'Our verified Bahria Town properties will be listed here soon.'}
              </p>
              <button
                onClick={() => onNavigate('contact')}
                className="px-6 py-3 text-sm font-semibold text-[#0B1A30] bg-[#F5A623] hover:bg-[#E59615] rounded-xl transition-all shadow-lg shadow-[#F5A623]/25"
              >
                Contact Us for Details
              </button>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-slate-900/40 border border-slate-800 rounded-3xl">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                <Search className="w-9 h-9 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Properties Match</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-7">
                Try changing the filter selections or reset to see all properties.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 text-sm font-semibold text-[#0B1A30] bg-[#F5A623] hover:bg-[#E59615] rounded-xl transition-all shadow-lg shadow-[#F5A623]/25"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredProperties.slice(0, 6).map((property, idx) => (
              <div
                key={property.id}
                className="group bg-gradient-to-b from-slate-900/70 to-slate-900/50 border border-white/[0.06] hover:border-[#F5A623]/50 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-[#94A3B8]/10 hover:-translate-y-1.5 flex flex-col justify-between scroll-reveal"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div>
                  <div className="relative h-32 sm:h-48 lg:h-60 w-full overflow-hidden">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-[900ms] ease-out-expo brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-wrap gap-1 sm:gap-2">
                      <span className="px-1.5 py-0.5 sm:px-3 sm:py-1 rounded sm:rounded-lg text-[8px] sm:text-[10px] font-bold uppercase tracking-wide bg-[#F5A623] text-[#0B1A30] shadow-lg shadow-[#F5A623]/30">
                        {property.category}
                      </span>
                      {property.status === 'Hot Deal' && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#F5A623] text-slate-950 shadow-lg">
                          <Zap className="w-2.5 h-2.5" />
                          Hot Deal
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 flex items-end justify-between text-white gap-1.5 sm:gap-2">
                      <span className="text-sm sm:text-lg lg:text-xl font-bold text-[#F5A623] truncate">
                        {property.priceFormatted}
                      </span>
                      <span className="hidden sm:inline-block text-[9px] sm:text-[11px] bg-slate-950/85 backdrop-blur-md border border-white/10 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg font-medium shrink-0">
                        {property.size} {property.sizeUnit}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-5 space-y-1.5 sm:space-y-3">
                    <h3 className="font-heading font-bold text-sm sm:text-base lg:text-lg text-white group-hover:text-[#F5A623] transition-colors leading-tight sm:leading-snug line-clamp-2 sm:min-h-[3rem]">
                      {property.title}
                    </h3>

                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#F5A623] shrink-0" />
                      <span className="truncate">
                        {property.precinct || 'Bahria Town Karachi'}
                      </span>
                    </div>

                    {property.bedrooms || property.bathrooms ? (
                      <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                        {property.bedrooms ? (
                          <span className="flex items-center gap-1.5">
                            <Bed className="w-3.5 h-3.5 text-slate-500" />
                            {property.bedrooms} Beds
                          </span>
                        ) : null}
                        {property.bathrooms ? (
                          <span className="flex items-center gap-1.5">
                            <Bath className="w-3.5 h-3.5 text-slate-500" />
                            {property.bathrooms} Baths
                          </span>
                        ) : null}
                      </div>
                    ) : property.ownership ? (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="text-[11px] font-medium">{property.ownership}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="p-3 sm:p-5 pt-0 sm:pt-0">
                  <div className="border-t border-white/[0.06] pt-2 sm:pt-4 flex items-center justify-between gap-1.5 sm:gap-3">
                    <div className="text-[11px] text-slate-500 truncate min-w-0">
                      {property.listing_type ? (
                        <span className="text-[#F5A623] font-semibold">
                          {property.listing_type}
                        </span>
                      ) : (
                        <span>{property.erpCode}</span>
                      )}
                    </div>

                    <button
                      onClick={() => onNavigate('property-detail', property.erpCode)}
                      className="px-4 py-2 text-xs font-bold text-white bg-white/[0.06] hover:bg-[#E59615] border border-white/[0.08] hover:border-[#F5A623] rounded-xl transition-all flex items-center gap-1.5 shrink-0 group/btn"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          4. WHY REALTOR X
         ═══════════════════════════════════════════════════ */}
      <section className="relative bg-[#0B1A30] py-16 sm:py-20 border-y border-white/[0.06] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(36, 144, 239, 0.08) 0%, transparent 60%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#94A3B8] mb-4">
              <span className="w-6 h-[1px] bg-[#94A3B8]/60" />
              <span>The Realtor X Difference</span>
              <span className="w-6 h-[1px] bg-[#94A3B8]/60" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading tracking-[-0.02em] leading-tight">
              Why Homeowners &amp; Dealers Choose Us
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed max-w-2xl mx-auto">
              Transforming the real estate transaction into a transparent, collaborative, and
              dignified experience.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Verified Listings',
                desc: 'Zero fake ads or disputed files. Every plot, villa, and shop is audited with Bahria Town transfer office records.',
              },
              {
                icon: Users,
                title: 'Trusted Dealers',
                desc: 'Our dealers take the Realtor X Founding Oath, committing to absolute honesty and client-first service.',
              },
              {
                icon: Percent,
                title: 'Fair 80/20 Split',
                desc: 'We empower realtors with 80% commission split to the closing agent, creating a supportive fraternity.',
              },
              {
                icon: Award,
                title: 'Community First',
                desc: 'Dedicated allottee advocacy desk. We resolve construction delays and transfer bottlenecks together.',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="group p-7 rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 shadow-lg hover:shadow-2xl scroll-reveal"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#94A3B8]/[0.12] border border-[#94A3B8]/25 flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="w-6 h-6 text-[#94A3B8]" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          5. STATS BAR
         ═══════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal">
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/30">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1A30] via-slate-900 to-[#0B1A30]" />
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background:
                'radial-gradient(ellipse at 20% 50%, rgba(36, 144, 239, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(245, 166, 35, 0.12) 0%, transparent 50%)',
            }}
          />

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 p-10 sm:p-12 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#F5A623] font-heading tabular-nums">
                {properties.length > 0 ? <><AnimatedNumber value={properties.length} />+</> : '0'}
              </div>
              <div className="text-[11px] uppercase tracking-[0.15em] text-slate-400 mt-3">
                Verified Listings
              </div>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#F5A623] font-heading tabular-nums">
                {dealers.length > 0 ? <><AnimatedNumber value={dealers.length} />+</> : '—'}
              </div>
              <div className="text-[11px] uppercase tracking-[0.15em] text-slate-400 mt-3">
                Registered Dealers
              </div>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#22C55E] font-heading tabular-nums">
                80/20
              </div>
              <div className="text-[11px] uppercase tracking-[0.15em] text-slate-400 mt-3">
                Commission Split
              </div>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-white font-heading tabular-nums">
                100%
              </div>
              <div className="text-[11px] uppercase tracking-[0.15em] text-slate-400 mt-3">
                Verified Documents
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          6. HOW IT WORKS
         ═══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 scroll-reveal">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#94A3B8] mb-4">
            <span className="w-6 h-[1px] bg-[#94A3B8]/60" />
            <span>Simple, Transparent, Secured</span>
            <span className="w-6 h-[1px] bg-[#94A3B8]/60" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading tracking-[-0.02em] leading-tight">
            How Realtor X Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            A frictionless journey from finding your dream property to receiving the transfer deed.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="group relative p-7 rounded-3xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 border border-white/[0.06] hover:border-[#F5A623]/40 transition-all duration-500 hover:-translate-y-1 scroll-reveal"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#94A3B8] to-[#94A3B8] flex items-center justify-center text-white font-black font-heading text-xl mb-5 shadow-lg shadow-[#F5A623]/25 group-hover:scale-110 transition-transform duration-500">
                {step.step}
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-1.5">
                {step.title}
              </h3>
              <div className="font-urdu text-sm text-[#F5A623] mb-3 leading-relaxed">
                {step.titleUrdu}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          7. BAHRIA TOWN SPOTLIGHT
         ═══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal">
        <div className="relative rounded-[2rem] overflow-hidden border border-white/[0.08] bg-[#0B1A30] shadow-2xl shadow-black/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7 p-10 sm:p-12 lg:p-14 space-y-6">
              <div className="inline-flex items-center gap-3 mb-5">
                <span className="w-6 h-[1px] bg-current" style={{ color: '#F5A623' }} />
                <span className="text-xs font-semibold tracking-wide text-[#F5A623]">The Flagship Master Development</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading tracking-[-0.02em] leading-tight">
                Bahria Town Karachi: <span className="text-[#94A3B8]">A City Within A City</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Featuring the world's 3rd largest mosque, international-standard hospitals, golf
                courses, theme parks, and 100% underground electrified utilities. Realtor X is
                permanently rooted inside Bahria Town.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                {['Grand Jamia Mosque', 'Danzoo Safari & Carnival', 'Saudi German Hospital', '400-ft Jinnah Avenue'].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/40 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                      </div>
                      <span>{item}</span>
                    </div>
                  )
                )}
              </div>

              <div className="pt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('projects')}
                  className="relative px-6 py-3 rounded-xl text-sm font-semibold text-[#0B1A30] bg-[#F5A623] hover:bg-[#E59615] transition-all shadow-lg shadow-[#F5A623]/25 flex items-center gap-2 group overflow-hidden active:scale-[0.98]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative z-10">Explore Bahria Precincts</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => onNavigate('contact')}
                  className="px-6 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] transition-all"
                >
                  Contact Our Office
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 h-72 sm:h-96 lg:h-full min-h-[400px] relative overflow-hidden">
              <img
                src="/images/bahria_town_karachi_1790600916751.webp"
                alt="Bahria Town Karachi Grand View"
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-[1200ms] ease-out-expo"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0B1A30] via-[#0B1A30]/30 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          8. CULTURE PREVIEW
         ═══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 scroll-reveal">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#F5A623] mb-4">
            <span className="w-6 h-[1px] bg-[#F5A623]/60" />
            <span>Our Guiding Pillars</span>
            <span className="w-6 h-[1px] bg-[#F5A623]/60" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading tracking-[-0.02em] leading-tight">
            The Culture of Realtor X
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            Why people don't just join Realtor X — they belong to Realtor X.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          {[
            {
              doc: 'Document 01 · Why We Exist',
              title: 'The RealtorX Manifesto',
              quote:
                '"Real estate is not just about land, buildings or transactions. It is about people. It is about dreams. It is about trust."',
              cta: 'Read Full Manifesto',
              route: 'manifesto' as PageId,
              icon: BookOpen,
            },
            {
              doc: 'Document 02 · What We Promise',
              title: 'The Founding Member Oath',
              quote:
                'The solemn commitments taken by every custodian dealer. Place ethics before profit and never mislead this community.',
              cta: 'Affirm & Sign Oath',
              route: 'oath' as PageId,
              icon: Award,
            },
            {
              doc: 'Document 03 · How We Behave',
              title: 'The RealtorX Code (8 Tenets)',
              quote:
                'Integrity First, Collaboration Before Competition, Solutions Over Excuses. Concrete rules for client transparency.',
              cta: 'Explore The 8 Principles',
              route: 'code' as PageId,
              icon: ShieldCheck,
            },
          ].map((card, idx) => {
            const CardIcon = card.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate(card.route)}
                className="group cursor-pointer p-7 rounded-3xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 border border-white/[0.06] hover:border-[#F5A623]/40 transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between scroll-reveal"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-[#94A3B8]/[0.12] border border-[#94A3B8]/25 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <CardIcon className="w-4 h-4 text-[#94A3B8]" />
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500 font-semibold">
                      {card.doc}
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-xl text-white group-hover:text-[#F5A623] transition-colors leading-tight mb-3">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {card.quote}
                  </p>
                </div>

                <div className="mt-7 flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8]">
                  <span>{card.cta}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          9. TESTIMONIALS
         ═══════════════════════════════════════════════════ */}
      <section className="relative bg-[#0B1A30] py-16 sm:py-20 border-y border-white/[0.06] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 50% 100%, rgba(245, 166, 35, 0.08) 0%, transparent 60%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#94A3B8] mb-4">
              <span className="w-6 h-[1px] bg-[#94A3B8]/60" />
              <span>Real Stories</span>
              <span className="w-6 h-[1px] bg-[#94A3B8]/60" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading tracking-[-0.02em] leading-tight">
              Voices From Our Community
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-white/[0.06] hover:border-white/[0.15] transition-all duration-500 flex flex-col justify-between scroll-reveal"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="space-y-5">
                  <div className="flex items-center gap-1 text-[#F5A623]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-white/[0.06]">
                  <div className="font-heading font-semibold text-white text-sm">
                    {t.author}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {t.role} · {t.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          10. REGISTERED DEALERS
         ═══════════════════════════════════════════════════ */}
      {dealers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#F5A623] mb-4">
              <span className="w-6 h-[1px] bg-[#F5A623]/60" />
              <span>Meet The Fraternity</span>
              <span className="w-6 h-[1px] bg-[#F5A623]/60" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading tracking-[-0.02em] leading-tight">
              Registered Dealers
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
              Verified Realtor X members committed to ethical, client-first real estate.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {dealers.map((dealer, idx) => {
              const showDesignation = dealer.designation && dealer.designation !== dealer.firm;
              const showFirm = dealer.firm && dealer.firm !== dealer.designation;

              return (
                <div
                  key={dealer.id}
                  className="group relative p-6 rounded-3xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 border border-white/[0.06] hover:border-[#F5A623]/50 transition-all duration-500 hover:-translate-y-1 flex flex-col items-center text-center overflow-hidden scroll-reveal"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(ellipse at 50% 0%, rgba(36, 144, 239, 0.12) 0%, transparent 60%)',
                    }}
                  />

                  <div className="relative w-20 h-20 rounded-full p-[2px] bg-gradient-to-br from-[#94A3B8]/50 via-[#F5A623]/40 to-[#94A3B8]/50 mb-4 group-hover:from-[#94A3B8] group-hover:to-[#94A3B8] transition-all duration-500">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#0B1A30] flex items-center justify-center">
                      {dealer.imageUrl ? (
                        <img
                          src={dealer.imageUrl}
                          alt={dealer.name}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-[#94A3B8] font-heading">
                          {dealer.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative flex items-center gap-1 mb-1.5 max-w-full">
                    <h3 className="font-heading font-bold text-sm text-white truncate">
                      {dealer.name}
                    </h3>
                    <BadgeCheck className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                  </div>

                  {showDesignation && (
                    <div className="relative text-[10px] text-[#F5A623] uppercase tracking-[0.12em] truncate w-full">
                      {dealer.designation}
                    </div>
                  )}

                  {showFirm && (
                    <div className="relative text-[11px] text-slate-400 truncate w-full mt-1">
                      {dealer.firm}
                    </div>
                  )}

                  {dealer.city && (
                    <div className="relative flex items-center gap-1 text-[10px] text-slate-500 mt-2">
                      <MapPin className="w-3 h-3" />
                      <span>{dealer.city}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          11. DUAL CTA
         ═══════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 scroll-reveal">
        <div className="relative rounded-[2rem] overflow-hidden border border-[#94A3B8]/20 shadow-2xl shadow-[#94A3B8]/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1A30] via-[#0B1A30] to-[#0B1A30]" />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                'radial-gradient(ellipse at 30% 50%, rgba(36, 144, 239, 0.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(245, 166, 35, 0.12) 0%, transparent 60%)',
            }}
          />
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#94A3B8]/60 to-transparent" />

          <div className="relative p-10 sm:p-14 text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F5A623] flex items-center justify-center shadow-xl shadow-[#F5A623]/30">
              <TrendingUp className="w-6 h-6 text-slate-950" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-bold text-white font-heading tracking-[-0.02em] leading-tight max-w-3xl mx-auto text-balance">
              Join the Realtor X Movement
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Whether you are buying a dream villa, securing an investment plot, or are a local
              dealer looking for a fair 80/20 partnership, we welcome you.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                onClick={() => onNavigate('become-dealer')}
                className="relative px-7 py-3.5 rounded-2xl text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] via-[#F5A623] to-[#F5A623] hover:bg-[#E59615] transition-all duration-300 shadow-xl shadow-[#F5A623]/30 hover:shadow-[#F5A623]/50 flex items-center gap-2 overflow-hidden group active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Award className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Become a Dealer</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('properties')}
                className="px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/[0.2] backdrop-blur-md transition-all duration-300 flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#94A3B8]" />
                <span>Browse Properties</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
