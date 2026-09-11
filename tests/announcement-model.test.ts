import test from "node:test";
import assert from "node:assert/strict";
import { announcementScenario } from "../src/lib/announcement-model";

const scenario = { deadline: 30, tap: 31, intervalAfterSpawn: 22.5, clearAfterSpawn: 5, final: false };

test("a warning-time tap starts one wave and leaves its fresh deadline in state 2", () => {
  const result = announcementScenario(scenario);
  assert.equal(result.warningStart, 30);
  assert.equal(result.warningEnd, 35);
  assert.equal(result.spawn, 31);
  assert.equal(result.stateAfterSpawn, 2);
  assert.equal(result.freshDeadline, 53.5);
  assert.equal(result.clear, 36);
  assert.equal(result.following, 53.5);
});

test("normal timeout and a pre-warning tap retain HP-driven following transitions", () => {
  const normal = announcementScenario({ ...scenario, tap: null });
  assert.equal(normal.spawn, 35);
  assert.equal(normal.stateAfterSpawn, 1);
  assert.equal(normal.following, 40);
  const early = announcementScenario({ ...scenario, tap: 20 });
  assert.equal(early.spawn, 20);
  assert.equal(early.stateAfterSpawn, 1);
  assert.equal(early.following, 25);
});

test("only available pre-spawn taps apply; the timed update wins an exact end tie", () => {
  for (const tap of [0, 17.4, 35, 40]) {
    const result = announcementScenario({ ...scenario, tap });
    assert.equal(result.accepted, false);
    assert.equal(result.spawn, 35);
  }
  assert.equal(announcementScenario({ ...scenario, tap: 17.5 }).accepted, true);
  const atEntry = announcementScenario({ ...scenario, tap: 30 });
  assert.equal(atEntry.retained, true);
});

test("the old-deadline shift, minimum interval, and final bookkeeping remain separate", () => {
  const earlyHealth = announcementScenario({ ...scenario, deadline: 1, tap: null, clearAfterSpawn: 0 });
  assert.equal(earlyHealth.warningStart, 4);
  assert.equal(earlyHealth.warningEnd, 6);
  assert.equal(earlyHealth.following, 10);
  const final = announcementScenario({ ...scenario, final: true });
  assert.equal(final.following, 53.5);
  assert.equal(final.completionNeedsAnotherUpdate, true);
  assert.equal(announcementScenario({ ...scenario, tap: null, final: true }).completionNeedsAnotherUpdate, false);
});
