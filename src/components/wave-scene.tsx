'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { WavePlan } from '@/lib/wave-model';
import { FallbackSculpture } from './wave-visual';

type Props = {
  plan: WavePlan;
  selected: number;
  showBoost: boolean;
  onSelect: (wave: number) => void;
};
type Column = {
  group: THREE.Group;
  base: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  extra: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  floor: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  height: number;
  boost: number;
};
export default function WaveScene(props: Props) {
  const holder = useRef<HTMLDivElement>(null),
    latest = useRef(props),
    update = useRef<(() => void) | null>(null);
  latest.current = props;
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const host = holder.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setClearColor('#10241b', 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#10241b', 24, 52);
    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
    camera.position.set(9, 9, 17);
    camera.lookAt(0, 1.3, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 1.25));
    const light = new THREE.DirectionalLight('#e8f0c4', 3.8);
    light.position.set(-7, 13, 6);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    Object.assign(light.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 });
    light.shadow.normalBias = 0.04;
    scene.add(light);
    const fill = new THREE.PointLight('#e5be81', 70);
    fill.position.set(8, 6, -5);
    scene.add(fill);
    const group = new THREE.Group();
    group.position.y = -1;
    scene.add(group);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: '#163125', roughness: 0.9 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);
    const grid = new THREE.GridHelper(34, 34, '#33583e', '#244432');
    grid.position.y = 0.014;
    group.add(grid);
    const geometry = new THREE.BoxGeometry(0.64, 1, 2.05),
      tileGeometry = new THREE.PlaneGeometry(0.87, 2.42);
    const columns: Column[] = [];
    let frame = 0,
      last = 0,
      visible = true,
      rotation = 0,
      disposed = false;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const schedule = () => {
      if (!frame && visible && !disposed) frame = requestAnimationFrame(render);
    };
    function render(time: number) {
      frame = 0;
      const delta = Math.min((time - last) / 1000 || 0.016, 0.08);
      last = time;
      let moving = false;
      const target = media.matches ? 0 : rotation;
      group.rotation.y = media.matches
        ? 0
        : THREE.MathUtils.damp(group.rotation.y, target, 5, delta);
      moving = Math.abs(group.rotation.y - target) > 0.0001;
      for (const column of columns) {
        const h = media.matches
          ? column.height
          : THREE.MathUtils.damp(column.base.scale.y, column.height, 8, delta);
        const b = media.matches
          ? column.boost
          : THREE.MathUtils.damp(column.extra.scale.y, column.boost, 8, delta);
        moving ||= Math.abs(h - column.height) > 0.001 || Math.abs(b - column.boost) > 0.001;
        column.base.scale.y = Math.max(0.001, h);
        column.base.position.y = h / 2 + 0.025;
        column.extra.scale.y = Math.max(0.001, b);
        column.extra.position.y = h + b / 2 + 0.025;
        column.extra.visible = b > 0.002;
      }
      renderer.render(scene, camera);
      if (moving) schedule();
    }
    const sync = () => {
      const { plan, selected, showBoost } = latest.current;
      const max = Math.max(...plan.waves.map((wave) => wave.budget));
      while (columns.length > plan.count) {
        const c = columns.pop()!;
        group.remove(c.group);
        c.base.material.dispose();
        c.extra.material.dispose();
        c.floor.material.dispose();
      }
      while (columns.length < plan.count) {
        const g = new THREE.Group();
        const base = new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.25 }),
        );
        const extra = new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({ roughness: 0.34, metalness: 0.4 }),
        );
        base.castShadow = true;
        base.receiveShadow = true;
        extra.castShadow = true;
        base.scale.y = 0.001;
        extra.scale.y = 0.001;
        const tile = new THREE.Mesh(
          tileGeometry,
          new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.6 }),
        );
        tile.rotation.x = -Math.PI / 2;
        tile.position.y = 0.008;
        g.add(base, extra, tile);
        group.add(g);
        columns.push({ group: g, base, extra, floor: tile, height: 0, boost: 0 });
      }
      plan.waves.forEach((wave, i) => {
        const c = columns[i];
        c.group.position.set(
          (i - (plan.count - 1) / 2) * 0.96,
          0,
          Math.sin((i / Math.max(1, plan.count - 1)) * Math.PI) * 0.6,
        );
        c.height = (wave.base / max) * 6.2;
        c.boost = showBoost ? ((wave.budget - wave.base) / max) * 6.2 : 0;
        c.base.material.color.set(wave.number === selected ? '#d5e5a9' : '#65997d');
        c.extra.material.color.set(wave.number === selected ? '#ffdda0' : '#d1a56a');
        c.floor.material.color.set(wave.number === selected ? '#6a8565' : '#243d32');
        c.base.userData.wave = wave.number;
        c.extra.userData.wave = wave.number;
      });
      schedule();
    };
    update.current = sync;
    const resize = new ResizeObserver(() => {
      const width = host.clientWidth,
        height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      schedule();
    });
    resize.observe(host);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    observer.observe(host);
    const point = new THREE.Vector2(),
      ray = new THREE.Raycaster();
    const move = (event: PointerEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      rotation = (((event.clientX - bounds.left) / bounds.width) * 2 - 1) * 0.09 - 0.06;
      schedule();
    };
    const click = (event: MouseEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      point.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      ray.setFromCamera(point, camera);
      const hit = ray
        .intersectObjects(columns.flatMap((column) => [column.base, column.extra]))
        .find((hit) => hit.object.visible);
      if (hit) latest.current.onSelect(hit.object.userData.wave);
    };
    const lost = (event: Event) => {
      event.preventDefault();
      visible = false;
      cancelAnimationFrame(frame);
      frame = 0;
      setFailed(true);
    };
    renderer.domElement.addEventListener('pointermove', move);
    renderer.domElement.addEventListener('click', click);
    renderer.domElement.addEventListener('webglcontextlost', lost);
    media.addEventListener('change', schedule);
    sync();
    return () => {
      disposed = true;
      update.current = null;
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      media.removeEventListener('change', schedule);
      renderer.domElement.removeEventListener('pointermove', move);
      renderer.domElement.removeEventListener('click', click);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      columns.forEach((c) => {
        c.base.material.dispose();
        c.extra.material.dispose();
        c.floor.material.dispose();
      });
      geometry.dispose();
      tileGeometry.dispose();
      floor.geometry.dispose();
      floor.material.dispose();
      grid.geometry.dispose();
      (Array.isArray(grid.material) ? grid.material : [grid.material]).forEach((material) =>
        material.dispose(),
      );
      light.shadow.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  useEffect(() => {
    update.current?.();
  }, [props.plan, props.selected, props.showBoost]);
  return (
    <div className="wave-canvas" ref={holder} aria-hidden="true">
      {failed && <FallbackSculpture plan={props.plan} showBoost={props.showBoost} />}
    </div>
  );
}
