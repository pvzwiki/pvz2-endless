import { libcxxShuffle, libraryEngineAt } from './native-rng';
import inputs from '@/data/evolution-inputs.json';
export type EvolutionPlant = {
  plant: string;
  type_class: string;
  cost: number | null;
  enabled?: boolean;
  hero_properties?: unknown;
  is_consumable?: boolean;
  valid_stages?: string[];
  black_list_stages?: string[];
};
export const evolutionPlants = inputs.plants as EvolutionPlant[];
export const evolutionBlacklist = new Set(inputs.blacklist);
const aliases = new Set(['coffeebean', 'pumpkin', 'powervine', 'peavine']);
const classes = new Set([
  'PlantTypeVine',
  'PlantTypeAquaVine',
  'PlantTypeMiniShroom',
  'PlantTypeShinevine',
]);
export const evolutionFilters = [
  (plant: EvolutionPlant) => plant.enabled !== false,
  (plant: EvolutionPlant) => !aliases.has(plant.plant),
  (plant: EvolutionPlant) => !classes.has(plant.type_class),
  (plant: EvolutionPlant) => !Object.hasOwn(plant, 'hero_properties'),
  (plant: EvolutionPlant) => !plant.plant.startsWith('parallel_'),
  (plant: EvolutionPlant) => !plant.is_consumable,
  (plant: EvolutionPlant) => !evolutionBlacklist.has(plant.plant),
] as const;
export function evolutionFunnel(plants: readonly EvolutionPlant[] = evolutionPlants) {
  let pool = [...plants];
  const steps = evolutionFilters.map((filter, index) => {
    const before = pool;
    pool = pool.filter(filter);
    return {
      index,
      remaining: pool.length,
      removed: before.filter((plant) => !filter(plant)).map((plant) => plant.plant),
    };
  });
  return { declared: plants.length, steps, pool };
}
export function evolutionCandidates(
  cost: number,
  plants: readonly EvolutionPlant[] = evolutionFunnel().pool,
) {
  if (!Number.isFinite(cost) || cost < 0)
    throw new RangeError('Effective cost must be nonnegative.');
  return plants.filter((plant) => typeof plant.cost === 'number' && plant.cost > cost);
}
export function evolutionExclusion(plant: EvolutionPlant, cost: number): number | null {
  const step = evolutionFilters.findIndex((filter) => !filter(plant));
  if (step >= 0) return step;
  return plant.cost === null || plant.cost <= cost ? 7 : null;
}

export type Cell = { column: number; row: number };
export type ScenePlant = Cell & {
  key: string;
  alias: string;
  level: number;
  width?: number;
  height?: number;
};
export type LawnPlant = ScenePlant & { effectiveCost: number; conditions?: readonly string[] };
export type PlantingChecks = {
  selection: readonly number[];
  commit: readonly number[];
  rejectedAliases?: readonly string[];
};
export type EvolutionInput = {
  plants: readonly LawnPlant[];
  corner: Cell;
  columns: number;
  rows: number;
  rank: number;
  streamPosition: number;
  clock: number;
  cooldown: number;
  stage: string | null;
  lilyPadStageAllowed: boolean;
  levelBlacklist: readonly string[];
  packetLevels: readonly number[];
  checks: Readonly<Record<string, PlantingChecks>>;
  callbackOrder: 'queued' | 'reverse';
};
export type EvolutionDecision = {
  key: string;
  kind: 'replacement' | 'bonus';
  cell: Cell;
  source?: LawnPlant;
  level: number;
  pool: readonly string[];
  shuffled: readonly string[];
  selected?: string;
  before: number;
  after: number;
  rejected: { cost: number; stage: number; tile: number; blacklist: number };
  selectionReasons: readonly number[];
  commitReasons: readonly number[];
};
export type EvolutionEvent =
  | 'ready'
  | 'trigger'
  | 'collect'
  | 'skip'
  | 'pool'
  | 'pick'
  | 'queued'
  | 'bonusStart'
  | 'bonusOutside'
  | 'bonusOccupied'
  | 'bonusPool'
  | 'bonusPick'
  | 'bonusQueued'
  | 'callback'
  | 'remove'
  | 'check'
  | 'added'
  | 'failed'
  | 'complete';
