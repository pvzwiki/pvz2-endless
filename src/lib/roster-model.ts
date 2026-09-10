import data from "@/data/egypt-roster.json";
import { randomSource, type RandomSource } from "./example-rng";

export type SpawnType = { id: string; cost: number; weight: number };
export type FillStep = {
  before: number;
  after: number;
  draw: number;
  totalWeight: number;
  chosen: SpawnType;
  candidates: { type: SpawnType; start: number; end: number }[];
};
export const egypt = data;

export type RosterPool = { basic: string; pool: string[]; types: SpawnType[] };

export function selectTypes(level: number, random: number | RandomSource, pool: RosterPool = egypt) {
  const rng = randomSource(random);
  const remaining = [...pool.pool];
  const initial = [pool.basic];
  const draws: {
    before: string[];
    index: number;
    chosen: string;
    remaining: string[];
  }[] = [];
  for (let i = 0; i < 4 && remaining.length; i++) {
    const before = [...remaining],
      index = rng.bounded(remaining.length);
    const chosen = remaining.splice(index, 1)[0];
    initial.push(chosen);
    draws.push({ before, index, chosen, remaining: [...remaining] });
  }
  const selected = [...initial];
  let replacement: { removed: string; added: string } | null = null;
  if (
    level > 50 &&
    !selected.some(
      (id) => pool.types.find((type) => type.id === id)!.cost >= 1500,
    )
  ) {
    const highCost = remaining.filter(
      (id) => pool.types.find((type) => type.id === id)!.cost >= 1500,
    );
    if (highCost.length) {
      const added = highCost[rng.bounded(highCost.length)];
      replacement = { removed: selected.at(-1)!, added };
      selected[selected.length - 1] = added;
    }
  }
  return { initial, selected, replacement, draws };
}

/** Integer-weight draw; the caller supplies affordability or leader eligibility. */
export function drawWeighted(types: SpawnType[], rng: RandomSource) {
  let totalWeight = 0;
  const candidates = types.filter((type) => type.weight > 0).map((type) => {
    const start = totalWeight;
    totalWeight += type.weight;
    return { type, start, end: totalWeight };
  });
  if (!totalWeight) return null;
  const draw = rng.bounded(totalWeight);
  return { draw, totalWeight, candidates, chosen: candidates.find((item) => draw < item.end)!.type };
}

export function fillBudget(
  budget: number,
  orderedTypes: SpawnType[],
  random: number | RandomSource,
) {
  if (!Number.isInteger(budget) || budget < 0 || budget > 30000)
    throw new RangeError("Expected a budget from 0 to 30000.");
  if (
    orderedTypes.some(
      (type) =>
        !Number.isInteger(type.cost) ||
        type.cost <= 0 ||
        !Number.isInteger(type.weight) ||
        type.weight < 0,
    )
  )
    throw new RangeError("Invalid cost or weight.");
  const rng = randomSource(random);
  const steps: FillStep[] = [];
  let remaining = budget;
  while (remaining > 0) {
    const affordable = orderedTypes.filter(
      (type) => type.cost <= remaining && type.weight > 0,
    );
    const picked = drawWeighted(affordable, rng);
    if (!picked) break;
    const { chosen, draw, totalWeight, candidates } = picked;
    steps.push({
      before: remaining,
      after: remaining - chosen.cost,
      draw,
      totalWeight,
      chosen,
      candidates,
    });
    remaining -= chosen.cost;
  }
  return { steps, remaining };
}

export function reserveUnseen(budget: number, ordered: SpawnType[]) {
  let remaining = budget;
  const result: SpawnType[] = [];
  for (const type of ordered)
    if (type.cost < remaining) {
      result.push(type);
      remaining -= type.cost;
    }
  return { result, remaining };
}
