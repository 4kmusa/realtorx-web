// Project (/projects/<id>): gallery, overview, unit types with live availability, 3D, floor plans, payment plan,
// amenities, location and nearby places, construction updates, the developer and the units on sale, with a contact
// panel that stays in view (a bar at the bottom on phones). Sections without data are left out.
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Bath, BedDouble, Box, Building2, Check, FileDown, Images, MapPin, MessageCircle, Phone, Ruler, Rotate3d,
} from 'lucide-react';
import { PageId } from '../types';
import InquiryModal from '../components/InquiryModal';
import RequestModal from '../features/requests/RequestModal';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { Button, ButtonLink, Container, Tag, XMark, useReveal } from '../components/site/ui';
import Lightbox from '../components/ui/Lightbox';
import { FEATURES, SITE, whatsappUrl } from '../config/site';
import { ListingCard } from '../features/marketplace/ListingCard';
import { PublicListing, formatArea, formatPrice, imageUrl, mapEmbedUrl, planLineAmount } from '../features/marketplace/api';
import { ProjectPage, PublicProject, UnitType, getProject, getProjectUnits, projectStage } from '../features/projects/api';
import { markNotFound } from '../utils/seo';

type Nav = (page: PageId, id?: string) => void;
type Project = PublicProject & ProjectPage;

const year = (d?: string | null) => (d ? new Date(`${d}T00:00:00`).getFullYear() : null);
const month = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
const range = (lo?: number | null, hi?: number | null, fmt: (v: number) => string = String) =>
  lo == null ? '—' : hi == null || hi === lo ? fmt(lo) : `${fmt(lo)} – ${fmt(hi)}`;
const label = 'mb-6 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3';

function TypeCard({ t, onPlan, onUnits }: { t: UnitType; onPlan?: () => void; onUnits: () => void }) {
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[17px] font-medium text-fg">{t.label}</h3>
          <p className="mt-1 flex flex-wrap gap-x-3 text-[13px] text-fg-3">
            {t.bedrooms ? <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {t.bedrooms} bed</span> : null}
            {t.bathrooms ? <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {t.bathrooms} bath</span> : null}
            {t.size_min ? <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {range(t.size_min, t.size_max, (v) => formatArea(v, t.size_unit))}</span> : null}
          </p>
        </div>
        {onPlan && (
          <button onClick={onPlan} className="shrink-0 overflow-hidden rounded-lg border border-line" aria-label={`Floor plan of ${t.label}`}>
            <img src={imageUrl(t.floor_plan) || ''} alt="" className="h-14 w-14 bg-white object-cover" />
          </button>
        )}
      </div>
      <p className="mt-4 text-[19px] font-medium tracking-[-0.01em] text-fg">{range(t.price_min, t.price_max, (v) => formatPrice(v, t.purpose))}</p>
      <div className="mt-auto flex items-center justify-between pt-5">
        <span className={`text-[13px] ${t.available ? 'text-emerald-400' : 'text-fg-3'}`}>{t.available ? `${t.available} of ${t.units} available` : 'Sold out'}</span>
        <button onClick={onUnits} className="text-[13px] text-fg-2 underline underline-offset-4 hover:text-fg">See units</button>
      </div>
    </div>
  );
}

