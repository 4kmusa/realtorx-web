// 360° virtual tour viewer: look around a room (drag, pinch/scroll zoom, arrow keys, phone motion), walk to
// the next room with the arrows on the floor (cross-fade with a short "step forward" zoom), slow auto-rotate
// until the visitor touches the view, full screen. Staff preview: a click reports the yaw/pitch under the pointer.
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { ChevronUp, Loader2 } from 'lucide-react';
import { imageUrl } from '../marketplace/api';
import { TourScene, VirtualTour } from './api';

const FOV = { min: 30, max: 95, start: 75 };
const DEG = Math.PI / 180;

/** Same convention as the server and the sample renders: yaw 0 = photo centre, positive = right. */
export function direction(yaw: number, pitch: number): THREE.Vector3 {
  const y = yaw * DEG;
  const p = pitch * DEG;
  return new THREE.Vector3(-Math.cos(y) * Math.cos(p), Math.sin(p), -Math.sin(y) * Math.cos(p));
}

function angles(dir: THREE.Vector3): { yaw: number; pitch: number } {
  const d = dir.clone().normalize();
  return { yaw: Math.atan2(-d.z, -d.x) / DEG, pitch: Math.asin(THREE.MathUtils.clamp(d.y, -1, 1)) / DEG };
}

const wrap = (yaw: number) => ((((yaw + 180) % 360) + 360) % 360) - 180;

export interface TourViewerHandle {
  goTo: (sceneId: string) => void;
  toggleMotion: () => Promise<boolean>;
}

interface Props {
  tour: VirtualTour;
  sceneId: string;
  onSceneChange: (sceneId: string) => void;
  onError: (message: string) => void;
  onInspect?: (point: { yaw: number; pitch: number }) => void;
}

