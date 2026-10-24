// Three.js building viewer: loads a GLB/glTF exterior (one tower or a whole site), shows each mapped unit's
// ERPNext status, isolates a floor and reports clicks/taps on units (mesh name or hotspot). Status is shown in the
// unit's own glass (like the coloured acrylic of a sales-office model); models without glass get a see-through box.
// Views: Model (a white architectural model on a studio table), Night (dark sky, lit windows, street lamps, a soft
// glow) and Day (physical sky and sun); the building record chooses which one opens first.
// Floating labels: blocks / places come from empty nodes named "LABEL:<text>" in the model, units from the mappings.
// The camera flies to a selected unit; Home and Top buttons frame the whole model.
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { Building, Eye, EyeOff, Home, Loader2, Moon, Sun } from 'lucide-react';
import { STATUS_STYLE, UnitMapping, UnitStatus } from './api';
import { webglAvailable } from './webgl';
import { disposeMaterial, releaseRenderer } from './webgl';

export type ViewMode = 'Model' | 'Day' | 'Night';

interface Props {
  modelUrl: string;
  /** View the page opens in (RX Building "Website Opens In"); visitors can switch. */
  defaultView?: ViewMode;
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
  glass: THREE.Mesh[]; // status is shown in these (generated models); empty: the overlay box shows it
  overlay?: { box: THREE.Mesh; edges: THREE.LineSegments };
  marker?: boolean;
  top: THREE.Vector3; // where its label sits
  center: THREE.Vector3;
}

interface Label {
  key: string;
  text: string;
  unit?: string;
}

const DIM_OPACITY = 0.12;
// Status colours inside the model: softer than the list's badges, so the building stays the main thing.
const TINT: Record<UnitStatus, number> = { Available: 0x3ba776, Reserved: 0xe0a030, Sold: 0xd65c5c, Unavailable: 0x98a2ad };
const isGlass = (name: string) => /^(glass|rail_glass)$/.test(name);
const SELECTED_COLOUR = 0xffffff;
const SUN_DIRECTION = new THREE.Vector3(-0.55, 1.1, 0.8).normalize();
const HAZE = new THREE.Color(0xb7c9da);
const NIGHT_HAZE = new THREE.Color(0x070b14);
const MAX_UNIT_LABELS = 40; // more units than this: unit labels only for the isolated floor or the selection
// How much brighter each self-lit material is at night (material names from the model).
const NIGHT_GLOW: Record<string, number> = { interior: 3.6, lobby: 3, lamp: 6, beacon: 10, glow: 3, water: 5, jet: 5 };

/** Physically based daylight sky (Preetham model) with the sun where the shadows come from. */
function daylightSky(scale: number): Sky {
  const sky = new Sky();
  sky.scale.setScalar(scale);
  const u = sky.material.uniforms;
  u.turbidity.value = 2.5;
  u.rayleigh.value = 2.2;
  u.mieCoefficient.value = 0.004;
  u.mieDirectionalG.value = 0.8;
  u.sunPosition.value.copy(SUN_DIRECTION);
  sky.userData.noAO = true;
  return sky;
}

/** Background dome: a vertical gradient (day: blue sky; night: deep navy to ink). */
function skyBackdrop(radius: number): THREE.Mesh {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { top: { value: new THREE.Color(0x3d7cc4) }, horizon: { value: new THREE.Color(0xcfdeeb) }, gain: { value: 2.4 } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform float gain; varying vec3 vDir;
      void main(){ float h = max(vDir.y, 0.0); vec3 c = mix(horizon, top, pow(h, 0.5));
        // Linear HDR value, so the colour survives the scene's tone mapping.
        gl_FragColor = vec4(pow(c, vec3(2.2)) * gain, 1.0); }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 16), material);
  mesh.userData.noAO = true;
  return mesh;
}

/** Remember a material's own transparency so floor isolation can dim it and restore it later. */
function rememberBase(mesh: THREE.Mesh) {
  const mat = mesh.material as THREE.MeshStandardMaterial;
  mesh.userData.base = { opacity: mat.opacity, transparent: mat.transparent, depthWrite: mat.depthWrite, emissive: mat.emissiveIntensity ?? 1 };
}

