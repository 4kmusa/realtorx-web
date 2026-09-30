import React, { useState } from 'react';
import { PageId, Language, PropertyCategory, Property } from '../types';
import { MOCK_PROPERTIES } from '../data/mockProperties';
import { Search, Filter, Grid, List, MapPin, Bed, Bath, ArrowUpDown, ChevronRight, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface PropertiesPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({ onNavigate, language }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sizeRange, setSizeRange] = useState<string>('All');
  const [priceSort, setPriceSort] = useState<'default' | 'price-asc' | 'price-desc' | 'size-desc'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories: (string | PropertyCategory)[] = [
    'All',
    'Luxury Villa',
    'Residential Plot',
    'Apartment',
    'Commercial Shop',
    'Commercial Plot'
  ];

  const projects = [
    'All',
    'Bahria Town Karachi (BTK-1)',
    'Bahria Town Karachi 2 (BTK-2)',
    'Bahria Heights Karachi'
  ];

  // Filtering
  const filteredProperties = MOCK_PROPERTIES.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.precinct.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesProject = selectedProject === 'All' || p.project === selectedProject;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;

    let matchesSize = true;
    if (sizeRange === '125-sq-yards') matchesSize = p.size === 125;
    if (sizeRange === '250-sq-yards') matchesSize = p.size === 250;
    if (sizeRange === '500-sq-yards') matchesSize = p.size >= 500;

    return matchesSearch && matchesCategory && matchesProject && matchesStatus && matchesSize;
  }).sort((a, b) => {
    if (priceSort === 'price-asc') return a.pricePkr - b.pricePkr;
    if (priceSort === 'price-desc') return b.pricePkr - a.pricePkr;
    if (priceSort === 'size-desc') return b.size - a.size;
    return 0;
  });

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedProject('All');
    setSelectedStatus('All');
    setSizeRange('All');
    setPriceSort('default');
    setSearchQuery('');
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#2490EF] mb-1">
            <span>Marketplace</span>
            <span>·</span>
            <span>Bahria Town Karachi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading">
            Verified Property Listings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Showing {filteredProperties.length} active plots, villas, and commercial properties verified with Bahria records.
          </p>
        </div>

        {/* View Switcher & Sort */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[#2490EF] text-white' : 'text-slate-400 hover:text-white'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[#2490EF] text-white' : 'text-slate-400 hover:text-white'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <select
            value={priceSort}
            onChange={(e: any) => setPriceSort(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-[#2490EF]"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="size-desc">Size: Largest First</option>
          </select>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Filters */}
        <aside className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white font-semibold">
              <Filter className="w-4 h-4 text-[#2490EF]" />
              <span>Filters</span>
            </div>
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#F5A623] hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Search Keyword</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Precinct, villa, shop..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#2490EF]"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Property Category</label>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#2490EF]/15 text-[#2490EF] font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'All' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Bahria Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#2490EF]"
            >
              {projects.map((proj) => (
                <option key={proj} value={proj}>{proj}</option>
              ))}
            </select>
          </div>

          {/* Size Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Standard Plot / Villa Size</label>
            <select
              value={sizeRange}
              onChange={(e) => setSizeRange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#2490EF]"
            >
              <option value="All">All Sizes</option>
              <option value="125-sq-yards">125 Sq. Yards</option>
              <option value="250-sq-yards">250 Sq. Yards</option>
              <option value="500-sq-yards">500 Sq. Yards &amp; Above</option>
            </select>
          </div>

          {/* Availability Status */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Listing Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#2490EF]"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available for Immediate Transfer</option>
              <option value="Hot Deal">Hot Deals</option>
            </select>
          </div>

          {/* Dealer Commission Guarantee badge */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
            <span className="font-semibold text-[#F5A623] block">Co-Brokering Welcomed</span>
            <span>All properties open for 40/60 verified dealer commission splits.</span>
          </div>

        </aside>

        {/* Right Content: Property List / Grid */}
        <main className="lg:col-span-9 space-y-6">
          
          {filteredProperties.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-xl font-bold text-white font-heading">No Properties Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                We couldn't find any listings matching your active filters. Try adjusting your parameters or search term.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="group bg-slate-900/70 border border-slate-800 hover:border-[#2490EF]/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-52 w-full overflow-hidden">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#2490EF] text-white">
                          {property.category}
                        </span>
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

                    <div className="p-5 space-y-2.5">
                      <h3 className="font-heading font-bold text-base text-white group-hover:text-[#2490EF] transition-colors leading-snug line-clamp-1">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </div>

                      {(property.bedrooms || property.bathrooms) && (
                        <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
                          {property.bedrooms && <span>{property.bedrooms} Beds</span>}
                          {property.bathrooms && <span>· {property.bathrooms} Baths</span>}
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400 font-mono text-[11px]">{property.ownership}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {property.precinct.split('(')[0]}
                      </span>
                      <button
                        onClick={() => onNavigate('property-detail', property.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-[#2490EF] rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="space-y-4">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-slate-900/70 border border-slate-800 hover:border-[#2490EF]/60 rounded-2xl overflow-hidden p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-center justify-between transition-all"
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      referrerPolicy="no-referrer"
                      className="w-full sm:w-48 h-32 object-cover rounded-xl shrink-0"
                    />
                    <div className="space-y-1.5 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2490EF]/20 text-[#2490EF] border border-[#2490EF]/30">
                          {property.category}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {property.precinct}
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-lg text-white">
                        {property.title}
                      </h3>
                      <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#F5A623]" />
                        <span>{property.location}</span>
                      </div>
                      <div className="text-xs text-slate-300 font-mono">
                        {property.size} {property.sizeUnit} · Ownership: {property.ownership}
                      </div>
                    </div>
                  </div>

                  <div className="text-center sm:text-right flex flex-col items-center sm:items-end gap-2 shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                    <div className="text-xl font-bold text-[#F5A623] font-mono">
                      {property.priceFormatted}
                    </div>
                    <button
                      onClick={() => onNavigate('property-detail', property.id)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>View Full Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
