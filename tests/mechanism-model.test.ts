import test from "node:test";
import assert from "node:assert/strict";
import levels from "./fixtures/levels-mechanism.json";
import jams from "./fixtures/jams-mechanism.json";
import foods from "./fixtures/food-mechanism.json";
import {
  mechanismInputs,
  levelRequest,
  applyJams,
  foodPlan,
  initialHistory,
  rowWeights,
  updateRowHistory,
  carrierRequests,
  specialPlacement,
  waveThreshold,
  deadlineScenario,
  advanceLootSchedule,
  entityStrength,
} from "../src/lib/mechanism-model";

test("all level requests match the independently checked research arithmetic", () => {
  for (const row of levels) {
    const out = levelRequest(row.level);
    assert.equal(out.value, row.value);
    assert.equal(out.threshold, row.upper_threshold_out_of_100);
    assert.equal(out.lower, row.lower);
    assert.equal(out.upper, row.upper);
    assert.equal(out.winning, row.upper_winning_residues);
  }
});
test("Jam schedules and replacements match the research component, including RNG draw order", () => {
  for (const row of jams) {
    const out = applyJams(row.level, row.input, row.seed);
    assert.deepEqual(out.result, row.output);
    assert.deepEqual(
      out.events.map(({ wave, jam, replacement_type, replacement_count }) => ({
        wave,
        jam,
        replacement_type,
        replacement_count,
      })),
      row.events,
    );
  }
});
test("plant-food allocation matches the original component across setup boundaries", () => {
  for (const row of foods)
    assert.deepEqual(foodPlan(row.level, row.seed).quotas, row.quota);
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
test("the health snapshot, timed gate, and automatic request have different boundaries", () => {
  assert.equal(waveThreshold(8000, 0.8), 6400);
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
test("the neutral conehead example separates level health, biting, and leader health", () => {
  const normal = entityStrength("mummy_armor1", 5, false),
    leader = entityStrength("mummy_armor1", 5, true);
  assert.equal(normal.body, 1350);
  assert.equal(normal.helmet, 1850);
  assert.ok(Math.abs(normal.bite - 900) < 0.001);
  assert.equal(leader.body, 2700);
  assert.equal(leader.helmet, 3700);
  assert.equal(leader.bite, normal.bite);
  assert.equal(entityStrength("mummy_armor1", 6, false).missingRow, true);
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

test("mechanism views contain only curated game inputs", () => {
  assert.doesNotMatch(
    JSON.stringify(mechanismInputs),
    /\/Users\/|\/home\/|file:\/\/|source_json|object_id/,
  );
});
