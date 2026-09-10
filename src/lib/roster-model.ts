import data from "@/data/egypt-roster.json";
import { GameRng } from "./game-rng";

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

export function selectTypes(level: number, seed: number) {
  const rng = new GameRng(seed);
  const remaining = [...data.pool];
  const initial = [data.basic];
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
      (id) => data.types.find((type) => type.id === id)!.cost >= 1500,
    )
  ) {
    const highCost = remaining.filter(
      (id) => data.types.find((type) => type.id === id)!.cost >= 1500,
    );
    if (highCost.length) {
      const added = highCost[rng.bounded(highCost.length)];
      replacement = { removed: selected.at(-1)!, added };
      selected[selected.length - 1] = added;
    }
  }
  return { initial, selected, replacement, draws };
}

export function fillBudget(
  budget: number,
  orderedTypes: SpawnType[],
  seed: number,
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
  const rng = new GameRng(seed);
  const steps: FillStep[] = [];
  let remaining = budget;
  while (remaining > 0) {
    const affordable = orderedTypes.filter(
      (type) => type.cost <= remaining && type.weight > 0,
    );
    let totalWeight = 0;
    const candidates = affordable.map((type) => {
      const start = totalWeight;
      totalWeight += type.weight;
      return { type, start, end: totalWeight };
    });
    if (!totalWeight) break;
    const draw = rng.bounded(totalWeight);
    const chosen = candidates.find((item) => draw < item.end)!.type;
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
