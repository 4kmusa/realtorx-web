// Projects (/projects): developments under contract with RealtorX.
import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { PageId } from '../types';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { Container, PageIntro, useReveal } from '../components/site/ui';
import { ProjectCard } from '../features/projects/ProjectCard';
import { PublicProject, getProjects } from '../features/projects/api';

export default function ProjectsPage({ onNavigate }: { onNavigate: (page: PageId, id?: string) => void }) {
  const [projects, setProjects] = useState<PublicProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useReveal([projects]);

  useEffect(() => {
    setError(null);
    getProjects().then(setProjects).catch((e) => setError(e?.message || 'Could not load the projects.'));
  }, [tick]);

  return (
    <div className="min-h-screen bg-ink pb-24">
      <PageIntro eyebrow="Projects" title={<>Developments we <span className="em">sell</span> for our partners.</>}
        intro="Each project is under a signed contract with RealtorX. Availability and prices come straight from the developer, unit by unit." />
      <Container className="pt-14">
        {error ? (
          <ErrorState message={error} onRetry={() => setTick((t) => t + 1)} />
        ) : !projects ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{[0, 1].map((i) => <Skeleton key={i} className="aspect-[16/11] rounded-2xl" />)}</div>
        ) : projects.length === 0 ? (
          <EmptyState icon={Building2} title="New projects are on the way" description="We publish a project once the developer has signed with RealtorX and the inventory is checked." />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {projects.map((p, i) => {
              const wide = projects.length === 1 || (i === 0 && projects.length % 2 === 1);
              return (
                <div key={p.name} className={`reveal ${wide ? 'md:col-span-2' : ''}`}>
                  <ProjectCard project={p} large={wide} onOpen={() => onNavigate('project-details', p.name)} />
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
