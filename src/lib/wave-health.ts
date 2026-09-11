/** The inspected non-trapping ARM64 float32-to-signed-int32 conversion. */
export const INT32_MAX = 2_147_483_647;
const INT32_MIN = -2_147_483_648;

export function reportedHealth(accumulator: number) {
  const value = Math.fround(accumulator);
  if (Number.isNaN(value)) return 0;
  return Math.max(INT32_MIN, Math.min(INT32_MAX, Math.trunc(value))) || 0;
}

/** Base virtual getter; eligibility and subclass overrides are caller inputs. */
export function entityHealthReport(body: number, helmet = 0) {
  return reportedHealth(Math.fround(Math.fround(body) + Math.fround(helmet)));
}

/** Eligible entities in query order, including each getter's integer conversion. */
export function waveHealth(entities: readonly { body: number; helmet: number }[]) {
  let accumulator = 0;
  for (const entity of entities) {
    const contribution = entityHealthReport(entity.body, entity.helmet);
    accumulator = Math.fround(accumulator + Math.fround(contribution));
  }
  return { accumulator, reported: reportedHealth(accumulator) };
}

export function healthThreshold(initial: number, fraction: number) {
  return reportedHealth(
    Math.fround(Math.fround(reportedHealth(initial)) * Math.fround(fraction)),
  );
}
