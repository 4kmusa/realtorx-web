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
  Sparkles,
  Star,
  BadgeCheck,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
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

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [props, dealerList] = await Promise.all([
          fetchProperties(),
          fetchDealers(),
        ]);
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
        const needle = selectedProject.toUpperCase();
        if (!haystack.includes(needle)) return false;
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
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-[#0A1628]">
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background:
              'radial-gradient(circle at 50% 20%, rgba(36, 144, 239, 0.22) 0%, rgba(245, 166, 35, 0.12) 35%, rgba(10, 22, 40, 0) 70%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#2490EF] bg-[#2490EF]/10 border border-[#2490EF]/30 px-3.5 py-1 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623]" />
              <span>Bahria Town Karachi's Premier Community Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight font-heading">
              Real Estate. <span className="text-[#2490EF]">Reimagined.</span>
            </h1>

            <p className="mt-4 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Connect with verified dealers, explore verified residential and commercial properties, and invest with complete trust in Bahria Town Karachi.
            </p>

            <div className="mt-2 font-urdu text-xl text-[#F5A623]">
              {BRAND_TAGLINES.urduTagline}
            </div>
          </div>

          {/* Search Filter Box */}
          <div className="max-w-4xl mx-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
                  Property Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-[#2490EF]"
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
                <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
                  Project / Precinct
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-[#2490EF]"
                >
                  <option value="All">All Bahria Projects</option>
                  <option value="BTK-1">Bahria Town Karachi (BTK-1)</option>
                  <option value="BTK-2">Bahria Town Karachi 2 (BTK-2)</option>
                  <option value="Bahria Heights">Bahria Heights Towers</option>
                  <option value="Jinnah Avenue">Jinnah Avenue Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
                  Budget (PKR)
                </label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-[#2490EF]"
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
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] rounded-lg shadow-lg shadow-[#2490EF]/20 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Properties</span>
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#28A745]" />
                100% Verified Bahria Town plot maps & NDC status
              </span>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    type="button"
                    className="text-slate-300 hover:text-white underline"
                  >
                    Reset Filters
                  </button>
                )}
                <button
                  onClick={() => onNavigate('become-dealer')}
                  className="text-[#F5A623] hover:underline font-medium"
                >
                  Are you a Bahria Dealer? Join with 60% Split →
                </button>
              </div>
            </div>
          </div>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('properties')}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] transition-all shadow-md flex items-center gap-2"
            >
              <span>Explore Verified Properties</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('become-dealer')}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 transition-all shadow-md flex items-center gap-2"
            >
              <span>Become a Realtor X Dealer</span>
              <span className="text-xs bg-slate-950 text-[#F5A623] px-2 py-0.5 rounded-full font-mono">
                60% Split
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. PHILOSOPHY BANNER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-[#0B1A30] to-slate-950 border border-slate-800 p-8 sm:p-14 lg:p-16 text-center shadow-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5A623] mb-4">
            <Sparkles className="w-4 h-4 text-[#F5A623]" />
            <span>The Heart of Realtor X</span>
          </div>

          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white max-w-4xl mx-auto leading-snug tracking-wide text-balance">
            "{BRAND_TAGLINES.philosophy}"
          </blockquote>

          <div className="mt-6 font-urdu text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
            {BRAND_TAGLINES.philosophyUrdu}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <span>Connect. Collaborate. Grow.</span>
            <span>·</span>
            <span className="text-[#2490EF]">Real Estate. Reimagined.</span>
            <span>·</span>
            <button
              onClick={() => onNavigate('manifesto')}
              className="text-[#F5A623] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Read The Manifesto</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES */}
      <section ref={featuredRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#2490EF] mb-1">
              <span>Prime Inventory</span>
              <span>·</span>
              <span>Bahria Town Karachi</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading">
              {hasActiveFilters ? 'Matching Properties' : 'Featured Properties'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {hasActiveFilters
                ? `${filteredProperties.length} properties match your filters`
                : 'Hand-picked verified villas, commercial shops, plots, and apartments ready for immediate transfer.'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('properties')}
            className="text-xs sm:text-sm font-semibold text-[#2490EF] hover:text-[#1b7ecf] flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-56 w-full bg-slate-800/50" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-800/60 rounded w-3/4" />
                  <div className="h-4 bg-slate-800/40 rounded w-1/2" />
                  <div className="h-4 bg-slate-800/40 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : properties.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/80 flex items-center justify-center">
                <Building className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Properties Coming Soon</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                {error || 'Our verified Bahria Town properties will be listed here soon.'}
              </p>
              <button
                onClick={() => onNavigate('contact')}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] rounded-lg transition-colors"
              >
                Contact Us for Details
              </button>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/80 flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Properties Match</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                Try changing the filter selections or reset to see all properties.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredProperties.slice(0, 6).map((property) => (
              <div
                key={property.id}
                className="group bg-slate-900/70 border border-slate-800 hover:border-[#2490EF]/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 w-full overflow-hidden">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#2490EF] text-white">
                        {property.category}
                      </span>
                      {property.status === 'Hot Deal' && (
                        <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-[#FFA500] text-slate-950">
                          Hot Deal
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <span className="text-lg font-bold text-[#F5A623] font-mono">
                        {property.priceFormatted}
                      </span>
                      <span className="text-xs bg-slate-950/80 px-2 py-0.5 rounded font-mono">
                        {property.size} {property.sizeUnit}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-heading font-bold text-lg text-white group-hover:text-[#2490EF] transition-colors leading-snug line-clamp-2">
                      {property.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
                      <span className="truncate">{property.precinct || 'Bahria Town Karachi'}</span>
                    </div>

                    {property.bedrooms || property.bathrooms ? (
                      <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                        {property.bedrooms ? (
                          <span className="flex items-center gap-1.5">
                            <Bed className="w-3.5 h-3.5 text-slate-400" />
                            {property.bedrooms} Beds
                          </span>
                        ) : null}
                        {property.bathrooms ? (
                          <span className="flex items-center gap-1.5">
                            <Bath className="w-3.5 h-3.5 text-slate-400" />
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

                <div className="p-5 pt-0">
                  <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                      {property.listing_type ? (
                        <span className="text-[#F5A623] font-medium">{property.listing_type}</span>
                      ) : (
                        <span className="font-mono text-slate-500">{property.erpCode}</span>
                      )}
                    </div>

                    <button
                      onClick={() => onNavigate('property-detail', property.erpCode)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-[#2490EF] rounded-lg transition-colors flex items-center gap-1 shrink-0"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. WHY REALTOR X */}
      <section className="bg-[#07101E] py-16 sm:py-20 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-wider text-[#2490EF]">
              The Realtor X Difference
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1 font-heading">
              Why Homeowners & Dealers Choose Us
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Transforming the real estate transaction into a transparent, collaborative, and dignified experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-[#2490EF]/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center text-[#2490EF] mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">Verified Listings</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Zero fake ads or disputed files. Every plot, villa, and shop is audited with Bahria Town transfer office records.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-[#F5A623]/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#F5A623]/15 border border-[#F5A623]/30 flex items-center justify-center text-[#F5A623] mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">Trusted Dealers</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Our dealers take the Realtor X Founding Oath, committing to absolute honesty and client-first service.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-[#28A745]/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#28A745]/15 border border-[#28A745]/30 flex items-center justify-center text-[#28A745] mb-4">
                <Percent className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">Fair 40/60 Commission</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                We empower realtors with 60% commission split to the closing agent, creating a supportive fraternity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">Community First</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Dedicated allottee advocacy desk. We resolve construction delays and transfer bottlenecks together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STATS BAR */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-slate-900/80 border border-slate-800 rounded-2xl text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#2490EF] font-heading">
              {properties.length > 0 ? `${properties.length}+` : '0'}
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mt-1">
              Verified Listings
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#F5A623] font-heading">
              {dealers.length > 0 ? `${dealers.length}+` : '—'}
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mt-1">
              Registered Dealers
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#28A745] font-heading">
              40/60
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mt-1">
              Commission Split
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
              100%
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mt-1">
              Verified Documents
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-[#2490EF]">
            Simple, Transparent, Secured
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1 font-heading">
            How Realtor X Works
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            A frictionless journey from finding your dream property to receiving the transfer deed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl font-black text-[#2490EF] font-mono">{step.step}</span>
                <h3 className="font-heading font-bold text-lg text-white mt-3 mb-1">
                  {step.title}
                </h3>
                <div className="font-urdu text-sm text-[#F5A623] mb-2">{step.titleUrdu}</div>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. BAHRIA TOWN SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-[#0B1A30]">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 p-8 sm:p-12 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5A623]">
                <Building className="w-4 h-4" />
                <span>The Flagship Master Development</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading">
                Bahria Town Karachi: A City Within A City
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Featuring the world's 3rd largest mosque, international-standard hospitals, golf courses, theme parks, and 100% underground electrified utilities. Realtor X is permanently rooted inside Bahria Town.
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-300 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#28A745]" />
                  <span>Grand Jamia Mosque</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#28A745]" />
                  <span>Danzoo Safari & Carnival</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#28A745]" />
                  <span>Saudi German Hospital</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#28A745]" />
                  <span>400-ft Jinnah Avenue</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate('projects')}
                  className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] transition-all flex items-center gap-1.5"
                >
                  <span>Explore Bahria Precincts</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('contact')}
                  className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
                >
                  Contact Our Office
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 h-72 sm:h-96 lg:h-full min-h-[360px] relative">
              <img
                src="/src/assets/images/bahria_town_karachi_1790600916751.jpg"
                alt="Bahria Town Karachi Grand View"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0B1A30] via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* 8. CULTURE PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-[#F5A623]">
            Our Guiding Pillars
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1 font-heading">
            The Culture of Realtor X
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Why people don't just join Realtor X — they belong to Realtor X.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => onNavigate('manifesto')}
            className="group cursor-pointer p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-[#2490EF]/60 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-mono text-[#2490EF] uppercase tracking-wider mb-2 font-semibold">
                Document 01 · Why We Exist
              </div>
              <h3 className="font-heading font-bold text-xl text-white group-hover:text-[#2490EF] transition-colors">
                The RealtorX Manifesto
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">
                "Real estate is not just about land, buildings or transactions. It is about people. It is about dreams. It is about trust."
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-[#2490EF]">
              <span>Read Full Manifesto</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('oath')}
            className="group cursor-pointer p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-[#F5A623]/60 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-mono text-[#F5A623] uppercase tracking-wider mb-2 font-semibold">
                Document 02 · What We Promise
              </div>
              <h3 className="font-heading font-bold text-xl text-white group-hover:text-[#F5A623] transition-colors">
                The Founding Member Oath
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">
                The solemn commitments taken by every custodian dealer. Place ethics before profit and never mislead this community.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-[#F5A623]">
              <span>Affirm & Sign Oath</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('code')}
            className="group cursor-pointer p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-[#28A745]/60 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-mono text-[#28A745] uppercase tracking-wider mb-2 font-semibold">
                Document 03 · How We Behave
              </div>
              <h3 className="font-heading font-bold text-xl text-white group-hover:text-[#28A745] transition-colors">
                The RealtorX Code (8 Tenets)
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">
                Integrity First, Collaboration Before Competition, Solutions Over Excuses. Concrete rules for client transparency.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-[#28A745]">
              <span>Explore The 8 Principles</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section className="bg-[#07101E] py-16 sm:py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-[#2490EF]">
              Real Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1 font-heading">
              Voices From Our Community
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-[#F5A623]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80">
                  <div className="font-heading font-semibold text-white text-sm">{t.author}</div>
                  <div className="text-[11px] text-[#2490EF] font-mono">
                    {t.role} · {t.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. REGISTERED DEALERS — sirf Approved/Active */}
      {dealers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-[#F5A623]">
              Meet The Fraternity
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1 font-heading">
              Registered Dealers
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Verified Realtor X members committed to ethical, client-first real estate.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {dealers.map((dealer) => {
              const showDesignation = dealer.designation && dealer.designation !== dealer.firm;
              const showFirm = dealer.firm && dealer.firm !== dealer.designation;

              return (
                <div
                  key={dealer.id}
                  className="group p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-[#2490EF]/60 transition-all flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-[#2490EF]/15 border-2 border-[#2490EF]/40 flex items-center justify-center mb-3 group-hover:border-[#2490EF] transition-colors">
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

                  <div className="flex items-center gap-1 mb-1 w-full justify-center">
                    <h3 className="font-heading font-bold text-sm text-white truncate">
                      {dealer.name}
                    </h3>
                    <BadgeCheck className="w-3.5 h-3.5 text-[#2490EF] shrink-0" />
                  </div>

                  {showDesignation && (
                    <div className="text-[11px] text-[#F5A623] font-mono uppercase tracking-wider truncate w-full">
                      {dealer.designation}
                    </div>
                  )}

                  {showFirm && (
                    <div className="text-[11px] text-slate-400 truncate w-full mt-0.5">
                      {dealer.firm}
                    </div>
                  )}

                  {dealer.city && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1.5">
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

      {/* 11. DUAL CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#0E2849] via-[#0B1A30] to-[#0E2849] border border-[#2490EF]/30 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading">
            Join the Realtor X Movement in Bahria Town
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Whether you are buying a dream villa, securing an investment plot, or are a local dealer looking for a fair 40/60 partnership, we welcome you.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('become-dealer')}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 transition-all shadow-md flex items-center gap-2"
            >
              <span>Become a Realtor X Dealer</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
