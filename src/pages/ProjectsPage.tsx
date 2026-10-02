import React, { useEffect, useState } from 'react';
import { PageId, Language } from '../types';
import { fetchProjects, Project } from '../services/propertyService';
import {
  Building,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  ImageOff,
} from 'lucide-react';

interface ProjectsPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProjects();
        setProjects(data);
        if (data.length === 0) setError('No projects available yet.');
      } catch (err) {
        console.error(err);
        setError('Failed to load projects.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ─── Loading ───
  if (loading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="h-6 bg-slate-800/60 rounded w-40 mx-auto animate-pulse" />
          <div className="h-12 bg-slate-800/60 rounded w-96 mx-auto animate-pulse" />
          <div className="h-4 bg-slate-800/40 rounded w-2/3 mx-auto animate-pulse" />
        </div>
        <div className="space-y-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-800 grid grid-cols-1 lg:grid-cols-12 overflow-hidden animate-pulse"
            >
              <div className="lg:col-span-5 h-72 lg:h-auto bg-slate-800/50" />
              <div className="lg:col-span-7 p-10 space-y-4">
                <div className="h-4 bg-slate-800/60 rounded w-40" />
                <div className="h-8 bg-slate-800/60 rounded w-3/4" />
                <div className="h-4 bg-slate-800/40 rounded w-full" />
                <div className="h-4 bg-slate-800/40 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Error ───
  if (error && projects.length === 0) {
    return (
      <div className="py-20 max-w-2xl mx-auto px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Projects Coming Soon</h2>
        <p className="text-slate-400 mb-8">{error}</p>
        <button
          onClick={() => onNavigate('contact')}
          className="px-6 py-3 bg-[#2490EF] hover:bg-[#1b7ecf] text-white font-semibold rounded-xl transition-colors"
        >
          Contact Us
        </button>
      </div>
    );
  }

  // ─── Main ───
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#2490EF] bg-[#2490EF]/10 border border-[#2490EF]/30 px-3.5 py-1 rounded-full">
          <Building className="w-3.5 h-3.5" />
          <span>Master Developments</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold text-white font-heading">
          Projects in Bahria Town Karachi
        </h1>

        <p className="text-sm sm:text-base text-slate-300">
          Explore the established and emerging master-planned destinations where Realtor X custodians manage active verified inventories.
        </p>
      </div>

      {/* Projects List */}
      <div className="space-y-10">
        {projects.map((project) => {
          const hasImg = !!project.heroImageUrl;

          return (
            <div
              key={project.id}
              className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 items-stretch"
            >
              {/* Image side */}
              <div className="lg:col-span-5 h-72 sm:h-96 lg:h-auto relative bg-slate-950">
                {hasImg ? (
                  <img
                    src={project.heroImageUrl!}
                    alt={project.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/80 to-slate-900">
                    <ImageOff className="w-12 h-12 text-slate-600 mb-3" strokeWidth={1.5} />
                    <span className="text-xs text-slate-500 font-mono">No Image</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950 via-transparent to-transparent pointer-events-none" />

                {project.status && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F5A623] text-slate-950 shadow-lg">
                      {project.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Content side */}
              <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  {/* Location */}
                  {(project.location || project.city || project.address) && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-[#2490EF]" />
                      <span>{project.location || project.city || project.address}</span>
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                    {project.name}
                  </h2>

                  {/* Tagline */}
                  {project.tagline && (
                    <p className="text-sm text-[#F5A623] font-medium">
                      {project.tagline}
                    </p>
                  )}

                  {/* Description */}
                  {project.description && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {project.description}
                    </p>
                  )}

                  {/* Key Highlights */}
                  {project.keyHighlights.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                        Key Infrastructure Highlights
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {project.keyHighlights.map((hl, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#28A745] shrink-0" />
                            <span>{hl}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Precincts */}
                  {project.precincts.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                        Active Precincts
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {project.precincts.map((prec, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-md text-[11px] bg-slate-950 border border-slate-800 text-slate-300"
                          >
                            {prec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                  <span className="text-xs font-mono text-slate-400">
                    <span className="text-white font-bold text-base tabular-nums">
                      {project.totalProperties}
                    </span>{' '}
                    Active Verified {project.totalProperties === 1 ? 'Listing' : 'Listings'}
                  </span>

                  <button
                    onClick={() => onNavigate('properties')}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] transition-all flex items-center gap-2 shadow-lg shadow-[#2490EF]/25 group/btn"
                  >
                    <span>View Project Properties</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