export type EvolutionFrame = {
  event: EvolutionEvent;
  phase: 'start' | 'targets' | 'selection' | 'bonus' | 'effects' | 'complete';
  /** Active plant anchors; this is not the deferred-erasure Board object list. */
  board: readonly ScenePlant[];
  pending: readonly string[];
  decisions: Readonly<Record<string, EvolutionDecision>>;
  focus?: string;
  cell?: Cell;
  reason?: string;
  blockingReason?: number;
  streamPosition: number;
  cooldownUntil: number | null;
};
const blockedConditions = new Set([
  'sheeped',
  'mind_controlled_extra',
  'witch_group_sheeped',
  'witch_group_frogged',
  'witch_group_chicked',
]);
const emptyChecks: PlantingChecks = { selection: [], commit: [] };

export function overlapsArea(plant: LawnPlant, corner: Cell): boolean {
  return (
    plant.column < corner.column + 3 &&
    plant.row < corner.row + 3 &&
    corner.column < plant.column + (plant.width ?? 1) &&
    corner.row < plant.row + (plant.height ?? 1)
  );
}
export function targetExclusion(plant: LawnPlant, type: EvolutionPlant): string | null {
  if (plant.conditions?.some((condition) => blockedConditions.has(condition))) return 'condition';
  if (type.is_consumable) return 'consumable';
  if (aliases.has(type.plant)) return 'alias';
  if (classes.has(type.type_class)) return 'class';
  if (Object.hasOwn(type, 'hero_properties')) return 'hero';
  if (type.plant.startsWith('parallel_')) return 'parallel';
  return null;
}
/** The native helper erases excused reasons, then returns the greatest remaining code. */
export function plantingResult(reasons: readonly number[], excuse79: boolean): number {
  if (reasons.some((reason) => !Number.isSafeInteger(reason) || reason < 0))
    throw new RangeError('Planting reasons must be nonnegative integers.');
  return Math.max(0, ...reasons.filter((reason) => !(excuse79 && reason === 79)));
}
export function stageAllows(type: EvolutionPlant, stage: string | null, lilyPadAllowed: boolean) {
  if (!stage) return true;
  if (type.type_class === 'PlantTypeLilyPad') return lilyPadAllowed;
  if (type.black_list_stages?.includes(stage)) return false;
  return !type.valid_stages?.length || type.valid_stages.includes(stage);
}
export function bonusPlantLevel(packetLevels: readonly number[]) {
  return packetLevels.reduce((result, level) => Math.min(result, level), 1);
}

