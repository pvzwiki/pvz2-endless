import { shuffled } from './example-rng';

export type PortalSlot = { id: string; slot: number };
export type PortalState = {
  phase: 'opening' | 'open' | 'closing' | 'removed';
  time: number;
  deadline: number;
  queue: PortalSlot[];
  children: PortalSlot[];
};
export type PortalEvent = 'opened' | 'update' | 'closed';

/** 0x100121908 / 0x100121a00: at most one emission per due update.
 * Opening and close-animation completion are external callbacks.
 */
export function advancePortal(state: PortalState, event: PortalEvent, time: number, interval: number): PortalState {
  if (!Number.isFinite(time) || time < state.time || !Number.isFinite(interval) || interval <= 0)
    throw new RangeError('Expected nondecreasing time and a positive interval.');
  const next = { ...state, time };
  if (event === 'opened' && state.phase === 'opening') return { ...next, phase: 'open' };
  if (event === 'closed' && state.phase === 'closing') return { ...next, phase: 'removed' };
  if (event !== 'update' || state.phase !== 'open' || time < state.deadline) return next;
  if (!state.queue.length) return { ...next, phase: 'closing' };
  return {
    ...next, queue: state.queue.slice(1), children: [...state.children, state.queue[0]],
    deadline: state.deadline + interval,
  };
}

export function portalReplay(types: string[], seed: number, offset: number, interval: number, opensAt: number) {
  if (offset < 0 || opensAt < 0) throw new RangeError('Expected nonnegative clock inputs.');
  let state: PortalState = {
    phase: 'opening', time: 0, deadline: offset,
    queue: types.map((id, slot) => ({ id, slot })), children: [],
  };
  type Frame = { kind: 'copy' | 'shuffle' | 'opening' | 'open' | 'emit' | 'closing' | 'removed'; state: PortalState };
  const frames: Frame[] = [{ kind: 'copy', state }];
  state = { ...state, queue: shuffled(state.queue, seed) };
  frames.push({ kind: 'shuffle', state }, { kind: 'opening', state });
  state = advancePortal(state, 'opened', opensAt, interval);
  frames.push({ kind: 'open', state });
  while (state.phase === 'open') {
    state = advancePortal(state, 'update', Math.max(state.time, state.deadline), interval);
    frames.push({ kind: state.phase === 'closing' ? 'closing' : 'emit', state });
  }
  // The replay explicitly supplies the completion event; no animation duration is assumed.
  state = advancePortal(state, 'closed', state.time, interval);
  frames.push({ kind: 'removed', state });
  return frames;
}

export type SmokeDamageState = { accumulator: number; passes: number };
/** State 4 in 0x101478070: strict > 1, one subtraction per update, no catch-up loop. */
export function advanceSmokeDamage(state: SmokeDamageState, delta: number): SmokeDamageState {
  if (!Number.isFinite(delta) || delta < 0) throw new RangeError('Expected a nonnegative delta.');
  const accumulated = Math.fround(Math.fround(state.accumulator) + Math.fround(delta)), due = accumulated > 1;
  return { accumulator: due ? Math.fround(accumulated - 1) : accumulated, passes: state.passes + Number(due) };
}
