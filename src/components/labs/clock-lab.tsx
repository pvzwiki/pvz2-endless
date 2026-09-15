'use client';
import { useTranslations } from 'next-intl';
import { m } from 'motion/react';
import { accessoryValue, rechargeFactor } from '@/lib/equipment-model';
import { AnimatedLab } from './animated-lab';
import { NumericControl } from './numeric-control';
import { Stat, useParameters } from './lab-controls';
export default function ClockLab() {
  const t = useTranslations('labs.clock');
  const [p, set] = useParameters(
    'clock',
    { accessoryLevel: 5, base: 10, other: 0, roll: 0.2 },
    { accessoryLevel: [0, 5], base: [1, 120, 0.1], other: [0, 5, 0.01], roll: [0, 1, 0.001] },
  );
  const contribution = accessoryValue('super_clock_15', p.accessoryLevel, 'BoostFastPlant');
  const chance = accessoryValue('super_clock_15', p.accessoryLevel, 'BoostClearPlanting');
  const factor = rechargeFactor([contribution, p.other]);
  return (
    <AnimatedLab>
      <div className="new-lab">
        <div className="lab-controls">
          <NumericControl
            label={t('accessoryLevel')}
            value={p.accessoryLevel}
            max={5}
            onChange={(accessoryLevel) => set({ accessoryLevel })}
          />
          <NumericControl
            label={t('base')}
            value={p.base}
            min={1}
            max={120}
            step={0.1}
            onChange={(base) => set({ base })}
          />
          <NumericControl
            label={t('other')}
            value={p.other}
            max={5}
            step={0.01}
            onChange={(other) => set({ other })}
          />
        </div>
        <div className="lab-stat-grid">
          <Stat label={t('contribution')} value={contribution} />
          <Stat label={t('factor')} value={factor.toFixed(4)} />
          <Stat label={t('interval')} value={(p.base * factor).toFixed(2)} />
        </div>
        <div className="recharge-bars">
          {[
            { label: t('baseLabel'), width: 100, value: p.base },
            { label: t('modifiedLabel'), width: factor * 100, value: p.base * factor },
          ].map((bar) => (
            <div key={bar.label}>
              <span>{bar.label}</span>
              <div>
                <m.div
                  initial={false}
                  animate={{ width: `${bar.width}%` }}
                  transition={{ duration: 0.35 }}
                />
                <strong>{bar.value.toFixed(2)}</strong>
              </div>
            </div>
          ))}
        </div>
        <div className="lab-controls">
          <NumericControl
            label={t('roll')}
            value={p.roll}
            max={1}
            step={0.001}
            onChange={(roll) => set({ roll })}
          />
          <Stat label={t('chance')} value={`${(chance * 100).toFixed(0)}%`} />
        </div>
        <p className="lab-outcome" role="status">
          {p.roll < chance ? t('resetResult') : t('rechargeResult')}
        </p>
        <p className="lab-caption">{t('formula')}</p>
      </div>
    </AnimatedLab>
  );
}
