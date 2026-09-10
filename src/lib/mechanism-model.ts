import inputs from "@/data/mechanism-inputs.json";
import { randomSource, type RandomSource } from "./example-rng";
import { createWavePlan } from "./wave-model";

export const mechanismInputs = inputs;
export const f32 = Math.fround;
export const clamp = (n: number, low: number, high: number) =>
  Math.max(low, Math.min(high, n));
export type Instruction = { zombie: string; level: number; leader: boolean };
export function typeRecord(id: string) {
  const record = inputs.types.find((type) => type.id === id);
  if (!record) throw new Error(`Missing curated type: ${id}`);
  return record;
}
export function typeNumber(
  id: string,
  field: "WavePointCost" | "Weight" | "Hitpoints" | "HelmHitpoints" | "EatDPS",
) {
  const value = typeRecord(id).values[field];
  if (typeof value !== "number")
    throw new Error(`No declared ${field} for ${id}`);
  return value;
}
export function levelRequest(level: number) {
  const raw = f32(f32(0.9) + f32(level) * f32(0.1));
  const value = Math.min(10, f32(Math.trunc(f32(raw * 10)) / 10));
  const lower = clamp(Math.floor(value), 1, 10),
    upper = clamp(Math.ceil(value), 1, 10);
  const threshold = f32(f32(value - lower) * 100);
  return {
    raw,
    value,
    lower,
    upper,
    threshold,
    winning:
      lower === upper
        ? 0
        : Array.from({ length: 100 }, (_, i) => i).filter((i) => i < threshold)
            .length,
  };
}
/** Shared-table health and the neutral base bite, without subclass attack dispatch. */
export function entityStrength(
  id: string,
  level: number,
  leader: boolean,
  pace = 1,
) {
  const type = typeRecord(id),
    row = inputs.strengthRows[level - 1];
  const healthMultiplier = row?.HitPointsLevel ?? 1,
    attackMultiplier = row?.AttackLevel ?? 1;
  const body =
    typeNumber(id, "Hitpoints") *
    healthMultiplier *
    (leader ? inputs.leaderRate : 1);
  // This lab chooses types with no helmet or a declared helmet, and neutral reduction factors.
  const helmet =
    (type.values.HelmHitpoints ?? 0) *
    healthMultiplier *
    (leader ? inputs.leaderRate : 1);
  const levelFactor = f32(1 + f32(0.2) * f32(level - 1));
  const bite = f32(
    f32(f32(typeNumber(id, "EatDPS") * attackMultiplier) * pace) * levelFactor,
  );
  return {
    body,
    helmet,
    bite,
    healthMultiplier,
    attackMultiplier,
    levelFactor,
    missingRow: !row,
  };
}
export type Interpolation = {
  first: number;
  second: number;
  alpha: number;
  value: number;
};
export function interpolatedDraw(
  level: number,
  bounds: readonly [number, number],
  low: readonly [number, number],
  high: readonly [number, number],
  rng: RandomSource,
): Interpolation {
  const first = low[0] + rng.bounded(low[1] - low[0] + 1);
  const second = high[0] + rng.bounded(high[1] - high[0] + 1);
  const alpha = clamp(
    f32(f32(level - bounds[0]) / (bounds[1] - bounds[0])),
    0,
    1,
  );
  return {
    first,
    second,
    alpha,
    value: Math.trunc(f32(first + f32(second - first) * alpha)),
  };
}
export const jamNames = [
  "jam_pop",
  "jam_punk",
  "jam_rap",
  "jam_8bit",
  "jam_metal",
] as const;
export const jamTypes = [
  ["eighties_glitter"],
  ["eighties_punk"],
  ["eighties_mc", "eighties_breakdancer"],
  ["eighties_arcade"],
  ["eighties_gargantuar_danger"],
];
export type VisualInstruction = Instruction & { key: string };
export type ReplacementFrame = {
  kind: "before" | "remove" | "append";
  roster: VisualInstruction[];
  removed: VisualInstruction[];
  picked?: number;
  added?: string;
};
export function applyJams(level: number, waves: Instruction[][], random: number | RandomSource) {
  const rng = randomSource(random),
    result = waves.map((wave) => wave.map((item) => ({ ...item })));
  const first = interpolatedDraw(level, [1, 15], [3, 4], [1, 2], rng);
  const available = level >= 7 ? 5 : 4;
  const count = Math.min(
    available,
    interpolatedDraw(level, [1, 15], [2, 2], [5, 5], rng).value,
  );
  const selected: number[] = [],
    selectionDraws: {
      candidate: number;
      accepted: boolean;
      selected: number[];
    }[] = [];
  while (selected.length < count) {
    const candidate = rng.bounded(available),
      accepted = !selected.includes(candidate);
    if (accepted) selected.push(candidate);
    selectionDraws.push({ candidate, accepted, selected: [...selected] });
  }
  const events: {
    wave: number;
    jam: (typeof jamNames)[number];
    replacement_type: string;
    replacement_count: number;
    amount: Interpolation;
    spacing: Interpolation;
    frames: ReplacementFrame[];
  }[] = [];
  let index = first.value;
  while (index < result.length) {
    const music = selected[rng.bounded(selected.length)],
      choices = jamTypes[music];
    const replacement_type = choices[rng.bounded(choices.length)];
    const amount = interpolatedDraw(level, [1, 50], [1, 2], [5, 7], rng);
    const wave = result[index],
      replacement_count = Math.min(amount.value, wave.length);
    const visual = wave.map((item, i) => ({ ...item, key: `w${index}-i${i}` }));
    const removed: VisualInstruction[] = [];
    const frames: ReplacementFrame[] = [
      { kind: "before", roster: [...visual], removed: [] },
    ];
    for (let i = 0; i < replacement_count; i++) {
      const picked = rng.bounded(wave.length);
      removed.push(visual[picked]);
      wave[picked] = wave.at(-1)!;
      wave.pop();
      visual[picked] = visual.at(-1)!;
      visual.pop();
      frames.push({
        kind: "remove",
        roster: [...visual],
        removed: [...removed],
        picked,
      });
    }
    for (let i = 0; i < removed.length; i++) {
      const entry = {
        zombie: replacement_type,
        level: removed[i].level,
        leader: false,
      };
      wave.push(entry);
      const key = `w${index}-new${i}`;
      visual.push({ ...entry, key });
      frames.push({
        kind: "append",
        roster: [...visual],
        removed: [...removed],
        added: key,
      });
    }
    const spacing = interpolatedDraw(level, [1, 15], [4, 5], [2, 3], rng);
    events.push({
      wave: index + 1,
      jam: jamNames[music],
      replacement_type,
      replacement_count,
      amount,
      spacing,
      frames,
    });
    index += spacing.value;
  }
  return { result, events, available, selected, selectionDraws, first };
}

