'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { ordinaryLevels, type Wave, type WavePlan } from '@/lib/wave-model';
import baseline from '@/data/wave-baseline.json';
import { useExperience } from './experience-context';
import { SpatialView } from './wave-visual';
import { LevelOverview, FlagMark } from './level-overview';
import { groupWaves } from '@/lib/wave-overview';

function useWaveLabel() {
  const t = useTranslations('site');
  return (wave: Wave) => wave.flag && wave.final ? t('both') : wave.final ? t('final') : wave.flag ? t('flag') : t('regular');
}

export function WaveExplorer() {
  const t = useTranslations('site');
  const { setView, ready } = useExperience();
  return <section className="view-launchers" id="explorer" aria-label={t('viewLabel')}>
    <button disabled={!ready} onClick={(event) => { event.currentTarget.focus({ preventScroll: true }); setView('visualization'); }} className="view-launcher">
      <span className="launcher-glyph" aria-hidden="true">▥</span><span><strong>{t('visualization')}</strong><small>{t('visualizationDescription')}</small></span>
      <span className="launcher-action">{t('view')}<b aria-hidden="true">+</b></span>
    </button>
    <button disabled={!ready} onClick={(event) => { event.currentTarget.focus({ preventScroll: true }); setView('levels'); }} className="view-launcher">
      <span className="launcher-glyph" aria-hidden="true">≡</span><span><strong>{t('allLevels')}</strong><small>{t('allLevelsDescription', { count: ordinaryLevels.length })}</small></span>
      <span className="launcher-action">{t('view')}<b aria-hidden="true">+</b></span>
    </button>
  </section>;
}

function BudgetChart() {
  const t = useTranslations('site');
  const formatter = useFormatter();
  const { plan, selected, setSelected, showBoost } = useExperience();
  const maximum = Math.max(...plan.waves.map((wave) => wave.budget));
  const width = 760, height = 320, left = 68, top = 25, bottom = 274;
  const step = (width - left - 24) / plan.count;
  const y = (value: number) => bottom - value / maximum * (bottom - top);
  return <svg viewBox={`0 0 ${width} ${height}`} className="budget-chart" role="group" aria-label={t('chart')}>
    {[0, 0.5, 1].map((fraction) => <g key={fraction} aria-hidden="true">
      <line x1={left} x2={width - 20} y1={y(maximum * fraction)} y2={y(maximum * fraction)} className="chart-grid" />
      <text x={left - 12} y={y(maximum * fraction) + 4} textAnchor="end" className="chart-axis">{formatter.number(Math.round(maximum * fraction))}</text>
    </g>)}
    {plan.waves.map((wave) => {
      const x = left + step * wave.index + step * 0.18;
      const barWidth = step * 0.64;
      const isSelected = selected === wave.number;
      return <g key={wave.number} className={`chart-wave${isSelected ? ' is-selected' : ''}`}
        role="button" tabIndex={0} aria-pressed={isSelected}
        aria-label={t('waveDescription', { wave: wave.number, points: showBoost ? wave.budget : wave.base })}
        onClick={() => setSelected(wave.number)} onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(wave.number); }
        }}>
        <rect className="chart-hit-area" x={left + step * wave.index} y={top - 8} width={step} height={bottom - top + 40} fill="transparent" />
        <rect className="bar-base" x={x} y={y(wave.base)} width={barWidth} height={Math.max(0.5, bottom - y(wave.base))} rx="2" />
        <rect className="bar-boost" x={x} y={y(showBoost ? wave.budget : wave.base)} width={barWidth}
          height={showBoost ? Math.max(0, y(wave.base) - y(wave.budget)) : 0} rx="2" />
        <line className="selected-line" x1={x - 3} x2={x + barWidth + 3} y1={bottom + 6} y2={bottom + 6} />
        <text x={x + barWidth / 2} y={bottom + 28} textAnchor="middle" className="chart-wave-number">{String(wave.number).padStart(2, '0')}</text>
      </g>;
    })}
  </svg>;
}

