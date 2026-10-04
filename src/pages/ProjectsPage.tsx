// src/pages/ProjectsPage.tsx
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
  Compass,
  TrendingUp,
  Award,
  Calendar,
} from 'lucide-react';

interface ProjectsPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

// ═══════════════════════════════════════════════════════
// Strip HTML tags from ERPNext rich text
// ═══════════════════════════════════════════════════════
function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
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
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
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

  useScrollReveal([projects.length, loading]);

  // ─── Loading Skeleton ───
  if (loading) {
    return (
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="h-6 bg-slate-800/60 rounded-full w-44 mx-auto animate-pulse" />
          <div className="h-14 bg-slate-800/60 rounded-2xl w-96 mx-auto animate-pulse" />
          <div className="h-4 bg-slate-800/40 rounded w-2/3 mx-auto animate-pulse" />
        </div>
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-800 grid grid-cols-1 lg:grid-cols-12 overflow-hidden animate-pulse"
            >
              <div className="lg:col-span-5 h-80 lg:h-auto bg-slate-800/50" />
              <div className="lg:col-span-7 p-10 space-y-5">
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
      <div className="py-24 max-w-2xl mx-auto px-4 text-center">
        <div className="w-24 h-24 mx-auto mb-7 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-slate-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3 font-heading">Projects Coming Soon</h2>
        <p className="text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">{error}</p>
        <button
          onClick={() => onNavigate('contact')}
          className="relative px-7 py-3.5 bg-[#2490EF] hover:bg-[#1b7ecf] text-white font-bold rounded-2xl transition-all shadow-xl shadow-[#2490EF]/25 active:scale-[0.98] overflow-hidden group inline-flex items-center gap-2"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <span className="relative z-10">Contact Us</span>
          <ArrowRight className="w-4 h-4 relative z-10" />
        </button>
      </div>
    );
  }

  // ─── Main ───
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

      {/* ═════ HEADER ═════ */}
      <div className="text-center max-w-3xl mx-auto scroll-reveal">
        <div className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[#2490EF] bg-[#2490EF]/[0.08] border border-[#2490EF]/25 px-4 py-2 rounded-full mb-7 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5A623]" />
          </span>
          <span>Master Developments</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-heading tracking-[-0.03em] leading-[1.05] mb-5 text-balance">
          Projects in <span className="gradient-text">Bahria Town</span> Karachi
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Explore the established and emerging master-planned destinations where Realtor X
          custodians manage active verified inventories.
        </p>
      </div>

      {/* ═════ PROJECTS LIST ═════ */}
      <div className="space-y-10">
        {projects.map((project, idx) => {
          const hasImg = !!project.heroImageUrl;
          const cleanDescription = stripHtml(project.description);

          return (
            <div
              key={project.id}
              className="group relative rounded-[2rem] overflow-hidden border border-white/[0.06] hover:border-[#2490EF]/30 transition-all duration-500 shadow-2xl shadow-black/30 hover:shadow-[0_25px_60px_-15px_rgba(36,144,239,0.25)] bg-gradient-to-br from-slate-900/60 to-slate-900/30 scroll-reveal"
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">

                {/* ═════ IMAGE SIDE ═════ */}
                <div className="lg:col-span-5 h-80 sm:h-96 lg:h-auto min-h-[400px] relative bg-slate-950 overflow-hidden">
                  {hasImg ? (
                    <img
                      src={project.heroImageUrl!}
                      alt={project.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-[1200ms] ease-out-expo"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/80 to-slate-900">
                      <ImageOff className="w-14 h-14 text-slate-600 mb-3" strokeWidth={1.5} />
                      <span className="text-xs text-slate-500 font-mono">No Image</span>
                    </div>
                  )}

                  {/* Gradient scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

                  {/* Status badge */}
                  {project.status && (
                    <div className="absolute top-5 left-5">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#F5A623] to-[#FFB84D] text-slate-950 shadow-lg shadow-[#F5A623]/40">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-60" /><span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950" /></span>
                        {project.status}
                      </span>
                    </div>
                  )}

                  {/* Project type badge */}
                  {project.projectType && (
                    <div className="absolute bottom-5 left-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-950/85 backdrop-blur-md border border-white/10 text-white">
                        <Building className="w-3 h-3 text-[#2490EF]" />
                        {project.projectType}
                      </span>
                    </div>
                  )}
                </div>

                {/* ═════ CONTENT SIDE ═════ */}
                <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12 flex flex-col justify-between gap-7">

                  <div className="space-y-4">
                    {/* Location */}
                    {(project.location || project.city || project.address) && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono uppercase tracking-[0.12em]">
                        <MapPin className="w-3.5 h-3.5 text-[#2490EF]" />
                        <span className="truncate">
                          {project.location || project.city || project.address}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-heading tracking-[-0.02em] leading-tight">
                      {project.name}
                    </h2>

                    {/* Tagline */}
                    {project.tagline && (
                      <p className="text-sm sm:text-base text-[#F5A623] font-medium leading-relaxed">
                        {project.tagline}
                      </p>
                    )}

                    {/* Description — HTML stripped */}
                    {cleanDescription && (
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {cleanDescription}
                      </p>
                    )}

                    {/* Key Highlights */}
                    {project.keyHighlights.length > 0 && (
                      <div className="pt-3">
                        <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3 font-mono">
                          <Award className="w-3 h-3 text-[#28A745]" />
                          Key Infrastructure Highlights
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {project.keyHighlights.map((hl, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2.5 text-xs text-slate-300 group/hl"
                            >
                              <div className="w-4 h-4 rounded-full bg-[#28A745]/15 border border-[#28A745]/40 flex items-center justify-center shrink-0 mt-0.5 group-hover/hl:scale-110 transition-transform">
                                <CheckCircle2 className="w-2.5 h-2.5 text-[#28A745]" />
                              </div>
                              <span className="leading-relaxed">{hl}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Active Precincts */}
                    {project.precincts.length > 0 && (
                      <div className="pt-3">
                        <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3 font-mono">
                          <Compass className="w-3 h-3 text-[#2490EF]" />
                          Active Precincts
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.precincts.map((prec, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.03] hover:bg-[#2490EF]/10 border border-white/[0.08] hover:border-[#2490EF]/40 text-slate-300 hover:text-white transition-all cursor-default"
                            >
                              {prec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ═════ ACTION FOOTER ═════ */}
                  <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-[#2490EF]" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-white font-heading tabular-nums leading-none">
                          {project.totalProperties}
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-slate-500 mt-1">
                          Active {project.totalProperties === 1 ? 'Listing' : 'Listings'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('properties')}
                      className="relative px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#2490EF] hover:bg-[#1b7ecf] transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#2490EF]/25 hover:shadow-[#2490EF]/40 overflow-hidden group/btn active:scale-[0.98]"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                      <span className="relative z-10">View Project Properties</span>
                      <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═════ BOTTOM CTA ═════ */}
      {projects.length > 0 && (
        <div className="relative rounded-[2rem] overflow-hidden border border-[#2490EF]/20 shadow-2xl shadow-[#2490EF]/10 scroll-reveal">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0E2849] via-[#0B1A30] to-[#0E2849]" />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                'radial-gradient(ellipse at 30% 50%, rgba(36, 144, 239, 0.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(245, 166, 35, 0.12) 0%, transparent 60%)',
            }}
          />
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#2490EF]/60 to-transparent" />

          <div className="relative p-10 sm:p-14 text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#FFA500] flex items-center justify-center shadow-xl shadow-[#F5A623]/30">
              <Building className="w-6 h-6 text-slate-950" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-heading tracking-[-0.02em] leading-tight max-w-2xl mx-auto text-balance">
              Ready to explore a project?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Browse all verified properties across Bahria Town Karachi's master-planned precincts.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                onClick={() => onNavigate('properties')}
                className="relative px-7 py-3.5 rounded-2xl text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] via-[#FFB84D] to-[#F5A623] hover:brightness-110 transition-all duration-300 shadow-xl shadow-[#F5A623]/30 hover:shadow-[#F5A623]/50 flex items-center gap-2 overflow-hidden group active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Compass className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Browse All Properties</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('contact')}
                className="px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/[0.2] backdrop-blur-md transition-all duration-300 flex items-center gap-2"
              >
                <span>Contact Our Team</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
