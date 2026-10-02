import React, { useState, useEffect, useMemo } from 'react';
import { PageId, Language } from '../types';
import { fetchProperties, Property } from '../services/propertyService';
import {
  Search,
  MapPin,
  Grid3x3,
  Grid2x2,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
  Heart,
  X,
  Building2,
  Bed,
  Bath,
  ImageOff,
  Sparkles,
  ArrowUpDown,
  Filter,
  Tag,
  Ruler,
  Wallet,
} from 'lucide-react';

interface PropertiesPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

type ViewMode = 'grid' | 'list';
type GridCols = 2 | 3 | 4;

const WHATSAPP_NUMBER = '923008472910';
const FAVORITES_KEY = 'realtorx_favorites';
const FILTERS_KEY = 'realtorx_properties_filters';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
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

const PRICE_RANGES: { value: string; label: string; min: number; max: number }[] = [
  { value: 'All', label: 'Any Price', min: 0, max: Infinity },
  { value: 'under-50l', label: 'Under 50 Lakh', min: 0, max: 5_000_000 },
  { value: '50l-1cr', label: '50 Lakh – 1 Crore', min: 5_000_000, max: 10_000_000 },
  { value: '1cr-2cr', label: '1 – 2 Crore', min: 10_000_000, max: 20_000_000 },
  { value: '2cr-5cr', label: '2 – 5 Crore', min: 20_000_000, max: 50_000_000 },
  { value: '5cr-plus', label: '5 Crore+', min: 50_000_000, max: Infinity },
];

interface SavedFilters {
  searchKeyword?: string;
  selectedCategory?: string;
  selectedProject?: string;
  selectedPrecinct?: string;
  selectedSize?: string;
  selectedBedrooms?: string;
  selectedPriceRange?: string;
  sortBy?: string;
  viewMode?: ViewMode;
  gridCols?: GridCols;
}

const hasRealImage = (url?: string): boolean => {
  if (!url) return false;
  return !url.startsWith('data:');
};

