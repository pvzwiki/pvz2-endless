import test from 'node:test';
import assert from 'node:assert/strict';
import { GameRng } from '../src/lib/game-rng';
import { egypt, selectTypes, fillBudget, reserveUnseen } from '../src/lib/roster-model';
import fixtures from './fixtures/rosters.json';
import rngFixtures from './fixtures/roster-rng.json';

test('the integer stream matches the research component through state rollover', () => {
  for (const fixture of rngFixtures) {
    const rng = new GameRng(fixture.seed);
    assert.deepEqual(fixture.raw.map(() => rng.next()), fixture.raw);
  }
});
test('selection and filling match 27 independently generated research cases', () => {
  for (const fixture of fixtures) {
    const selection = selectTypes(fixture.level, fixture.seed);
    assert.deepEqual(selection.selected, fixture.selected);
    const types = selection.selected.map((id) => egypt.types.find((type) => type.id === id)!);
    const result = fillBudget(fixture.budget, types, fixture.seed + 1);
    assert.deepEqual(result.steps.map((step) => step.chosen.id), fixture.roster);
    assert.equal(result.remaining, fixture.remaining);
    for (const step of result.steps) {
      assert.ok(step.chosen.cost <= step.before);
      assert.equal(step.before - step.chosen.cost, step.after);
      assert.ok(step.candidates.every(({ type }) => type.cost <= step.before));
    }
  }
});
test('exact matches are allowed by filling but excluded by final reservation', () => {
  const type = { id: 'example', cost: 300, weight: 1000 };
  assert.equal(reserveUnseen(300, [type]).result.length, 0);
  assert.equal(fillBudget(300, [type], 1).steps.length, 1);
});
test('the post-50 rule installs a high-cost type and preserves the basic type', () => {
  for (let seed = 1; seed < 40; seed++) {
    const selection = selectTypes(51, seed);
    assert.equal(selection.selected[0], egypt.basic);
    assert.ok(selection.selected.some((id) => egypt.types.find((type) => type.id === id)!.cost >= 1500));
  }
});
