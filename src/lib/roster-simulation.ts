import { createWavePlan } from './wave-model';
import { randomSource, type RandomSource } from './example-rng';
import { selectTypes, reserveUnseen, fillBudget, drawWeighted } from './roster-model';
import { mechanismInputs, levelRequest, typeNumber, type Instruction } from './mechanism-model';

/** 0x101ce8a54 rolls this once per level, before materializing individual waves. */
export function rollLeader(level: number, waveCount: number, rng: RandomSource) {
  const threshold = Math.fround(Math.fround(mechanismInputs.leaderProbability) * 100);
  if (level < 4) return { roll: null, wave: null, threshold };
  // The inspected wealth chance is zero. It cannot append an entry in this model.
  rng.bounded(100);
  const roll = rng.bounded(100);
  return { roll, wave: roll < threshold ? rng.bounded(waveCount) + 1 : null, threshold };
}

/** Reconstruct the ordinary action for every wave, before world postprocessing.
 * Selected display order replaces native pointer order. Module overrides, combat,
 * and the separate flag action's entity construction are outside this model.
 */
export function generateOrdinaryRosters(
  worldId: 'egypt' | 'eighties', level: number, random: number | RandomSource,
) {
  const plan = createWavePlan(level), rng = randomSource(random);
  const world = mechanismInputs.worlds.find((row) => row.id === worldId)!;
  const pool = {
    ...world,
    types: [world.basic, ...world.pool].map((id) => ({
      id, cost: typeNumber(id, 'WavePointCost'), weight: typeNumber(id, 'Weight'),
    })),
  };
  const selection = selectTypes(level, rng, pool);
  const types = selection.selected.map((id) => pool.types.find((type) => type.id === id)!);
  const leaderAttempt = rollLeader(level, plan.count, rng);
  const request = levelRequest(level);
  const instruction = (zombie: string, leader = false): Instruction => ({
    zombie, leader,
    level: request.lower === request.upper ? request.lower
      : rng.bounded(100) < request.threshold ? request.upper : request.lower,
  });
  const unseen = new Set(selection.selected);
  const waves = plan.waves.map((wave) => {
    const unseenBefore = types.filter((type) => unseen.has(type.id));
    // 0x101ce8598 reserves strictly affordable unseen types before normal filling.
    const reservation = wave.final ? reserveUnseen(wave.budget, unseenBefore)
      : { result: [], remaining: wave.budget };
    const fill = fillBudget(reservation.remaining, types, rng);
    const reserved = reservation.result.map((type) => instruction(type.id));
    const filled = fill.steps.map((step) => instruction(step.chosen.id));
    const paid = [...reserved, ...filled];
    // Native bookkeeping erases budget-paid types here, before extra entries.
    for (const item of paid) unseen.delete(item.zombie);
    const leaderType = wave.number === leaderAttempt.wave
      ? drawWeighted(types.filter((type) => type.cost > mechanismInputs.leaderMinCost), rng)?.chosen : undefined;
    const leader = leaderType ? instruction(leaderType.id, true) : null;
    return {
      ...wave, unseenBefore: unseenBefore.map((type) => type.id),
      reserved, filled, paid, remaining: fill.remaining, leader,
      instructions: leader ? [...paid, leader] : paid,
      flagType: wave.flag || wave.final ? world.flag : null,
    };
  });
  return { plan, selection, types, leaderAttempt, waves };
}
