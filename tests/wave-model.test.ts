import test from 'node:test';
import assert from 'node:assert/strict';
import { createWavePlan, ordinaryLevels } from '../src/lib/wave-model';
import references from './fixtures/wave-plans.json';

test('all 149 plans match the research implementation', () => {
  for (const reference of references) {
    const result = createWavePlan(reference.level);
    assert.equal(result.count, reference.wave_count, `level ${reference.level}: count`);
    assert.equal(result.spacing, reference.flag_spacing, `level ${reference.level}: spacing`);
    assert.deepEqual(result.waves.map((wave) => ({
      wave: wave.number, base_points: wave.base, fill_budget: wave.budget,
      flag_boundary: wave.flag, final: wave.final,
    })), reference.waves, `level ${reference.level}: wave plan`);
  }
});

test('explorer visits ordinary levels and excludes the Boss route', () => {
  assert.equal(ordinaryLevels.length, 120);
  assert.equal(ordinaryLevels[0], 1);
  assert.equal(ordinaryLevels.at(-1), 149);
  assert.ok(ordinaryLevels.every((level) => level % 5 !== 0));
});

test('the final/flag overlap receives one boost and truncates fractional points', () => {
  const plan = createWavePlan(149);
  assert.equal(plan.waves[9].budget, 17687);
  assert.equal(plan.waves[14].budget, 27375);
  assert.ok(plan.waves[14].flag && plan.waves[14].final);
});

test('invalid inputs cannot silently produce a misleading diagram', () => {
  for (const value of [0, 150, -1, 1.5, NaN, Infinity]) {
    assert.throws(() => createWavePlan(value), RangeError);
  }
});