function setDim(mesh: THREE.Mesh, factor: number) {
  const mat = mesh.material as THREE.MeshStandardMaterial;
  const base = mesh.userData.base as { opacity: number; transparent: boolean; depthWrite: boolean };
  const transparent = base.transparent || factor < 1;
  if (mat.transparent !== transparent) mat.needsUpdate = true; // blending mode change needs a recompile
  mat.transparent = transparent;
  mat.opacity = base.opacity * factor;
  mat.depthWrite = factor < 1 ? false : base.depthWrite;
  mesh.userData.dimmed = factor < 1;
  mesh.castShadow = factor === 1 && !base.transparent;
}

// White architectural-model look: the model's own colours become a few soft neutrals; glass stays see-through.
const CLAY: [RegExp, number][] = [
  [/glass|jet/, 0xcfdde6], [/^(grass)$/, 0xdde4d3], [/hedge|leaf|palm|foliage|plant/, 0xc3d1bd], [/bark/, 0xb9a58c], [/water/, 0xbfd6e3],
  [/plinth/, 0x7a5a40], [/asphalt/, 0xcfcdc8], [/marking|drive|paving|concrete|core/, 0xe7e5e0], [/stone/, 0xece6dc],
  [/frame|tank|solar|dark|screen|tyre|metal|chrome|car_/, 0x8f969d], [/wood|deck|cabinet_wood|accent/, 0xcdb89c],
];
function clayMaterial(own: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
  const colour = CLAY.find(([re]) => re.test(own.name))?.[1] ?? 0xf6f4ef;
  const glass = /glass|jet/.test(own.name);
  const mat = new THREE.MeshStandardMaterial({ name: own.name, color: colour, roughness: glass ? 0.25 : /plinth/.test(own.name) ? 0.5 : 0.9, metalness: 0,
    transparent: glass, opacity: glass ? 0.45 : 1, side: own.side, depthWrite: !glass });
  if (own.alphaTest > 0 && own.map) { // leaf cards keep their outline
    mat.alphaMap = own.map;
    mat.alphaTest = own.alphaTest;
  }
  return mat;
}

