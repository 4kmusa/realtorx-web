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
  Sparkle,
  Compass,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

// ═══════════════════════════════════════════════════════
// Scroll reveal hook — fades in elements as they enter viewport
// ═══════════════════════════════════════════════════════
function useScrollReveal() {
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
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

// ═══════════════════════════════════════════════════════
// Animated counter hook
// ═══════════════════════════════════════════════════════
function useAnimatedCount(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (target <= 0) {
      setCount(0);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setCount(Math.floor(eased * target));
              if (p < 1) requestAnimationFrame(tick);
              else setCount(target);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, language }) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [budgetRange, setBudgetRange] = useState<string>('All');

  const [properties, setProperties] = useState<Property[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const featuredRef = useRef<HTMLElement>(null);

  useScrollReveal();

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

  const propertiesCounter = useAnimatedCount(properties.length);
  const dealersCounter = useAnimatedCount(dealers.length);

  return (
    <div className="space-y-14 sm:space-y-20 lg:space-y-24">
      {/* ═══════════════════════════════════════════════════
          1. HERO
         ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-36 bg-[#0A1628]">
        {/* Ambient gradient background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-70 animate-fade-in"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(36, 144, 239, 0.20) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(245, 166, 35, 0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 30%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-14">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[#2490EF] bg-[#2490EF]/[0.08] border border-[#2490EF]/25 px-4 py-1.5 rounded-full mb-8 animate-fade-in-down backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5A623]" />
              </span>
              <span>Bahria Town Karachi's Premier Community Marketplace</span>
            </div>

            {/* Main heading */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.25rem] font-bold tracking-[-0.03em] text-white leading-[1.02] font-heading animate-fade-in-up text-balance"
              style={{ animationDelay: '100ms' }}
            >
              Real Estate.{' '}
              <span className="relative inline-block">
                <span className="gradient-text">Reimagined.</span>
              </span>
            </h1>

            {/* Subtext */}
            <p
              className="mt-7 text-base sm:text-lg lg:text-xl text-slate-300/90 max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
              style={{ animationDelay: '200ms' }}
            >
              Connect with verified dealers, explore real residential and commercial properties,
              and invest with complete trust in Bahria Town Karachi.
            </p>

            {/* Urdu tagline */}
            <div
              className="mt-5 font-urdu text-xl sm:text-2xl text-[#F5A623]/90 animate-fade-in-up"
              style={{ animationDelay: '300ms' }}
            >
              {BRAND_TAGLINES.urduTagline}
            </div>
          </div>

          {/* Search Filter Box */}
          <div
            className="max-w-5xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/95 to-slate-900/70 border border-white/[0.08] shadow-2xl shadow-black/40 backdrop-blur-2xl overflow-hidden">
              {/* Top gradient line */}
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#2490EF]/50 to-transparent" />

              <div className="p-5 sm:p-7">
                <form
                  onSubmit={handleSearchSubmit}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
                >
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase font-mono tracking-[0.14em]">
                      Property Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white focus:outline-none focus:border-[#2490EF]/70 focus:ring-4 focus:ring-[#2490EF]/10 transition-all cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      <option value="Residential Plot">Residential Plots</option>
                      <option value="Commercial Plot">Commercial Plots</option>
                      <option value="House">Houses</option>
                      <option value="Flat">Apartments</option>
                      <option value="Shop">Commercial Shops</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase font-mono tracking-[0.14em]">
                      Project / Precinct
                    </label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white focus:outline-none focus:border-[#2490EF]/70 focus:ring-4 focus:ring-[#2490EF]/10 transition-all cursor-pointer"
                    >
                      <option value="All">All Bahria Projects</option>
                      <option value="BTK-1">Bahria Town Karachi (BTK-1)</option>
                      <option value="BTK-2">Bahria Town Karachi 2 (BTK-2)</option>
                      <option value="Bahria Heights">Bahria Heights Towers</option>
                      <option value="Jinnah Avenue">Jinnah Avenue Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase font-mono tracking-[0.14em]">
                      Budget (PKR)
                    </label>
                    <select
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white focus:outline-none focus:border-[#2490EF]/70 focus:ring-4 focus:ring-[#2490EF]/10 transition-all cursor-pointer"
                    >
                      <option value="All">Any Price</option>
                      <option value="under-50-lakh">Under 50 Lakh</option>
                      <option value="50-to-1-crore">50 Lakh – 1 Crore</option>
                      <option value="1-to-3-crore">1 Crore – 3 Crore</option>
                      <option value="above-3-crore">3 Crore +</option>
                    </select>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="relative w-full py-3 px-5 text-sm font-bold text-white bg-gradient-to-r from-[#2490EF] to-[#1b7ecf] hover:brightness-110 rounded-xl shadow-lg shadow-[#2490EF]/25 hover:shadow-[#2490EF]/40 transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group active:scale-[0.98]"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <Search className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Search</span>
                    </button>
                  </div>
                </form>

                <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#28A745]" />
                    <span className="font-medium">
                      100% Verified Bahria Town plot maps & NDC status
                    </span>
                  </span>
                  <div className="flex items-center gap-4">
                    {hasActiveFilters && (
                      <button
                        onClick={resetFilters}
                        type="button"
                        className="text-slate-300 hover:text-white underline decoration-dotted underline-offset-4"
                      >
                        Reset Filters
                      </button>
                    )}
                    <button
                      onClick={() => onNavigate('become-dealer')}
                      className="text-[#F5A623] hover:text-[#FFB84D] font-semibold inline-flex items-center gap-1 group"
                    >
                      <span>Become a Dealer — 60% Split</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero CTAs */}
          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: '500ms' }}
          >
            <button
              onClick={() => onNavigate('properties')}
              className="relative px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/[0.2] backdrop-blur-md transition-all duration-300 flex items-center gap-2 group active:scale-[0.98]"
            >
              <Compass className="w-4 h-4 text-[#2490EF] group-hover:rotate-45 transition-transform duration-500" />
              <span>Explore Properties</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('become-dealer')}
              className="relative px-7 py-3.5 rounded-2xl text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] via-[#FFB84D] to-[#F5A623] hover:brightness-110 transition-all duration-300 shadow-xl shadow-[#F5A623]/30 hover:shadow-[#F5A623]/50 flex items-center gap-2 overflow-hidden group active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Award className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Become a Realtor X Dealer</span>
              <span className="relative z-10 text-[10px] bg-slate-950 text-[#F5A623] px-2 py-0.5 rounded-full font-mono font-bold">
                60%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          2. PHILOSOPHY BANNER
         ═══════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal">
        <div className="relative rounded-[2rem] overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/30">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#050C16] via-[#0B1A30] to-[#050C16]" />
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background:
                'radial-gradient(ellipse at 30% 20%, rgba(36, 144, 239, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(245, 166, 35, 0.10) 0%, transparent 50%)',
            }}
          />
          {/* Top line */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5A623]/50 to-transparent" />

          <div className="relative p-10 sm:p-16 lg:p-20 text-center">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#F5A623] bg-[#F5A623]/[0.08] border border-[#F5A623]/25 px-4 py-1.5 rounded-full mb-8">
              <Heart className="w-3.5 h-3.5" />
              <span>The Heart of Realtor X</span>
            </div>

            <blockquote className="text-2xl sm:text-3xl lg:text-[2.5rem] font-display italic text-white max-w-4xl mx-auto leading-[1.25] tracking-[-0.01em] text-balance">
              "{BRAND_TAGLINES.philosophy}"
            </blockquote>

            <div className="mt-8 font-urdu text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-loose">
              {BRAND_TAGLINES.philosophyUrdu}
            </div>

            <div className="mt-10 pt-8 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-slate-400 font-mono tracking-wider">
              <span className="text-[#2490EF] font-semibold">CONNECT.</span>
              <span className="text-slate-600">·</span>
              <span className="text-[#2490EF] font-semibold">COLLABORATE.</span>
              <span className="text-slate-600">·</span>
              <span className="text-[#F5A623] font-semibold">GROW.</span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <button
                onClick={() => onNavigate('manifesto')}
                className="text-[#F5A623] hover:text-[#FFB84D] flex items-center gap-1.5 font-semibold group"
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-5">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#2490EF] mb-3">
              <span className="w-6 h-[1px] bg-[#2490EF]/60" />
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
            className="text-xs sm:text-sm font-semibold text-[#2490EF] hover:text-white flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-xl border border-[#2490EF]/30 hover:border-[#2490EF] hover:bg-[#2490EF]/10 transition-all group"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="px-6 py-3 text-sm font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] rounded-xl transition-all shadow-lg shadow-[#2490EF]/25"
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
                className="px-6 py-3 text-sm font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] rounded-xl transition-all shadow-lg shadow-[#2490EF]/25"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredProperties.slice(0, 6).map((property, idx) => (
              <div
                key={property.id}
                className="group bg-gradient-to-b from-slate-900/70 to-slate-900/50 border border-white/[0.06] hover:border-[#2490EF]/50 rounded-3xl overflow-hidden transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-[#2490EF]/10 hover:-translate-y-1.5 flex flex-col justify-between"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div>
                  <div className="relative h-60 w-full overflow-hidden">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-[900ms] ease-out-expo brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#2490EF] text-white shadow-lg shadow-[#2490EF]/30">
                        {property.category}
                      </span>
                      {property.status === 'Hot Deal' && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#FFA500] text-slate-950 shadow-lg">
                          <Zap className="w-2.5 h-2.5" />
                          Hot Deal
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                      <span className="text-xl font-bold text-[#F5A623] font-mono drop-shadow-lg">
                        {property.priceFormatted}
                      </span>
                      <span className="text-[11px] bg-slate-950/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg font-mono">
                        {property.size} {property.sizeUnit}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="font-heading font-bold text-lg text-white group-hover:text-[#2490EF] transition-colors leading-snug line-clamp-2 min-h-[3rem]">
                      {property.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
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
                        <span className="font-mono text-[11px]">{property.ownership}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <div className="border-t border-white/[0.06] pt-4 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-500 font-mono truncate min-w-0">
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
                      className="px-4 py-2 text-xs font-bold text-white bg-white/[0.06] hover:bg-[#2490EF] border border-white/[0.08] hover:border-[#2490EF] rounded-xl transition-all flex items-center gap-1.5 shrink-0 group/btn"
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
      <section className="relative bg-[#07101E] py-16 sm:py-20 border-y border-white/[0.06] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(36, 144, 239, 0.08) 0%, transparent 60%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 scroll-reveal">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#2490EF] mb-4">
              <span className="w-6 h-[1px] bg-[#2490EF]/60" />
              <span>The Realtor X Difference</span>
              <span className="w-6 h-[1px] bg-[#2490EF]/60" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading tracking-[-0.02em] leading-tight">
              Why Homeowners & Dealers Choose Us
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed max-w-2xl mx-auto">
              Transforming the real estate transaction into a transparent, collaborative, and
              dignified experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                color: '#2490EF',
                title: 'Verified Listings',
                desc: 'Zero fake ads or disputed files. Every plot, villa, and shop is audited with Bahria Town transfer office records.',
              },
              {
                icon: Users,
                color: '#F5A623',
                title: 'Trusted Dealers',
                desc: 'Our dealers take the Realtor X Founding Oath, committing to absolute honesty and client-first service.',
              },
              {
                icon: Percent,
                color: '#28A745',
                title: 'Fair 40/60 Commission',
                desc: 'We empower realtors with 60% commission split to the closing agent, creating a supportive fraternity.',
              },
              {
                icon: Award,
                color: '#8B5CF6',
                title: 'Community First',
                desc: 'Dedicated allottee advocacy desk. We resolve construction delays and transfer bottlenecks together.',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="group relative p-7 rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 shadow-lg hover:shadow-2xl scroll-reveal"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      backgroundColor: `${item.color}18`,
                      border: `1px solid ${item.color}35`,
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: item.color }} />
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
            <div ref={propertiesCounter.ref}>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#2490EF] font-heading tabular-nums">
                {properties.length > 0 ? `${propertiesCounter.count}+` : '0'}
              </div>
              <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-slate-400 mt-3">
                Verified Listings
              </div>
            </div>

            <div ref={dealersCounter.ref}>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#F5A623] font-heading tabular-nums">
                {dealers.length > 0 ? `${dealersCounter.count}+` : '—'}
              </div>
              <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-slate-400 mt-3">
                Registered Dealers
              </div>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#28A745] font-heading tabular-nums">
                40/60
              </div>
              <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-slate-400 mt-3">
                Commission Split
              </div>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-white font-heading tabular-nums">
                100%
              </div>
              <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-slate-400 mt-3">
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
        <div className="text-center max-w-2xl mx-auto mb-16 scroll-reveal">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#2490EF] mb-4">
            <span className="w-6 h-[1px] bg-[#2490EF]/60" />
            <span>Simple, Transparent, Secured</span>
            <span className="w-6 h-[1px] bg-[#2490EF]/60" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading tracking-[-0.02em] leading-tight">
            How Realtor X Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            A frictionless journey from finding your dream property to receiving the transfer deed.
          </p>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-transparent via-[#2490EF]/20 to-transparent" />

          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="group relative p-7 rounded-3xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 border border-white/[0.06] hover:border-[#2490EF]/40 transition-all duration-500 hover:-translate-y-1 scroll-reveal"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2490EF] to-[#1b7ecf] flex items-center justify-center text-white font-black font-heading text-xl mb-5 shadow-lg shadow-[#2490EF]/25 group-hover:scale-110 transition-transform duration-500">
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
            <div className="lg:col-span-7 p-10 sm:p-14 lg:p-16 space-y-6">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#F5A623] bg-[#F5A623]/[0.08] border border-[#F5A623]/25 px-4 py-1.5 rounded-full">
                <Building className="w-3.5 h-3.5" />
                <span>The Flagship Master Development</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading tracking-[-0.02em] leading-tight">
                Bahria Town Karachi: <span className="text-[#2490EF]">A City Within A City</span>
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
                      <div className="w-5 h-5 rounded-full bg-[#28A745]/15 border border-[#28A745]/40 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-[#28A745]" />
                      </div>
                      <span>{item}</span>
                    </div>
                  )
                )}
              </div>

              <div className="pt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('projects')}
                  className="relative px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] transition-all shadow-lg shadow-[#2490EF]/25 flex items-center gap-2 group overflow-hidden active:scale-[0.98]"
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
                src="/images/bahria_town_karachi_1790600916751.jpg"
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
        <div className="text-center max-w-2xl mx-auto mb-16 scroll-reveal">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#F5A623] mb-4">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              doc: 'Document 01 · Why We Exist',
              color: '#2490EF',
              title: 'The RealtorX Manifesto',
              quote:
                '"Real estate is not just about land, buildings or transactions. It is about people. It is about dreams. It is about trust."',
              cta: 'Read Full Manifesto',
              route: 'manifesto' as PageId,
            },
            {
              doc: 'Document 02 · What We Promise',
              color: '#F5A623',
              title: 'The Founding Member Oath',
              quote:
                'The solemn commitments taken by every custodian dealer. Place ethics before profit and never mislead this community.',
              cta: 'Affirm & Sign Oath',
              route: 'oath' as PageId,
            },
            {
              doc: 'Document 03 · How We Behave',
              color: '#28A745',
              title: 'The RealtorX Code (8 Tenets)',
              quote:
                'Integrity First, Collaboration Before Competition, Solutions Over Excuses. Concrete rules for client transparency.',
              cta: 'Explore The 8 Principles',
              route: 'code' as PageId,
            },
          ].map((card, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate(card.route)}
              className="group cursor-pointer relative p-7 rounded-3xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 border border-white/[0.06] hover:border-white/[0.15] transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden scroll-reveal"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${card.color}15 0%, transparent 60%)`,
                }}
              />

              <div className="relative">
                <div
                  className="text-[10px] font-mono uppercase tracking-[0.16em] mb-3 font-semibold"
                  style={{ color: card.color }}
                >
                  {card.doc}
                </div>
                <h3 className="font-heading font-bold text-xl text-white leading-tight mb-3 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {card.quote}
                </p>
              </div>

              <div
                className="relative mt-7 flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: card.color }}
              >
                <span>{card.cta}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          9. TESTIMONIALS
         ═══════════════════════════════════════════════════ */}
      <section className="relative bg-[#07101E] py-16 sm:py-20 border-y border-white/[0.06] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 50% 100%, rgba(245, 166, 35, 0.08) 0%, transparent 60%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 scroll-reveal">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#2490EF] mb-4">
              <span className="w-6 h-[1px] bg-[#2490EF]/60" />
              <span>Real Stories</span>
              <span className="w-6 h-[1px] bg-[#2490EF]/60" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading tracking-[-0.02em] leading-tight">
              Voices From Our Community
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="relative p-7 rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-white/[0.06] hover:border-white/[0.15] transition-all duration-500 flex flex-col justify-between scroll-reveal"
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
                  <div className="text-[11px] text-[#2490EF] font-mono mt-0.5">
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 scroll-reveal">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#F5A623] mb-4">
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
                  className="group relative p-6 rounded-3xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 border border-white/[0.06] hover:border-[#2490EF]/50 transition-all duration-500 hover:-translate-y-1 flex flex-col items-center text-center overflow-hidden scroll-reveal"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(ellipse at 50% 0%, rgba(36, 144, 239, 0.12) 0%, transparent 60%)',
                    }}
                  />

                  <div className="relative w-20 h-20 rounded-full p-[2px] bg-gradient-to-br from-[#2490EF]/50 via-[#F5A623]/40 to-[#2490EF]/50 mb-4 group-hover:from-[#2490EF] group-hover:to-[#2490EF] transition-all duration-500">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#0A1628] flex items-center justify-center">
                      {dealer.imageUrl ? (
                        <img
                          src={dealer.imageUrl}
                          alt={dealer.name}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-[#2490EF] font-heading">
                          {dealer.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative flex items-center gap-1 mb-1.5 max-w-full">
                    <h3 className="font-heading font-bold text-sm text-white truncate">
                      {dealer.name}
                    </h3>
                    <BadgeCheck className="w-3.5 h-3.5 text-[#2490EF] shrink-0" />
                  </div>

                  {showDesignation && (
                    <div className="relative text-[10px] text-[#F5A623] font-mono uppercase tracking-[0.12em] truncate w-full">
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
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal">
        <div className="relative rounded-[2rem] overflow-hidden border border-[#2490EF]/20 shadow-2xl shadow-[#2490EF]/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0E2849] via-[#0B1A30] to-[#0E2849]" />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                'radial-gradient(ellipse at 30% 50%, rgba(36, 144, 239, 0.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(245, 166, 35, 0.12) 0%, transparent 60%)',
            }}
          />
          {/* Top line */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#2490EF]/60 to-transparent" />

          <div className="relative p-10 sm:p-14 text-center space-y-7">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#FFA500] flex items-center justify-center shadow-xl shadow-[#F5A623]/30">
              <TrendingUp className="w-7 h-7 text-slate-950" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white font-heading tracking-[-0.02em] leading-tight max-w-3xl mx-auto text-balance">
              Join the Realtor X Movement in Bahria Town
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Whether you are buying a dream villa, securing an investment plot, or are a local
              dealer looking for a fair 40/60 partnership, we welcome you.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                onClick={() => onNavigate('become-dealer')}
                className="relative px-7 py-3.5 rounded-2xl text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] via-[#FFB84D] to-[#F5A623] hover:brightness-110 transition-all duration-300 shadow-xl shadow-[#F5A623]/30 hover:shadow-[#F5A623]/50 flex items-center gap-2 overflow-hidden group active:scale-[0.98]"
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
                <Compass className="w-4 h-4 text-[#2490EF]" />
                <span>Browse Properties</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
