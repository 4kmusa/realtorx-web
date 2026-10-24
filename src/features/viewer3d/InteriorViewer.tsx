// 3D apartment interior: a dollhouse (no ceiling) to look into from above, room labels, a plan view, and "step in":
// stand in a room at eye height and look around. Rooms come from nodes with extras.room = [x0, z0, x1, z1];
// labels from nodes with extras.label. Works with any GLB; without room data it is a plain orbit view.
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { Box, Footprints, Loader2, Map as MapIcon } from 'lucide-react';
import { webglAvailable } from './webgl';
import { disposeMaterial, releaseRenderer } from './webgl';

interface Room {
  name: string;
  rect: [number, number, number, number];
  /** Where to stand and where to look: [eye x, eye z, look x, look z] (optional). */
  view?: [number, number, number, number];
}

const EYE = 1.6;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function InteriorViewer({ url, onError }: { url: string; onError: (message: string) => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const api = useRef<{ dollhouse?: () => void; plan?: () => void; enter?: (room: Room) => void }>({});
  const errorRef = useRef(onError);
  errorRef.current = onError;
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [labels, setLabels] = useState<{ key: string; text: string; room: Room | null }[]>([]);
  const [inside, setInside] = useState<string | null>(null);
  const insideRef = useRef<string | null>(null);
  insideRef.current = inside;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (!webglAvailable()) {
      errorRef.current('This device or browser cannot display 3D.');
      return;
    }
    const lowPower = window.matchMedia('(pointer: coarse)').matches || Math.min(window.screen.width, window.screen.height) < 600;
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f17);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    const sun = new THREE.DirectionalLight(0xfff1dc, 2.2);
    sun.position.set(6, 12, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    scene.add(sun, new THREE.HemisphereLight(0xdfe8ff, 0x3a3228, 0.6));

    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.05, 500);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI * 0.48;

    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(renderer, target);
    composer.addPass(new RenderPass(scene, camera));
    let gtao: GTAOPass | null = null;
    if (!lowPower) {
      gtao = new GTAOPass(scene, camera, mount.clientWidth, mount.clientHeight);
      gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 2, thickness: 1, scale: 1 });
      gtao.blendIntensity = 0.8;
      composer.addPass(gtao);
    }
    composer.addPass(new OutputPass());
    composer.setSize(mount.clientWidth, mount.clientHeight);

    const places: Record<string, THREE.Vector3> = {};
    const v = new THREE.Vector3();
    const placeLabels = () => {
      for (const [key, el] of Object.entries(labelRefs.current)) {
        if (!el) continue;
        const p = places[key];
        let show = !!p && !insideRef.current;
        if (show && p) {
          v.copy(p).project(camera);
          show = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
          if (show) el.style.transform = `translate(-50%, -50%) translate(${((v.x + 1) / 2) * mount.clientWidth}px, ${((1 - v.y) / 2) * mount.clientHeight}px)`;
        }
        el.style.opacity = show ? '1' : '0';
        el.style.pointerEvents = show ? 'auto' : 'none';
      }
    };

    let frame = 0;
    let dirty = true;
    let flight: { from: THREE.Vector3; to: THREE.Vector3; ft: THREE.Vector3; tt: THREE.Vector3; start: number; after?: () => void } | null = null;
    const fly = (to: THREE.Vector3, tt: THREE.Vector3, after?: () => void) => {
      flight = { from: camera.position.clone(), to, ft: controls.target.clone(), tt, start: performance.now(), after };
    };
    controls.addEventListener('start', () => {
      if (flight) {
        flight.after?.();
        flight = null;
      }
    });
    controls.addEventListener('change', () => (dirty = true));
    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (flight) {
        const t = Math.min(1, (performance.now() - flight.start) / 1000);
        const k = ease(t);
        camera.position.lerpVectors(flight.from, flight.to, k);
        controls.target.lerpVectors(flight.ft, flight.tt, k);
        dirty = true;
        if (t >= 1) {
          const done = flight.after;
          flight = null;
          done?.();
        }
      }
      if (controls.update() || dirty) {
        dirty = false;
        composer.render();
        placeLabels();
      }
    };
    loop();

    // Orbit around the apartment (dollhouse) or stand inside a room and look around.
    const night = new THREE.Color(0x0b0f17);
    const daySky = (() => {
      const c = document.createElement('canvas');
      c.width = 2;
      c.height = 256;
      const g = c.getContext('2d')!;
      const grad = g.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#7fa9d6');
      grad.addColorStop(0.55, '#cfe0ef');
      grad.addColorStop(1, '#e9e3d6');
      g.fillStyle = grad;
      g.fillRect(0, 0, 2, 256);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    })();
    let outsideLimits = { min: 2, max: 60 };
    const outsideMode = () => {
      scene.background = night;
      controls.minDistance = outsideLimits.min;
      controls.maxDistance = outsideLimits.max;
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.rotateSpeed = 1;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI * 0.48;
    };
    const insideMode = () => {
      scene.background = daySky; // daylight outside the windows
      controls.minDistance = 0.01; // the camera stays where you stand; dragging turns your head
      controls.maxDistance = 0.2;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.rotateSpeed = -0.35;
      controls.minPolarAngle = Math.PI * 0.3;
      controls.maxPolarAngle = Math.PI * 0.72;
    };
    let home: { position: THREE.Vector3; target: THREE.Vector3; size: THREE.Vector3 } | null = null;
    api.current.dollhouse = () => {
      if (!home) return;
      setInside(null);
      outsideMode();
      fly(home.position.clone(), home.target.clone());
    };
    api.current.plan = () => {
      if (!home) return;
      setInside(null);
      outsideMode();
      const span = Math.max(home.size.x, home.size.z);
      fly(new THREE.Vector3(home.target.x, span * 1.35 / Math.min(camera.aspect, 1.4) + 2, home.target.z + 0.01), home.target.clone());
    };
    api.current.enter = (room: Room) => {
      const [x0, z0, x1, z1] = room.rect;
      // The model's viewpoint for the room, else near one corner looking across to the opposite one.
      const [ex, ez, lx, lz] = room.view || [x0 + (x1 - x0) * 0.22, z0 + (z1 - z0) * 0.25, x1 - (x1 - x0) * 0.2, z1 - (z1 - z0) * 0.2];
      const eye = new THREE.Vector3(ex, EYE, ez);
      const look = new THREE.Vector3(lx, 1.3, lz).sub(eye).normalize().multiplyScalar(0.05).add(eye);
      setInside(room.name);
      insideMode();
      fly(eye, look);
    };

    const resize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      composer.setSize(mount.clientWidth, mount.clientHeight);
      dirty = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    let disposed = false;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      url,
      (gltf) => {
        if (disposed) return;
        const root = gltf.scene;
        scene.add(root);
        root.updateMatrixWorld(true);
        const marks: { key: string; text: string; room: Room | null }[] = [];
        root.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (mesh.isMesh) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mesh.castShadow = !mat.transparent;
            mesh.receiveShadow = true;
          }
        });
        root.traverse((o) => {
          const text = o.userData?.label as string | undefined;
          if (!text) return;
          const key = o.uuid;
          places[key] = o.getWorldPosition(new THREE.Vector3());
          const rect = o.parent?.userData?.room as Room['rect'] | undefined; // the label sits inside its room's node
          const view = o.parent?.userData?.view as Room['view'] | undefined;
          marks.push({ key, text, room: Array.isArray(rect) && rect.length === 4 ? { name: text, rect, view: Array.isArray(view) && view.length === 4 ? view : undefined } : null });
        });
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        center.y = 0.4;
        const r = Math.max(size.x, size.z);
        const back = Math.max(r * 0.95, (r * 0.62) / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.min(camera.aspect, 1.5)));
        home = { position: new THREE.Vector3(center.x + back * 0.45, back * 0.95, center.z + back * 0.85), target: center.clone(), size };
        camera.position.copy(home.position);
        controls.target.copy(center);
        outsideLimits = { min: 2, max: r * 3 };
        controls.minDistance = outsideLimits.min;
        controls.maxDistance = outsideLimits.max;
        const s = sun.shadow.camera;
        s.left = s.bottom = -r;
        s.right = s.top = r;
        s.far = 60;
        s.updateProjectionMatrix();
        sun.target.position.copy(center);
        scene.add(sun.target);
        setRooms(marks.flatMap((m) => (m.room ? [m.room] : [])));
        setLabels(marks);
        setLoading(false);
        dirty = true;
      },
      undefined,
      () => !disposed && errorRef.current('The 3D interior could not be loaded.')
    );

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        disposeMaterial(mesh.material);
      });
      env.dispose();
      daySky.dispose();
      pmrem.dispose();
      gtao?.dispose();
      composer.dispose();
      target.dispose();
      releaseRenderer(renderer, mount);
    };
  }, [url]);

  const btn = (active: boolean) => `flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium backdrop-blur ${active ? 'bg-white text-black' : 'bg-black/60 text-white hover:bg-black/80'}`;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={mountRef} className="h-full w-full touch-none" />
      <div className="pointer-events-none absolute inset-0">
        {labels.map((l) => (
          <button key={l.key} ref={(el) => (labelRefs.current[l.key] = el)} onClick={() => l.room && api.current.enter?.(l.room)}
            className="absolute left-0 top-0 whitespace-nowrap rounded-full border border-white/20 bg-black/65 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white opacity-0 shadow-lg backdrop-blur transition-opacity hover:bg-black/85">
            {l.text}
          </button>
        ))}
      </div>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/80 text-sm text-fg-2" role="status">
          <Loader2 className="h-8 w-8 animate-spin" /> Loading the 3D apartment…
        </div>
      )}
      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
        <button onClick={() => api.current.dollhouse?.()} className={btn(!inside)}><Box className="h-4 w-4" /> Dollhouse</button>
        <button onClick={() => api.current.plan?.()} className={btn(false)}><MapIcon className="h-4 w-4" /> Plan</button>
      </div>
      {inside && (
        <p className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur">
          <Footprints className="me-1 inline h-3.5 w-3.5" /> {inside} · 360° · drag to look around
        </p>
      )}
      {rooms.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8">
          <div className="hide-scrollbar flex gap-2 overflow-x-auto" role="list" aria-label="Rooms">
            {labels.filter((l) => l.room).map((l) => (
              <button key={l.key} role="listitem" onClick={() => api.current.enter?.(l.room!)} className={`shrink-0 ${btn(inside === l.text)}`}>
                <Footprints className="h-3.5 w-3.5" /> {l.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
