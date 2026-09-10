'use client';

import { useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { filterLevels, ordinaryPlans } from '@/lib/wave-overview';
import { useExperience } from './experience-context';

export function FlagMark({ final = false }: { final?: boolean }) {
  return <svg viewBox="0 0 16 16" aria-hidden="true" className={`flag-mark${final ? ' final-mark' : ''}`}>
    <path d="M3 14V2m0 0c3-2 6 2 10 0v7C9 11 6 7 3 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {final && <path d="M5 5h2v2H5zm4 0h2v2H9z" fill="currentColor" />}
  </svg>;
}

export function LevelOverview() {
  const t = useTranslations('site');
  const format = useFormatter();
  const { inspectWave, setView, setShowBoost } = useExperience();
  const [query, setQuery] = useState('');
  const [hovered, setHovered] = useState<number | null>(null);
  const levels = filterLevels(query);
  const plans = ordinaryPlans.filter((plan) => levels.includes(plan.level));
  const open = (level: number, wave: number) => { inspectWave(level, wave); setShowBoost(true); setView('visualization'); };
  return <div className="levels-panel matrix-panel">
    <div className="matrix-tools"><label>{t('searchLevels')}<input type="search" placeholder={t('comparePlaceholder')} value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <div className="matrix-presets"><button onClick={() => setQuery('')}>{t('all')}</button><button onClick={() => setQuery('1, 36, 149')}>{t('compareExamples')}</button><button onClick={() => setQuery('1–19')}>1–19</button><button onClick={() => setQuery('101–149')}>101–149</button></div>
      <span className="matrix-count" aria-live="polite">{t('levelResults', { count: plans.length })}</span>
    </div>
    <p className="matrix-hint">{t('matrixHint')}</p>
    <div className="matrix-scroll" tabIndex={0} aria-label={t('matrixScroll')}>
      <table className="wave-matrix"><thead><tr><th scope="col" className="matrix-level">L</th>{Array.from({ length: 15 }, (_, i) => <th scope="col" key={i} className={hovered === i ? 'column-active' : ''}><span>{t('wave')}</span>{String(i + 1).padStart(2, '0')}</th>)}</tr></thead>
        <tbody>{plans.map((plan) => <tr key={plan.level}>
          <th scope="row" className="matrix-level"><button onClick={() => open(plan.level, 1)} aria-label={t('showLevel', { level: plan.level })}>{String(plan.level).padStart(2, '0')}</button></th>
          {Array.from({ length: 15 }, (_, index) => {
            const wave = plan.waves[index];
            if (!wave) return <td key={index} className="matrix-empty"><span aria-label={t('noWave')}>—</span></td>;
            const type = wave.final ? t('final') : wave.flag ? t('flag') : t('regular');
            return <td key={index} className={`${wave.flag || wave.final ? 'matrix-flag' : ''} ${wave.final ? 'matrix-final' : ''} ${hovered === index ? 'column-active' : ''}`}
              onPointerEnter={() => setHovered(index)} onPointerLeave={() => setHovered(null)}>
              <button onClick={() => open(plan.level, wave.number)} onFocus={() => setHovered(index)} onBlur={() => setHovered(null)}
                aria-label={t('matrixCell', { level: plan.level, wave: wave.number, points: wave.budget, type })}>
                {(wave.flag || wave.final) && <FlagMark final={wave.final} />}<span>{format.number(wave.budget)}</span>
              </button>
            </td>;
          })}
        </tr>)}</tbody>
      </table>
      {!plans.length && <p className="empty-state">{t('noResults')}</p>}
    </div>
    <div className="matrix-legend"><span><i />{t('regular')}</span><span><FlagMark />{t('flag')}</span><span><FlagMark final />{t('final')}</span><span>— {t('noWave')}</span></div>
  </div>;
}
