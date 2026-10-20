// Three.js building viewer: loads a GLB/glTF exterior, colours mapped units by their ERPNext status,
// isolates a floor, and reports clicks/taps on units (mesh name or hotspot marker).
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Loader2, RotateCcw } from 'lucide-react';
import { STATUS_STYLE, UnitMapping, UnitStatus } from './api';

interface Props {
  modelUrl: string;
  mappings: UnitMapping[];
  statusByUnit: Record<string, UnitStatus>;
  labelByUnit: Record<string, string>;
  floorLevelById: Record<string, number>;
  activeFloor: string | null;
  selectedUnit: string | null;
  onSelectUnit: (unitId: string) => void;
  onError: (message: string) => void;
  /** Staff mapping helper: called on every click with the object hit and the point (model space). */
  onInspect?: (info: { object: string | null; point: [number, number, number] | null }) => void;
}

interface UnitObject {
  unit: string;
  floor: string | null;
  meshes: THREE.Mesh[];
}

const DIM_OPACITY = 0.12;

export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
}

export default function BuildingViewer({ modelUrl, mappings, statusByUnit, labelByUnit, floorLevelById, activeFloor, selectedUnit, onSelectUnit, onError, onInspect }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    home?: { position: THREE.Vector3; target: THREE.Vector3 };
    units: UnitObject[];
    others: THREE.Mesh[];
    pickables: THREE.Object3D[];
    render?: () => void;
  }>({ units: [], others: [], pickables: [] });
  const propsRef = useRef({ onSelectUnit, onError, onInspect });
  propsRef.current = { onSelectUnit, onError, onInspect };
  const modelRootRef = useRef<THREE.Object3D | null>(null);
  const [progress, setProgress] = useState<number | null>(0);
  const [hover, setHover] = useState<string | null>(null);

  // Scene setup and model loading (once per model / mapping set).
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const st = stateRef.current;
    st.units = [];
    st.others = [];
    st.pickables = [];

    if (!webglAvailable()) {
      propsRef.current.onError('This device or browser cannot display 3D. Use the unit list to see availability.');
      return;
    }
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1a30);
    scene.add(new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(20, 40, 25);
    scene.add(sun);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 48), new THREE.MeshStandardMaterial({ color: 0x14243d, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI * 0.49;
    st.camera = camera;
    st.controls = controls;

    let frame = 0;
    const render = () => renderer.render(scene, camera);
    st.render = render;
    const loop = () => {
      frame = requestAnimationFrame(loop);
      controls.update();
      render();
    };
    loop();

    const resize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    let disposed = false;
    setProgress(0);
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder); // models compressed with gltfpack/meshopt load too
    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) return;
        const root = gltf.scene;
        scene.add(root);
        modelRootRef.current = root;
        const byName = new Map<string, THREE.Object3D>();
        root.traverse((o) => byName.set(o.name, o));
        const unitMeshes = new Set<THREE.Mesh>();

        for (const m of mappings) {
          const meshes: THREE.Mesh[] = [];
          if (m.object && byName.has(m.object)) {
            byName.get(m.object)!.traverse((o) => {
              if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
            });
          } else if (m.hotspot && m.hotspot.every((v) => v !== null)) {
            const marker = new THREE.Mesh(new THREE.SphereGeometry(0.6, 20, 16), new THREE.MeshStandardMaterial());
            marker.position.set(m.hotspot[0] as number, m.hotspot[1] as number, m.hotspot[2] as number);
            scene.add(marker);
            meshes.push(marker);
          }
          for (const mesh of meshes) {
            mesh.material = (mesh.material as THREE.MeshStandardMaterial).clone(); // per-unit colour
            mesh.userData.unit = m.unit;
            unitMeshes.add(mesh);
            st.pickables.push(mesh);
          }
          if (meshes.length) st.units.push({ unit: m.unit, floor: m.floor, meshes });
        }
        root.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (mesh.isMesh && !unitMeshes.has(mesh)) {
            mesh.material = (mesh.material as THREE.MeshStandardMaterial).clone();
            st.others.push(mesh);
          }
        });

        // Frame the model.
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const radius = Math.max(size.x, size.y, size.z);
        const position = new THREE.Vector3(center.x + radius * 1.3, center.y + radius * 0.6, center.z + radius * 1.5);
        camera.position.copy(position);
        controls.target.copy(center);
        controls.minDistance = radius * 0.3;
        controls.maxDistance = radius * 4;
        st.home = { position: position.clone(), target: center.clone() };
        setProgress(null);
        paint();
      },
      (event) => {
        if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
      },
      () => {
        if (!disposed) propsRef.current.onError('The 3D model could not be loaded.');
      }
    );

    // Click / tap picking (ignore drags).
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let down: { x: number; y: number } | null = null;
    const pick = (event: PointerEvent): string | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const visible = st.pickables.filter((o) => {
        const mat = (o as THREE.Mesh).material as THREE.MeshStandardMaterial;
        return !mat.transparent || mat.opacity > DIM_OPACITY + 0.01;
      });
      const hit = raycaster.intersectObjects(visible, false)[0];
      return hit ? (hit.object.userData.unit as string) : null;
    };
    const onDown = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY });
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
      const unit = pick(e);
      if (unit) propsRef.current.onSelectUnit(unit);
      if (propsRef.current.onInspect && modelRootRef.current) {
        // Any object of the model (mapped or not): name + point, for setting up mappings and hotspots.
        const hit = raycaster.intersectObject(modelRootRef.current, true)[0];
        const p = hit ? hit.point : null;
        propsRef.current.onInspect({
          object: hit ? hit.object.name || null : null,
          point: p ? [Number(p.x.toFixed(3)), Number(p.y.toFixed(3)), Number(p.z.toFixed(3))] : null,
        });
      }
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const unit = pick(e);
      renderer.domElement.style.cursor = unit ? 'pointer' : 'grab';
      setHover(unit);
    };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointermove', onMove);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointermove', onMove);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUrl, mappings]);

  // Colour by status, isolate the active floor, highlight the selection.
  const paint = () => {
    const st = stateRef.current;
    const activeLevel = activeFloor ? floorLevelById[activeFloor] : null;
    for (const u of st.units) {
      const status = statusByUnit[u.unit] || 'Unavailable';
      const onFloor = activeFloor === null || u.floor === activeFloor;
      const selected = u.unit === selectedUnit;
      for (const mesh of u.meshes) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.color.setHex(STATUS_STYLE[status].color);
        mat.emissive.setHex(selected ? 0xf5a623 : 0x000000);
        mat.emissiveIntensity = selected ? 0.9 : 0;
        if (mat.transparent !== !onFloor) mat.needsUpdate = true; // blending mode change needs a recompile
        mat.transparent = !onFloor;
        mat.opacity = onFloor ? 1 : DIM_OPACITY;
        mat.depthWrite = onFloor;
      }
    }
    for (const mesh of st.others) {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const near = activeLevel === null || activeLevel === undefined;
      if (mat.transparent !== !near) mat.needsUpdate = true;
      mat.transparent = !near;
      mat.opacity = near ? 1 : 0.18;
      mat.depthWrite = near;
    }
    st.render?.();
  };

  useEffect(paint);

  // Turn the camera towards the selected unit so a unit on the far side is visible too.
  useEffect(() => {
    const st = stateRef.current;
    if (!selectedUnit || !st.camera || !st.controls || !st.home) return;
    const u = st.units.find((x) => x.unit === selectedUnit);
    if (!u) return;
    const box = new THREE.Box3();
    u.meshes.forEach((m) => box.expandByObject(m));
    const target = box.getCenter(new THREE.Vector3());
    const centre = st.home.target;
    const dir = new THREE.Vector3(target.x - centre.x, 0, target.z - centre.z);
    if (dir.lengthSq() < 1e-6) dir.set(1, 0, 1);
    dir.normalize();
    const distance = st.home.position.distanceTo(st.home.target) * 0.75;
    st.camera.position.set(target.x + dir.x * distance, target.y + distance * 0.35, target.z + dir.z * distance);
    st.controls.target.copy(target);
  }, [selectedUnit]);

  const reset = () => {
    const st = stateRef.current;
    if (!st.home || !st.camera || !st.controls) return;
    st.camera.position.copy(st.home.position);
    st.controls.target.copy(st.home.target);
  };

  return (
    <div className="relative h-full w-full">
      <div ref={mountRef} className="h-full w-full touch-none" />
      {progress !== null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0B1A30]/80 text-sm text-slate-300" role="status">
          <Loader2 className="h-8 w-8 animate-spin text-[#F5A623]" />
          Loading 3D model{progress ? ` · ${progress}%` : '…'}
        </div>
      )}
      <button onClick={reset} className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-2 text-xs text-white hover:bg-black/80" aria-label="Reset view">
        <RotateCcw className="h-4 w-4" /> Reset view
      </button>
      {hover && <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-black/70 px-3 py-1.5 text-xs text-white">Unit {labelByUnit[hover] || hover} · {statusByUnit[hover] || 'Unavailable'}</div>}
      <p className="pointer-events-none absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 text-[11px] text-slate-300">Drag to rotate · scroll or pinch to zoom · tap a unit</p>
    </div>
  );
}
