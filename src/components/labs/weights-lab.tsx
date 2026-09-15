'use client';
import { useTranslations } from 'next-intl';
import { m } from 'motion/react';
import { weightedShares } from '@/lib/equipment-model';
import { AnimatedLab } from './animated-lab';
import { NumericControl } from './numeric-control';
import { Stat, useParameters } from './lab-controls';
export default function WeightsLab() {
  const t = useTranslations('labs.weights');
  const [p, set] = useParameters(
    'weights',
    { a: 1, b: 1, c: 1, d: 1, e: 1 },
    { a: [1, 100], b: [1, 100], c: [1, 100], d: [1, 100], e: [1, 100] },
  );
  const keys = ['a', 'b', 'c', 'd', 'e'] as const,
    weights = keys.map((key) => p[key]);
  const single = weightedShares(weights, false),
    redraw = weightedShares(weights, true);
  return (
    <AnimatedLab>
      <div className="new-lab">
        <div className="lab-controls">
          {keys.map((key, index) => (
            <NumericControl
              key={key}
              label={`${t('weight')} ${index + 1}`}
              value={p[key]}
              min={1}
              max={100}
              onChange={(value) => set({ [key]: value })}
            />
          ))}
          <button onClick={() => set({ a: 1, b: 1, c: 1, d: 1, e: 1 })}>{t('equal')}</button>
        </div>
        <div className="weight-legend">
          <span>{t('single')}</span>
          <span>{t('redraw')}</span>
        </div>
        <div className="weight-chart">
          {keys.map((key, index) => (
            <div key={key} className="weight-chart-row">
              <strong>
                {t('entry')} {index + 1}
              </strong>
              <div>
                {[single[index], redraw[index]].map((value, algorithm) => (
                  <div className="weight-bar" key={algorithm}>
                    <m.div
                      initial={false}
                      animate={{ width: `${value * 100}%` }}
                      className={algorithm ? 'redraw' : 'single'}
                      transition={{ duration: 0.3 }}
                    />
                    <output>{(value * 100).toFixed(2)}%</output>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="lab-stat-grid">
          <Stat
            label={`${t('last')} · ${t('single')}`}
            value={`${(single[4] * 100).toFixed(2)}%`}
          />
          <Stat
            label={`${t('last')} · ${t('redraw')}`}
            value={`${(redraw[4] * 100).toFixed(2)}%`}
          />
        </div>
        <p className="lab-caption">{t('caption')}</p>
      </div>
    </AnimatedLab>
  );
}
