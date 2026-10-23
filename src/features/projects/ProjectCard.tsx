// Project card: a wide photo with the name and the essentials set over it.
import React from 'react';
import { ArrowUpRight, Building2 } from 'lucide-react';
import { imageUrl } from '../marketplace/api';
import { PublicProject, projectStage } from './api';

export function ProjectCard({ project, onOpen, large }: { project: PublicProject; onOpen: () => void; large?: boolean }) {
  const cover = imageUrl(project.cover_image);
  return (
    <button onClick={onOpen} className={`zoom reveal-img group relative block w-full overflow-hidden rounded-2xl bg-panel text-left ${large ? 'aspect-[16/10] md:aspect-[21/10]' : 'aspect-[4/5] sm:aspect-[16/11]'}`}>
      {cover ? <img src={cover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" /> : (
        <div className="absolute inset-0 flex items-center justify-center text-fg-3"><Building2 className="h-12 w-12" strokeWidth={1} /></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 md:p-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-fg-2">{[projectStage(project.status), project.city].filter(Boolean).join('  ·  ')}</p>
          <h3 className={`mt-3 font-medium tracking-[-0.03em] text-fg ${large ? 'text-3xl md:text-5xl' : 'text-2xl md:text-3xl'}`}>{project.project_name}</h3>
          <p className="mt-2 text-[14px] text-fg-2">
            {[project.developer_name && `by ${project.developer_name}`, project.available_units ? `${project.available_units} ${project.available_units === 1 ? 'unit' : 'units'} available` : null].filter(Boolean).join('  ·  ')}
          </p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-2 text-fg transition-colors duration-300 group-hover:border-fg group-hover:bg-fg group-hover:text-ink">
          <ArrowUpRight className="h-5 w-5" strokeWidth={1.5} />
        </span>
      </div>
    </button>
  );
}