const TourViewer = React.forwardRef<TourViewerHandle, Props>(function TourViewer({ tour, sceneId, onSceneChange, onError, onInspect }, ref) {
  const mountRef = useRef<HTMLDivElement>(null);
  const hotspotLayerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [arrows, setArrows] = useState<TourScene['hotspots']>([]);
  const propsRef = useRef({ onSceneChange, onError, onInspect });
  propsRef.current = { onSceneChange, onError, onInspect };
  const api = useRef<{ goTo: (id: string) => void; toggleMotion: () => Promise<boolean> }>({ goTo: () => undefined, toggleMotion: async () => false });

  useImperativeHandle(ref, () => ({ goTo: (id) => api.current.goTo(id), toggleMotion: () => api.current.toggleMotion() }), []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scenes = new Map(tour.scenes.map((s) => [s.id, s]));
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const scene3 = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV.start, mount.clientWidth / mount.clientHeight, 0.1, 200);
    const geometry = new THREE.SphereGeometry(50, 96, 64);
    geometry.scale(-1, 1, 1);
    const makeSphere = () => {
      const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ transparent: true, opacity: 1, depthWrite: false }));
      scene3.add(mesh);
      return mesh;
    };
    let front = makeSphere(); // current room
    let back = makeSphere(); // incoming room during a transition
    back.visible = false;

    // Textures: loaded once and kept, neighbours prefetched.
    const textures = new Map<string, Promise<THREE.Texture>>();
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const load = (s: TourScene) => {
      let p = textures.get(s.id);
      if (!p) {
        p = new Promise<THREE.Texture>((resolve, reject) =>
          loader.load(
            imageUrl(s.url) || s.url,
            (t) => {
              t.colorSpace = THREE.SRGBColorSpace;
              t.anisotropy = maxAniso;
              t.generateMipmaps = true;
              t.minFilter = THREE.LinearMipmapLinearFilter;
              resolve(t);
            },
            undefined,
            reject
          )
        );
        p.catch(() => textures.delete(s.id));
        textures.set(s.id, p);
      }
      return p;
    };
    const prefetch = (s: TourScene) => s.hotspots.forEach((h) => scenes.get(h.to) && load(scenes.get(h.to)!).catch(() => undefined));

    // View state.
    const view = { yaw: 0, pitch: 0, fov: FOV.start, vyaw: 0, vpitch: 0 };
    let current: TourScene | null = null;
    let interacted = !tour.auto_rotate;
    type Sphere = ReturnType<typeof makeSphere>;
    let transition: { start: number; from: Sphere; to: Sphere; zoomDir: THREE.Vector3 } | null = null;
    let dirty = true;
    let disposed = false;

    const applyCamera = () => {
      view.pitch = THREE.MathUtils.clamp(view.pitch, -85, 85);
      view.fov = THREE.MathUtils.clamp(view.fov, FOV.min, FOV.max);
      camera.fov = view.fov;
      camera.updateProjectionMatrix();
      camera.lookAt(direction(view.yaw, view.pitch));
    };

    // Arrows: DOM buttons placed over the photo each frame.
    const placeHotspots = () => {
      const layer = hotspotLayerRef.current;
      if (!layer || !current) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      const forward = direction(view.yaw, view.pitch);
      layer.querySelectorAll<HTMLElement>('[data-yaw]').forEach((el) => {
        const d = direction(Number(el.dataset.yaw), Number(el.dataset.pitch));
        const p = d.clone().multiplyScalar(10).project(camera);
        const visible = d.dot(forward) > 0 && Math.abs(p.x) < 1.02 && Math.abs(p.y) < 1.02 && !transition;
        el.style.transform = `translate(${((p.x + 1) / 2) * w}px, ${((1 - p.y) / 2) * h}px) translate(-50%, -50%)`;
        el.style.opacity = visible ? '1' : '0';
        el.style.pointerEvents = visible ? 'auto' : 'none';
      });
    };

    const show = async (id: string, animate: boolean, viaArrow?: { yaw: number; pitch: number }) => {
      const s = scenes.get(id);
      if (!s || transition) return;
      setLoading(true);
      let texture: THREE.Texture;
      try {
        texture = await load(s);
      } catch {
        if (!disposed) propsRef.current.onError(`The 360° photo of ${s.title} could not be loaded.`);
        setLoading(false);
        return;
      }
      if (disposed) return;
      setLoading(false);
      const target = animate ? back : front;
      (target.material as THREE.MeshBasicMaterial).map = texture;
      (target.material as THREE.MeshBasicMaterial).needsUpdate = true;
      current = s;
      setArrows(s.hotspots);
      propsRef.current.onSceneChange(s.id);
      if (animate) {
        target.visible = true;
        (target.material as THREE.MeshBasicMaterial).opacity = 0;
        target.renderOrder = 1;
        front.renderOrder = 0;
        transition = { start: performance.now(), from: front, to: target, zoomDir: direction(viaArrow?.yaw ?? view.yaw, 0) };
      } else {
        view.yaw = s.yaw;
        view.pitch = s.pitch;
        view.fov = FOV.start;
      }
      prefetch(s);
      dirty = true;
    };

    api.current.goTo = (id: string) => {
      interacted = true;
      const arrow = current?.hotspots.find((h) => h.to === id);
      if (arrow) {
        // Face the doorway before stepping through it.
        view.yaw = arrow.yaw;
        view.pitch = Math.max(view.pitch, -5);
      }
      show(id, true, arrow ? { yaw: arrow.yaw, pitch: arrow.pitch } : undefined);
    };

    // Phone motion (gyroscope): turn the phone to look around.
    let motion: { alpha0: number; yaw0: number } | null = null;
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha == null || e.beta == null) return;
      if (!motion) motion = { alpha0: e.alpha, yaw0: view.yaw };
      view.yaw = wrap(motion.yaw0 - (e.alpha - motion.alpha0));
      view.pitch = THREE.MathUtils.clamp(e.beta - 90, -80, 80);
      interacted = true;
      dirty = true;
    };
    let motionOn = false;
    api.current.toggleMotion = async () => {
      if (motionOn) {
        window.removeEventListener('deviceorientation', onOrientation);
        motionOn = false;
        motion = null;
        return false;
      }
      const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
      if (!DOE) return false;
      if (typeof DOE.requestPermission === 'function') {
        try {
          if ((await DOE.requestPermission()) !== 'granted') return false;
        } catch {
          return false;
        }
      }
      window.addEventListener('deviceorientation', onOrientation);
      motionOn = true;
      return true;
    };

    // Pointer: drag to look, pinch to zoom, click for the staff helper.
    const pointers = new Map<number, { x: number; y: number }>();
    let downAt: { x: number; y: number; t: number } | null = null;
    let pinch = 0;
    const el = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
      interacted = true;
      view.vyaw = view.vpitch = 0;
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const onMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) view.fov *= pinch / dist;
        pinch = dist;
      } else {
        const k = (view.fov / mount.clientHeight) * 1.0;
        const dyaw = -(e.clientX - prev.x) * k;
        const dpitch = (e.clientY - prev.y) * k;
        view.yaw = wrap(view.yaw + dyaw);
        view.pitch += dpitch;
        view.vyaw = dyaw;
        view.vpitch = dpitch;
      }
      dirty = true;
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = 0;
      if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 6 && performance.now() - downAt.t < 400) {
        view.vyaw = view.vpitch = 0;
        if (propsRef.current.onInspect) {
          const rect = el.getBoundingClientRect();
          const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
          const ray = new THREE.Raycaster();
          ray.setFromCamera(ndc, camera);
          const a = angles(ray.ray.direction);
          propsRef.current.onInspect({ yaw: Number(a.yaw.toFixed(1)), pitch: Number(a.pitch.toFixed(1)) });
        }
      }
      downAt = null;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      interacted = true;
      view.fov += e.deltaY * 0.04;
      dirty = true;
    };
    const onKey = (e: KeyboardEvent) => {
      const step = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, 5], ArrowDown: [0, -5] }[e.key];
      if (step) {
        view.yaw = wrap(view.yaw + step[0]);
        view.pitch += step[1];
      } else if (e.key === '+' || e.key === '=') view.fov -= 5;
      else if (e.key === '-') view.fov += 5;
      else return;
      e.preventDefault();
      interacted = true;
      dirty = true;
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    mount.addEventListener('keydown', onKey);

    const resize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      dirty = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 16.7, 3);
      last = now;
      if (!interacted && current) {
        view.yaw = wrap(view.yaw + 0.04 * dt);
        dirty = true;
      }
      if (!pointers.size && (Math.abs(view.vyaw) > 0.01 || Math.abs(view.vpitch) > 0.01)) {
        view.yaw = wrap(view.yaw + view.vyaw);
        view.pitch += view.vpitch;
        view.vyaw *= 0.9;
        view.vpitch *= 0.9;
        dirty = true;
      }
      if (transition) {
        const t = Math.min((now - transition.start) / 650, 1);
        const ease = t * t * (3 - 2 * t);
        (transition.to.material as THREE.MeshBasicMaterial).opacity = ease;
        (transition.from.material as THREE.MeshBasicMaterial).opacity = 1 - ease;
        // Step forward: the old room zooms towards the doorway, the new one settles in.
        transition.from.position.copy(transition.zoomDir).multiplyScalar(-18 * ease);
        transition.to.position.copy(transition.zoomDir).multiplyScalar(8 * (1 - ease));
        if (t >= 1) {
          transition.from.visible = false;
          transition.from.position.set(0, 0, 0);
          transition.to.position.set(0, 0, 0);
          (transition.from.material as THREE.MeshBasicMaterial).opacity = 1;
          [front, back] = [transition.to, transition.from];
          transition = null;
          if (current) {
            view.yaw = current.yaw;
            view.pitch = current.pitch;
          }
        }
        dirty = true;
      }
      if (dirty) {
        dirty = false;
        applyCamera();
        renderer.render(scene3, camera);
        placeHotspots();
      }
    };
    frame = requestAnimationFrame(loop);
    show(sceneId, false);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('deviceorientation', onOrientation);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('wheel', onWheel);
      mount.removeEventListener('keydown', onKey);
      textures.forEach((p) => p.then((t) => t.dispose()).catch(() => undefined));
      [front, back].forEach((m) => (m.material as THREE.Material).dispose());
      geometry.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
    // The viewer is rebuilt only for another tour; room changes go through goTo().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour]);

  const titleOf = useCallback((id: string) => tour.scenes.find((s) => s.id === id)?.title || '', [tour]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div ref={mountRef} tabIndex={0} className="h-full w-full cursor-grab touch-none outline-none active:cursor-grabbing" aria-label="360° view. Drag or use the arrow keys to look around." />
      <div ref={hotspotLayerRef} className="pointer-events-none absolute inset-0">
        {arrows.map((a) => (
          <button
            key={`${a.to}-${a.yaw}`}
            data-yaw={a.yaw}
            data-pitch={a.pitch}
            onClick={() => api.current.goTo(a.to)}
            className="group absolute left-0 top-0 flex flex-col items-center gap-1.5 transition-opacity duration-200"
            style={{ opacity: 0 }}
            aria-label={`Go to ${a.label || titleOf(a.to)}`}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/90 bg-white/20 shadow-[0_4px_18px_rgba(0,0,0,0.45)] backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-blue/80">
              <ChevronUp className="h-8 w-8 text-white drop-shadow" strokeWidth={2.5} />
            </span>
            <span className="rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white shadow">{a.label || titleOf(a.to)}</span>
          </button>
        ))}
      </div>
      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30" role="status">
          <Loader2 className="h-9 w-9 animate-spin text-fg-2" aria-label="Loading 360° photo" />
        </div>
      )}
    </div>
  );
});

export default TourViewer;
