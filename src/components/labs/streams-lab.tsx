'use client';
import { m } from 'motion/react';
import { useTranslations } from 'next-intl';
import { GameRng, Mt19937, libcxxShuffle } from '@/lib/native-rng';
import { reseedCallers } from '@/lib/reseed-sites';
import './evolution-flow.css';
import { AnimatedLab } from './animated-lab';
import { NumericControl } from './numeric-control';
import { useParameters } from './lab-controls';
function engine(seed: number, position: number, game: boolean) {
  const rng = game ? new GameRng(seed) : new Mt19937(seed);
  for (let i = 0; i < position; i++) rng.next();
  return rng;
}
function sequence(seed: number, position: number, game: boolean) {
  const rng = engine(seed, position, game);
  return Array.from({ length: 6 }, () => rng.next());
}
export default function StreamsLab() {
  const t = useTranslations('labs.streams');
  const [p, set] = useParameters(
    'streams',
    {
      seed: 1789516800,
      gameSeed: 4357,
      game: 0,
      library: 0,
      source: 0,
      previous: 0,
      reset: 0,
      lastSource: 0,
    },
    {
      seed: [0, 4294967295],
      gameSeed: [0, 4294967295],
      game: [0, 10000],
      library: [0, 10000],
      source: [0, reseedCallers.length - 1],
      previous: [0, 10000],
      reset: [0, 1],
      lastSource: [0, reseedCallers.length - 1],
    },
  );
  const shuffleEngine = engine(5489, p.library, false);
  const permutation = libcxxShuffle([0, 1, 2, 3, 4, 5, 6, 7], shuffleEngine);
  const consumed = shuffleEngine.draws - p.library;
  return (
    <AnimatedLab>
      <div className="new-lab">
        <div className="lab-controls">
          <NumericControl
            label={t('clockSeed')}
            value={p.seed}
            max={4294967295}
            onChange={(seed) => set({ seed })}
          />
          <label>
            {t('reseedSource')}
            <select
              value={p.source}
              onChange={(event) => set({ source: Number(event.target.value) })}
            >
              {reseedCallers.map((caller, index) => (
                <option key={caller.id} value={index}>
                  {t(`callers.${caller.id}`)}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() =>
              set({ gameSeed: p.seed, game: 0, previous: p.game, reset: 1, lastSource: p.source })
            }
          >
            {t('reseed')}
          </button>
          <button
            onClick={() => set({ gameSeed: 4357, seed: 1789516800, game: 0, library: 0, reset: 0 })}
          >
            {t('restart')}
          </button>
        </div>
        <section className="reseed-checkpoint">
          <h3>{t('checkpoint')}</h3>
          <p>{t('census')}</p>
          <p>{t('checkpointNote')}</p>
          {!!p.reset && (
            <div className="reseed-history" role="status">
              <strong>{t(`callers.${reseedCallers[p.lastSource].id}`)}</strong>
              <span>
                {t('discarded')}: {p.previous} → 0
              </span>
            </div>
          )}
          <code>{reseedCallers[p.reset ? p.lastSource : p.source].addresses.join(' · ')}</code>
        </section>
        {[
          {
            name: t('game'),
            seed: p.gameSeed,
            position: p.game,
            kind: 'game' as const,
            button: t('advanceGame'),
          },
          {
            name: t('library'),
            seed: 5489,
            position: p.library,
            kind: 'library' as const,
            button: t('advanceLibrary'),
          },
        ].map((lane) => (
          <section className={`stream-lane ${lane.kind}`} key={lane.kind}>
            <header>
              <h3>{lane.name}</h3>
              <span>
                {t('position')}:{' '}
                <output data-testid={`${lane.kind}-position`}>{lane.position}</output>
              </span>
            </header>
            <p className="lab-caption">
              {t('seed')}: {lane.seed}
            </p>
            <div className="stream-values" aria-label={t('next')}>
              {sequence(lane.seed, lane.position, lane.kind === 'game').map((value, index) => (
                <m.div
                  key={`${lane.seed}-${lane.position + index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <small>#{lane.position + index + 1}</small>
                  <strong>{value.toLocaleString('en-US')}</strong>
                </m.div>
              ))}
            </div>
            <button
              disabled={lane.position >= 10000}
              onClick={() => set({ [lane.kind]: lane.position + 1 })}
            >
              {lane.button} →
            </button>
          </section>
        ))}
        <section className="shuffle-preview">
          <h3>{t('shuffle')}</h3>
          <div className="stream-values">
            {permutation.map((value) => (
              <strong key={value}>{value}</strong>
            ))}
          </div>
          <p className="lab-caption">{t('consumed', { count: consumed })}</p>
          <button
            disabled={p.library + consumed > 10000}
            onClick={() => set({ library: p.library + consumed })}
          >
            {t('runShuffle')} →
          </button>
        </section>
        <p className="lab-caption">{t('caption')}</p>
      </div>
    </AnimatedLab>
  );
}
