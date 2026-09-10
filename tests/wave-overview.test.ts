import test from 'node:test';
import assert from 'node:assert/strict';
import { filterLevels, groupWaves } from '../src/lib/wave-overview';
import { createWavePlan } from '../src/lib/wave-model';

test('comparison filters support exact numbers, lists, and ranges without Boss levels', () => {
  assert.equal(filterLevels('').length, 120);
  assert.deepEqual(filterLevels('36'), [36]);
  assert.deepEqual(filterLevels('1, 36, 149'), [1, 36, 149]);
  assert.deepEqual(filterLevels('1–6'), [1, 2, 3, 4, 6]);
  assert.deepEqual(filterLevels('36, 36'), [36]);
  for (const query of ['10', '5–2', 'abc', '150']) assert.deepEqual(filterLevels(query), []);
});
test('flag grouping preserves absolute wave numbers and the short final group', () => {
  assert.deepEqual(groupWaves(createWavePlan(149).waves).map((group) => group.map((wave) => wave.number)), [[1,2,3,4,5],[6,7,8,9,10],[11,12,13,14,15]]);
  assert.deepEqual(groupWaves(createWavePlan(36).waves).map((group) => group.length), [5,5,3]);
});
