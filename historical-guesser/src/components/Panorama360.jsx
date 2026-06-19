import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Panorama360
 * A true 360° equirectangular viewer. The image is mapped onto the inside of a
 * sphere; drag to look around, scroll/pinch to zoom. Works for both the static
 * equirectangular panoramas and AI-generated wide scenes.
 *
 * Props:
 *   - src: string | null  -> image URL or data: URL to display
 *   - loading: boolean     -> show a spinner overlay while a scene generates
 */
export default function Panorama360({ src, loading = false }) {
  const mountRef = useRef(null);
  const ctx = useRef(null);

  // One-time Three.js setup + render loop + interaction.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      72,
      mount.clientWidth / mount.clientHeight,
      1,
      1100
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // render the texture on the inside
    const material = new THREE.MeshBasicMaterial({ color: 0x0b0d14 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const view = { lon: 0, lat: 0, fov: 72 };
    const drag = { on: false, x: 0, y: 0, lon: 0, lat: 0 };

    function onDown(e) {
      drag.on = true;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.lon = view.lon;
      drag.lat = view.lat;
      renderer.domElement.style.cursor = 'grabbing';
    }
    function onMove(e) {
      if (!drag.on) return;
      view.lon = drag.lon - (e.clientX - drag.x) * 0.13;
      view.lat = Math.max(-85, Math.min(85, drag.lat + (e.clientY - drag.y) * 0.13));
    }
    function onUp() {
      drag.on = false;
      renderer.domElement.style.cursor = 'grab';
    }
    function onWheel(e) {
      e.preventDefault();
      view.fov = Math.max(35, Math.min(90, view.fov + e.deltaY * 0.05));
      camera.fov = view.fov;
      camera.updateProjectionMatrix();
    }

    const el = renderer.domElement;
    el.style.cursor = 'grab';
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });

    let raf = 0;
    const target = new THREE.Vector3();
    function animate() {
      raf = requestAnimationFrame(animate);
      const phi = THREE.MathUtils.degToRad(90 - view.lat);
      const theta = THREE.MathUtils.degToRad(view.lon);
      target.set(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );
      camera.lookAt(target);
      renderer.render(scene, camera);
    }
    animate();

    function resize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    ctx.current = {
      material,
      resetView: () => {
        view.lon = 0;
        view.lat = 0;
        view.fov = 72;
        camera.fov = 72;
        camera.updateProjectionMatrix();
      },
    };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('wheel', onWheel);
      geometry.dispose();
      if (material.map) material.map.dispose();
      material.dispose();
      renderer.dispose();
      if (el.parentNode === mount) mount.removeChild(el);
      ctx.current = null;
    };
  }, []);

  // Swap the texture whenever the source changes.
  useEffect(() => {
    const c = ctx.current;
    if (!c) return;
    const { material } = c;

    if (!src) {
      if (material.map) {
        material.map.dispose();
        material.map = null;
      }
      material.color.set(0x0b0d14);
      material.needsUpdate = true;
      return;
    }

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(src, (tex) => {
      if (cancelled) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      if (material.map) material.map.dispose();
      material.map = tex;
      material.color.set(0xffffff);
      material.needsUpdate = true;
      c.resetView();
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div className="pano" ref={mountRef}>
      {(loading || !src) && (
        <div className="pano-overlay">
          {loading ? (
            <>
              <div className="spinner" />
              <span>Generating the scene…</span>
            </>
          ) : (
            <span>No panorama loaded</span>
          )}
        </div>
      )}
      {src && <div className="pano-hint">drag to look around · scroll to zoom</div>}
    </div>
  );
}
