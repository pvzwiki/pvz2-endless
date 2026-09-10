'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { WavePlan } from '@/lib/wave-model';

function Column({ x, z, baseHeight, extraHeight, selected, delay, reduced, onSelect }: {
  x: number; z: number; baseHeight: number; extraHeight: number; selected: boolean; delay: number; reduced: boolean; onSelect: () => void;
}) {
  const base = useRef<THREE.Mesh>(null);
  const extra = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!base.current || !extra.current) return;
    const entrance = reduced ? 1 : THREE.MathUtils.smoothstep(state.clock.elapsedTime - delay, 0, 1.4);
    const dt = Math.min(delta, 0.08);
    const h = reduced ? baseHeight : THREE.MathUtils.damp(base.current.scale.y, baseHeight * entrance, 6, dt);
    const e = reduced ? extraHeight : THREE.MathUtils.damp(extra.current.scale.y, extraHeight * entrance, 6, dt);
    base.current.scale.y = Math.max(0.001, h);
    base.current.position.y = h / 2 + 0.025;
    extra.current.scale.y = Math.max(0.001, e);
    extra.current.position.y = h + e / 2 + 0.025;
    extra.current.visible = e > 0.002;
  });
  return <group position={[x, 0, z]} onClick={(event) => { event.stopPropagation(); onSelect(); }}>
    <mesh ref={base} castShadow receiveShadow scale={[1, 0.001, 1]}>
      <boxGeometry args={[0.64, 1, 2.05]} />
      <meshStandardMaterial color={selected ? '#d5e5a9' : '#65997d'} roughness={0.4} metalness={0.25} />
    </mesh>
    <mesh ref={extra} castShadow receiveShadow scale={[1, 0.001, 1]}>
      <boxGeometry args={[0.64, 1, 2.05]} />
      <meshStandardMaterial color={selected ? '#ffdda0' : '#d1a56a'} roughness={0.34} metalness={0.4} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
      <planeGeometry args={[0.87, 2.42]} />
      <meshBasicMaterial color={selected ? '#6a8565' : '#243d32'} transparent opacity={0.6} />
    </mesh>
  </group>;
}

function Sculpture({ plan, selected, reduced, showBoost, onSelect }: { plan: WavePlan; selected: number; reduced: boolean; showBoost: boolean; onSelect: (wave: number) => void }) {
  const group = useRef<THREE.Group>(null);
  const max = Math.max(...plan.waves.map((wave) => wave.budget));
  useFrame((state, delta) => {
    if (group.current && !reduced) group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y, state.pointer.x * 0.09 - 0.06, 2, Math.min(delta, 0.08));
  });
  return <>
    <ambientLight intensity={1.25} />
    <directionalLight position={[-7, 13, 6]} intensity={3.8} color="#e8f0c4" castShadow
      shadow-mapSize={[1024, 1024]} shadow-camera-left={-12} shadow-camera-right={12}
      shadow-camera-top={12} shadow-camera-bottom={-12} shadow-normalBias={0.04} />
    <pointLight position={[8, 6, -5]} intensity={70} color="#e5be81" />
    <fog attach="fog" args={['#10241b', 24, 52]} />
    <group ref={group} position={[0, -1, 0]}>
      {plan.waves.map((wave) => <Column key={wave.number} x={(wave.index - (plan.count - 1) / 2) * 0.96}
        z={Math.sin(wave.index / Math.max(1, plan.count - 1) * Math.PI) * 0.6}
        baseHeight={wave.base / max * 6.2} extraHeight={showBoost ? (wave.budget - wave.base) / max * 6.2 : 0}
        selected={wave.number === selected} delay={wave.index * 0.065} reduced={reduced} onSelect={() => onSelect(wave.number)} />)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[80, 80]} /><meshStandardMaterial color="#163125" roughness={0.9} /></mesh>
      <gridHelper args={[34, 34, '#33583e', '#244432']} position={[0, 0.014, 0]} />
    </group>
  </>;
}

export default function WaveScene({ plan, selected, showBoost, onSelect }: { plan: WavePlan; selected: number; showBoost: boolean; onSelect: (wave: number) => void }) {
  const holder = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update(); media.addEventListener('change', update);
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: '100px' });
    if (holder.current) observer.observe(holder.current);
    return () => { observer.disconnect(); media.removeEventListener('change', update); };
  }, []);
  return <div className="wave-canvas" ref={holder} aria-hidden="true">
    <Canvas shadows dpr={[1, 1.75]} frameloop={!active ? 'never' : reduced ? 'demand' : 'always'}
      camera={{ position: [9, 9, 17], fov: 37 }} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ camera, gl }) => { camera.lookAt(0, 1.3, 0); gl.setClearColor('#10241b', 0); }}>
      <Sculpture plan={plan} selected={selected} reduced={reduced} showBoost={showBoost} onSelect={onSelect} />
    </Canvas>
  </div>;
}
