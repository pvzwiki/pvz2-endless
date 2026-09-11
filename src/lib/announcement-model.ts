/** Two ordinary transitions with auto-next disabled and entered clock events.
 * A tap at a timed boundary is evaluated after that update. The final-wave
 * completion check also needs a later normal update; its frame duration is unknown.
 */
export function announcementScenario(input: {
  deadline: number;
  tap: number | null;
  intervalAfterSpawn: number;
  clearAfterSpawn: number;
  final: boolean;
}) {
  const { deadline, tap, intervalAfterSpawn, clearAfterSpawn, final } = input;
  if (!Number.isFinite(deadline) || deadline < 0 || deadline > 35
    || !Number.isFinite(intervalAfterSpawn) || intervalAfterSpawn < 20 || intervalAfterSpawn > 25
    || !Number.isFinite(clearAfterSpawn) || clearAfterSpawn < 0
    || (tap !== null && (!Number.isFinite(tap) || tap < 0))) {
    throw new RangeError("Invalid announcement scenario.");
  }
  const warningStart = Math.max(4, Math.fround(deadline));
  const warningEnd = Math.max(warningStart, Math.fround(Math.fround(deadline) + 5));
  // For a single earlier HP event, visibility can begin at that event or at I/2.
  const visible = Math.min(17.5, Math.fround(deadline));
  const tapTime = tap === null ? null : Math.fround(tap);
  const accepted = tapTime !== null && tapTime >= visible && tapTime < warningEnd;
  const retained = accepted && tapTime >= warningStart;
  const spawn = accepted ? tapTime : warningEnd;
  const freshDeadline = Math.fround(spawn + Math.fround(intervalAfterSpawn));
  const clear = Math.fround(spawn + Math.fround(clearAfterSpawn));
  const following = Math.max(
    Math.fround(spawn + 4),
    retained ? freshDeadline : Math.min(freshDeadline, clear),
  );
  return {
    warningStart, warningEnd, visible, accepted, retained, spawn, freshDeadline,
    clear, following, stateAfterSpawn: retained ? 2 : 1,
    completionNeedsAnotherUpdate: final && retained,
  };
}
