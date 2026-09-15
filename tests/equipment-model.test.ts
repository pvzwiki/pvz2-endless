import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameRng, Mt19937, libcxxShuffle } from '../src/lib/native-rng';
import { evolutionCandidates, evolutionFunnel } from '../src/lib/evolution-model';
import {
  accessoryValue,
  displayFormulaValue,
  gloveAttempt,
  weightedShares,
} from '../src/lib/equipment-model';

const evidence = JSON.parse(
  readFileSync(new URL('./fixtures/rng-evidence.json', import.meta.url), 'utf8'),
);

test('the game generator matches independent native outputs across a state-regeneration boundary', () => {
  for (const trace of evidence.game) {
    const rng = new GameRng(trace.seed);
    for (let i = 0; i <= 639; i++) {
      const value = rng.next();
      if (String(i) in trace.samples)
        assert.equal(value, trace.samples[i], `seed ${trace.seed}, draw ${i}`);
    }
  }
});

test('the library shuffle matches measured permutations and rejection consumption', () => {
  const raw = new Mt19937();
  assert.deepEqual(
    evidence.library.first.map(() => raw.next()),
    evidence.library.first,
  );
  const engine = new Mt19937();
  for (let i = 0; i < evidence.library.permutations.length; i++) {
    const before = engine.draws;
    assert.deepEqual(
      libcxxShuffle([0, 1, 2, 3, 4, 5, 6, 7], engine),
      evidence.library.permutations[i],
    );
    assert.equal(engine.draws - before, evidence.library.consumed[i]);
  }
});

test('the Evolution ceiling uses a strict price comparison after the type filters', () => {
  assert.deepEqual(
    evolutionCandidates(450)
      .map((plant) => plant.plant)
      .sort(),
    ['banana', 'cobcannon', 'wintermelon'],
  );
  assert.equal(evolutionCandidates(500).length, 0);
  const pool = evolutionFunnel([
    { plant: 'ordinary', type_class: 'PlantType', cost: 500 },
    { plant: 'disabled', type_class: 'PlantType', cost: 600, enabled: false },
    { plant: 'parallel_expensive', type_class: 'PlantType', cost: 4000 },
    { plant: 'vine', type_class: 'PlantTypeVine', cost: 600 },
  ]).pool;
  assert.deepEqual(
    evolutionCandidates(499, pool).map((plant) => plant.plant),
    ['ordinary'],
  );
  assert.equal(evolutionCandidates(500, pool).length, 0);
});

test('glove chance and deadline equality both reject, and only a pickup rearms the timer', () => {
  const input = { time: 8, deadline: 8, rate: 0.18, roll: 0.17, credited: true, allowed: true };
  assert.equal(gloveAttempt(input).reason, 'cooldown');
  assert.equal(gloveAttempt({ ...input, time: 9, roll: 0.18 }).reason, 'roll');
  assert.equal(gloveAttempt({ ...input, time: 9, credited: false }).deadline, 8);
  assert.equal(gloveAttempt({ ...input, time: 9 }).deadline, 17);
  assert.equal(accessoryValue('super_clock', 2, 'BoostPlantfoodOnKill'), 0);
  assert.equal(accessoryValue('super_clock', 3, 'BoostPlantfoodOnKill'), 0.1);
  assert.equal(accessoryValue('super_clock', 6, 'BoostPlantfoodOnKill'), 0);
});

test('formula integer division and the display guard stay separate', () => {
  assert.equal(displayFormulaValue('2+level/10', 9, 1).value, 2);
  assert.equal(displayFormulaValue('2+level/10', 10, 1).value, 3);
  assert.equal(displayFormulaValue('2.0+level/10', 9, 1).value, Math.fround(2.9));
  const guarded = displayFormulaValue('stage*1.0-1.0', 1, 1, true);
  assert.equal(guarded.raw, 0);
  assert.equal(guarded.value, 1);
  assert.equal(displayFormulaValue('stage*1.0-1.0', 1, 1, false).value, 0);
});

test('redrawing rewards the middle interval at the expense of the last interval', () => {
  assert.deepEqual(weightedShares([1, 2, 1], false), [0.25, 0.5, 0.25]);
  assert.deepEqual(weightedShares([1, 2, 1], true), [0.25, 0.5625, 0.1875]);
});
