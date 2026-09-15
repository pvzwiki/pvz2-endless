import accessories from '@/data/accessory-catalog.json';

type Boost = { PlantBoostProps: string; Values: number[] };
export function accessoryValue(id: string, level: number, boost: string) {
  const entry = accessories.items.find((item) => item.id === id);
  if (!entry) throw new RangeError('Unknown accessory.');
  const values = entry.values;
  const tiers = values.SuperBoostList as Boost[][] | null;
  const tier =
    values.Quality === 'super' &&
    Number.isInteger(level) &&
    level >= 0 &&
    level <= (values.MaxLevel ?? 0) &&
    tiers &&
    level < tiers.length
      ? tiers[level]
      : (values.Boosts as Boost[] | null);
  return (
    tier?.find((item) => item.PlantBoostProps === `RTID(${boost}@PropertySheets)`)?.Values[0] ?? 0
  );
}
export function rechargeFactor(contributions: readonly number[]) {
  if (contributions.some((value) => !Number.isFinite(value) || value < 0))
    throw new RangeError('Use nonnegative recharge contributions.');
  const sum = contributions.reduce((total, value) => Math.fround(total + Math.fround(value)), 0);
  return Math.fround(1 / Math.fround(1 + sum));
}
export function gloveAttempt(input: {
  time: number;
  deadline: number;
  rate: number;
  roll: number;
  credited: boolean;
  allowed: boolean;
}) {
  const { time, deadline, rate, roll, credited, allowed } = input;
  if (
    !Number.isFinite(time) ||
    !Number.isFinite(deadline) ||
    !Number.isFinite(rate) ||
    !Number.isFinite(roll) ||
    rate < 0 ||
    rate > 1 ||
    roll < 0 ||
    roll > 1
  )
    throw new RangeError('Invalid drop inputs.');
  const reason = !credited
    ? 'credit'
    : !allowed
      ? 'mode'
      : !(Math.fround(roll) < Math.fround(rate))
        ? 'roll'
        : !(Math.fround(deadline) < Math.fround(time))
          ? 'cooldown'
          : 'drop';
  return {
    reason,
    drop: reason === 'drop',
    deadline: reason === 'drop' ? Math.fround(Math.fround(time) + 8) : deadline,
  };
}
export function weightedShares(weights: readonly number[], redraw: boolean) {
  if (!weights.length || weights.some((weight) => !Number.isFinite(weight) || weight <= 0))
    throw new RangeError('Weights must be positive.');
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cumulative = 0,
    survival = 1;
  return weights.map((weight) => {
    cumulative += weight;
    const chance = cumulative / total;
    const result = redraw ? survival * chance : weight / total;
    survival *= 1 - chance;
    return result;
  });
}
export function evaluateArtifactFormula(expression: string, level: number, rank: number) {
  if (!Number.isInteger(level) || !Number.isInteger(rank))
    throw new RangeError('Formula variables are integers.');
  const substituted = expression.replace('level', String(level)).replace('stage', String(rank));
  const floating = substituted.includes('.');
  if (!substituted.trim()) return { substituted, floating, value: 0 };
  const tokens = substituted.match(/\d+(?:\.\d*)?|\.\d+|[()+*/-]/g) ?? [];
  if (tokens.join('') !== substituted.replace(/\s/g, ''))
    throw new Error('Unsupported formula token.');
  let at = 0;
  const numeric = (value: number) => (floating ? Math.fround(value) : value | 0);
  function atom(): number {
    const token = tokens[at++];
    if (token === '(') {
      const value = sum();
      if (tokens[at++] !== ')') throw new Error('Unclosed formula.');
      return value;
    }
    if (token === '-') return numeric(-atom());
    if (token === '+') return atom();
    if (token === undefined || !/^\d|^\./.test(token)) throw new Error('Expected formula operand.');
    return numeric(Number(token));
  }
  function product(): number {
    let result = atom();
    while (tokens[at] === '*' || tokens[at] === '/') {
      const op = tokens[at++],
        rhs = atom();
      if (op === '/' && rhs === 0) throw new Error('Division by zero.');
      result = numeric(
        op === '*'
          ? floating
            ? result * rhs
            : Math.imul(result, rhs)
          : floating
            ? result / rhs
            : Math.trunc(result / rhs),
      );
    }
    return result;
  }
  function sum(): number {
    let result = product();
    while (tokens[at] === '+' || tokens[at] === '-') {
      const op = tokens[at++],
        rhs = product();
      result = numeric(op === '+' ? result + rhs : result - rhs);
    }
    return result;
  }
  const value = sum();
  if (at !== tokens.length) throw new Error('Trailing formula input.');
  return { substituted, floating, value: Math.fround(value) };
}
export function displayFormulaValue(
  expression: string,
  level: number,
  rank: number,
  lastMainField = false,
) {
  const result = evaluateArtifactFormula(expression, level, rank);
  return {
    ...result,
    raw: result.value,
    value: lastMainField && Math.abs(result.value) < Math.fround(0.00001) ? 1 : result.value,
  };
}
