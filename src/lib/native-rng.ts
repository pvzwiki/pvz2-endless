/** MT19937 core, matching the retained native integer traces and libc++ probe. */
export class Mt19937 {
  private state = new Uint32Array(624);
  private index = 624;
  draws = 0;
  constructor(seed = 5489) {
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
      throw new RangeError('Seed must be uint32.');
    this.state[0] = seed;
    for (let i = 1; i < 624; i++) {
      const previous = this.state[i - 1];
      this.state[i] = (Math.imul(1812433253, previous ^ (previous >>> 30)) + i) >>> 0;
    }
  }
  next(): number {
    if (this.index >= 624) {
      for (let i = 0; i < 624; i++) {
        const combined = (this.state[i] & 0x80000000) | (this.state[(i + 1) % 624] & 0x7fffffff);
        this.state[i] =
          this.state[(i + 397) % 624] ^ (combined >>> 1) ^ (combined & 1 ? 0x9908b0df : 0);
      }
      this.index = 0;
    }
    let value = this.state[this.index++];
    this.draws++;
    value ^= value >>> 11;
    value ^= (value << 7) & 0x9d2c5680;
    value ^= (value << 15) & 0xefc60000;
    value ^= value >>> 18;
    return value >>> 0;
  }
}
export class GameRng extends Mt19937 {
  constructor(seed: number) {
    super(seed === 0 ? 4357 : seed);
  }
  next() {
    return super.next() & 0x7fffffff;
  }
  bounded(limit: number) {
    if (!Number.isSafeInteger(limit) || limit <= 0) throw new RangeError('Bound must be positive.');
    return this.next() % limit;
  }
  float(max = 1) {
    return Math.fround((this.next() / 2147483647) * max);
  }
}
/** The traced forward libc++ permutation, restricted to the small lists this view offers. */
export function libcxxShuffle<T>(values: readonly T[], engine: Mt19937): T[] {
  if (values.length > 65536) throw new RangeError('This view supports at most 65536 entries.');
  const result = [...values];
  for (let first = 0; first < result.length - 1; first++) {
    const span = result.length - first,
      width = Math.ceil(Math.log2(span)),
      mask = 2 ** width - 1;
    let draw: number;
    do {
      draw = engine.next() & mask;
    } while (draw >= span);
    [result[first], result[first + draw]] = [result[first + draw], result[first]];
  }
  return result;
}

export function libraryEngineAt(position: number) {
  if (!Number.isSafeInteger(position) || position < 0 || position > 1000000)
    throw new RangeError('Invalid library stream position.');
  const engine = new Mt19937(5489);
  for (let i = 0; i < position; i++) engine.next();
  return engine;
}
