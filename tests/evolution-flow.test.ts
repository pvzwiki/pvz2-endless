import test from 'node:test';
import assert from 'node:assert/strict';
import {
  traceEvolution,
  plantingResult,
  overlapsArea,
  type EvolutionInput,
} from '../src/lib/evolution-model';

function input(overrides: Partial<EvolutionInput> = {}): EvolutionInput {
  return {
    plants: [
      { key: 'source', alias: 'peashooter', column: 1, row: 1, level: 3, effectiveCost: 450 },
    ],
    corner: { column: 0, row: 0 },
    columns: 9,
    rows: 5,
    rank: 1,
    streamPosition: 0,
    clock: 10,
    cooldown: 30,
    stage: null,
    lilyPadStageAllowed: false,
    levelBlacklist: [],
    packetLevels: [3, 5],
    checks: {},
    callbackOrder: 'queued',
    ...overrides,
  };
}

test('selection excuses only reason 79 and the later failure removes the already-chosen source', () => {
  assert.equal(plantingResult([79], true), 0);
  assert.equal(plantingResult([79, 80], true), 80);
  const frames = traceEvolution(input({ checks: { source: { selection: [79], commit: [79] } } }));
  const queued = frames.find((frame) => frame.event === 'queued')!;
  assert.equal(queued.board[0].key, 'source');
  assert.equal(queued.decisions.source.pool.length, 3);
  assert.ok(queued.decisions.source.selected);
  assert.ok(
    frames.findIndex((frame) => frame.event === 'remove') <
      frames.findIndex((frame) => frame.event === 'check'),
  );
  assert.equal(frames.at(-1)!.board.length, 0);
  assert.equal(
    frames.at(-1)!.streamPosition,
    queued.streamPosition,
    'commit cannot reroll the selection',
  );
  const blocked = traceEvolution(input({ checks: { source: { selection: [80], commit: [80] } } }));
  assert.equal(blocked.at(-1)!.board[0].key, 'source');
  assert.equal(blocked.at(-1)!.streamPosition, 0);
});

test('an empty picker preserves the source and stream but still starts the cooldown', () => {
  const initial = input();
  initial.plants[0].effectiveCost = 500;
  const frames = traceEvolution(initial);
  assert.equal(frames.at(-1)!.board[0].key, 'source');
  assert.equal(frames.at(-1)!.streamPosition, 0);
  assert.equal(frames.at(-1)!.cooldownUntil, 40);
  assert.ok(!frames.some((frame) => frame.event === 'remove'));
});

test('rank-4 checks the occupied board before removals and continues the same shuffle stream', () => {
  const frames = traceEvolution(
    input({ rank: 4, checks: { source: { selection: [79], commit: [79] } } }),
  );
  const end = frames.at(-1)!;
  assert.equal(end.board.length, 8);
  assert.ok(
    !end.board.some((plant) => plant.column === 1 && plant.row === 1),
    'the subsequently empty target is not retroactively refilled',
  );
  assert.ok(end.board.every((plant) => plant.level === 1));
  const decisions = Object.values(end.decisions).filter((decision) => decision.selected);
  assert.equal(decisions.length, 9);
  for (let i = 1; i < decisions.length; i++)
    assert.equal(decisions[i].before, decisions[i - 1].after);
  const firstRemove = frames.findIndex((frame) => frame.event === 'remove');
  assert.ok(frames.findLastIndex((frame) => frame.phase === 'bonus') < firstRemove);
  assert.deepEqual(
    decisions
      .filter((decision) => decision.kind === 'bonus')
      .slice(0, 3)
      .map((decision) => decision.cell),
    [
      { column: 0, row: 0 },
      { column: 0, row: 1 },
      { column: 0, row: 2 },
    ],
  );
});

test('callback order changes delivery order without changing selected types or inherited levels', () => {
  const initial = input({
    plants: [
      { key: 'a', alias: 'sunflower', column: 0, row: 0, level: 3, effectiveCost: 450 },
      { key: 'b', alias: 'peashooter', column: 1, row: 1, level: 5, effectiveCost: 450 },
    ],
  });
  const forward = traceEvolution(initial),
    reverse = traceEvolution({ ...initial, callbackOrder: 'reverse' });
  assert.equal(forward.find((frame) => frame.event === 'callback')!.focus, 'a');
  assert.equal(reverse.find((frame) => frame.event === 'callback')!.focus, 'b');
  assert.deepEqual(forward.at(-1)!.decisions, reverse.at(-1)!.decisions);
  assert.equal(forward.at(-1)!.board.find((plant) => plant.key === 'result-a')!.level, 3);
  assert.equal(forward.at(-1)!.board.find((plant) => plant.key === 'result-b')!.level, 5);
});

test('excluded targets consume no shuffle outputs and the result blacklist does not gate sources', () => {
  const original = input({
    plants: [{ key: 'a', alias: 'sunflower', column: 0, row: 0, level: 3, effectiveCost: 450 }],
  });
  const withExcluded = input({
    plants: [
      { key: 'vine', alias: 'pumpkin', column: 1, row: 0, level: 3, effectiveCost: 125 },
      {
        key: 'sheep',
        alias: 'wallnut',
        column: 2,
        row: 0,
        level: 3,
        effectiveCost: 50,
        conditions: ['sheeped'],
      },
      ...original.plants,
    ],
  });
  const plain = traceEvolution(original).at(-1)!,
    extra = traceEvolution(withExcluded).at(-1)!;
  assert.ok(plain.decisions.a.selected, 'sunflower is blacklisted as a result, not as a target');
  assert.deepEqual(extra.decisions.a, plain.decisions.a);
  assert.equal(extra.streamPosition, plain.streamPosition);
});

test('rectangle overlap collects a touching footprint, while the bonus pass respects board bounds', () => {
  const plant = {
    key: 'wide',
    alias: 'peashooter',
    column: -1,
    row: 0,
    width: 2,
    level: 3,
    effectiveCost: 450,
  };
  assert.equal(overlapsArea(plant, { column: 0, row: 0 }), true);
  assert.equal(overlapsArea({ ...plant, column: -2 }, { column: 0, row: 0 }), false);
  const frames = traceEvolution(input({ plants: [], rank: 4, corner: { column: 8, row: 4 } }));
  assert.deepEqual(
    frames.at(-1)!.board.map(({ column, row }) => ({ column, row })),
    [{ column: 8, row: 4 }],
  );
});
