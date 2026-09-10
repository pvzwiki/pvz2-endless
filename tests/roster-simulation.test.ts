import test from 'node:test';
import assert from 'node:assert/strict';
import { generateOrdinaryRosters, rollLeader } from '../src/lib/roster-simulation';
import { rosterCost, applyJams } from '../src/lib/mechanism-model';

test('the leader chance has a level gate and selects at most one wave', () => {
  assert.equal(rollLeader(3, 5, { bounded() { throw new Error('Too early to roll'); } }).wave, null);
  const draws = [99, 39, 6];
  assert.equal(rollLeader(4, 9, { bounded: () => draws.shift()! }).wave, 7);
  assert.equal(rollLeader(4, 9, { bounded: () => 40 }).wave, null);
});

test('final reservation uses earlier budget-paid appearances, independent of extra leaders', () => {
  // Every filler draw picks the basic type; an extra leader appears in wave 1.
  const level = generateOrdinaryRosters('egypt', 36, { bounded: () => 0 });
  assert.ok(level.waves[0].leader);
  assert.ok(level.waves.slice(0, -1).every((wave) => wave.paid.every((row) => row.zombie === 'mummy')));
  const final = level.waves.at(-1)!;
  assert.deepEqual(final.reserved.map((row) => row.zombie), level.selection.selected.slice(1));
  assert.ok(final.reserved.some((row) => row.zombie === level.waves[0].leader!.zombie));
  assert.equal(rosterCost(final.paid) + final.remaining, final.budget);
});

test('generated rosters account for budgets, levels and extras across wave-count boundaries', () => {
  for (const world of ['egypt', 'eighties'] as const) {
    for (const displayed of [1, 4, 19, 21, 36, 49, 51, 69, 71, 81, 99, 101, 149]) {
      const level = generateOrdinaryRosters(world, displayed, 7);
      assert.equal(level.selection.selected.length, 5);
      assert.equal(new Set(level.selection.selected).size, 5);
      assert.ok(level.waves.filter((wave) => wave.leader).length <= 1);
      for (const wave of level.waves) {
        assert.equal(rosterCost(wave.paid) + wave.remaining, wave.budget);
        assert.ok(wave.remaining >= 0);
        assert.equal(rosterCost(wave.instructions) - rosterCost(wave.paid), wave.leader ? rosterCost([wave.leader]) : 0);
        assert.ok(wave.instructions.every((row) => row.level >= 1 && row.level <= 10));
        if (displayed >= 91) assert.ok(wave.instructions.every((row) => row.level === 10));
      }
      if (world === 'eighties') {
        const out = applyJams(displayed, level.waves.map((wave) => wave.instructions), 8);
        assert.ok(out.events.length > 0, `music event fits level ${displayed}`);
        out.result.forEach((wave, index) => {
          assert.deepEqual(wave.map((row) => row.level).sort(), level.waves[index].instructions.map((row) => row.level).sort());
        });
      }
    }
  }
});

test('one seed repeats a roster, while independent instructions can get either adjacent level', () => {
  const level = generateOrdinaryRosters('eighties', 36, 7);
  assert.deepEqual(level, generateOrdinaryRosters('eighties', 36, 7));
  assert.notDeepEqual(level.waves, generateOrdinaryRosters('eighties', 36, 8).waves);
  assert.deepEqual([...new Set(level.waves.flatMap((wave) => wave.instructions.map((row) => row.level)))].sort(), [4, 5]);
});