export default function ProjectDetailPage({ projectId, onNavigate }: { projectId: string; onNavigate: Nav }) {
  const [project, setProject] = useState<Project | null>(null);
  const [units, setUnits] = useState<PublicListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [interest, setInterest] = useState<PublicListing | null>(null);
  const [visit, setVisit] = useState(false);
  const [viewer, setViewer] = useState<{ images: { src: string; caption?: string | null }[]; start: number } | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [active, setActive] = useState('overview');
  useReveal([units]);
  useEffect(() => {
    document.body.classList.add('rx-bottom-bar'); // the page's own WhatsApp bar replaces the floating button on phones
    return () => document.body.classList.remove('rx-bottom-bar');
  }, []);

  useEffect(() => {
    if (!projectId) return;
    setError(null);
    getProject(projectId)
      .then((p) => {
        setProject(p);
        document.title = `${p.project_name} | RealtorX`;
      })
      .catch((e) => {
        if (e?.status === 404) markNotFound();
        setError(e?.message || 'This project is not available.');
      });
    getProjectUnits(projectId).then(setUnits).catch(() => setUnits([]));
  }, [projectId]);

  const photos = useMemo(() => {
    const list = (project?.gallery || []).map((g) => ({ src: imageUrl(g.image) || '', caption: g.caption }));
    const cover = imageUrl(project?.cover_image);
    return list.length ? list : cover ? [{ src: cover, caption: null }] : [];
  }, [project]);
  const plans = useMemo(() => (project?.floor_plans || []).map((p) => ({ src: imageUrl(p.image) || '', caption: p.title })), [project]);

  const sections = useMemo(() => {
    if (!project) return [];
    return [
      ['overview', 'Overview', true],
      ['types', 'Unit types', !!project.unit_types?.length],
      ['in3d', '3D', FEATURES.tours3d && (project.has_3d || project.has_tour)],
      ['plans', 'Floor plans', !!plans.length],
      ['payment', 'Payment plan', !!project.payment_plan],
      ['amenities', 'Amenities', !!project.amenities?.length],
      ['location', 'Location', !!(project.location?.latitude || project.location?.address || project.nearby?.length)],
      ['progress', 'Progress', !!project.updates?.length],
      ['developer', 'Developer', !!project.developer],
      ['units', 'Units', true],
    ].filter(([, , show]) => show) as [string, string, boolean][];
  }, [project, plans]);

  // Highlight the section in view in the sticky menu.
  useEffect(() => {
    if (!sections.length) return;
    const seen = new IntersectionObserver((entries) => {
      const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (top) setActive(top.target.id);
    }, { rootMargin: '-140px 0px -60% 0px' });
    sections.forEach(([id]) => { const el = document.getElementById(id); if (el) seen.observe(el); });
    return () => seen.disconnect();
  }, [sections]);

  if (error) {
    return (
      <Container className="py-24">
        <ErrorState title="This project is not available" message={error} />
        <div className="mt-6 text-center"><Button variant="secondary" onClick={() => onNavigate('projects')}>All projects</Button></div>
      </Container>
    );
  }
  if (!project) {
    return <Container className="py-14"><Skeleton className="mb-8 h-14 w-1/2" /><Skeleton className="aspect-[21/9] rounded-2xl" /></Container>;
  }

  const stats = project.stats || { units: 0, available: project.available_units || 0 };
  const priceRange = range(stats.price_min, stats.price_max, (v) => formatPrice(v));
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const showType = (t: UnitType) => { setTypeFilter(t.label); go('units'); };
  const facts: [string, string][] = ([
    ['Stage', projectStage(project.status)],
    ['Developer', project.developer_name],
    ['Type', project.project_type],
    ['Possession', year(project.expected_completion_date) ? String(year(project.expected_completion_date)) : null],
    ['Floors', stats.floors ? String(stats.floors) : null],
    ['Towers', stats.towers && stats.towers > 1 ? String(stats.towers) : null],
    ['Units', stats.units ? `${stats.available} of ${stats.units} available` : null],
    ['Plot size', project.building?.plot_size],
    ['Approvals', project.building?.approvals],
  ] as [string, string | null | undefined][]).filter(([, v]) => !!v) as [string, string][];
  const cheapest = project.unit_types?.find((t) => t.price_min)?.price_min ?? null;
  const map = project.location ? mapEmbedUrl({ latitude: project.location.latitude ?? null, longitude: project.location.longitude ?? null, location_area: project.location.address, city: project.location.city }) : null;
  const typeUnits = typeFilter ? new Set(project.unit_types?.find((t) => t.label === typeFilter)?.unit_ids || []) : null;
  const shownUnits = (units || []).filter((u) => !typeUnits || typeUnits.has(u.name));
  const waText = `Hello RealtorX, I am interested in ${project.project_name}${project.city ? `, ${project.city}` : ''}.`;

  return (
    <div className="min-h-screen bg-ink pb-28 lg:pb-24">
      <Container className="pt-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[13px] text-fg-3" aria-label="Breadcrumb">
          <button onClick={() => onNavigate('projects')} className="flex items-center gap-1.5 hover:text-fg"><ArrowLeft className="h-3.5 w-3.5" /> Projects</button>
          {project.city && <><span>/</span><span>{project.city}</span></>}
          <span>/</span><span className="text-fg-2">{project.project_name}</span>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {projectStage(project.status) && <Tag tone="blue">{projectStage(project.status)}</Tag>}
              <Tag tone="good">Checked by RealtorX</Tag>
            </div>
            <h1 className="text-balance text-[38px] font-medium leading-[1.02] tracking-[-0.035em] text-fg md:text-[60px]">{project.project_name}</h1>
            <p className="mt-3 flex items-center gap-2 text-[15px] text-fg-2"><MapPin className="h-4 w-4" strokeWidth={1.5} /> {[project.address, project.address?.toLowerCase().includes((project.city || '').toLowerCase()) ? null : project.city].filter(Boolean).join(', ') || '—'}</p>
            {project.custom_tagline && <p className="mt-3 max-w-2xl text-fg-2">{project.custom_tagline}</p>}
          </div>
          {stats.price_min ? (
            <div className="text-right">
              <p className="text-[13px] text-fg-3">Prices</p>
              <p className="text-[26px] font-medium tracking-[-0.02em] text-fg md:text-[32px]">{priceRange}</p>
            </div>
          ) : null}
        </div>

        {/* Gallery: one large image and up to four more; all photos open in the viewer. */}
        {photos.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-2 overflow-hidden rounded-2xl md:h-[520px] md:grid-cols-4 md:grid-rows-2">
            {photos.slice(0, 5).map((p, i) => {
              // Fill the 4 x 2 grid whatever the number of photos: one large, the rest share the right half.
              const n = Math.min(photos.length, 5);
              const span = i === 0 ? (n === 1 ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-2')
                : n === 2 ? 'md:col-span-2 md:row-span-2' : n === 3 || (n === 4 && i === 3) ? 'md:col-span-2' : '';
              return (
              <button key={i} onClick={() => setViewer({ images: photos, start: i })}
                className={`group relative overflow-hidden bg-panel ${i === 0 ? 'aspect-[4/3] md:aspect-auto' : 'hidden md:block'} ${span}`}>
                <img src={p.src} alt={p.caption || project.project_name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading={i ? 'lazy' : 'eager'} />
                {i === Math.min(4, photos.length - 1) && photos.length > 1 && (
                  <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white"><Images className="h-3.5 w-3.5" /> {photos.length} photos</span>
                )}
              </button>
              );
            })}
          </div>
        )}
      </Container>

      {/* Section menu: stays under the site header while scrolling. */}
      <div className="sticky top-[72px] z-30 mt-10 border-y border-line bg-ink/90 backdrop-blur">
        <Container>
          <div className="-mx-1 flex gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
            {sections.map(([id, text]) => (
              <button key={id} onClick={() => go(id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${active === id ? 'bg-fg text-ink' : 'text-fg-2 hover:text-fg'}`}>{text}</button>
            ))}
          </div>
        </Container>
      </div>

      <Container className="pt-12">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-20">
            <section id="overview" className="scroll-mt-40">
              <h2 className={label}>Overview</h2>
              <dl className="grid grid-cols-2 border-t border-line sm:grid-cols-3">
                {facts.map(([k, v]) => (
                  <div key={k} className="border-b border-line py-5 pr-4">
                    <dt className="text-[13px] text-fg-3">{k}</dt>
                    <dd className="mt-1.5 text-[16px] text-fg">{v}</dd>
                  </div>
                ))}
              </dl>
              {project.custom_description && <div className="prose-rx mt-10 max-w-none" dangerouslySetInnerHTML={{ __html: project.custom_description }} />}
              {project.custom_key_highlights && (
                <div className="mt-8">
                  <h3 className="mb-3 text-lg font-medium text-fg">Highlights</h3>
                  <div className="prose-rx max-w-none" dangerouslySetInnerHTML={{ __html: project.custom_key_highlights }} />
                </div>
              )}
            </section>

            {!!project.unit_types?.length && (
              <section id="types" className="scroll-mt-40">
                <h2 className={label}>Unit types</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {project.unit_types.map((t) => (
                    <TypeCard key={t.label} t={t} onUnits={() => showType(t)}
                      onPlan={t.floor_plan ? () => setViewer({ images: [{ src: imageUrl(t.floor_plan) || '', caption: `${t.label} floor plan` }], start: 0 }) : undefined} />
                  ))}
                </div>
                <p className="mt-3 text-xs text-fg-3">Prices and availability are live from the developer's inventory.</p>
              </section>
            )}

            {FEATURES.tours3d && (project.has_3d || project.has_tour) && (
              <section id="in3d" className="scroll-mt-40">
                <h2 className={label}>Explore in 3D</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {project.has_3d && (
                    <button onClick={() => onNavigate('project-3d', projectId)} className="flex items-start gap-4 rounded-2xl border border-line-2 bg-ink-2 p-5 text-left transition-colors hover:border-fg-3">
                      <Box className="mt-0.5 h-6 w-6 shrink-0 text-blue-2" strokeWidth={1.5} />
                      <span><span className="block text-[16px] text-fg">The whole project in 3D</span>
                        <span className="mt-1 block text-[13px] text-fg-3">Every tower and floor with live availability. Step into the furnished apartments and look around 360° in every room.</span></span>
                    </button>
                  )}
                  {project.has_tour && (
                    <button onClick={() => onNavigate('virtual-tour', `project/${projectId}`)} className="flex items-start gap-4 rounded-2xl border border-line-2 bg-ink-2 p-5 text-left transition-colors hover:border-fg-3">
                      <Rotate3d className="mt-0.5 h-6 w-6 shrink-0 text-blue-2" strokeWidth={1.5} />
                      <span><span className="block text-[16px] text-fg">360° photos</span>
                        <span className="mt-1 block text-[13px] text-fg-3">Real 360° photos of the show apartment, room by room.</span></span>
                    </button>
                  )}
                </div>
              </section>
            )}

            {plans.length > 0 && (
              <section id="plans" className="scroll-mt-40">
                <h2 className={label}>Floor plans</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {plans.map((p, i) => (
                    <button key={i} onClick={() => setViewer({ images: plans, start: i })} className="group overflow-hidden rounded-2xl border border-line bg-panel text-left">
                      <div className="aspect-[4/3] bg-white"><img src={p.src} alt={p.caption || ''} className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" /></div>
                      <p className="px-4 py-3 text-[14px] text-fg">{p.caption}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {project.payment_plan && (
              <section id="payment" className="scroll-mt-40">
                <h2 className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">Payment plan</h2>
                <p className="mb-6 text-[15px] text-fg-2">{project.payment_plan.name} · {project.payment_plan.summary}</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead className="text-left text-[12px] text-fg-3">
                      <tr className="border-b border-line"><th className="py-3 pr-4 font-normal">Payment</th><th className="hidden py-3 pr-4 font-normal sm:table-cell">When</th><th className="py-3 pr-4 text-right font-normal">Share</th>
                        {cheapest ? <th className="py-3 text-right font-normal">From</th> : null}</tr>
                    </thead>
                    <tbody className="text-fg">
                      {project.payment_plan.lines.map((l, i) => {
                        const amount = planLineAmount(cheapest, l);
                        const when = l.kind === 'Installments'
                          ? `${l.installments} × every ${l.every_months === 1 ? 'month' : `${l.every_months} months`}`
                          : l.on_possession ? 'On possession' : l.due_after_days ? `${l.due_after_days} days after booking` : 'On booking';
                        return (
                          <tr key={i} className="border-b border-line">
                            <td className="py-4 pr-4">{l.label}<span className="mt-1 block text-[12px] text-fg-3 sm:hidden">{when}</span></td>
                            <td className="hidden py-4 pr-4 text-fg-2 sm:table-cell">{when}</td>
                            <td className="py-4 pr-4 text-right tabular-nums text-fg-2">{l.percent}%</td>
                            {cheapest ? <td className="py-4 text-right tabular-nums">{amount ? `${formatPrice(Math.round(amount))}${l.kind === 'Installments' ? ' each' : ''}` : '—'}</td> : null}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-fg-3">{cheapest ? `"From" uses the lowest unit price (${formatPrice(cheapest)}). ` : ''}Each unit's page shows its own schedule.</p>
              </section>
            )}

            {!!project.amenities?.length && (
              <section id="amenities" className="scroll-mt-40">
                <h2 className={label}>Amenities</h2>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  {project.amenities.map((g) => (
                    <div key={g.group}>
                      <h3 className="mb-3 text-[15px] font-medium text-fg">{g.group}</h3>
                      <ul className="space-y-2.5">
                        {g.items.map((a) => <li key={a} className="flex items-center gap-3 text-[15px] text-fg-2"><Check className="h-4 w-4 text-blue-2" strokeWidth={1.75} /> {a}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(map || !!project.nearby?.length) && (
              <section id="location" className="scroll-mt-40">
                <h2 className={label}>Location</h2>
                {map && (
                  <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-line bg-panel">
                    <iframe title="Map" src={map} className="h-full w-full grayscale invert-[0.92] hue-rotate-180" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                )}
                {project.location?.map_link && (
                  <a href={project.location.map_link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[13px] text-fg-2 underline underline-offset-4 hover:text-fg">Open in Google Maps</a>
                )}
                {!!project.nearby?.length && (
                  <ul className="mt-8 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                    {project.nearby.map((n, i) => (
                      <li key={i} className="flex items-center justify-between gap-4 border-b border-line py-3.5">
                        <span className="text-[15px] text-fg">{n.place}<span className="ml-2 text-[12px] text-fg-3">{n.kind}</span></span>
                        <span className="shrink-0 text-[14px] tabular-nums text-fg-2">{n.distance || ''}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {!!project.updates?.length && (
              <section id="progress" className="scroll-mt-40">
                <h2 className={label}>Construction progress</h2>
                <ol className="relative space-y-10 border-l border-line pl-7">
                  {project.updates.map((u, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[33px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-2" aria-hidden="true" />
                      <p className="text-[12px] uppercase tracking-[0.16em] text-fg-3">{month(u.date)}</p>
                      <h3 className="mt-1 text-[17px] font-medium text-fg">{u.title}</h3>
                      {u.progress != null && (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-blue-2" style={{ width: `${Math.min(100, u.progress)}%` }} /></div>
                          <span className="text-[13px] tabular-nums text-fg-2">{u.progress}%</span>
                        </div>
                      )}
                      {u.note && <p className="mt-2 max-w-2xl text-[14px] text-fg-2">{u.note}</p>}
                      {u.photos.length > 0 && (
                        <div className="mt-4 flex gap-2">
                          {u.photos.map((p, k) => {
                            const all = u.photos.map((x) => ({ src: imageUrl(x) || '', caption: `${u.title} · ${month(u.date)}` }));
                            return (
                              <button key={k} onClick={() => setViewer({ images: all, start: k })} className="h-24 w-32 overflow-hidden rounded-lg border border-line">
                                <img src={imageUrl(p) || ''} alt="" className="h-full w-full object-cover" loading="lazy" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {project.developer && (
              <section id="developer" className="scroll-mt-40">
                <h2 className={label}>Developer</h2>
                <div className="flex flex-col gap-6 rounded-2xl border border-line bg-panel p-6 sm:flex-row">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                    {project.developer.logo ? <img src={imageUrl(project.developer.logo) || ''} alt="" className="h-full w-full object-contain p-2" /> : <Building2 className="h-8 w-8 text-ink" strokeWidth={1.5} />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[19px] font-medium text-fg">{project.developer.name}</h3>
                    {project.developer.about && <p className="mt-2 text-[14px] leading-relaxed text-fg-2">{project.developer.about}</p>}
                    <p className="mt-3 text-[13px] text-fg-3">Under contract with RealtorX.</p>
                  </div>
                </div>
                {project.developer.projects.length > 0 && (
                  <>
                    <h3 className="mb-4 mt-8 text-[15px] font-medium text-fg">More from {project.developer.name}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {project.developer.projects.map((p) => (
                        <button key={p.name} onClick={() => onNavigate('project-details', p.name)} className="group overflow-hidden rounded-2xl border border-line bg-panel text-left">
                          <div className="aspect-[16/10] bg-ink-2">{p.cover_image && <img src={imageUrl(p.cover_image) || ''} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />}</div>
                          <div className="px-4 py-3"><p className="text-[15px] text-fg">{p.project_name}</p><p className="text-[12px] text-fg-3">{[projectStage(p.status), p.city].filter(Boolean).join(' · ')}</p></div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}
          </div>

          <aside className="hidden h-fit lg:sticky lg:top-40 lg:block">
            <div className="rounded-2xl border border-line bg-panel p-7">
              <p className="text-[13px] text-fg-3">Prices</p>
              <p className="mt-1 text-2xl font-medium tracking-[-0.02em] text-fg">{stats.price_min ? priceRange : 'On request'}</p>
              {stats.units ? <p className="mt-2 text-[14px] text-fg-2">{stats.available} of {stats.units} units available</p> : null}
              <div className="my-6 h-px bg-line" />
              <div className="grid gap-2.5">
                <Button size="lg" onClick={() => setVisit(true)}>Book a site visit</Button>
                <ButtonLink size="lg" variant="secondary" href={whatsappUrl(waText)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp</ButtonLink>
                <ButtonLink variant="ghost" href={`tel:${SITE.phoneTel}`}><Phone className="h-4 w-4" /> {SITE.phoneDisplay}</ButtonLink>
                {project.brochure && <ButtonLink variant="ghost" href={imageUrl(project.brochure) || '#'} target="_blank" rel="noreferrer"><FileDown className="h-4 w-4" strokeWidth={1.5} /> Download brochure</ButtonLink>}
              </div>
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-white/[0.03] p-4 text-[13px] leading-relaxed text-fg-2">
                <XMark className="mt-1 h-3 w-3 shrink-0" />
                <span>Checked by RealtorX. Your contact details stay private until you ask us to call.</span>
              </div>
            </div>
          </aside>
        </div>

        <section id="units" className="mt-24 scroll-mt-40">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-medium tracking-[-0.03em] text-fg md:text-[44px]">Available <span className="em">units</span></h2>
            {!!project.unit_types?.length && (
              <div className="flex flex-wrap gap-2">
                {[null, ...project.unit_types.map((t) => t.label)].map((t) => (
                  <button key={t || 'all'} onClick={() => setTypeFilter(t)} aria-pressed={typeFilter === t}
                    className={`h-9 rounded-full border px-4 text-[13px] ${typeFilter === t ? 'border-fg bg-fg text-ink' : 'border-line-2 text-fg-2 hover:text-fg'}`}>{t || 'All'}</button>
                ))}
              </div>
            )}
          </div>
          {!units ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="aspect-[4/3] rounded-xl" />)}</div>
          ) : shownUnits.length === 0 ? (
            <EmptyState icon={Building2} title="No units on sale right now" description="The developer releases inventory in phases. Ask us to tell you when new units open." actionLabel="Contact RealtorX" onAction={() => onNavigate('contact')} />
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {shownUnits.map((u) => (
                <div key={u.name} className="reveal">
                  <ListingCard item={u} onOpen={() => onNavigate('property-detail', u.name)} onInterest={() => setInterest(u)} />
                </div>
              ))}
            </div>
          )}
        </section>
      </Container>

      {/* Phones: the contact actions as a bar at the bottom. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line bg-ink/95 p-3 backdrop-blur lg:hidden">
        <Button className="flex-1" onClick={() => setVisit(true)}>Site visit</Button>
        <ButtonLink className="flex-1" variant="secondary" href={whatsappUrl(waText)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp</ButtonLink>
      </div>

      {viewer && <Lightbox images={viewer.images} start={viewer.start} onClose={() => setViewer(null)} />}
      {visit && <RequestModal mode="visit" projectId={projectId} title={project.project_name} onClose={() => setVisit(false)} />}
      {interest && <InquiryModal propertyId={interest.name} propertyTitle={interest.property_title} onClose={() => setInterest(null)} />}
    </div>
  );
}
