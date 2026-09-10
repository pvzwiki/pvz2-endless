import baseline from '@/data/wave-baseline.json';

export type Wave = {
  number: number;
  index: number;
  base: number;
  budget: number;
  flag: boolean;
  final: boolean;
};

export type WavePlan = {
  level: number;
  count: number;
  spacing: number;
  increment: number;
  waves: Wave[];
};

export const ordinaryLevels = Array.from({ length: 149 }, (_, i) => i + 1)
  .filter((level) => level % baseline.bossInterval !== 0);

/** Reconstructed arithmetic with this guide's wave settings; accepts Boss numbers for boundary checks. */
export function createWavePlan(level: number): WavePlan {
  if (!Number.isInteger(level) || level < 1 || level > 149) {
    throw new RangeError('Expected an integer level from 1 to 149.');
  }
  const settings = baseline.settings;
  const count = Math.max(settings.MinWaveCount, Math.min(settings.MaxWaveCount,
    settings.MinWaveCount + settings.WaveAddEach * Math.trunc(level / settings.WaveAddInterval)));
  const groups = count < 7 ? 1 : count < 12 ? 2 : 3;
  const spacing = Math.ceil(count / groups);
  const increment = settings.BasePointIncrementPerWave + settings.BasePointIncrementPerLevel * level;
  const waves = Array.from({ length: count }, (_, index): Wave => {
    const base = settings.StartingPoints + increment * index;
    const flag = (index + 1) % spacing === 0;
    const final = index === count - 1;
    const budget = flag || final
      ? Math.trunc(Math.fround(Math.fround(base) * baseline.flagMultiplier)) : base;
    return { number: index + 1, index, base, budget, flag, final };
  });
  return { level, count, spacing, increment, waves };
}

export function isOrdinaryLevel(level: number): boolean {
  return ordinaryLevels.includes(level);
}
