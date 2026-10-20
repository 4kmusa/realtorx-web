// Interactive 3D project page (/projects/<id>/3d[?preview=1]). The 3D library is loaded only here.
import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Bath, BedDouble, Box, Eye, Layers, Ruler, X } from 'lucide-react';
import { PageId } from '../../types';
import InquiryModal from '../../components/InquiryModal';
import RequestModal, { RequestMode } from '../requests/RequestModal';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatArea, formatPrice, imageUrl } from '../marketplace/api';
import { Building3D, Project3D, STATUS_STYLE, Unit3D, UnitStatus, getProject3D } from './api';

const BuildingViewer = React.lazy(() => import('./BuildingViewer'));
const PanoramaViewer = React.lazy(() => import('./PanoramaViewer'));

type Nav = (page: PageId, id?: string) => void;

function StatusPill({ status }: { status: UnitStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white">
      <span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLE[status].css}`} aria-hidden="true" />
      {STATUS_STYLE[status].label}
    </span>
  );
}

export default function Project3DPage({ projectId, onNavigate }: { projectId: string; onNavigate: Nav }) {
  const preview = new URLSearchParams(window.location.search).get('preview') === '1';
  const [data, setData] = useState<Project3D | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [floor, setFloor] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [tour, setTour] = useState<{ url: string; illustrative: boolean; type: string } | null>(null);
  const [interest, setInterest] = useState<Unit3D | null>(null);
  const [tourError, setTourError] = useState<string | null>(null);
  const [request, setRequest] = useState<{ mode: RequestMode; unit: Unit3D | null } | null>(null);
  const [loadLarge, setLoadLarge] = useState<Record<string, boolean>>({});
  const [inspect, setInspect] = useState<{ object: string | null; point: [number, number, number] | null } | null>(null);
  const copy = (text: string) => navigator.clipboard?.writeText(text).catch(() => undefined);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    getProject3D(projectId, preview)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setBuildingId((b) => b || d.buildings[0]?.id || null);
        document.title = `${d.project.name} in 3D | RealtorX`;
      })
      .catch((e) => !cancelled && setError(e?.status === 404 ? 'This project is not available.' : e?.message || 'Could not load the 3D view.'));
    return () => {
      cancelled = true;
    };
  }, [projectId, preview, tick]);

  const building: Building3D | null = data?.buildings.find((b) => b.id === buildingId) || null;
  const units = useMemo(() => Object.fromEntries((data?.units || []).map((u) => [u.id, u])), [data]);
  const statusByUnit = useMemo(() => Object.fromEntries((data?.units || []).map((u) => [u.id, u.status])), [data]) as Record<string, UnitStatus>;
  const labelByUnit = useMemo(() => Object.fromEntries((data?.units || []).map((u) => [u.id, u.code])), [data]);
  const floorLevelById = useMemo(() => Object.fromEntries((building?.floors || []).map((f) => [f.id, f.level])), [building]);
  const floorLabel = useMemo(() => Object.fromEntries((building?.floors || []).map((f) => [f.id, f.label])), [building]);
  // Keep the same array between status refreshes so the model is not reloaded every minute.
  const mappingsKey = JSON.stringify(building?.units || []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mappings = useMemo(() => building?.units || [], [mappingsKey]);
  const visible = mappings.filter((m) => !floor || m.floor === floor);
  const counts = useMemo(() => {
    const c: Record<UnitStatus, number> = { Available: 0, Reserved: 0, Sold: 0, Unavailable: 0 };
    for (const m of visible) c[statusByUnit[m.unit] || 'Unavailable'] += 1;
    return c;
  }, [visible, statusByUnit]);
  const unit = selected ? units[selected] : null;
  const mapping = selected ? mappings.find((m) => m.unit === selected) : null;

  // Refresh statuses every minute so the view never drifts far from ERPNext.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <ErrorState message={error} onRetry={() => setTick((t) => t + 1)} />
        <div className="mt-6 text-center"><button onClick={() => onNavigate('projects')} className="text-sm text-[#F5A623] hover:underline">All projects</button></div>
      </div>
    );
  }
  if (!data) return <div className="mx-auto max-w-7xl px-4 py-10"><Skeleton className="h-[70vh] rounded-2xl" /></div>;

  const exterior = building?.exterior;
  return (
    <div className="min-h-screen bg-[#0B1A30] pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <button onClick={() => onNavigate('project-details', projectId)} className="mb-2 flex items-center gap-2 text-sm text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Project page
            </button>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{data.project.name} <span className="text-[#F5A623]">in 3D</span></h1>
            <p className="text-sm text-slate-400">{[data.project.city, data.project.type].filter(Boolean).join(' · ')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!data.preview && (
              <button onClick={() => setRequest({ mode: 'visit', unit: null })} className="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/5">Request a site visit</button>
            )}
            {data.preview && <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-300">Staff preview (not public)</span>}
            {exterior?.illustrative && (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" /> Illustrative model, not architecturally verified
              </span>
            )}
          </div>
        </div>

        {data.buildings.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#081221] p-10 text-center">
            <Box className="mx-auto h-10 w-10 text-slate-500" />
            <p className="mt-3 font-semibold text-white">The 3D view for this project is not available yet.</p>
            <p className="mt-1 text-sm text-slate-400">You can still see the project details and available units.</p>
            <button onClick={() => onNavigate('project-details', projectId)} className="mt-5 rounded-xl bg-[#F5A623] px-5 py-2.5 text-sm font-bold text-slate-950">View project</button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="relative h-[58vh] min-h-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#081221] lg:h-[72vh]">
              {exterior && !viewerError && (exterior.size_mb || 0) > data.large_model_mb && !loadLarge[exterior.url] ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                  <Box className="h-10 w-10 text-[#F5A623]" />
                  <p className="text-sm text-slate-200">This 3D model is {exterior.size_mb?.toFixed(1)} MB.</p>
                  <button onClick={() => setLoadLarge((m) => ({ ...m, [exterior.url]: true }))} className="rounded-xl bg-[#F5A623] px-5 py-2.5 text-sm font-bold text-slate-950">
                    Load 3D model
                  </button>
                  <p className="text-xs text-slate-500">On mobile data? You can use the unit list on the right without loading the model.</p>
                </div>
              ) : exterior && !viewerError ? (
                <React.Suspense fallback={<Skeleton className="h-full w-full" />}>
                  <BuildingViewer
                    key={exterior.url}
                    modelUrl={imageUrl(exterior.url) || exterior.url}
                    mappings={mappings}
                    statusByUnit={statusByUnit}
                    labelByUnit={labelByUnit}
                    floorLevelById={floorLevelById}
                    activeFloor={floor}
                    selectedUnit={selected}
                    onSelectUnit={setSelected}
                    onError={setViewerError}
                    onInspect={data.preview ? setInspect : undefined}
                  />
                </React.Suspense>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-slate-300">
                  <AlertTriangle className="h-8 w-8 text-amber-400" />
                  <p>{viewerError || 'No 3D model is published for this building.'}</p>
                  <p className="text-xs text-slate-500">Use the unit list to see availability and details.</p>
                </div>
              )}
            </div>

            <aside className="space-y-4">
              {data.buildings.length > 1 && (
                <label className="block text-xs text-slate-400">
                  Building
                  <select className="mt-1 w-full rounded-lg border border-white/10 bg-[#081221] px-3 py-2 text-sm text-white" value={buildingId || ''}
                    onChange={(e) => { setBuildingId(e.target.value); setFloor(null); setSelected(null); setViewerError(null); }}>
                    {data.buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </label>
              )}

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400"><Layers className="h-3.5 w-3.5" /> Floor</p>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Select floor">
                  <button onClick={() => setFloor(null)} aria-pressed={floor === null} className={`rounded-lg border px-3 py-1.5 text-xs ${floor === null ? 'border-[#F5A623] bg-[#F5A623]/15 text-[#F5A623]' : 'border-white/10 text-slate-300'}`}>All</button>
                  {[...(building?.floors || [])].sort((a, b) => b.level - a.level).map((f) => (
                    <button key={f.id} onClick={() => setFloor(f.id)} aria-pressed={floor === f.id} className={`rounded-lg border px-3 py-1.5 text-xs ${floor === f.id ? 'border-[#F5A623] bg-[#F5A623]/15 text-[#F5A623]' : 'border-white/10 text-slate-300'}`}>{f.label}</button>
                  ))}
                </div>
              </div>

              {data.preview && (
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3 text-xs text-sky-100">
                  <p className="font-semibold text-sky-300">Mapping helper (staff)</p>
                  {inspect ? (
                    <div className="mt-2 space-y-1.5">
                      <p className="flex items-center justify-between gap-2">
                        <span>Object: <code className="text-white">{inspect.object || '—'}</code></span>
                        {inspect.object && <button className="underline" onClick={() => copy(inspect.object!)}>Copy</button>}
                      </p>
                      <p className="flex items-center justify-between gap-2">
                        <span>Hotspot X, Y, Z: <code className="text-white">{inspect.point ? inspect.point.join(', ') : '—'}</code></span>
                        {inspect.point && <button className="underline" onClick={() => copy(inspect.point!.join(', '))}>Copy</button>}
                      </p>
                      <p className="text-sky-200/70">Paste into RX Building → Unit Mapping: "Model Object Name", or "Hotspot (X, Y, Z)" for units without their own object.</p>
                    </div>
                  ) : (
                    <p className="mt-1 text-sky-200/80">Click anywhere on the model to see the object name and the 3D point.</p>
                  )}
                </div>
              )}
              <ul className="grid grid-cols-2 gap-2 text-xs" aria-label="Availability legend">
                {data.legend.map((s) => (
                  <li key={s} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-slate-200">
                    <span className="flex items-center gap-2"><span className={`h-3 w-3 rounded-sm ${STATUS_STYLE[s].css}`} aria-hidden="true" />{STATUS_STYLE[s].label}</span>
                    <b className="text-white">{counts[s]}</b>
                  </li>
                ))}
              </ul>

              {unit ? (
                <div className="rounded-2xl border border-[#F5A623]/30 bg-[#081221] p-4" aria-live="polite">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-400">Unit {mapping?.floor ? `· ${floorLabel[mapping.floor]}` : ''}</p>
                      <p className="text-xl font-bold text-white">{unit.code}</p>
                    </div>
                    <button onClick={() => setSelected(null)} aria-label="Close unit details" className="rounded p-1 text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-2"><StatusPill status={unit.status} /></div>
                  {unit.listed ? (
                    <>
                      <p className="mt-3 text-sm text-slate-200">{unit.title}</p>
                      <p className="mt-1 text-lg font-bold text-[#F5A623]">{formatPrice(unit.price, unit.purpose)}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-300">
                        {unit.category && <span>{unit.category}</span>}
                        {unit.size ? <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {formatArea(unit.size, unit.size_unit)}</span> : null}
                        {unit.is_studio ? <span>Studio</span> : unit.bedrooms ? <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {unit.bedrooms}</span> : null}
                        {unit.bathrooms ? <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {unit.bathrooms}</span> : null}
                        {unit.layout && <span>Layout: {unit.layout}</span>}
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">Details for this unit are not published.</p>
                  )}
                  <div className="mt-4 space-y-2">
                    {tourError && <p className="text-xs text-red-300" role="alert">{tourError}</p>}
                    {mapping?.interior ? (
                      <button onClick={() => { setTourError(null); setTour({ url: imageUrl(mapping.interior!.url) || mapping.interior!.url, illustrative: mapping.interior!.illustrative, type: mapping.interior!.type }); }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 py-2.5 text-sm text-white hover:bg-white/5">
                        <Eye className="h-4 w-4" /> Open interior tour
                      </button>
                    ) : (
                      <p className="text-xs text-slate-500">An interior tour is not available for this unit yet.</p>
                    )}
                    {unit.listed && unit.bookable ? (
                      <>
                        <button onClick={() => setRequest({ mode: 'booking', unit })} className="w-full rounded-xl bg-[#F5A623] py-2.5 text-sm font-bold text-slate-950 hover:brightness-110">Request booking</button>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => setRequest({ mode: 'visit', unit })} className="rounded-xl border border-white/15 py-2 text-xs text-white hover:bg-white/5">Request a visit</button>
                          <button onClick={() => setInterest(unit)} className="rounded-xl border border-white/15 py-2 text-xs text-white hover:bg-white/5">I&apos;m interested</button>
                        </div>
                        {!data.preview && <button onClick={() => onNavigate('property-detail', unit.id)} className="w-full rounded-xl py-1.5 text-xs text-slate-300 hover:text-white">Full listing</button>}
                      </>
                    ) : unit.listed && unit.status === 'Reserved' ? (
                      <>
                        <p className="rounded-lg bg-white/5 p-2 text-center text-xs text-slate-300">This unit is reserved. You can still visit or ask to be told if it becomes available.</p>
                        <button onClick={() => setRequest({ mode: 'visit', unit })} className="w-full rounded-xl border border-white/15 py-2 text-xs text-white hover:bg-white/5">Request a visit</button>
                      </>
                    ) : (
                      <p className="rounded-lg bg-white/5 p-2 text-center text-xs text-slate-300">This unit is {unit.status.toLowerCase()} and cannot be requested.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="rounded-xl bg-white/5 p-3 text-xs text-slate-400">Select a unit on the model or in the list below.</p>
              )}

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Units {floor ? `on ${floorLabel[floor]}` : ''}</p>
                <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
                  {visible.map((m) => {
                    const u = units[m.unit];
                    if (!u) return null;
                    return (
                      <li key={m.unit}>
                        <button onClick={() => setSelected(m.unit)} aria-pressed={selected === m.unit}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${selected === m.unit ? 'bg-[#F5A623]/15 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
                          <span className="font-mono">{u.code}</span>
                          <StatusPill status={u.status} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">Availability and prices come from RealtorX records and are checked again when you send a request. A request is not a confirmed booking.</p>
            </aside>
          </div>
        )}
      </div>

      {tour && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label="Interior tour">
          <div className="flex items-center justify-between gap-3 bg-[#081221] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Interior · Unit {unit?.code}</p>
              {tour.illustrative && <p className="text-xs text-amber-300">Illustrative visual; finishes and layout may differ.</p>}
            </div>
            <button onClick={() => setTour(null)} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4" /> Back to building
            </button>
          </div>
          <div className="flex-1">
            <React.Suspense fallback={<Skeleton className="h-full w-full" />}>
              {tour.type === '360 Panorama' ? (
                <PanoramaViewer url={tour.url} onError={(m) => { setTour(null); setTourError(m); }} />
              ) : (
                <BuildingViewer modelUrl={tour.url} mappings={[]} statusByUnit={{}} labelByUnit={{}} floorLevelById={{}} activeFloor={null} selectedUnit={null} onSelectUnit={() => undefined} onError={() => setTour(null)} />
              )}
            </React.Suspense>
          </div>
        </div>
      )}

      {request && (
        <RequestModal
          mode={request.mode}
          unitId={request.unit?.id}
          projectId={projectId}
          title={request.unit ? `Unit ${request.unit.code} · ${data.project.name}` : data.project.name}
          onClose={() => setRequest(null)}
          onDone={() => request.mode === 'booking' && setTick((t) => t + 1)}
        />
      )}
      {interest && <InquiryModal propertyId={interest.id} propertyTitle={`${interest.code} · ${interest.title || ''}`} onClose={() => setInterest(null)} />}
    </div>
  );
}