export function rosterCost(roster: Instruction[]) {
  return roster.reduce(
    (sum, item) => sum + typeNumber(item.zombie, "WavePointCost"),
    0,
  );
}
export type RowHistory = { last: number; previous: number };
export function initialHistory(): RowHistory[] {
  return Array.from({ length: 5 }, () => ({ last: 0, previous: 0 }));
}
export function adjustedWeight(p: number, a: number, b: number) {
  if (p < f32(1e-6)) return 0;
  const inv = f32(1 / p),
    twice = f32(inv + inv);
  const termA = f32(f32(f32(a + 1) - inv) / inv);
  const termB = f32(f32(f32(b + 1) - twice) / twice);
  const weightedB = f32(f32(termB * 2 + 1) * 0.25);
  const factor = f32(f32(termA * 2 + 1) * 0.75 + weightedB);
  return f32(p * clamp(factor, f32(0.01), 100));
}
export function rowWeights(history: RowHistory[], enabled: boolean[]) {
  const count = enabled.filter(Boolean).length;
  const normalized = enabled.map((value) =>
    value && count ? f32(1 / count) : 0,
  );
  const weights = normalized.map((p, i) =>
    adjustedWeight(p, history[i].last, history[i].previous),
  );
  const total = weights.reduce((sum, value) => f32(sum + value), 0);
  return weights.map((weight, i) => ({
    weight,
    share: total ? weight / total : 0,
    p: normalized[i],
    ...history[i],
  }));
}
export function updateRowHistory(
  history: RowHistory[],
  enabled: boolean[],
  chosen: number,
) {
  const next = history.map((record, i) =>
    enabled[i]
      ? { last: record.last + 1, previous: record.previous + 1 }
      : { ...record },
  );
  next[chosen].previous = next[chosen].last;
  next[chosen].last = 0;
  return next;
}
export function eligibleRows(world: string, id: string) {
  const extent = typeRecord(id).values.GridExtents as { mY?: number } | null;
  const height = extent?.mY ?? 1;
  return Array.from({ length: 5 }, (_, row) => {
    if (row < height - 1) return false;
    if (world === "pirate")
      return [1, 3].includes(row)
        ? !["seagull", "swashbuckler"].includes(id)
        : ["seagull", "swashbuckler", "cannon"].includes(id);
    if (world === "future" && id === "disco_mech")
      return row !== 0 && row !== 4;
    return true;
  });
}
export function specialPlacement(
  type: "king" | "fisherman" | "ordinary",
  provisional: number,
  occupied: number[],
  circle: boolean,
  random: number | RandomSource = 0,
) {
  const afterCircle = circle ? 2 : provisional;
  const excluded = new Set(occupied);
  if (type === "king") excluded.add(afterCircle);
  const candidates =
    type === "ordinary"
      ? [afterCircle]
      : [0, 1, 2, 3, 4].filter((row) => !excluded.has(row));
  const retained = candidates.includes(afterCircle);
  return {
    afterCircle,
    candidates,
    retained,
    rejected: !candidates.length,
    final: retained ? afterCircle : candidates.length ? candidates[randomSource(random).bounded(candidates.length)] : null,
  };
}
export function foodPlan(level: number, random: number | RandomSource) {
  const rng = randomSource(random),
    flags = inputs.flagRows.filter((row) => row.MinLevel <= level),
    foods = inputs.foodRows.filter((row) => row.MinLevel <= level);
  const chosen = flags[rng.bounded(flags.length)];
  const low = Math.min(...foods.map((row) => row.MinPlantfoodPerFlagWave)),
    high = Math.min(...foods.map((row) => row.MaxPlantfoodPerFlagWave));
  const draws = Array.from(
    { length: chosen.FlagCount },
    () => low + rng.bounded(high - low + 1),
  );
  let left = draws.reduce((sum, n) => sum + n, 0);
  const plan = createWavePlan(level),
    quotas = plan.waves.map(() => 0),
    assignments: { wave: number; kind: "flag" | "remainder" }[] = [];
  for (
    let index = plan.spacing - 1;
    index < quotas.length;
    index += plan.spacing
  )
    if (left > 0) {
      quotas[index]++;
      left--;
      assignments.push({ wave: index + 1, kind: "flag" });
    }
  while (left-- > 0) {
    const index = rng.bounded(quotas.length);
    quotas[index]++;
    assignments.push({ wave: index + 1, kind: "remainder" });
  }
  return { flags, foods, chosen, low, high, draws, quotas, assignments };
}
export type CarrierExampleId =
  | "eighties"
  | "eighties_gargantuar_danger"
  | "cowboy"
  | "cowboy_gargantuar_danger";
