import React, { useCallback, useEffect, useState } from 'react';
import { MapPin, ArrowRight, Building2, Layers } from 'lucide-react';
import { StatusBadge } from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';

interface Project {
  name: string;
  project_name: string;
  city?: string;
  project_type?: string;
  status?: string;
  project_image?: string;
}

export default function ProjectsPage({ onNavigate }: { onNavigate: (page: string, id?: string) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch('/api/erp/method/realtor_x.api.v1.get_public_projects')
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data?.message)) throw new Error('Unexpected response');
        setProjects(data.message);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load projects', err);
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openProject = (id: string) => onNavigate('project-details', id);

  return (
    <div className="min-h-screen bg-[#0B1A30] px-4 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center md:mb-14">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#F5A623]/25 bg-[#F5A623]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#F5A623]">
            <Building2 className="h-3.5 w-3.5" /> Portfolio
          </span>
          <h1 className="font-heading mb-3 text-4xl font-bold tracking-[-0.02em] text-white md:text-5xl">
            Projects &amp; Developments
          </h1>
          <p className="mx-auto max-w-2xl text-slate-400">
            Explore premium real estate developments by RealtorX — verified inventory, transparent status.
          </p>
          {!loading && !error && projects.length > 0 && (
            <p className="mt-3 text-sm text-slate-500">
              {projects.length} project{projects.length !== 1 && 's'} listed
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <ErrorState
            title="Could not load projects"
            message="We couldn't reach the server. Please check your connection and try again."
            onRetry={load}
            className="mx-auto max-w-lg"
          />
        )}

        {/* Empty */}
        {!loading && !error && projects.length === 0 && (
          <EmptyState
            icon={Building2}
            title="No Projects Yet"
            description="We are currently working on new projects. Please check back soon."
            actionLabel="Back to Home"
            onAction={() => onNavigate('home')}
            className="mx-auto max-w-lg"
          />
        )}

        {/* Grid */}
        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {projects.map((proj) => (
              <button
                key={proj.name}
                type="button"
                onClick={() => openProject(proj.name)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#081221] text-left shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:border-[#F5A623]/40 hover:shadow-[0_16px_40px_-16px_rgba(245,166,35,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-slate-800">
                  {proj.project_image ? (
                    <img
                      src={proj.project_image}
                      alt={proj.project_name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <Building2 className="h-16 w-16 text-slate-600 transition-colors group-hover:text-[#F5A623]/60" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#081221] to-transparent" />
                  <div className="absolute right-4 top-4">
                    <StatusBadge status={proj.status || 'Active'} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="mb-3 text-xl font-bold text-white transition-colors group-hover:text-[#F5A623]">
                    {proj.project_name}
                  </h3>

                  <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" /> {proj.city || 'Karachi'}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Layers className="h-4 w-4" /> {proj.project_type || 'Residential'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-slate-500">
                      {proj.name}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-semibold text-[#F5A623] transition-all group-hover:gap-2">
                      View Details <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
