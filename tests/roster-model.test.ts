import test from 'node:test';
import assert from 'node:assert/strict';
import { egypt, selectTypes, fillBudget, reserveUnseen } from '../src/lib/roster-model';
test('weighted draws exclude unaffordable and zero-weight entries', () => {
  const types = [
    { id: 'light', cost: 100, weight: 1 },
    { id: 'heavy', cost: 100, weight: 3 },
    { id: 'disabled', cost: 100, weight: 0 },
    { id: 'too-expensive', cost: 101, weight: 1000 },
  ];
  let draw = 0;
  const chosen = [];
  for (draw = 0; draw < 4; draw++) {
    const fill = fillBudget(100, types, { bounded: () => draw });
    chosen.push(fill.steps[0].chosen.id);
    assert.equal(fill.remaining, 0);
  }
  assert.deepEqual(chosen, ['light', 'heavy', 'heavy', 'heavy']);
});

test('filling spends only the budget and stops when no positive-weight type fits', () => {
  const fill = fillBudget(550, [
    { id: 'small', cost: 100, weight: 2 },
    { id: 'large', cost: 300, weight: 1 },
  ], 7);
  assert.equal(fill.remaining, 50);
  assert.equal(fill.steps.reduce((sum, step) => sum + step.chosen.cost, 0), 500);
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
