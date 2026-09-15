'use client';
import { useMemo, useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { evolutionFunnel, traceEvolution, type EvolutionFrame } from '@/lib/evolution-model';
import {
  defaultSourceIndex,
  evolutionScenario,
  evolutionStages,
  sourceChoices,
} from '@/lib/evolution-scenarios';
import plants from '@/data/plant-catalog.json';
import { AnimatedLab } from './animated-lab';
import { NumericControl } from './numeric-control';
import { Playback, Stat, Toggle, useParameters } from './lab-controls';
import './evolution-flow.css';

const names = new Map(plants.types.map((plant) => [plant.id, plant.name]));
const costs = new Map(plants.types.map((plant) => [plant.id, plant.values.Cost]));
const funnel = evolutionFunnel();
const phases: EvolutionFrame['phase'][] = [
  'start',
  'targets',
  'selection',
  'bonus',
  'effects',
  'complete',
];

type PlaybackMoment = { index: number; summary?: 'selection' | 'bonus' };

/** Select snapshots from the full trace; presentation never changes model state. */
function guidedMoments(frames: readonly EvolutionFrame[]): PlaybackMoment[] {
  const moments = new Map<number, PlaybackMoment>();
  const add = (index: number, summary?: PlaybackMoment['summary']) => {
    if (index >= 0) moments.set(index, { index, summary });
  };
  for (const event of ['ready', 'trigger', 'collect'])
    add(frames.findIndex((frame) => frame.event === event));
  const selectionEnd =
    frames.findIndex(
      (frame) => frame.phase === 'bonus' || frame.phase === 'effects' || frame.phase === 'complete',
    ) - 1;
  if (selectionEnd > 2) add(selectionEnd, 'selection');
  add(
    frames.findLastIndex((frame) => frame.phase === 'bonus'),
    'bonus',
  );
  // Follow a failing effect when present, otherwise a replacement or the first bonus.
  const example =
    frames.find((frame) => frame.event === 'failed')?.focus ??
    frames.find((frame) => frame.event === 'remove')?.focus ??
    frames.find((frame) => frame.event === 'callback')?.focus;
  frames.forEach((frame, index) => {
    if (
      frame.event === 'failed' ||
      (frame.focus === example && ['remove', 'check', 'added'].includes(frame.event))
    )
      add(index);
  });
  add(frames.length - 1);
  return [...moments.values()].sort((a, b) => a.index - b.index);
}

export default function EvolutionLab() {
  const t = useTranslations('labs.evolution'),
    locale = useLocale();
  const [p, set] = useParameters(
    'evolution',
    {
      preset: 0,
      source: defaultSourceIndex,
      cost: 100,
      plantLevel: 3,
      condition: 0,
      check: 0,
      rank: 1,
      stage: 1,
      stream: 0,
      reverse: 0,
      callback: 0,
      lily: 0,
      detail: 0,
      step: 0,
    },
    {
      preset: [0, 2],
      source: [0, sourceChoices.length - 1],
      cost: [0, 5000],
      plantLevel: [1, 10],
      condition: [0, 1],
      check: [0, 3],
      rank: [1, 4],
      stage: [0, evolutionStages.length - 1],
      stream: [0, 65535],
      reverse: [0, 1],
      callback: [0, 1],
      lily: [0, 1],
      detail: [0, 1],
      step: [0, 999],
    },
  );
  const [inspection, setInspection] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const replayKey = [
    p.preset,
    p.source,
    p.cost,
    p.plantLevel,
    p.condition,
    p.check,
    p.rank,
    p.stage,
    p.stream,
    p.reverse,
    p.callback,
    p.lily,
  ].join('/');
  const input = useMemo(() => evolutionScenario(p), [replayKey]);
  const frames = useMemo(() => traceEvolution(input), [input]);
  const moments = useMemo<PlaybackMoment[]>(
    () => (p.detail ? frames.map((_, index) => ({ index })) : guidedMoments(frames)),
    [frames, p.detail],
  );
  const step = Math.max(
      0,
      moments.findLastIndex((moment) => moment.index <= p.step),
    ),
    moment = moments[step],
    frame = frames[moment.index];
  const summaryChoice =
    moment.summary &&
    Object.values(frame.decisions).find(
      (entry) =>
        entry.selected && entry.kind === (moment.summary === 'bonus' ? 'bonus' : 'replacement'),
    );
  const focusCell = summaryChoice ? summaryChoice.cell : frame.cell;
  const selectedCell = inspection ?? (focusCell ? `${focusCell.column}-${focusCell.row}` : '1-1');
  const decision = Object.values(frame.decisions).find(
    (entry) => `${entry.cell.column}-${entry.cell.row}` === selectedCell,
  );
  const selectedOriginal = input.plants.find(
    (plant) => `${plant.column}-${plant.row}` === selectedCell,
  );
  const name = (alias: string) => names.get(alias)?.[locale] ?? alias;
  const presets = t.raw('presets') as string[],
    checks = t.raw('checks') as string[],
    stageNames = t.raw('stages') as string[];
  const change = (patch: Partial<typeof p>) => {
    set({ ...patch, step: 0 });
    setInspection(null);
  };
  const seek = (value: number) => {
    set({ step: moments[value].index });
    setInspection(null);
  };
  const visiblePool = (decision?.pool ?? []).filter((alias) =>
    `${alias} ${name(alias)}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <AnimatedLab>
      <div className="new-lab evolution-flow">
        <details className="evolution-setup">
          <summary>
            {t('edit')}{' '}
            <span>
              {presets[p.preset]} · {t('source')}: {name(sourceChoices[p.source].plant)} · {p.cost}
            </span>
          </summary>
          <div className="evolution-inputs">
            <label>
              {t('preset')}
              <select
                value={p.preset}
                onChange={(event) =>
                  change({
                    preset: Number(event.target.value),
                    rank: Number(event.target.value) === 2 ? 4 : 1,
                  })
                }
              >
                {presets.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('source')}
              <select
                value={p.source}
                onChange={(event) => {
                  const source = Number(event.target.value);
                  change({ source, cost: sourceChoices[source].cost ?? 0 });
                }}
              >
                {sourceChoices.map((plant, index) => (
                  <option key={plant.plant} value={index}>
                    {name(plant.plant)}
                  </option>
                ))}
              </select>
            </label>
            <NumericControl
              label={t('cost')}
              value={p.cost}
              max={5000}
              onChange={(cost) => change({ cost })}
            />
            <NumericControl
              label={t('plantLevel')}
              value={p.plantLevel}
              min={1}
              max={10}
              onChange={(plantLevel) => change({ plantLevel })}
            />
            <NumericControl
              label={t('rank')}
              value={p.rank}
              min={1}
              max={4}
              onChange={(rank) => change({ rank })}
            />
            <label>
              {t('condition')}
              <select
                value={p.condition}
                onChange={(event) => change({ condition: Number(event.target.value) })}
              >
                <option value={0}>{t('normal')}</option>
                <option value={1}>{t('sheeped')}</option>
              </select>
            </label>
            <label>
              {t('check')}
              <select
                value={p.check}
                onChange={(event) => change({ check: Number(event.target.value) })}
              >
                {checks.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <details className="evolution-advanced">
            <summary>{t('advanced')}</summary>
            <div className="lab-controls">
              <NumericControl
                label={t('stream')}
                value={p.stream}
                max={65535}
                onChange={(stream) => change({ stream })}
              />
              <label>
                {t('stage')}
                <select
                  value={p.stage}
                  onChange={(event) => change({ stage: Number(event.target.value) })}
                >
                  <option value={0}>{t('stageOff')}</option>
                  {stageNames.map((label, index) => (
                    <option key={label} value={index + 1}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <Toggle
                checked={!!p.reverse}
                onChange={(value) => change({ reverse: Number(value) })}
              >
                {t('reverse')}
              </Toggle>
              <Toggle
                checked={!!p.callback}
                onChange={(value) => change({ callback: Number(value) })}
              >
                {t('callback')}
              </Toggle>
              <Toggle checked={!!p.lily} onChange={(value) => change({ lily: Number(value) })}>
                {t('lily')}
              </Toggle>
            </div>
            <p className="lab-caption">{t('inputNote')}</p>
            <p className="lab-caption">{t('checkNote')}</p>
          </details>
        </details>
        <nav className="evolution-phases" aria-label={t('title')}>
          {phases.map((phase, index) => {
            const first = moments.findIndex(
              (entry) => (entry.summary ?? frames[entry.index].phase) === phase,
            );
            return (
              <button
                key={phase}
                disabled={first < 0}
                aria-current={(moment.summary ?? frame.phase) === phase ? 'step' : undefined}
                onClick={() => seek(first)}
              >
                <span>{index + 1}</span>
                {t(`phases.${phase}`)}
              </button>
            );
          })}
        </nav>
        <div className="evolution-playback-mode">
          <Toggle checked={!!p.detail} onChange={(value) => set({ detail: Number(value) })}>
            {t('showEveryEvent')}
          </Toggle>
          <p className="lab-caption">{t(p.detail ? 'detailedPlayback' : 'guidedPlayback')}</p>
        </div>
        <Playback
          key={`${replayKey}/${p.detail}`}
          step={step}
          total={moments.length - 1}
          onChange={seek}
        />
        <div className="evolution-workspace">
          <section className="evolution-lawn-panel">
            <h3>{t('board')}</h3>
            <p className="evolution-grid-note">{t('gridInputs')}</p>
            <div className="activation-board" aria-label={t('board')}>
              {Array.from({ length: 9 }, (_, index) => {
                const column = index % 3,
                  row = Math.floor(index / 3),
                  cell = `${column}-${row}`;
                const plant = frame.board.find(
                  (entry) => entry.column === column && entry.row === row,
                );
                const originalIndex = input.plants.findIndex(
                  (entry) => entry.column === column && entry.row === row,
                );
                const queued = frame.pending.some((key) => {
                  const d = frame.decisions[key];
                  return d.cell.column === column && d.cell.row === row;
                });
                const failed =
                  frame.event === 'failed' &&
                  frame.cell?.column === column &&
                  frame.cell.row === row;
                return (
                  <button
                    key={cell}
                    className={`activation-cell${selectedCell === cell ? ' inspected' : ''}${queued ? ' pending' : ''}${failed ? ' failed' : ''}`}
                    aria-label={t('cell', { column: column + 1, row: row + 1 })}
                    aria-pressed={selectedCell === cell}
                    onClick={() => {
                      setInspection(cell);
                      setQuery('');
                    }}
                  >
                    <span className="cell-coordinate">
                      {column + 1} · {row + 1}
                    </span>
                    <AnimatePresence mode="wait" initial={false}>
                      {plant ? (
                        <m.span
                          key={plant.key}
                          className={`activation-plant${plant.key.startsWith('result-') ? ' replacement' : ''}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.18 }}
                        >
                          <strong>{name(plant.alias)}</strong>
                          <small>{t('level', { level: plant.level })}</small>
                          <span className="plant-kind">
                            {plant.key.startsWith('result-')
                              ? t('new')
                              : originalIndex >= 0
                                ? t('order', { number: originalIndex + 1 })
                                : t('old')}
                          </span>
                        </m.span>
                      ) : (
                        <m.span
                          key="empty"
                          className="activation-empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {t('empty')}
                        </m.span>
                      )}
                    </AnimatePresence>
                    {queued && <span className="queued-badge">{t('pending')}</span>}
                  </button>
                );
              })}
            </div>
            <div className="activation-counters">
              <Stat label={t('position')} value={frame.streamPosition} />
              <Stat label={t('cooldown')} value={frame.cooldownUntil ?? t('notTriggered')} />
            </div>
            <h4>{t('queue')}</h4>
            {frame.pending.length ? (
              <ol className="effect-queue">
                {frame.pending.map((key) => {
                  const effect = frame.decisions[key];
                  return (
                    <li key={key}>
                      <code>{effect.kind === 'replacement' ? 'loop' : 'grownew'}</code>
                      <span>
                        {effect.cell.column + 1} · {effect.cell.row + 1}
                      </span>
                      <strong>{name(effect.selected!)}</strong>
                      <small>{t('level', { level: effect.level })}</small>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="lab-caption">{t('noEffects')}</p>
            )}
          </section>
          <section className="evolution-inspector">
            <div className="evolution-event" role="status" data-event={frame.event}>
              <div>
                <span className="eyebrow">{t(`phases.${moment.summary ?? frame.phase}`)}</span>
                <h3>
                  {moment.summary ? t(`summaries.${moment.summary}`) : t(`events.${frame.event}`)}
                </h3>
                <p>
                  {moment.summary
                    ? t(`summaryText.${moment.summary}`)
                    : t(`eventText.${frame.event}`)}
                </p>
              </div>
              {!moment.summary && frame.reason && (
                <strong className="event-reason">
                  {t(`reasons.${frame.reason}` as 'reasons.condition')}
                </strong>
              )}
              {frame.blockingReason !== undefined && (
                <strong className="event-reason">
                  {t('blocked')}: {frame.blockingReason}
                </strong>
              )}
            </div>

            {decision &&
              (decision.selected ? (
                <div className="chosen-result">
                  <span>
                    {decision.source && <>{name(decision.source.alias)} → </>}
                    {t('selected')}
                  </span>
                  <strong>{name(decision.selected)}</strong>
                  <code>{decision.selected}</code>
                  {frame.phase === 'complete' &&
                    !frame.board.some((plant) => plant.key === `result-${decision.key}`) && (
                      <p className="evolution-rejected">{t('rejected')}</p>
                    )}
                  <small>
                    {decision.source && (
                      <>
                        {t('sourceCost')}: {decision.source.effectiveCost} →{' '}
                      </>
                    )}
                    {t('baseCost')}: {costs.get(decision.selected)} ·{' '}
                    {t('level', { level: decision.level })}
                  </small>
                </div>
              ) : !decision.pool.length ? (
                <p className="lab-outcome">{t('noCandidate')}</p>
              ) : null)}

            <span className="eyebrow">{t('inspect')}</span>
            <h3>{selectedOriginal ? name(selectedOriginal.alias) : t('empty')}</h3>
            {decision ? (
              <>
                <div className="activation-counters">
                  <Stat label={t('pool')} value={decision.pool.length} />
                  {decision.source && (
                    <Stat label={t('sourceCost')} value={decision.source.effectiveCost} />
                  )}
                </div>
                <dl className="selection-gates">
                  {Object.entries(decision.rejected).map(([key, value]) => (
                    <div key={key}>
                      <dt>{t(`filter${key[0].toUpperCase()}${key.slice(1)}` as 'filterCost')}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                {decision.selected && (
                  <>
                    <div className="shuffle-comparison">
                      {[
                        { label: t('before'), list: decision.pool },
                        { label: t('after'), list: decision.shuffled },
                      ].map((part) => (
                        <div key={part.label}>
                          <span>{part.label}</span>
                          <ol>
                            {part.list.slice(0, 5).map((alias, index) => (
                              <li
                                key={alias}
                                className={alias === decision.selected ? 'chosen' : ''}
                              >
                                <small>{index}</small>
                                {name(alias)}
                              </li>
                            ))}
                          </ol>
                        </div>
                      ))}
                    </div>
                    <Stat
                      label={t('draws')}
                      value={decision.after - decision.before}
                      detail={`${decision.before} → ${decision.after}`}
                    />
                    <p className="lab-caption">
                      {decision.source ? t('retained') : t('bonusLevel')}
                    </p>
                  </>
                )}
                <dl className="selection-gates">
                  <div>
                    <dt>{t('selectionReasons')}</dt>
                    <dd>
                      <code>[{decision.selectionReasons.join(', ')}]</code>
                    </dd>
                  </div>
                  <div>
                    <dt>{t('commitReasons')}</dt>
                    <dd>
                      <code>[{decision.commitReasons.join(', ')}]</code>
                    </dd>
                  </div>
                </dl>
                <details className="evolution-pool">
                  <summary>{t('fullPool')}</summary>
                  <input
                    aria-label={t('pool')}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <ul className="candidate-list">
                    {visiblePool.map((alias) => (
                      <li key={alias}>
                        <a href={`/${locale}/plants/?q=${encodeURIComponent(alias)}`}>
                          {name(alias)}
                        </a>
                        <strong>{costs.get(alias)}</strong>
                      </li>
                    ))}
                  </ul>
                </details>
              </>
            ) : (
              selectedOriginal && (
                <Stat label={t('sourceCost')} value={selectedOriginal.effectiveCost} />
              )
            )}
          </section>
        </div>
        <details className="evolution-advanced">
          <summary>
            {t('funnel')} · {funnel.declared} → {funnel.pool.length}
          </summary>
          <div className="catalog-funnel">
            {funnel.steps.map((entry) => (
              <div key={entry.index}>
                <span>{(t.raw('funnelLabels') as string[])[entry.index]}</span>
                <strong>{entry.remaining}</strong>
              </div>
            ))}
          </div>
        </details>
      </div>
    </AnimatedLab>
  );
}
