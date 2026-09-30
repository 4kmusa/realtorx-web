import React from 'react';
import { PageId, Language } from '../types';
import { MOCK_PROJECTS } from '../data/mockProperties';
import { Building, MapPin, CheckCircle2, ArrowRight, Home, ExternalLink } from 'lucide-react';

interface ProjectsPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate, language }) => {
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

      {/* Projects Grid */}
      <div className="space-y-10">
        {MOCK_PROJECTS.map((project, idx) => (
          <div
            key={project.id}
            className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 items-stretch"
          >
            {/* Image side */}
            <div className="lg:col-span-5 h-72 sm:h-96 lg:h-auto relative">
              <img
                src={project.heroImage}
                alt={project.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950 via-transparent to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F5A623] text-slate-950">
                  {project.status}
                </span>
              </div>
            </div>

            {/* Content side */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-[#2490EF]" />
                  <span>{project.location}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                  {project.name}
                </h2>

                <p className="text-sm text-[#F5A623] font-medium">
                  {project.tagline}
                </p>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {project.description}
                </p>

                {/* Highlights */}
                <div className="pt-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Key Infrastructure Highlights
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {project.keyHighlights.map((hl: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#28A745] shrink-0" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Precincts Chips */}
                <div className="pt-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Active Precincts
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {project.precincts.map((prec: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-md text-[11px] bg-slate-950 border border-slate-800 text-slate-300">
                        {prec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  {project.totalProperties}+ Active Verified Listings
                </span>
                <button
                  onClick={() => onNavigate('properties')}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] transition-all flex items-center gap-2 shadow"
                >
                  <span>View Project Properties</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
