import { GameRng } from './native-rng';
/** Native integer draws, with injectable values for controlled boundary examples. */
export type RandomSource = { bounded(limit: number): number };
export function randomSource(input: number | RandomSource): RandomSource {
  return typeof input === 'number' ? new GameRng(input) : input;
}
