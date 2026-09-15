import { evolutionPlants, type EvolutionInput, type LawnPlant } from './evolution-model';
import artifactCatalog from '@/data/artifact-catalog.json';
import { evaluateArtifactFormula } from './equipment-model';

export const evolutionStages = [null, 'egypt', 'beach', 'moon', 'steam'] as const;
export const sourceChoices = evolutionPlants.filter((plant) => plant.enabled !== false);
export const defaultSourceIndex = sourceChoices.findIndex((plant) => plant.plant === 'peashooter');
const definition = artifactCatalog.items.find((artifact) => artifact.id === 'artifact_evolution')!;
const mainField = definition.values.MainField;

export type EvolutionParameters = {
  preset: number;
  source: number;
  cost: number;
  plantLevel: number;
  condition: number;
  check: number;
  rank: number;
  stage: number;
  stream: number;
  reverse: number;
  callback: number;
  lily: number;
  step: number;
};
function plant(alias: string, column: number, row: number, level = 3): LawnPlant {
  const type = evolutionPlants.find((entry) => entry.plant === alias)!;
  return {
    key: `plant-${column}-${row}`,
    alias,
    column,
    row,
    level,
    effectiveCost: type.cost ?? 0,
  };
}

/** Explicit board/check inputs, not inferred terrain behavior. The center plant is editable. */
export function evolutionScenario(p: EvolutionParameters): EvolutionInput {
  const center = plant(sourceChoices[p.source].plant, 1, 1, p.plantLevel);
  center.effectiveCost = p.cost;
  center.conditions = p.condition ? ['sheeped'] : [];
  const plants =
    p.preset === 0
      ? [
          plant('sunflower', 0, 0),
          plant('wintermelon', 1, 0, 4),
          plant('pumpkin', 2, 0, 2),
          center,
          plant('repeater', 2, 1, 5),
          plant('goldbloom', 0, 2),
          { ...plant('wallnut', 2, 2, 2), conditions: ['sheeped'] },
        ]
      : [center];
  if (p.reverse) plants.reverse();
  const selection = p.check === 1 ? [79] : p.check === 2 ? [80] : [];
  const commit = p.check === 1 ? [79] : p.check === 2 || p.check === 3 ? [80] : [];
  return {
    plants,
    corner: { column: 0, row: 0 },
    columns: 9,
    rows: 5,
    rank: p.rank,
    streamPosition: p.stream,
    clock: 0,
    cooldown: evaluateArtifactFormula(
      mainField[mainField.length - 2],
      [1, 10, 20, 30][p.rank - 1],
      p.rank,
    ).value,
    stage: evolutionStages[p.stage],
    lilyPadStageAllowed: !!p.lily,
    levelBlacklist: [],
    packetLevels: plants.map((plant) => plant.level),
    checks: { [center.key]: { selection, commit } },
    callbackOrder: p.callback ? 'reverse' : 'queued',
  };
}