function WaveTable({ plan }: { plan: WavePlan }) {
  const t = useTranslations('site');
  const formatter = useFormatter();
  const label = useWaveLabel();
  return <table className="wave-table"><thead><tr><th>{t('wave')}</th><th>{t('base')}</th><th>{t('waveType')}</th><th>{t('total')}</th></tr></thead>
    <tbody>{plan.waves.map((wave) => <tr key={wave.number}><th scope="row">{wave.number}</th><td>{formatter.number(wave.base)}</td><td>{label(wave)}</td><td>{formatter.number(wave.budget)}</td></tr>)}</tbody></table>;
}

function Visualization() {
  const { plan, selected, setSelected, setLevel, showBoost, setShowBoost } = useExperience();
  const [renderMode, setRenderMode] = useState<'diagram' | 'spatial'>('spatial');
  const t = useTranslations('site');
  const formatter = useFormatter();
  const label = useWaveLabel();
  const wave = plan.waves[selected - 1];
  const multiplier = showBoost && (wave.flag || wave.final) ? baseline.flagMultiplier : 1;
  const displayedBudget = multiplier === 1 ? wave.base : wave.budget;
  return <div className="visualization-panel">
    <div className="level-toolbar">
      <div className="level-control"><label htmlFor="level-control">{t('levelControl')}<output data-testid="current-level">{plan.level}</output></label>
        <input id="level-control" type="range" min="0" max={ordinaryLevels.length - 1} value={ordinaryLevels.indexOf(plan.level)}
          aria-valuetext={t('levelDescription', { level: plan.level, waves: plan.count })}
          onChange={(event) => setLevel(ordinaryLevels[Number(event.target.value)])} />
        <span className="control-caption">{t('ordinaryOnly')}</span>
      </div>
      <div className="level-presets">{[1, 14, 36, 74, 149].map((level) => <button key={level} aria-label={`${t('level')} ${level}`} aria-pressed={plan.level === level} onClick={() => setLevel(level)}>{level}</button>)}</div>
      <button className="reset-button" onClick={() => { setLevel(36); setSelected(5); setShowBoost(true); }}>{t('reset')} ↺</button>
    </div>
    <div className="plan-stats"><div><span>{t('countLabel')}</span><strong data-testid="wave-count">{plan.count}</strong></div><div><span>{t('spacingLabel')}</span><strong>{plan.spacing}</strong></div><div><span>{t('incrementLabel')}</span><strong>+{formatter.number(plan.increment)}</strong></div></div>
    <div className="visualization-grid">
      <div className="visual-stage">
        <div className="stage-toolbar"><div className="segmented" aria-label={t('view')}>
          <button aria-pressed={renderMode === 'spatial'} onClick={() => setRenderMode('spatial')}>{t('spatial')}</button>
          <button aria-pressed={renderMode === 'diagram'} onClick={() => setRenderMode('diagram')}>{t('diagram')}</button>
        </div><span className="stage-budget" aria-hidden="true">{formatter.number(displayedBudget)}<small>{t('points')}</small></span></div>
        <div className="stage-graphic">{renderMode === 'spatial' ? <SpatialView plan={plan} selected={selected} showBoost={showBoost} onSelect={setSelected} /> : <BudgetChart />}</div>
        <div className="stage-legend"><span><i className="legend-base" />{t('base')}</span><span><i className="legend-boost" />{t('extra')}</span></div>
        <div className="wave-selector grouped-waves" aria-label={t('waveChoice')}>{groupWaves(plan.waves).map((group, index) => <div className="wave-group" key={index}><span className="wave-group-label">{t('group')} {index + 1}</span><div>{group.map((item) => <button key={item.number} className={item.flag || item.final ? 'flag-wave-button' : ''} aria-pressed={selected === item.number} aria-label={`${t('wave')} ${item.number}`} onClick={() => setSelected(item.number)}>{(item.flag || item.final) && <FlagMark final={item.final} />}{item.number}</button>)}</div></div>)}</div>
      </div>
      <section className="wave-inspector" aria-label={t('total')}>
        <div className="inspector-heading"><span>{t('wave')} {String(wave.number).padStart(2, '0')}</span><span className={`wave-type${wave.flag || wave.final ? ' accented' : ''}`}>{label(wave)}</span></div>
        <output className="budget-output" data-testid="selected-budget" aria-live="polite">{formatter.number(displayedBudget)}</output><span className="budget-unit">{t('points')}</span>
        <div className="calculation-step"><span>01 / {t('baseEquation')}</span><div>{baseline.settings.StartingPoints} + <b>{plan.increment}</b> × {wave.index}</div><strong>= {formatter.number(wave.base)}</strong></div>
        <div className="calculation-step"><span>02 / {t('boostEquation')}</span><div>{formatter.number(wave.base)} × <b>{multiplier}</b></div><strong>= {formatter.number(displayedBudget)}</strong></div>
        <div className="boost-toggle segmented"><button aria-pressed={!showBoost} onClick={() => setShowBoost(false)}>{t('baseOnly')}</button><button aria-pressed={showBoost} onClick={() => setShowBoost(true)}>{t('boosted')}</button></div>
        {wave.flag && wave.final && showBoost && <p className="inspector-note">{t('boostOnce')}</p>}
        <div className="wave-stepper"><button disabled={selected === 1} onClick={() => setSelected(selected - 1)} aria-label={t('previousWave')}>←</button><span>{selected} / {plan.count}</span><button disabled={selected === plan.count} onClick={() => setSelected(selected + 1)} aria-label={t('nextWave')}>→</button></div>
      </section>
    </div>
    <details className="complete-plan"><summary>{t('table')}<span aria-hidden="true">+</span></summary><div className="table-scroll"><WaveTable plan={plan} /></div></details>
  </div>;
}

