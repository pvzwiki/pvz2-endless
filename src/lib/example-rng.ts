/** A small repeatable source for the teaching models, unrelated to the game's RNG. */
export type RandomSource = { bounded(limit: number): number };

export class ExampleRng implements RandomSource {
  private state: number;
  constructor(seed: number) { this.state = seed >>> 0; }
  bounded(limit: number): number {
    if (!Number.isSafeInteger(limit) || limit <= 0)
      throw new RangeError('Expected a positive integer bound.');
    // Mulberry32: repeatable examples without the native MT state or modulo mapping.
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(this.state ^ (this.state >>> 15), this.state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return Math.floor(((value ^ (value >>> 14)) >>> 0) / 0x100000000 * limit);
  }
}

export function randomSource(input: number | RandomSource): RandomSource {
  return typeof input === 'number' ? new ExampleRng(input) : input;
}

export function shuffled<T>(values: readonly T[], random: number | RandomSource): T[] {
  const result = [...values], rng = randomSource(random);
  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.bounded(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
