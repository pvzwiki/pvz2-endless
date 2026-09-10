'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useState, type ReactNode } from 'react';
import type { WavePlan } from '@/lib/wave-model';

const WaveScene = dynamic(() => import('./wave-scene'), { ssr: false });

function Block({ x, y, height, gold = false }: { x: number; y: number; height: number; gold?: boolean }) {
  return <g><path d={`M${x},${y}l25,-8 0,${-height} -25,8z`} fill={gold ? '#d1a56a' : '#71977c'} />
    <path d={`M${x + 25},${y - 8}l10,7 0,${-height} -10,-7z`} fill={gold ? '#a27c48' : '#3e6650'} />
    <path d={`M${x},${y - height}l25,-8 10,7 -25,8z`} fill={gold ? '#ecd29d' : '#bdd2ab'} /></g>;
}

export function FallbackSculpture({ plan, showBoost = true }: { plan: WavePlan; showBoost?: boolean }) {
  const maximum = Math.max(...plan.waves.map((wave) => wave.budget));
  return <svg viewBox="0 0 560 340" className="fallback-sculpture" aria-hidden="true">
    {plan.waves.map((wave) => {
      const x = (560 - ((plan.count - 1) * 31 + 35)) / 2 + wave.index * 31;
      const y = 260 - wave.index * 3.3;
      const baseHeight = wave.base / maximum * 155;
      const extraHeight = showBoost ? (wave.budget - wave.base) / maximum * 155 : 0;
      return <g key={wave.number}><Block x={x} y={y} height={baseHeight} />
        {extraHeight > 0 && <Block x={x} y={y - baseHeight} height={extraHeight} gold />}</g>;
    })}
  </svg>;
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function SpatialView({ plan, selected, showBoost, onSelect }: { plan: WavePlan; selected: number; showBoost: boolean; onSelect: (wave: number) => void }) {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      setSupported(!!gl);
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch { setSupported(false); }
  }, []);
  const fallback = <FallbackSculpture plan={plan} showBoost={showBoost} />;
  return <SceneBoundary fallback={fallback}>{supported ? <WaveScene plan={plan} selected={selected} showBoost={showBoost} onSelect={onSelect} /> : fallback}</SceneBoundary>;
}