// The four demo classes have a known Gargantuar relationship; this is not a
// classifier for arbitrary unresolved class names in the complete catalog.
export function carrierRequests(
  ids: readonly CarrierExampleId[],
  quota: number,
) {
  let remaining = quota;
  return ids.map((id) => {
    const record = typeRecord(id),
      before = remaining;
    const requested = remaining > 0 && record.values.CanSpawnPlantFood === true;
    if (requested) remaining--;
    const rejected = requested && record.zombieClass === "ZombieGargantuar";
    return {
      id,
      before,
      after: remaining,
      requested,
      rejected,
      carrier: requested && !rejected,
      declared: record.values.CanSpawnPlantFood,
    };
  });
}
export function assignLoot(ids: string[], count: number, random: number | RandomSource) {
  const rng = randomSource(random),
    remaining = ids.map((id, index) => ({
      id,
      index,
      cost: typeNumber(id, "WavePointCost"),
    }));
  const steps: {
    draw: number;
    total: number;
    chosen: number;
    remaining: number[];
  }[] = [];
  for (let i = 0; i < count && remaining.length; i++) {
    const total = remaining.reduce((sum, item) => sum + item.cost, 0);
    if (total <= 0) break;
    const draw = rng.bounded(total);
    let end = 0;
    const position = remaining.findIndex((item) => {
      end += item.cost;
      return draw < end;
    });
    const chosen = remaining[position].index;
    steps.push({
      draw,
      total,
      chosen,
      remaining: remaining.map((item) => item.index),
    });
    remaining.splice(position, 1);
  }
  return steps;
}
export function waveThreshold(health: number, fraction: number) {
  return Math.trunc(f32(f32(health) * f32(fraction)));
}
export function deadlineScenario(
  interval: number,
  crossing: number | null,
  automatic: boolean,
  guarded: boolean,
  large = false,
) {
  const deadline = crossing === null ? interval : Math.min(interval, crossing);
  const normalGate = Math.max(4, deadline),
    normal = Math.max(normalGate, deadline + (large ? 5 : 0));
  const visible =
    crossing === null ? interval / 2 : Math.min(interval / 2, crossing);
  return {
    deadline,
    normalGate,
    normal,
    visible,
    advance: automatic && !guarded ? Math.min(visible, normal) : normal,
    request: automatic && !guarded && visible <= normal,
  };
}
export type LootScheduleState = {
  length: number;
  nextDrop: number | null;
  nextSchedule: number;
};
export function advanceLootSchedule(
  state: LootScheduleState,
  length: number,
  period: number,
  phase: number,
  count: number,
) {
  if (period <= 0 || phase < 0 || phase > period)
    throw new RangeError("Invalid schedule parameters.");
  const next = { ...state, length: state.length + length },
    events: { kind: "schedule" | "drop"; at: number }[] = [];
  let scheduled = true,
    emitted = 0;
  while (scheduled) {
    scheduled = false;
    if (next.nextDrop !== null && next.nextDrop < next.length) {
      events.push({ kind: "drop", at: next.nextDrop });
      emitted += count;
      next.nextDrop = null;
    }
    if (next.nextSchedule < next.length) {
      next.nextDrop = next.nextSchedule + f32(phase);
      events.push({ kind: "schedule", at: next.nextDrop });
      next.nextSchedule += period;
      scheduled = true;
    }
  }
  return { state: next, events, emitted };
}
