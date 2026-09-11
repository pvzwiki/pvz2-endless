import test from "node:test";
import assert from "node:assert/strict";
import { INT32_MAX, entityHealthReport, healthThreshold, reportedHealth, waveHealth } from "../src/lib/wave-health";
import { waveThreshold } from "../src/lib/mechanism-model";

test("positive float32 conversion saturates instead of wrapping", () => {
  assert.equal(reportedHealth(2_147_483_520), 2_147_483_520);
  assert.equal(reportedHealth(2 ** 31), INT32_MAX);
  assert.equal(reportedHealth(10_000_000_000), INT32_MAX);
  assert.equal(entityHealthReport(2_000_000_000, 1_000_000_000), INT32_MAX);
});

test("wave reporting truncates each entity before its sequential float32 sum", () => {
  const fractional = Array.from({ length: 3 }, () => ({ body: 100.25, helmet: 0.5 }));
  assert.equal(waveHealth(fractional).reported, 300);
  const entries = Array.from({ length: 80 }, () => ({ body: 27_000_000, helmet: 0 }));
  // Corresponding FADD/SCVTF/FCVTZS sequences checked on ARM64.
  assert.equal(waveHealth(entries.slice(0, 79)).reported, 2_133_002_496);
  assert.deepEqual(waveHealth(entries), { accumulator: 2_160_002_560, reported: INT32_MAX });
  assert.equal(entries[0].body, 27_000_000);
});

test("the capped baseline is converted back to float32 before threshold multiplication", () => {
  assert.equal(healthThreshold(10_000_000_000, 0.7), 1_503_238_528);
  assert.equal(healthThreshold(10_000_000_000, 0.8), 1_717_986_944);
  assert.equal(healthThreshold(10_000_000_000, 0.85), 1_825_361_152);
  assert.equal(waveThreshold(10_000_000_000, 0.8), 1_717_986_944);
  assert.ok(reportedHealth(8_000_000_000) > healthThreshold(10_000_000_000, 0.8));
  assert.ok(reportedHealth(1_500_000_000) <= healthThreshold(10_000_000_000, 0.8));
  assert.equal(healthThreshold(8000, 0.8), 6400);
});