/** Colour a unit's glass with its status (null: back to the model's own glass). */
function tintGlass(mesh: THREE.Mesh, colour: number | null, selected: boolean, night: boolean, dim: number) {
  const mat = mesh.material as THREE.MeshStandardMaterial;
  const base = (mat.userData.tintBase as { color: THREE.Color; emissive: THREE.Color; intensity: number } | undefined)
    || (mat.userData.tintBase = { color: mat.color.clone(), emissive: mat.emissive.clone(), intensity: mat.emissiveIntensity });
  const opacity = (mesh.userData.base as { opacity: number }).opacity; // of the material in use (own or white model)
  if (colour === null) {
    mat.color.copy(base.color);
    mat.emissive.copy(base.emissive);
    mat.emissiveIntensity = base.intensity;
    mat.opacity = opacity * dim;
    return;
  }
  const c = new THREE.Color(colour); // the selected unit: the same colour, stronger and glowing (plus its white outline)
  mat.color.copy(base.color).lerp(c, selected ? 1 : night ? 0.6 : 0.85);
  mat.emissive.copy(c);
  mat.emissiveIntensity = selected ? 0.7 : night ? 0.3 : 0.18;
  mat.opacity = Math.max(opacity, selected ? 0.92 : night ? 0.5 : 0.72) * dim; // at night the lit rooms still show through
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export { webglAvailable };

export default function BuildingViewer({ modelUrl, defaultView, mappings, statusByUnit, labelByUnit, floorLevelById, activeFloor, selectedUnit, onSelectUnit, onError, onInspect }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Record<string, HTMLButtonElement | HTMLDivElement | null>>({});
  const stateRef = useRef<{
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    home?: { position: THREE.Vector3; target: THREE.Vector3; radius: number };
    units: UnitObject[];
    others: THREE.Mesh[];
    site: Set<THREE.Mesh>;
    pickables: THREE.Object3D[];
    places: Record<string, THREE.Vector3>;
    render?: () => void;
    flyTo?: (position: THREE.Vector3, target: THREE.Vector3) => void;
    setMode?: (mode: ViewMode) => void;
  }>({ units: [], others: [], site: new Set(), pickables: [], places: {} });
  const propsRef = useRef({ onSelectUnit, onError, onInspect });
  propsRef.current = { onSelectUnit, onError, onInspect };
  const viewRef = useRef({ activeFloor, selectedUnit, hover: null as string | null });
  const modelRootRef = useRef<THREE.Object3D | null>(null);
  const [progress, setProgress] = useState<number | null>(0);
  const [hover, setHover] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(true);
  const [mode, setMode] = useState<ViewMode>(defaultView || 'Night');
  const night = mode === 'Night';
  const [labels, setLabels] = useState<Label[]>([]);
  viewRef.current = { activeFloor, selectedUnit, hover };
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const paintRef = useRef<() => void>(() => undefined);

  // Scene setup and model loading (once per model / mapping set).
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const st = stateRef.current;
    st.units = [];
    st.others = [];
    st.site = new Set();
    st.pickables = [];
    st.places = {};

    if (!webglAvailable()) {
      propsRef.current.onError('This device or browser cannot display 3D. Use the unit list to see availability.');
      return;
    }
    // Phones and tablets get lighter settings (no ambient occlusion or glow, smaller shadow map).
    const lowPower = window.matchMedia('(pointer: coarse)').matches || Math.min(window.screen.width, window.screen.height) < 600;
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.55;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');

    const scene = new THREE.Scene();
    const backdrop = skyBackdrop(3000);
    scene.add(backdrop);
    // Image-based light from the same sky: glass and metal reflect it, shadows stay soft.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.add(daylightSky(50));
    const envMap = pmrem.fromScene(envScene, 0.02).texture;
    const studioEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; // neutral studio light for the white model
    scene.environment = envMap;
    scene.environmentIntensity = 0.8;
    const sun = new THREE.DirectionalLight(0xfff0d8, 3.2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(lowPower ? 2048 : 4096, lowPower ? 2048 : 4096);
    sun.shadow.bias = -0.0003;
    sun.shadow.normalBias = 0.03;
    scene.add(sun, sun.target);
    const sky = new THREE.HemisphereLight(0x3a4f86, 0x05070c, 0);
    scene.add(sky);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x9c9888, roughness: 1 });
    const tableMat = new THREE.ShadowMaterial({ opacity: 0.16 }); // Model view: only the model's shadow on a seamless backdrop
    const ground = new THREE.Mesh<THREE.CircleGeometry, THREE.Material>(new THREE.CircleGeometry(1400, 64), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.5, 5000);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI * 0.49;
    st.camera = camera;
    st.controls = controls;

    // Render pipeline: scene (multisampled) -> ambient occlusion (desktop) -> glow (desktop, night) -> output.
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(renderer, target);
    composer.addPass(new RenderPass(scene, camera));
    let gtao: GTAOPass | null = null;
    let bloom: UnrealBloomPass | null = null;
    if (!lowPower) {
      gtao = new GTAOPass(scene, camera, mount.clientWidth, mount.clientHeight);
      gtao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 2, thickness: 1, scale: 1 });
      gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
      gtao.blendIntensity = 0.7;
      // Status overlays and the sky must not darken the model.
      const hide = gtao.overrideVisibility.bind(gtao);
      gtao.overrideVisibility = () => {
        hide();
        scene.traverse((o) => {
          if (o.userData.noAO) o.visible = false;
        });
      };
      composer.addPass(gtao);
      bloom = new UnrealBloomPass(new THREE.Vector2(mount.clientWidth, mount.clientHeight), 0.55, 0.5, 0.82);
      composer.addPass(bloom);
    }
    composer.addPass(new OutputPass());
    composer.setSize(mount.clientWidth, mount.clientHeight);

    // Floating labels follow their 3D point; hidden behind the camera, on dimmed floors or when too many.
    const v = new THREE.Vector3();
    const placeLabels = () => {
      const { activeFloor: floorNow, selectedUnit: sel, hover: hov } = viewRef.current;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      const many = st.units.length > MAX_UNIT_LABELS;
      for (const [key, el] of Object.entries(labelRefs.current)) {
        if (!el) continue;
        const unit = key.startsWith('u:') ? st.units.find((u) => u.unit === key.slice(2)) : null;
        const point = unit ? unit.top : st.places[key];
        let show = !!point;
        if (unit) {
          const focused = unit.unit === sel || unit.unit === hov;
          const onFloor = !floorNow || unit.floor === floorNow;
          show = show && onFloor && (focused || !many || !!floorNow);
        }
        if (show && point) {
          v.copy(point).project(camera);
          show = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
          if (show) el.style.transform = `translate(-50%, -100%) translate(${((v.x + 1) / 2) * width}px, ${((1 - v.y) / 2) * height}px)`;
        }
        el.style.opacity = show ? '1' : '0';
        el.style.pointerEvents = show ? 'auto' : 'none';
      }
    };

    // Draw only when something changed (camera moving, paint, resize), so idle pages use no GPU.
    let frame = 0;
    let dirty = true;
    let flight: { from: THREE.Vector3; to: THREE.Vector3; fromTarget: THREE.Vector3; toTarget: THREE.Vector3; start: number } | null = null;
    st.render = () => {
      dirty = true;
    };
    st.flyTo = (position, focus) => {
      flight = { from: camera.position.clone(), to: position, fromTarget: controls.target.clone(), toTarget: focus, start: performance.now() };
      dirty = true;
    };
    controls.addEventListener('start', () => (flight = null)); // the visitor takes over
    controls.addEventListener('change', () => (dirty = true));
    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (flight) {
        const t = Math.min(1, (performance.now() - flight.start) / 900);
        const k = ease(t);
        camera.position.lerpVectors(flight.from, flight.to, k);
        controls.target.lerpVectors(flight.fromTarget, flight.toTarget, k);
        dirty = true;
        if (t >= 1) flight = null;
      }
      const moving = controls.update();
      if (moving || dirty) {
        dirty = false;
        composer.render();
        placeLabels();
      }
    };
    loop();

    // Model / Day / Night: sky, lights, exposure, materials (white model or the model's own), self-lit parts and glow.
    st.setMode = (view: ViewMode) => {
      const on = view === 'Night';
      const clay = view === 'Model';
      const u = (backdrop.material as THREE.ShaderMaterial).uniforms;
      u.top.value.set(on ? 0x050913 : clay ? 0xd2d0cb : 0x3d7cc4);
      u.horizon.value.set(on ? 0x1a2440 : clay ? 0xe9e7e2 : 0xcfdeeb);
      u.gain.value = on ? 1.6 : clay ? 1.55 : 2.4;
      scene.environment = clay ? studioEnv : envMap;
      scene.environmentIntensity = on ? 0.14 : clay ? 0.55 : 0.8;
      sun.color.set(on ? 0x8ea6ff : clay ? 0xfff8ee : 0xfff0d8);
      sun.intensity = on ? 0.35 : clay ? 2.2 : 3.2;
      sky.intensity = on ? 0.35 : clay ? 0.6 : 0;
      sky.color.set(clay ? 0xffffff : 0x3a4f86);
      sky.groundColor.set(clay ? 0xbdb8ae : 0x05070c);
      renderer.toneMappingExposure = on ? 0.8 : clay ? 0.62 : 0.55;
      ground.material = clay ? tableMat : groundMat;
      groundMat.color.set(on ? 0x0b0f17 : 0x8d9476); // day: open land around the model
      if (scene.fog) {
        const fog = scene.fog as THREE.Fog;
        fog.color.set(on ? NIGHT_HAZE : clay ? 0xe9e7e2 : HAZE);
        const base = (fog as THREE.Fog & { base?: [number, number] }).base || ((fog as THREE.Fog & { base?: [number, number] }).base = [fog.near, fog.far]);
        fog.near = base[0] * (clay ? 3 : 1); // a crisp model: almost no haze
        fog.far = base[1] * (clay ? 2 : 1);
      }
      if (bloom) bloom.enabled = on;
      modelRootRef.current?.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh || !mesh.userData.base) return;
        const own = (mesh.userData.own as THREE.MeshStandardMaterial | undefined) || (mesh.userData.own = mesh.material as THREE.MeshStandardMaterial);
        const ownBase = mesh.userData.ownBase || (mesh.userData.ownBase = mesh.userData.base);
        if (clay) {
          if (!mesh.userData.clay) {
            mesh.userData.clay = clayMaterial(own);
            mesh.userData.clayBase = { opacity: mesh.userData.clay.opacity, transparent: mesh.userData.clay.transparent, depthWrite: mesh.userData.clay.depthWrite, emissive: 0 };
          }
          mesh.material = mesh.userData.clay;
          mesh.userData.base = mesh.userData.clayBase;
        } else {
          mesh.material = own;
          mesh.userData.base = ownBase;
        }
        const boost = NIGHT_GLOW[own.name];
        if (own.name === 'glow') mesh.visible = on; // light pools under lamps only at night
        if (boost) own.emissiveIntensity = ownBase.emissive * (on ? boost : 1);
      });
      paintRef.current(); // floor isolation and dimming apply to whichever materials are now in use
      dirty = true;
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
    setProgress(0);
    setLabels([]);
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder); // models compressed with gltfpack/meshopt load too
    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) return;
        const root = gltf.scene;
        scene.add(root);
        root.updateMatrixWorld(true);
        modelRootRef.current = root;
        const byName = new Map<string, THREE.Object3D>();
        const places: Label[] = [];
        root.traverse((o) => {
          byName.set(o.name, o);
          const text = (o.userData?.label as string | undefined) || (/^LABEL[:_]/.test(o.name) ? o.name.slice(6).replace(/_/g, ' ') : null);
          if (text) {
            const key = `p:${o.uuid}`;
            st.places[key] = o.getWorldPosition(new THREE.Vector3());
            places.push({ key, text });
          }
        });
        const unitMeshes = new Set<THREE.Mesh>();
        const unitsBox = new THREE.Box3();

        for (const m of mappings) {
          const meshes: THREE.Mesh[] = [];
          let marker = false;
          if (m.object && byName.has(m.object)) {
            byName.get(m.object)!.traverse((o) => {
              if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
            });
          } else if (m.hotspot && m.hotspot.every((x) => x !== null)) {
            const dot = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 16), new THREE.MeshStandardMaterial({ roughness: 0.4 }));
            dot.position.set(m.hotspot[0] as number, m.hotspot[1] as number, m.hotspot[2] as number);
            dot.userData.marker = true;
            scene.add(dot);
            dot.updateMatrixWorld();
            meshes.push(dot);
            marker = true;
          }
          if (!meshes.length) continue;
          const box = new THREE.Box3();
          for (const mesh of meshes) {
            mesh.material = (mesh.material as THREE.MeshStandardMaterial).clone(); // per-unit dimming
            rememberBase(mesh);
            mesh.userData.unit = m.unit;
            unitMeshes.add(mesh);
            st.pickables.push(mesh);
            box.expandByObject(mesh);
          }
          unitsBox.union(box);
          const center = box.getCenter(new THREE.Vector3());
          const glass = marker ? [] : meshes.filter((mesh) => isGlass((mesh.material as THREE.Material).name));
          const unit: UnitObject = { unit: m.unit, floor: m.floor, meshes, glass, marker, center, top: new THREE.Vector3(center.x, box.max.y + 0.4, center.z) };
          if (!marker) {
            // See-through status overlay around the unit; the model's own materials stay untouched.
            // Built in the unit's own orientation (towers on a site can be turned).
            const parent = meshes[0].parent || root;
            const local = new THREE.Box3();
            const inv = new THREE.Matrix4().copy(parent.matrixWorld).invert();
            for (const mesh of meshes) {
              mesh.geometry.computeBoundingBox();
              local.union(mesh.geometry.boundingBox!.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, mesh.matrixWorld)));
            }
            const size = local.getSize(new THREE.Vector3());
            const geometry = new THREE.BoxGeometry(size.x + 0.08, Math.max(size.y - 0.12, 0.1), size.z + 0.08);
            const overlay = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
            const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ transparent: true }));
            overlay.add(edges);
            overlay.position.copy(local.getCenter(new THREE.Vector3()));
            overlay.raycast = () => undefined;
            edges.raycast = () => undefined;
            overlay.renderOrder = 2;
            overlay.userData.noAO = true;
            overlay.userData.overlay = true; // not part of the model: never dimmed with it
            parent.add(overlay);
            unit.overlay = { box: overlay, edges };
          }
          st.units.push(unit);
        }

        const modelBox = new THREE.Box3().setFromObject(root);
        // Landscaping, roads etc. never fade with floor isolation: meshes under a node named Site /
        // Landscape / Context, or (models without such a node) meshes outside the units' footprint.
        const siteNode = (o: THREE.Object3D) => {
          for (let p: THREE.Object3D | null = o; p && p !== root; p = p.parent) if (/^(site|landscape|context)/i.test(p.name)) return true;
          return false;
        };
        let named = false;
        root.traverse((o) => { if (o !== root && /^(site|landscape|context)/i.test(o.name)) named = true; });
        const footprint = unitsBox.isEmpty() ? modelBox.clone() : unitsBox.clone().expandByScalar(0.5);
        const buildingBox = unitsBox.clone();
        root.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mesh.receiveShadow = true;
          mesh.castShadow = !mat.transparent;
          if (unitMeshes.has(mesh) || mesh.userData.overlay) return;
          mesh.material = mat.clone();
          rememberBase(mesh);
          st.others.push(mesh);
          const b = new THREE.Box3().setFromObject(mesh);
          const outside = b.max.x < footprint.min.x || b.min.x > footprint.max.x || b.max.z < footprint.min.z || b.min.z > footprint.max.z;
          if (named ? siteNode(mesh) : outside) st.site.add(mesh);
          else buildingBox.union(b);
        });

        // Frame the buildings (not the whole site), light them and fit the sun's shadow to the model.
        const focus = buildingBox.isEmpty() ? modelBox : buildingBox;
        const size = focus.getSize(new THREE.Vector3());
        const center = focus.getCenter(new THREE.Vector3());
        center.y = focus.min.y + size.y * 0.4;
        const radius = Math.max(size.x, size.y, size.z);
        // Far enough that the whole width fits, also on a narrow phone screen.
        const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const fit = (Math.max(size.x, size.z) * 0.62) / (halfH * Math.min(camera.aspect, 1.6));
        const back = Math.max(radius * 1.75, fit) / 1.75;
        const position = new THREE.Vector3(center.x + back * 0.95, focus.min.y + back * 0.75, center.z + back * 1.45);
        camera.position.copy(position);
        controls.target.copy(center);
        controls.minDistance = radius * 0.15;
        controls.maxDistance = radius * 3.5;
        st.home = { position: position.clone(), target: center.clone(), radius };
        controls.maxDistance = Math.max(controls.maxDistance, position.distanceTo(center) * 1.6);

        ground.position.y = modelBox.min.y - 0.02;
        const span = modelBox.getSize(new THREE.Vector3()).length() / 2;
        sun.target.position.copy(modelBox.getCenter(new THREE.Vector3()));
        sun.position.copy(sun.target.position).add(SUN_DIRECTION.clone().multiplyScalar(span * 2.5));
        const cam = sun.shadow.camera;
        cam.left = cam.bottom = -span;
        cam.right = cam.top = span;
        cam.near = 0.5;
        cam.far = span * 5;
        cam.updateProjectionMatrix();
        scene.fog = new THREE.Fog(HAZE, radius * 5, radius * 30);
        st.setMode?.(modeRef.current);
        setLabels([...places, ...st.units.map((u) => ({ key: `u:${u.unit}`, text: '', unit: u.unit }))]);
        dirty = true;
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
      const visible = st.pickables.filter((o) => !o.userData.dimmed);
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
        let namedObject: THREE.Object3D | null = hit ? hit.object : null;
        while (namedObject && !namedObject.name && namedObject.parent && namedObject.parent !== modelRootRef.current) namedObject = namedObject.parent;
        propsRef.current.onInspect({
          object: namedObject ? namedObject.name || null : null,
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
        if (mesh.geometry) mesh.geometry.dispose();
        disposeMaterial(mesh.material);
        disposeMaterial(mesh.userData?.clay as THREE.Material | undefined);
        disposeMaterial(mesh.userData?.own as THREE.Material | undefined);
      });
      envMap.dispose();
      studioEnv.dispose();
      tableMat.dispose();
      pmrem.dispose();
      gtao?.dispose();
      bloom?.dispose();
      composer.dispose();
      target.dispose();
      releaseRenderer(renderer, mount);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUrl, mappings]);

  useEffect(() => stateRef.current.setMode?.(mode), [mode]);

  // Status overlays, floor isolation and the selection highlight. The model's own materials only fade.
  const paint = () => {
    const st = stateRef.current;
    const isolating = activeFloor !== null && floorLevelById[activeFloor] !== undefined;
    for (const u of st.units) {
      const status = statusByUnit[u.unit] || 'Unavailable';
      const onFloor = activeFloor === null || u.floor === activeFloor;
      const selected = u.unit === selectedUnit;
      const focused = selected || u.unit === hover;
      const tinted = showStatus || focused;
      for (const mesh of u.meshes) {
        setDim(mesh, onFloor ? 1 : DIM_OPACITY);
        if (u.glass.includes(mesh)) tintGlass(mesh, tinted ? TINT[status] : null, selected, night, onFloor ? 1 : DIM_OPACITY);
        if (u.marker) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.color.setHex(selected ? SELECTED_COLOUR : STATUS_STYLE[status].color);
          mat.emissive.setHex(selected ? SELECTED_COLOUR : STATUS_STYLE[status].color);
          mat.emissiveIntensity = selected ? 0.8 : 0.35;
        }
      }
      if (u.overlay) {
        const colour = STATUS_STYLE[status].color;
        const fill = u.overlay.box.material as THREE.MeshBasicMaterial;
        const line = u.overlay.edges.material as THREE.LineBasicMaterial;
        const boxed = !u.glass.length; // models without glass: the box shows the status
        u.overlay.box.visible = onFloor && (boxed ? tinted : focused);
        fill.color.setHex(colour);
        fill.opacity = boxed ? (selected ? 0.32 : focused ? 0.28 : night ? 0.22 : 0.2) : 0;
        line.color.setHex(selected ? SELECTED_COLOUR : colour); // the selected unit gets a white outline
        line.opacity = focused ? 1 : 0.6;
      }
    }
    for (const mesh of st.others) setDim(mesh, isolating && !st.site.has(mesh) ? 0.15 : 1);
    st.render?.();
  };

  paintRef.current = paint;
  useEffect(paint);

  // Fly to the selected unit, from the side it faces (works for towers turned on a site).
  useEffect(() => {
    const st = stateRef.current;
    if (!selectedUnit || !st.home || !st.flyTo) return;
    const u = st.units.find((x) => x.unit === selectedUnit);
    if (!u) return;
    const target = u.center.clone();
    // The tower the unit belongs to: the nearest ancestor named "Tower …" / "Building", else the top-level node.
    let tower: THREE.Object3D | null = u.meshes[0].parent;
    while (tower && tower.parent && tower.parent !== modelRootRef.current && !/^(tower[ _]|building)/i.test(tower.name)) tower = tower.parent;
    const towerCentre = tower ? new THREE.Box3().setFromObject(tower).getCenter(new THREE.Vector3()) : st.home.target;
    const dir = new THREE.Vector3(target.x - towerCentre.x, 0, target.z - towerCentre.z);
    if (dir.lengthSq() < 1e-6) dir.set(1, 0, 1);
    dir.normalize();
    const distance = Math.max(st.home.radius * 0.5, 36);
    st.flyTo(new THREE.Vector3(target.x + dir.x * distance, target.y + distance * 0.45, target.z + dir.z * distance), target);
  }, [selectedUnit, progress === null]); // also once the model has loaded (a unit chosen on its own page)

  const home = () => {
    const st = stateRef.current;
    if (st.home && st.flyTo) st.flyTo(st.home.position.clone(), st.home.target.clone());
  };
  const top = () => {
    const st = stateRef.current;
    if (!st.home || !st.flyTo) return;
    const t = st.home.target.clone();
    st.flyTo(new THREE.Vector3(t.x, t.y + st.home.radius * 1.9, t.z + 0.01), t);
  };

  const btn = 'flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-2 text-xs text-white backdrop-blur hover:bg-black/80';
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={mountRef} className="h-full w-full touch-none" />
      <div className="pointer-events-none absolute inset-0" aria-hidden={false}>
        {labels.map((l) => {
          if (!l.unit) {
            return (
              <div key={l.key} ref={(el) => (labelRefs.current[l.key] = el)} className="absolute left-0 top-0 whitespace-nowrap rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white opacity-0 backdrop-blur transition-opacity duration-200">
                {l.text}
              </div>
            );
          }
          const status = statusByUnit[l.unit] || 'Unavailable';
          const selected = l.unit === selectedUnit;
          return (
            <button
              key={l.key}
              ref={(el) => (labelRefs.current[l.key] = el)}
              onClick={() => onSelectUnit(l.unit!)}
              className={`absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium opacity-0 shadow-lg backdrop-blur transition-[opacity,background-color] duration-200 ${selected ? 'bg-white text-black' : 'border border-white/15 bg-black/65 text-white hover:bg-black/85'}`}
              aria-label={`Unit ${labelByUnit[l.unit] || l.unit}, ${status}`}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: `#${STATUS_STYLE[status].color.toString(16).padStart(6, '0')}`, boxShadow: `0 0 8px #${STATUS_STYLE[status].color.toString(16).padStart(6, '0')}` }} />
              {labelByUnit[l.unit] || l.unit}
              {selected && <span className="text-black/60">· {STATUS_STYLE[status].label}</span>}
            </button>
          );
        })}
      </div>
      {progress !== null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/80 text-sm text-fg-2" role="status">
          <Loader2 className="h-8 w-8 animate-spin text-fg-2" />
          Loading 3D model{progress ? ` · ${progress}%` : '…'}
        </div>
      )}
      <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-2">
        <div className="flex rounded-full bg-black/60 p-0.5 backdrop-blur" role="group" aria-label="View">
          {(['Model', 'Day', 'Night'] as ViewMode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} aria-label={`${m} view`}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs ${mode === m ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}>
              {m === 'Model' ? <Building className="h-3.5 w-3.5" /> : m === 'Day' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{m}</span>
            </button>
          ))}
        </div>
        {mappings.length > 0 && (
          <button onClick={() => setShowStatus((x) => !x)} className={btn} aria-pressed={showStatus}>
            {showStatus ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} <span className="hidden sm:inline">{showStatus ? 'Hide availability' : 'Show availability'}</span>
          </button>
        )}
      </div>
      <div className="absolute bottom-12 right-3 flex flex-col gap-2 sm:bottom-3">
        <button onClick={home} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80" aria-label="Whole project"><Home className="h-4 w-4" /></button>
        <button onClick={top} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-[10px] font-bold text-white backdrop-blur hover:bg-black/80" aria-label="View from the top">TOP</button>
      </div>
      {hover && <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white">Unit {labelByUnit[hover] || hover} · {statusByUnit[hover] || 'Unavailable'}</div>}
      <p className="pointer-events-none absolute bottom-3 left-3 hidden rounded bg-black/50 px-2 py-1 text-[11px] text-fg-2 sm:block">Drag to rotate · scroll or pinch to zoom · tap a unit</p>
    </div>
  );
}
