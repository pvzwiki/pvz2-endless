/** The inspected integer component: MT-style state, 31-bit output, modulo bounds. */
export class GameRng {
  private state = new Uint32Array(624);
  private index = 624;
  constructor(seed: number) {
    this.state[0] = seed === 0 ? 4357 : seed >>> 0;
    for (let i = 1; i < 624; i++) {
      const previous = this.state[i - 1];
      this.state[i] = (Math.imul(1812433253, previous ^ (previous >>> 30)) + i) >>> 0;
    }
  }
  next(): number {
    if (this.index >= 624) {
      for (let i = 0; i < 624; i++) {
        const combined = (this.state[i] & 0x80000000) | (this.state[(i + 1) % 624] & 0x7fffffff);
        this.state[i] = this.state[(i + 397) % 624] ^ (combined >>> 1) ^ (combined & 1 ? 0x9908b0df : 0);
      }
      this.index = 0;
    }
    let value = this.state[this.index++];
    value ^= value >>> 11;
    value ^= (value << 7) & 0x9d2c5680;
    value ^= (value << 15) & 0xefc60000;
    value ^= value >>> 18;
    return value & 0x7fffffff;
  }
  bounded(limit: number): number {
    if (!Number.isInteger(limit) || limit <= 0) throw new RangeError('Expected a positive integer bound.');
    return this.next() % limit;
  }
}
