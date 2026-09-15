'use client';
import { useTranslations } from 'next-intl';
import { m } from 'motion/react';
import { accessoryValue, gloveAttempt } from '@/lib/equipment-model';
import { AnimatedLab } from './animated-lab';
import { NumericControl } from './numeric-control';
import { Stat, Toggle, useParameters } from './lab-controls';
export default function GloveLab() {
  const t = useTranslations('labs.glove');
  const [p, set] = useParameters(
    'glove',
    { accessoryLevel: 5, clock: 8, deadlineA: 8, deadlineB: 0, roll: 0.1, credit: 1, allowed: 1 },
    {
      accessoryLevel: [0, 5],
      clock: [0, 1000, 0.001],
      deadlineA: [0, 1000, 0.001],
      deadlineB: [0, 1000, 0.001],
      roll: [0, 1, 0.001],
      credit: [0, 1],
      allowed: [0, 1],
    },
  );
  const rate = accessoryValue('super_clock', p.accessoryLevel, 'BoostPlantfoodOnKill');
  const results = [p.deadlineA, p.deadlineB].map((deadline) =>
    gloveAttempt({
      time: p.clock,
      deadline,
      rate,
      roll: p.roll,
      credited: !!p.credit,
      allowed: !!p.allowed,
    }),
  );
  const reason = (value: string) =>
    t(value === 'credit' ? 'creditFail' : value === 'roll' ? 'rollFail' : (value as 'drop'));
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
            label={t('clock')}
            value={p.clock}
            max={1000}
            step={0.001}
            onChange={(clock) => set({ clock })}
          />
          <NumericControl
            label={t('roll')}
            value={p.roll}
            max={1}
            step={0.001}
            onChange={(roll) => set({ roll })}
          />
        </div>
        <div className="lab-controls">
          <Toggle checked={!!p.credit} onChange={(v) => set({ credit: Number(v) })}>
            {t('credit')}
          </Toggle>
          <Toggle checked={!!p.allowed} onChange={(v) => set({ allowed: Number(v) })}>
            {t('allowed')}
          </Toggle>
        </div>
        <Stat label={t('chance')} value={`${(rate * 100).toFixed(0)}%`} />
        <div className="new-lab-grid">
          {results.map((result, index) => (
            <section key={index} className="glove-card">
              <h3>{index === 0 ? t('useA') : t('useB')}</h3>
              <NumericControl
                label={t('deadline')}
                value={index === 0 ? p.deadlineA : p.deadlineB}
                max={1000}
                step={0.001}
                onChange={(value) => set(index === 0 ? { deadlineA: value } : { deadlineB: value })}
              />
              <m.div
                className={`drop-outcome${result.drop ? ' success' : ''}`}
                initial={false}
                animate={{ backgroundColor: result.drop ? '#dcebb4' : '#e8e5dc' }}
              >
                <span aria-hidden="true">{result.drop ? '✦' : '—'}</span>
                <strong role="status">{reason(result.reason)}</strong>
              </m.div>
              <Stat label={t('nextDeadline')} value={Number(result.deadline.toFixed(3))} />
            </section>
          ))}
        </div>
        <p className="lab-caption">{t('strict')}</p>
        <p className="lab-caption">{t('otherPlant')}</p>
      </div>
    </AnimatedLab>
  );
}
