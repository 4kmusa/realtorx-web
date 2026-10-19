import React, { useEffect, useState } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import { callGet } from '../services/api/client';
import { PageId } from '../types';

interface PublicProject {
  name: string;
  project_name: string;
  developer_name: string;
  city?: string;
  status?: string;
  available_units: number;
}

interface DeveloperGroup {
  developer: string;
  projects: PublicProject[];
  availableUnits: number;
}

function groupByDeveloper(projects: PublicProject[]): DeveloperGroup[] {
  const groups = new Map<string, DeveloperGroup>();
  for (const p of projects) {
    const key = p.developer_name || 'Developer not listed';
    const group = groups.get(key) || { developer: key, projects: [], availableUnits: 0 };
    group.projects.push(p);
    group.availableUnits += p.available_units || 0;
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => a.developer.localeCompare(b.developer));
}

export default function DevelopersPage({ onNavigate }: { onNavigate: (page: PageId, id?: string) => void }) {
  const [groups, setGroups] = useState<DeveloperGroup[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    callGet<PublicProject[]>('realtor_x.api.v1.get_public_projects')
      .then((rows) => setGroups(groupByDeveloper(rows || [])))
      .catch((err) => setError(err?.message || 'Could not load developers.'));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Developers</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">
        Developers whose projects are currently marketed by RealtorX. Unit counts show inventory available right now.
      </p>

      {error && (
        <div role="alert" className="mt-8 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}
      {!groups && !error && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" aria-label="Loading" />
        </div>
      )}
      {groups && groups.length === 0 && (
        <p className="mt-10 rounded-lg border border-white/10 p-8 text-center text-sm text-slate-400">
          No published projects yet.
        </p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {groups?.map((g) => (
          <section key={g.developer} className="rounded-2xl border border-white/10 bg-[#0B1A30] p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5A623]/10 text-[#F5A623]">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-semibold text-white">{g.developer}</h2>
              </div>
              <span className="whitespace-nowrap rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
                {g.availableUnits} available
              </span>
            </div>
            <ul className="mt-4 divide-y divide-white/5">
              {g.projects.map((p) => (
                <li key={p.name}>
                  <button
                    onClick={() => onNavigate('project-details', p.name)}
                    className="flex w-full items-center justify-between py-2.5 text-left text-sm hover:text-[#F5A623]"
                  >
                    <span className="text-slate-200">{p.project_name}</span>
                    <span className="text-xs text-slate-500">{[p.city, p.status].filter(Boolean).join(' · ')}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
