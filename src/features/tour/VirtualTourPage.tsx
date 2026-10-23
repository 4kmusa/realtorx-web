// 360° virtual tour page (/properties/<id>/tour, /projects/<id>/tour): full-height viewer, room strip,
// full screen and phone-motion buttons. Staff preview (?preview=1) adds the arrow-position helper.
import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, Compass, Copy, Maximize2, Minimize2, Smartphone } from 'lucide-react';
import { PageId } from '../../types';
import { imageUrl } from '../marketplace/api';
import { Skeleton } from '../../components/ui/Skeleton';
import { getVirtualTour, parseTourRouteId, VirtualTour } from './api';
import { webglAvailable } from '../viewer3d/webgl';

const TourViewer = React.lazy(() => import('./TourViewer'));

type Nav = (page: PageId, id?: string) => void;

export default function VirtualTourPage({ routeId, onNavigate }: { routeId: string; onNavigate: Nav }) {
  const owner = parseTourRouteId(routeId);
  const preview = new URLSearchParams(window.location.search).get('preview') === '1';
  const [tour, setTour] = useState<VirtualTour | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [motion, setMotion] = useState(false);
  const [point, setPoint] = useState<{ yaw: number; pitch: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<import('./TourViewer').TourViewerHandle>(null);
  const canMotion = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window && window.matchMedia('(pointer: coarse)').matches;

  useEffect(() => {
    if (!owner) {
      setError('Tour not found.');
      return;
    }
    getVirtualTour(owner, preview)
      .then((t) => {
        if (!t || !t.scenes.length) throw new Error('This tour has no rooms yet.');
        setTour(t);
        setSceneId(t.start || t.scenes[0].id);
        document.title = `360° photos · ${t.subject} | RealtorX`;
      })
      .catch((e) => setError(e?.message?.includes('not found') ? 'This virtual tour is not available.' : e?.message || 'The tour could not be loaded.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const back = () => (owner?.kind === 'project' ? onNavigate('project-details', owner.id) : onNavigate('property-detail', owner?.id));
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else frameRef.current?.requestFullscreen?.();
  };
  const copyPoint = () => {
    if (!point) return;
    navigator.clipboard?.writeText(`${point.yaw}, ${point.pitch}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-ink px-4 pt-24 text-center text-fg-2">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-400" />
        <p>{error}</p>
        {owner && <button onClick={back} className="mt-4 text-sm text-fg underline underline-offset-4">Back</button>}
      </div>
    );
  }
  if (!tour || !sceneId) return <div className="min-h-screen bg-ink px-4 pt-8"><Skeleton className="mx-auto h-[70vh] max-w-6xl rounded-2xl" /></div>;

  const current = tour.scenes.find((s) => s.id === sceneId) || tour.scenes[0];
  const webgl = webglAvailable();

  return (
    <div className="min-h-screen bg-ink px-4 pb-10 pt-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <button onClick={back} className="mb-2 flex items-center gap-2 text-sm text-fg-2 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> {owner?.kind === 'project' ? 'Project page' : 'Back to listing'}
            </button>
            <h1 className="text-3xl font-medium tracking-[-0.03em] md:text-[44px]">{tour.subject} <span className="em">360° photos</span></h1>
            <p className="text-sm text-fg-2">{current.title}{current.floor ? ` · ${current.floor}` : ''} · {tour.scenes.length} room{tour.scenes.length === 1 ? '' : 's'}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {tour.preview && <span className="rounded-full bg-sky-500/15 px-3 py-1 font-semibold text-sky-300">Staff preview{tour.status !== 'Published' ? ` · ${tour.status}` : ''}</span>}
            {tour.illustrative && <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 font-semibold text-amber-300"><AlertTriangle className="h-3.5 w-3.5" /> Illustrative images, not real photos</span>}
          </div>
        </div>

        <div ref={frameRef} className={`relative overflow-hidden bg-black ${fullscreen ? 'h-screen w-screen' : 'h-[62vh] min-h-[380px] rounded-2xl border border-line'}`}>
          {webgl ? (
            <React.Suspense fallback={<Skeleton className="h-full w-full" />}>
              <TourViewer ref={viewerRef} tour={tour} sceneId={sceneId} onSceneChange={setSceneId} onError={setError} onInspect={tour.preview ? setPoint : undefined} />
            </React.Suspense>
          ) : (
            <div className="relative h-full w-full">
              <img src={imageUrl(current.url) || current.url} alt={`${current.title}, 360° photo`} className="h-full w-full object-cover" />
              <p className="absolute bottom-3 left-3 rounded bg-black/70 px-3 py-1 text-xs">This device cannot show the interactive view; the flat photo is shown instead.</p>
            </div>
          )}
          <div className="absolute right-3 top-3 flex gap-2">
            {canMotion && (
              <button onClick={async () => setMotion(await (viewerRef.current?.toggleMotion() ?? Promise.resolve(false)))} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs ${motion ? 'bg-fg text-ink' : 'bg-black/60 text-white'}`} aria-pressed={motion}>
                <Smartphone className="h-4 w-4" /> Motion
              </button>
            )}
            <button onClick={toggleFullscreen} className="flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-2 text-xs text-white hover:bg-black/80">
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />} {fullscreen ? 'Exit full screen' : 'Full screen'}
            </button>
          </div>
          <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-black/60 px-3 py-1.5 text-sm font-semibold">{current.title}</div>
          <p className="pointer-events-none absolute bottom-3 left-3 hidden items-center gap-1.5 rounded bg-black/55 px-2 py-1 text-[11px] text-fg sm:flex">
            <Compass className="h-3.5 w-3.5" /> Drag to look around · scroll or pinch to zoom · tap the arrows to walk
          </p>
          {fullscreen && (
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 overflow-x-auto bg-gradient-to-t from-black/80 to-transparent p-3">
              {tour.scenes.map((s) => (
                <RoomChip key={s.id} title={s.title} url={s.url} active={s.id === current.id} onClick={() => viewerRef.current?.goTo(s.id)} />
              ))}
            </div>
          )}
        </div>

        {!fullscreen && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1" role="list" aria-label="Rooms">
            {tour.scenes.map((s) => (
              <RoomChip key={s.id} title={s.title} url={s.url} active={s.id === current.id} onClick={() => viewerRef.current?.goTo(s.id)} />
            ))}
          </div>
        )}

        {tour.preview && (
          <div className="mt-4 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-100">
            <p className="font-semibold">Arrow position helper (staff)</p>
            <p className="mt-1 text-sky-200/80">Click a doorway in the photo, then copy the position into the arrow row (Desk → 360° Virtual Tours → Arrows → Position).</p>
            {point && (
              <p className="mt-2 flex flex-wrap items-center gap-2">
                <span>Room <b>{current.title}</b> · Yaw, Pitch: <code className="rounded bg-black/40 px-2 py-0.5">{point.yaw}, {point.pitch}</code></span>
                <button onClick={copyPoint} className="flex items-center gap-1 rounded bg-sky-500/30 px-2 py-0.5 text-xs hover:bg-sky-500/50">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy'}
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RoomChip({ title, url, active, onClick }: { title: string; url: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} role="listitem" aria-current={active} className={`group relative h-20 w-36 shrink-0 overflow-hidden rounded-xl border-2 text-left ${active ? 'border-fg' : 'border-line hover:border-white/40'}`}>
      <span className="absolute inset-0 bg-cover" style={{ backgroundImage: `url("${imageUrl(url) || url}")`, backgroundSize: '320% 160%', backgroundPosition: '50% 45%' }} aria-hidden="true" />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 pb-1.5 pt-5 text-xs font-medium text-fg">{title}</span>
    </button>
  );
}
