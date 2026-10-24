import type * as THREE from 'three';

/** True when this browser can draw WebGL (3D viewer, 360° tours). */
export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
}

/** Frees a material and every texture it holds (GLTF maps are not freed by material.dispose() alone). */
export function disposeMaterial(material: THREE.Material | THREE.Material[] | undefined | null) {
  for (const m of Array.isArray(material) ? material : material ? [material] : []) {
    for (const value of Object.values(m)) if (value && (value as THREE.Texture).isTexture) (value as THREE.Texture).dispose();
    m.dispose();
  }
}

/** Releases the GPU context at once (browsers allow only a few at a time), then removes the canvas. */
export function releaseRenderer(renderer: THREE.WebGLRenderer, mount: HTMLElement) {
  renderer.dispose();
  renderer.forceContextLoss();
  if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
}
