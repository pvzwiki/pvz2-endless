import test from 'node:test';
import assert from 'node:assert/strict';
import { advancePortal, portalReplay, advanceSmokeDamage, type PortalState } from '../src/lib/runtime-model';
import { specialPlacement } from '../src/lib/mechanism-model';

test('portal updates wait for opening, emit once, retain old deadlines, and close separately', () => {
  let state: PortalState = {
    phase: 'opening', time: 0, deadline: 3, children: [],
    queue: [{ id: 'same', slot: 0 }, { id: 'same', slot: 1 }],
  };
  state = advancePortal(state, 'update', 20, 11);
  assert.equal(state.children.length, 0);
  state = advancePortal(state, 'opened', 20, 11);
  state = advancePortal(state, 'update', 20, 11);
  assert.equal(state.children.length, 1);
  assert.equal(state.deadline, 14); // Based on 3, not the late update time 20.
  state = advancePortal(state, 'update', 20, 11);
  assert.deepEqual(state.children.map((child) => child.slot), [0, 1]);
  assert.equal(state.deadline, 25);
  assert.equal(state.phase, 'open'); // Last emission is not the close event.
  state = advancePortal(state, 'update', 24, 11);
  assert.equal(state.phase, 'open');
  state = advancePortal(state, 'update', 25, 11);
  assert.equal(state.phase, 'closing');
  state = advancePortal(state, 'closed', 27, 11);
  assert.equal(state.phase, 'removed');
  const frames = portalReplay(['a', 'a', 'b', 'c'], 7, 3, 11, 20);
  assert.deepEqual(frames.at(-1)!.state.children.map((child) => child.slot).sort(), [0, 1, 2, 3]);
});

test('smoke carries accumulated time between different deltas and services one pass per update', () => {
  let state = advanceSmokeDamage({ accumulator: 0, passes: 0 }, 1);
  assert.deepEqual(state, { accumulator: 1, passes: 0 });
  state = advanceSmokeDamage(state, 3);
  assert.deepEqual(state, { accumulator: 3, passes: 1 });
  state = advanceSmokeDamage(state, 0);
  assert.deepEqual(state, { accumulator: 2, passes: 2 });
});

test('placement samples only remaining rows and keeps a valid Fisherman row without drawing', () => {
  const king = specialPlacement('king', 2, [0, 3], false, { bounded: (limit) => limit - 1 });
  assert.equal(king.final, 4);
  assert.equal(king.retained, false);
  const retained = specialPlacement('fisherman', 2, [0, 3], false, { bounded() { throw new Error('Retained row must not draw'); } });
  assert.equal(retained.final, 2);
  assert.equal(specialPlacement('fisherman', 2, [0, 1, 2, 3, 4], true).final, null);
});