export function WaveViewer() {
  const { view, setView } = useExperience();
  const t = useTranslations('site');
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const active = view === 'visualization' || view === 'levels';
  useEffect(() => {
    if (active && !dialog.current?.open) {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.current?.showModal();
    }
    if (!active && dialog.current?.open) dialog.current?.close();
  }, [active]);
  return <dialog className="wave-viewer" ref={dialog} aria-labelledby="viewer-title" onClose={() => { if (active) setView(null); returnFocus.current?.focus({ preventScroll: true }); }} onClick={(event) => { if (event.target === event.currentTarget) setView(null); }}>
    <div className="viewer-content"><div className="viewer-header"><div><span className="eyebrow">{t('exampleSettings')}</span><h2 id="viewer-title">{t('wavePlan')}</h2></div><button className="close-view" aria-label={t('closeView')} onClick={() => setView(null)}>×</button></div>
      <div className="viewer-tabs" role="tablist" aria-label={t('viewLabel')} onKeyDown={(event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const target = event.key === 'Home' ? 'visualization' : event.key === 'End' ? 'levels' : view === 'visualization' ? 'levels' : 'visualization';
        setView(target); document.getElementById(`view-tab-${target}`)?.focus();
      }}><button id="view-tab-visualization" role="tab" aria-controls="view-panel" tabIndex={view === 'visualization' ? 0 : -1} aria-selected={view === 'visualization'} onClick={() => setView('visualization')}>{t('visualization')}</button><button id="view-tab-levels" role="tab" aria-controls="view-panel" tabIndex={view === 'levels' ? 0 : -1} aria-selected={view === 'levels'} onClick={() => setView('levels')}>{t('allLevels')}<span>{ordinaryLevels.length}</span></button></div>
      <div className={`viewer-body${view === 'levels' ? ' viewer-matrix-body' : ''}`} id="view-panel" role="tabpanel" aria-labelledby={`view-tab-${view}`}>{view === 'visualization' ? <Visualization /> : view === 'levels' ? <LevelOverview /> : null}</div>
    </div>
  </dialog>;
}
