import test from "node:test";
import assert from "node:assert/strict";
import {
  levelRequest,
  applyJams,
  foodPlan,
  initialHistory,
  rowWeights,
  updateRowHistory,
  carrierRequests,
  specialPlacement,
  deadlineScenario,
  advanceLootSchedule,
  entityStrength,
} from "../src/lib/mechanism-model";

test("level rounding preserves the fractional-residue boundary and cap", () => {
  const request = levelRequest(3);
  assert.deepEqual([request.lower, request.upper], [1, 2]);
  assert.ok(request.threshold > 10 && request.threshold < 11);
  assert.equal(request.winning, 11);
  assert.deepEqual([levelRequest(91).lower, levelRequest(149).upper], [10, 10]);
});

test("music replaces instructions without changing count or levels or retaining leader fields", () => {
  const input = Array.from({ length: 15 }, () => [
    { zombie: 'eighties', level: 2, leader: true },
    { zombie: 'eighties_armor1', level: 4, leader: true },
    { zombie: 'eighties_punk', level: 5, leader: true },
  ]);
  const before = structuredClone(input);
  const out = applyJams(149, input, 7);
  assert.deepEqual(input, before);
  assert.ok(out.events.length > 0);
  for (const event of out.events) {
    const wave = out.result[event.wave - 1];
    assert.equal(wave.length, 3);
    assert.deepEqual(wave.map((entry) => entry.level).sort(), [2, 4, 5]);
    assert.ok(wave.every((entry) => entry.zombie === event.replacement_type && !entry.leader));
  }
});

test("plant-food quotas conserve the draws and disappear at the level-55 boundary", () => {
  for (const level of [1, 54, 55, 149]) {
    const plan = foodPlan(level, 7);
    assert.equal(plan.quotas.reduce((sum, n) => sum + n, 0), plan.draws.reduce((sum, n) => sum + n, 0));
    assert.ok(plan.quotas.every((n) => Number.isInteger(n) && n >= 0));
    assert.equal(plan.high, level < 55 ? 1 : 0);
  }
});

test("row history explains repeats and distinguishes both counters", () => {
  const enabled = [true, true, true, true, true];
  let history = initialHistory();
  history = updateRowHistory(history, enabled, 0);
  assert.deepEqual(history[0], { last: 0, previous: 1 });
  assert.ok(
    rowWeights(history, enabled).every(
      (row) => Math.abs(row.share - 0.2) < 1e-6,
    ),
  );
  history = updateRowHistory(history, enabled, 1);
  const rows = rowWeights(history, enabled);
  assert.ok(Math.abs(rows[0].share - 1 / 17) < 1e-5);
  assert.ok(Math.abs(rows[2].share - 5 / 17) < 1e-5);
});
test("native carrier and placement boundary cases stay distinct", () => {
  assert.deepEqual(
    carrierRequests(["cowboy_gargantuar_danger", "cowboy"], 1).map(
      (row) => row.carrier,
    ),
    [false, false],
  );
  assert.deepEqual(
    carrierRequests(["eighties_gargantuar_danger", "eighties"], 1).map(
      (row) => row.carrier,
    ),
    [false, true],
  );
  assert.equal(specialPlacement("king", 2, [], false).retained, false);
  assert.equal(specialPlacement("fisherman", 2, [], false).retained, true);
  assert.equal(
    specialPlacement("fisherman", 1, [0, 1, 2, 3, 4], true).rejected,
    true,
  );
});
test("the timed gate and automatic request have different boundaries", () => {
  assert.equal(deadlineScenario(24, 1, false, false).advance, 4);
  assert.equal(deadlineScenario(24, 1, true, false).advance, 1);
  assert.equal(deadlineScenario(24, 1, true, true).advance, 4);
});
test("loot scheduling uses strict boundaries and can service multiple due periods", () => {
  const initial = { length: 0, nextDrop: null, nextSchedule: 0 };
  const a = advanceLootSchedule(initial, 2, 4, 2, 1);
  assert.equal(a.emitted, 0);
  assert.equal(a.state.nextDrop, 2);
  const b = advanceLootSchedule(a.state, 1, 4, 2, 1);
  assert.equal(b.emitted, 1);
  assert.equal(b.state.nextDrop, null);
  const c = advanceLootSchedule(initial, 11, 4, 2, 1);
  assert.equal(c.emitted, 3);
});
test("leader health leaves fixed-EatDPS biting unchanged and absent rows use base health", () => {
  const normal = entityStrength("mummy_armor1", 5, false);
  const leader = entityStrength("mummy_armor1", 5, true);
  assert.ok(leader.body > normal.body && leader.helmet > normal.helmet);
  assert.equal(leader.bite, normal.bite);
  const missing = entityStrength("mummy_armor1", 6, false);
  const base = entityStrength("mummy_armor1", 1, false);
  assert.equal(missing.body, base.body);
  assert.equal(missing.helmet, base.helmet);
});

test("large-wave announcement shifts the old deadline, and an allowed automatic event runs first", () => {
  const guarded = deadlineScenario(35, 1, true, true, true);
  assert.equal(guarded.normalGate, 4);
  assert.equal(guarded.deadline, 1);
  assert.equal(guarded.advance, 6);
  assert.equal(deadlineScenario(35, null, false, true, true).advance, 40);
  assert.equal(deadlineScenario(35, 1, true, false, true).advance, 1);
  assert.equal(deadlineScenario(24, 10, true, false).request, true);
});

test('a second plant-food unit at level 49 enters the remainder draw after wave 5', () => {
  // Last eligible flag row requests two draws; max count gives one unit each.
  const plan = foodPlan(49, { bounded: (limit) => limit - 1 });
  assert.deepEqual(plan.draws, [1, 1]);
  assert.deepEqual(plan.assignments, [{ wave: 5, kind: 'flag' }, { wave: 9, kind: 'remainder' }]);
});
