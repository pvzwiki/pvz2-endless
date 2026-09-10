import { createWavePlan, ordinaryLevels, type Wave } from './wave-model';

export const ordinaryPlans = ordinaryLevels.map(createWavePlan);

export function filterLevels(query: string): number[] {
  if (!query.trim()) return ordinaryLevels;
  const requested = new Set<number>();
  for (const part of query.split(/[,，]/)) {
    const match = part.trim().match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/);
    if (!match) return [];
    const start = Number(match[1]), end = Number(match[2] || match[1]);
    if (start > end) return [];
    for (const level of ordinaryLevels) if (level >= start && level <= end) requested.add(level);
  }
  return ordinaryLevels.filter((level) => requested.has(level));
}

export function groupWaves(waves: Wave[]): Wave[][] {
  const groups: Wave[][] = [];
  let current: Wave[] = [];
  for (const wave of waves) {
    current.push(wave);
    if (wave.flag || wave.final) { groups.push(current); current = []; }
  }
  if (current.length) groups.push(current);
  return groups;
}
