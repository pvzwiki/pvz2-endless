import test from 'node:test';
import assert from 'node:assert/strict';
import { createWavePlan, ordinaryLevels } from '../src/lib/wave-model';

test('explorer visits ordinary levels and excludes the Boss route', () => {
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

test('wave counts follow ten-level steps, change flag groups, and cap at fifteen', () => {
  // Hand-checked edges of the count formula and the 7-/12-wave grouping thresholds.
  for (const [level, count, spacing] of [
    [1, 5, 5], [9, 5, 5], [10, 6, 6], [19, 6, 6], [20, 7, 4],
    [36, 8, 4], [49, 9, 5], [69, 11, 6], [70, 12, 4],
    [99, 14, 5], [100, 15, 5], [101, 15, 5], [149, 15, 5],
  ]) {
    const plan = createWavePlan(level);
    assert.equal(plan.count, count, `level ${level}`);
    assert.equal(plan.spacing, spacing, `level ${level}`);
  }
});
