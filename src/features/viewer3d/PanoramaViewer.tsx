// 360° interior viewer for equirectangular JPG panoramas (drag to look around, scroll/pinch to zoom).
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Loader2 } from 'lucide-react';

export default function PanoramaViewer({ url, onError }: { url: string; onError: (message: string) => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const errorRef = useRef(onError);
  errorRef.current = onError;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 0.01);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = -0.35;
    controls.enableDamping = true;

    const geometry = new THREE.SphereGeometry(50, 64, 32);
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial();
    scene.add(new THREE.Mesh(geometry, material));
    let disposed = false;
    new THREE.TextureLoader().load(
      url,
      (texture) => {
        if (disposed) return;
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.needsUpdate = true;
        setLoading(false);
      },
      undefined,
      () => !disposed && errorRef.current('The 360° interior could not be loaded.')
    );

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.fov = THREE.MathUtils.clamp(camera.fov + e.deltaY * 0.03, 35, 90);
      camera.updateProjectionMatrix();
    };
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    let frame = 0;
    const loop = () => {
      frame = requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    };
    loop();
    const observer = new ResizeObserver(() => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    });
    observer.observe(mount);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener('wheel', onWheel);
      controls.dispose();
      geometry.dispose();
      material.map?.dispose();
      material.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [url]);

  return (
    <div className="relative h-full w-full">
      <div ref={mountRef} className="h-full w-full cursor-grab touch-none" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60" role="status">
          <Loader2 className="h-8 w-8 animate-spin text-[#F5A623]" aria-label="Loading 360° view" />
        </div>
      )}
    </div>
  );
}