/** One activation. Target order, check results, and callback order are explicit inputs. */
export function traceEvolution(
  input: EvolutionInput,
  registry = evolutionPlants,
): EvolutionFrame[] {
  if (!Number.isInteger(input.rank) || input.rank < 1 || input.rank > 4)
    throw new RangeError('Artifact rank must be 1–4.');
  if (!Number.isFinite(input.clock) || !Number.isFinite(input.cooldown) || input.cooldown < 0)
    throw new RangeError('Invalid trigger clock or cooldown.');
  const byAlias = new Map(registry.map((plant) => [plant.plant, plant]));
  if (new Set(input.plants.map((plant) => plant.key)).size !== input.plants.length)
    throw new Error('Plant keys must be unique.');
  for (const plant of input.plants) {
    if (!byAlias.has(plant.alias)) throw new Error(`Unknown plant ${plant.alias}`);
    if (!Number.isFinite(plant.effectiveCost) || plant.effectiveCost < 0)
      throw new RangeError('Effective costs must be nonnegative.');
  }
  const engine = libraryEngineAt(input.streamPosition);
  // The constructor applies Enabled; the remaining type gates are shared by the three pickers.
  const typePool = registry.filter((plant) =>
    evolutionFilters.slice(0, 6).every((filter) => filter(plant)),
  );
  const blacklist = new Set([...evolutionBlacklist, ...input.levelBlacklist]);
  let board: ScenePlant[] = input.plants.map((plant) => ({ ...plant }));
  const decisions: Record<string, EvolutionDecision> = {};
  let pending: string[] = [];
  let cooldownUntil: number | null = null;
  const frames: EvolutionFrame[] = [];
  function record(
    event: EvolutionEvent,
    phase: EvolutionFrame['phase'],
    extra: Partial<EvolutionFrame> = {},
  ) {
    frames.push({
      event,
      phase,
      board: [...board],
      decisions: { ...decisions },
      pending: [...pending],
      streamPosition: engine.draws,
      cooldownUntil,
      ...extra,
    });
  }
  function poolFor(key: string, cell: Cell, source?: LawnPlant): EvolutionDecision {
    const checks = input.checks[key] ?? emptyChecks;
    const rejected = { cost: 0, stage: 0, tile: 0, blacklist: 0 };
    const bonus = !source;
    const pool = typePool
      .filter((type) => {
        if (type.cost === null || (source ? type.cost <= source.effectiveCost : type.cost > 100)) {
          rejected.cost++;
          return false;
        }
        if (!stageAllows(type, input.stage, input.lilyPadStageAllowed)) {
          rejected.stage++;
          return false;
        }
        if (
          plantingResult(checks.selection, !bonus) ||
          checks.rejectedAliases?.includes(type.plant)
        ) {
          rejected.tile++;
          return false;
        }
        if (blacklist.has(type.plant)) {
          rejected.blacklist++;
          return false;
        }
        return true;
      })
      .map((type) => type.plant);
    return {
      key,
      kind: bonus ? 'bonus' : 'replacement',
      cell,
      source,
      level: source?.level ?? bonusPlantLevel(input.packetLevels),
      pool,
      shuffled: [],
      before: engine.draws,
      after: engine.draws,
      rejected,
      selectionReasons: checks.selection,
      commitReasons: checks.commit,
    };
  }
  function pick(decision: EvolutionDecision) {
    const shuffled = libcxxShuffle(decision.pool, engine);
    decisions[decision.key] = { ...decision, shuffled, selected: shuffled[0], after: engine.draws };
  }
  record('ready', 'start');
  cooldownUntil = Math.fround(Math.fround(input.clock) + Math.fround(input.cooldown));
  record('trigger', 'start');
  const targets = input.plants.filter((plant) => overlapsArea(plant, input.corner));
  record('collect', 'targets');
  for (const source of targets) {
    const reason = targetExclusion(source, byAlias.get(source.alias)!);
    if (reason) {
      record('skip', 'targets', { focus: source.key, cell: source, reason });
      continue;
    }
    const decision = poolFor(source.key, source, source);
    decisions[source.key] = decision;
    record('pool', 'selection', { focus: source.key, cell: source });
    if (!decision.pool.length) {
      record('skip', 'selection', { focus: source.key, cell: source, reason: 'emptyPool' });
      continue;
    }
    pick(decision);
    record('pick', 'selection', { focus: source.key, cell: source });
    pending.push(source.key);
    record('queued', 'selection', { focus: source.key, cell: source });
  }
  if (input.rank === 4) {
    record('bonusStart', 'bonus');
    // The native loop advances rows inside columns. No replacement effect has run yet.
    for (let column = input.corner.column; column < input.corner.column + 3; column++) {
      for (let row = input.corner.row; row < input.corner.row + 3; row++) {
        const cell = { column, row },
          key = `bonus-${column}-${row}`;
        if (column < 0 || row < 0 || column >= input.columns || row >= input.rows) {
          record('bonusOutside', 'bonus', { cell });
          continue;
        }
        const occupied = board.some(
          (plant) =>
            column >= plant.column &&
            column < plant.column + (plant.width ?? 1) &&
            row >= plant.row &&
            row < plant.row + (plant.height ?? 1),
        );
        if (occupied) {
          record('bonusOccupied', 'bonus', { cell, reason: 'occupied' });
          continue;
        }
        const decision = poolFor(key, cell);
        decisions[key] = decision;
        record('bonusPool', 'bonus', { focus: key, cell });
        if (!decision.pool.length) continue;
        pick(decision);
        record('bonusPick', 'bonus', { focus: key, cell });
        pending.push(key);
        record('bonusQueued', 'bonus', { focus: key, cell });
      }
    }
  }
  const callbacks = input.callbackOrder === 'reverse' ? [...pending].reverse() : [...pending];
  for (const key of callbacks) {
    const decision = decisions[key];
    record('callback', 'effects', { focus: key, cell: decision.cell });
    if (decision.source) {
      board = board.filter((plant) => plant.key !== key);
      record('remove', 'effects', { focus: key, cell: decision.cell });
    }
    const result = plantingResult(decision.commitReasons, false);
    record('check', 'effects', { focus: key, cell: decision.cell, blockingReason: result });
    pending = pending.filter((effect) => effect !== key);
    if (result)
      record('failed', 'effects', { focus: key, cell: decision.cell, blockingReason: result });
    else {
      board.push({
        ...decision.cell,
        key: `result-${key}`,
        alias: decision.selected!,
        level: decision.level,
      });
      record('added', 'effects', { focus: key, cell: decision.cell });
    }
  }
  record('complete', 'complete');
  return frames;
}