export const PropertiesPage: React.FC<PropertiesPageProps> = ({ onNavigate }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [gridCols, setGridCols] = useState<GridCols>(3);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedPrecinct, setSelectedPrecinct] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedBedrooms, setSelectedBedrooms] = useState('Any');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    try {
      const favs = localStorage.getItem(FAVORITES_KEY);
      if (favs) setFavorites(new Set(JSON.parse(favs)));

      const saved = sessionStorage.getItem(FILTERS_KEY);
      if (saved) {
        const f: SavedFilters = JSON.parse(saved);
        if (f.searchKeyword) setSearchKeyword(f.searchKeyword);
        if (f.selectedCategory) setSelectedCategory(f.selectedCategory);
        if (f.selectedProject) setSelectedProject(f.selectedProject);
        if (f.selectedPrecinct) setSelectedPrecinct(f.selectedPrecinct);
        if (f.selectedSize) setSelectedSize(f.selectedSize);
        if (f.selectedBedrooms) setSelectedBedrooms(f.selectedBedrooms);
        if (f.selectedPriceRange) setSelectedPriceRange(f.selectedPriceRange);
        if (f.sortBy) setSortBy(f.sortBy);
        if (f.viewMode) setViewMode(f.viewMode);
        if (f.gridCols) setGridCols(f.gridCols);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const payload: SavedFilters = {
      searchKeyword, selectedCategory, selectedProject, selectedPrecinct,
      selectedSize, selectedBedrooms, selectedPriceRange, sortBy, viewMode, gridCols,
    };
    try { sessionStorage.setItem(FILTERS_KEY, JSON.stringify(payload)); } catch {}
  }, [searchKeyword, selectedCategory, selectedProject, selectedPrecinct, selectedSize, selectedBedrooms, selectedPriceRange, sortBy, viewMode, gridCols]);

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProperties();
        setProperties(data);
        if (data.length === 0) setError('No properties available yet.');
      } catch (err) {
        console.error(err);
        setError('Failed to load properties.');
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  const toggleFavorite = (erpCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(erpCode)) next.delete(erpCode);
      else next.add(erpCode);
      try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(properties.map((p) => p.category).filter(Boolean))).sort()],
    [properties]
  );
  const projects = useMemo(
    () => ['All', ...Array.from(new Set(properties.map((p) => p.project).filter(Boolean))).sort()],
    [properties]
  );
  const precincts = useMemo(
    () => ['All', ...Array.from(new Set(properties.map((p) => p.precinct).filter(Boolean))).sort()],
    [properties]
  );
  const hasBedrooms = useMemo(
    () => properties.some((p) => (p.bedrooms || 0) > 0),
    [properties]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of properties) counts[p.category] = (counts[p.category] || 0) + 1;
    return counts;
  }, [properties]);

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase().trim();
      result = result.filter((p) => {
        const haystack = [p.title, p.precinct, p.project, p.category, p.location, p.erpCode]
          .filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(kw);
      });
    }

    if (selectedCategory !== 'All') result = result.filter((p) => p.category === selectedCategory);
    if (selectedProject !== 'All') result = result.filter((p) => p.project === selectedProject);
    if (selectedPrecinct !== 'All') result = result.filter((p) => p.precinct === selectedPrecinct);

    if (selectedSize !== 'All') {
      if (selectedSize === 'small') result = result.filter((p) => p.size > 0 && p.size <= 250);
      else if (selectedSize === 'medium') result = result.filter((p) => p.size > 250 && p.size <= 500);
      else if (selectedSize === 'large') result = result.filter((p) => p.size > 500);
    }

    if (selectedBedrooms !== 'Any' && hasBedrooms) {
      if (selectedBedrooms === '4+') result = result.filter((p) => (p.bedrooms || 0) >= 4);
      else {
        const n = parseInt(selectedBedrooms, 10);
        result = result.filter((p) => (p.bedrooms || 0) >= n);
      }
    }

    if (selectedPriceRange !== 'All') {
      const range = PRICE_RANGES.find((r) => r.value === selectedPriceRange);
      if (range) result = result.filter((p) => p.pricePkr >= range.min && p.pricePkr < range.max);
    }

    if (sortBy === 'price-low') result.sort((a, b) => a.pricePkr - b.pricePkr);
    else if (sortBy === 'price-high') result.sort((a, b) => b.pricePkr - a.pricePkr);
    else if (sortBy === 'size') result.sort((a, b) => b.size - a.size);
    else if (sortBy === 'newest')
      result.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

    return result;
  }, [properties, searchKeyword, selectedCategory, selectedProject, selectedPrecinct, selectedSize, selectedBedrooms, selectedPriceRange, sortBy, hasBedrooms]);

  const activeChips: { key: string; label: string; onClear: () => void }[] = [];
  if (searchKeyword.trim()) activeChips.push({ key: 'kw', label: `"${searchKeyword}"`, onClear: () => setSearchKeyword('') });
  if (selectedCategory !== 'All') activeChips.push({ key: 'cat', label: selectedCategory, onClear: () => setSelectedCategory('All') });
  if (selectedProject !== 'All') activeChips.push({ key: 'proj', label: selectedProject, onClear: () => setSelectedProject('All') });
  if (selectedPrecinct !== 'All') activeChips.push({ key: 'prec', label: selectedPrecinct, onClear: () => setSelectedPrecinct('All') });
  if (selectedSize !== 'All') {
    const sizeLabel = selectedSize === 'small' ? 'Up to 250 Sq.Yd' : selectedSize === 'medium' ? '250–500 Sq.Yd' : '500+ Sq.Yd';
    activeChips.push({ key: 'size', label: sizeLabel, onClear: () => setSelectedSize('All') });
  }
  if (selectedBedrooms !== 'Any') activeChips.push({ key: 'bed', label: `${selectedBedrooms} Beds`, onClear: () => setSelectedBedrooms('Any') });
  if (selectedPriceRange !== 'All') {
    const pr = PRICE_RANGES.find((r) => r.value === selectedPriceRange);
    if (pr) activeChips.push({ key: 'price', label: pr.label, onClear: () => setSelectedPriceRange('All') });
  }

  const hasActiveFilters = activeChips.length > 0;

  const resetFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('All');
    setSelectedProject('All');
    setSelectedPrecinct('All');
    setSelectedSize('All');
    setSelectedBedrooms('Any');
    setSelectedPriceRange('All');
    setSortBy('default');
  };

  const gridClass =
    gridCols === 2 ? 'grid-cols-1 sm:grid-cols-2'
    : gridCols === 4 ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3';

  if (loading) {
    return (
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <div className="h-4 bg-slate-800/60 rounded w-48 animate-pulse" />
          <div className="h-10 bg-slate-800/60 rounded w-96 animate-pulse" />
          <div className="h-4 bg-slate-800/40 rounded w-64 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="h-[600px] bg-slate-900/60 border border-slate-800 rounded-3xl animate-pulse" />
          </div>
          <div className="lg:col-span-3 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden animate-pulse">
                  <div className="h-56 w-full bg-slate-800/50" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-800/60 rounded w-3/4" />
                    <div className="h-3 bg-slate-800/40 rounded w-1/2" />
                    <div className="h-3 bg-slate-800/40 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.15em] text-[#2490EF] mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2490EF]" />
          <span>Marketplace</span>
          <span className="text-slate-600">·</span>
          <span>Bahria Town Karachi</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white font-heading leading-tight">
              Verified Property Listings
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Showing{' '}
              <span className="text-white font-semibold tabular-nums">{filteredProperties.length}</span>
              {' '}of{' '}
              <span className="text-white font-semibold tabular-nums">{properties.length}</span>
              {' '}{properties.length === 1 ? 'property' : 'properties'}
              {hasActiveFilters ? ' matching your filters' : ' available'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#2490EF] text-white shadow-md shadow-[#2490EF]/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Grid view"
                title="Grid view"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#2490EF] text-white shadow-md shadow-[#2490EF]/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-label="List view"
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {viewMode === 'grid' && (
              <div className="hidden md:flex items-center bg-slate-900/80 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setGridCols(2)}
                  className={`p-2 rounded-lg transition-all ${gridCols === 2 ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                  aria-label="2 columns"
                  title="2 columns"
                >
                  <Grid2x2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-2 rounded-lg transition-all ${gridCols === 3 ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                  aria-label="3 columns"
                  title="3 columns"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={`p-2 rounded-lg transition-all ${gridCols === 4 ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                  aria-label="4 columns"
                  title="4 columns"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#2490EF] cursor-pointer appearance-none"
              >
                <option value="default">Sort: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="size">Size: Large First</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-white relative"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeChips.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#F5A623] text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {activeChips.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                onClick={chip.onClear}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#2490EF]/10 border border-[#2490EF]/30 text-[#2490EF] hover:bg-[#2490EF]/20 transition-all"
              >
                <span>{chip.label}</span>
                <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </button>
            ))}
            <button
              onClick={resetFilters}
              className="text-xs font-medium text-[#F5A623] hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className={`lg:col-span-1 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/60 border border-slate-800 p-5 lg:sticky lg:top-24 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2490EF]/15 flex items-center justify-center">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#2490EF]" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Filters</h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#F5A623] hover:underline font-semibold uppercase tracking-wider"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.1em]">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Precinct, villa, shop..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF] focus:ring-2 focus:ring-[#2490EF]/20 transition-all"
                />
              </div>
            </div>

            {categories.length > 1 && (
              <div className="mb-5">
                <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.1em] flex items-center gap-1.5">
                  <Tag className="w-3 h-3" />
                  Category
                </label>
                <div className="space-y-1">
                  {categories.map((cat) => {
                    const count = cat === 'All' ? properties.length : categoryCounts[cat] || 0;
                    const isActive = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center justify-between group ${
                          isActive
                            ? 'bg-[#2490EF]/15 text-[#2490EF] font-semibold ring-1 ring-[#2490EF]/30'
                            : 'text-slate-300 hover:bg-slate-800/50'
                        }`}
                      >
                        <span>{cat === 'All' ? 'All Categories' : cat}</span>
                        <span className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                          isActive ? 'bg-[#2490EF]/25 text-[#2490EF]' : 'bg-slate-800/60 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {projects.length > 1 && (
              <div className="mb-5">
                <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.1em] flex items-center gap-1.5">
                  <Building2 className="w-3 h-3" />
                  Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#2490EF] cursor-pointer"
                >
                  {projects.map((proj) => (
                    <option key={proj} value={proj}>
                      {proj === 'All' ? 'All Projects' : proj}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {precincts.length > 1 && (
              <div className="mb-5">
                <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.1em] flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  Precinct
                </label>
                <select
                  value={selectedPrecinct}
                  onChange={(e) => setSelectedPrecinct(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#2490EF] cursor-pointer"
                >
                  {precincts.map((p) => (
                    <option key={p} value={p}>
                      {p === 'All' ? 'All Precincts' : p}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-5">
              <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.1em] flex items-center gap-1.5">
                <Ruler className="w-3 h-3" />
                Plot / Villa Size
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { value: 'All', label: 'Any' },
                  { value: 'small', label: '≤250' },
                  { value: 'medium', label: '250-500' },
                  { value: 'large', label: '500+' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedSize(opt.value)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedSize === opt.value
                        ? 'bg-[#2490EF]/15 text-[#2490EF] ring-1 ring-[#2490EF]/30'
                        : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {hasBedrooms && (
              <div className="mb-5">
                <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.1em] flex items-center gap-1.5">
                  <Bed className="w-3 h-3" />
                  Bedrooms
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {['Any', '1', '2', '3', '4+'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedBedrooms(opt)}
                      className={`py-2 rounded-lg text-xs font-medium transition-all ${
                        selectedBedrooms === opt
                          ? 'bg-[#2490EF]/15 text-[#2490EF] ring-1 ring-[#2490EF]/30'
                          : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.1em] flex items-center gap-1.5">
                <Wallet className="w-3 h-3" />
                Price Range
              </label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#2490EF] cursor-pointer"
              >
                {PRICE_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 min-w-0">
          {error && properties.length === 0 ? (
            <div className="text-center py-24 bg-gradient-to-b from-slate-900/60 to-slate-900/30 border border-slate-800 rounded-3xl">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{error}</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
                Please check back soon or contact us for available properties.
              </p>
              <button
                onClick={() => onNavigate('contact')}
                className="px-6 py-3 text-sm font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] rounded-xl transition-colors shadow-lg shadow-[#2490EF]/25"
              >
                Contact Us
              </button>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-24 bg-gradient-to-b from-slate-900/60 to-slate-900/30 border border-slate-800 rounded-3xl">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No properties match</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
                Try removing a filter or searching for something else. Our inventory changes daily.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] rounded-xl transition-colors"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={() => onNavigate('contact')}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Contact Us
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className={`grid ${gridClass} gap-5`}>
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.erpCode || property.id}
                  property={property}
                  onNavigate={onNavigate}
                  isFavorite={favorites.has(property.erpCode)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProperties.map((property) => (
                <PropertyListItem
                  key={property.erpCode || property.id}
                  property={property}
                  onNavigate={onNavigate}
                  isFavorite={favorites.has(property.erpCode)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PropertyCard: React.FC<{
  property: Property;
  onNavigate: (page: PageId, extraId?: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (erpCode: string, e: React.MouseEvent) => void;
}> = ({ property, onNavigate, isFavorite, onToggleFavorite }) => {
  const handleClick = () => onNavigate('property-detail', property.erpCode || property.id);

  const isNew =
    property.dateAdded &&
    Date.now() - new Date(property.dateAdded).getTime() < 7 * 24 * 60 * 60 * 1000;

  const realImg = hasRealImage(property.images[0]);

  const whatsappMsg = `Hello Realtor X, I'm interested in: ${property.title} (${property.erpCode}) - ${property.priceFormatted}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="group bg-slate-900/70 border border-slate-800 hover:border-[#2490EF]/60 rounded-3xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-[#2490EF]/10 hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <div className="relative h-56 w-full overflow-hidden bg-slate-950">
          {realImg ? (
            <img
              src={property.images[0]}
              alt={property.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/80 to-slate-900">
              <ImageOff className="w-10 h-10 text-slate-600 mb-2" strokeWidth={1.5} />
              <span className="text-xs text-slate-500 font-mono">No Image</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md border border-white/10 text-white">
              {property.category}
            </span>
          </div>

          <button
            onClick={(e) => onToggleFavorite(property.erpCode, e)}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
              isFavorite
                ? 'bg-red-500/90 border-red-400 text-white shadow-lg shadow-red-500/30'
                : 'bg-slate-950/60 border-white/10 text-slate-300 hover:bg-slate-950/90 hover:text-red-400'
            }`}
            aria-label="Save"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                {property.status && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#28A745] text-white shadow-md">
                    {property.status}
                  </span>
                )}
                {isNew && (
                  <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F5A623] text-slate-950 shadow-md">
                    <Sparkles className="w-2.5 h-2.5" />
                    New
                  </span>
                )}
              </div>
              <div className="text-xl font-bold text-[#F5A623] font-mono leading-none drop-shadow-lg">
                {property.priceFormatted}
              </div>
            </div>

            <span className="text-[11px] bg-slate-950/80 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg font-mono text-white shrink-0">
              {property.size} {property.sizeUnit}
            </span>
          </div>

          {property.images.length > 1 && realImg && (
            <span className="absolute top-3 right-14 text-[10px] bg-slate-950/80 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg font-mono text-white">
              {property.images.length} photos
            </span>
          )}
        </div>

        <div className="p-5 space-y-3">
          <h3 className="font-heading font-bold text-base text-white group-hover:text-[#2490EF] transition-colors leading-snug line-clamp-2 min-h-[2.6rem]">
            {property.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
            <span className="truncate">
              {property.precinct || property.project || 'Bahria Town Karachi'}
            </span>
          </div>

          {(property.bedrooms || property.bathrooms) && (
            <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
              {property.bedrooms ? (
                <span className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-slate-500" />
                  {property.bedrooms}
                </span>
              ) : null}
              {property.bathrooms ? (
                <span className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-slate-500" />
                  {property.bathrooms}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between gap-2">
          <div className="text-[10px] text-slate-500 font-mono truncate min-w-0 flex items-center gap-1">
            <Building2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{property.erpCode}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-lg bg-[#25D366] hover:bg-[#1ebe5b] text-white flex items-center justify-center transition-all shadow-md shadow-[#25D366]/30"
              aria-label="WhatsApp"
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </a>

            <button
              onClick={handleClick}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-[#2490EF] rounded-lg transition-all flex items-center gap-1 group/btn"
            >
              <span>Details</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyListItem: React.FC<{
  property: Property;
  onNavigate: (page: PageId, extraId?: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (erpCode: string, e: React.MouseEvent) => void;
}> = ({ property, onNavigate, isFavorite, onToggleFavorite }) => {
  const handleClick = () => onNavigate('property-detail', property.erpCode || property.id);

  const isNew =
    property.dateAdded &&
    Date.now() - new Date(property.dateAdded).getTime() < 7 * 24 * 60 * 60 * 1000;

  const realImg = hasRealImage(property.images[0]);
  const whatsappMsg = `Hello Realtor X, I'm interested in: ${property.title} (${property.erpCode}) - ${property.priceFormatted}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="group bg-slate-900/70 border border-slate-800 hover:border-[#2490EF]/60 rounded-3xl overflow-hidden transition-all hover:shadow-xl hover:shadow-[#2490EF]/10">
      <div className="flex flex-col sm:flex-row min-w-0">
        <div className="sm:w-64 h-52 sm:h-auto sm:min-h-[200px] shrink-0 relative overflow-hidden bg-slate-950">
          {realImg ? (
            <img
              src={property.images[0]}
              alt={property.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800/80 to-slate-900">
              <ImageOff className="w-10 h-10 text-slate-600" strokeWidth={1.5} />
            </div>
          )}

          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md border border-white/10 text-white">
            {property.category}
          </span>

          <button
            onClick={(e) => onToggleFavorite(property.erpCode, e)}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
              isFavorite
                ? 'bg-red-500/90 border-red-400 text-white'
                : 'bg-slate-950/60 border-white/10 text-slate-300 hover:text-red-400'
            }`}
            aria-label="Save"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {property.images.length > 1 && realImg && (
            <span className="absolute bottom-3 right-3 text-[10px] bg-slate-950/80 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg font-mono text-white">
              {property.images.length} photos
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col justify-between">
          <div className="min-w-0">
            <div className="flex items-start gap-3 mb-2 min-w-0">
              <h3 className="font-heading font-bold text-base sm:text-lg text-white group-hover:text-[#2490EF] transition-colors leading-snug flex-1 min-w-0 line-clamp-2">
                {property.title}
              </h3>

              <div className="flex flex-col gap-1 items-end shrink-0">
                {property.status && (
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[#28A745] text-white whitespace-nowrap">
                    {property.status}
                  </span>
                )}
                {isNew && (
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[#F5A623] text-slate-950 whitespace-nowrap">
                    New
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
              <span className="truncate">
                {property.precinct || property.project || 'Bahria Town Karachi'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs mb-3">
              <div className="min-w-0">
                <div className="text-slate-500 mb-0.5 uppercase tracking-wider text-[10px]">Size</div>
                <div className="text-white font-semibold truncate">
                  {property.size} {property.sizeUnit}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-slate-500 mb-0.5 uppercase tracking-wider text-[10px]">Price</div>
                <div className="text-[#F5A623] font-bold font-mono truncate">
                  {property.priceFormatted}
                </div>
              </div>
              {property.ownership && (
                <div className="min-w-0">
                  <div className="text-slate-500 mb-0.5 uppercase tracking-wider text-[10px]">Ownership</div>
                  <div className="text-white font-semibold truncate">{property.ownership}</div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 mt-1 border-t border-slate-800 flex items-center justify-between gap-2 min-w-0">
            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 truncate min-w-0">
              <Building2 className="w-3 h-3 shrink-0" />
              <span className="truncate">{property.erpCode}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 rounded-lg bg-[#25D366] hover:bg-[#1ebe5b] text-white flex items-center justify-center transition-all shadow-md shadow-[#25D366]/30"
                aria-label="WhatsApp"
                title="Chat on WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
              <button
                onClick={handleClick}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-[#2490EF] rounded-lg transition-all flex items-center gap-1 group/btn whitespace-nowrap"
              >
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
