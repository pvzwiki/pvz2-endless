'use client';
import { useLocale, useTranslations } from 'next-intl';
import artifacts from '@/data/artifact-catalog.json';
import { displayFormulaValue } from '@/lib/equipment-model';
import { NumericControl } from './numeric-control';
import { Stat, useParameters } from './lab-controls';
import { AnimatedLab } from './animated-lab';
const ranges = [
  [1, 10],
  [10, 20],
  [20, 30],
  [30, 30],
] as const;
export default function FormulasLab() {
  const t = useTranslations('labs.formulas'),
    locale = useLocale();
  const [p, set] = useParameters(
    'formulas',
    {
      artifact: artifacts.items.findIndex((item) => item.id === 'artifact_evolution'),
      artifactLevel: 10,
      rank: 2,
      field: 0,
    },
    {
      artifact: [0, artifacts.items.length - 1],
      artifactLevel: [1, 30],
      rank: [1, 4],
      field: [0, 100],
    },
  );
  const artifact = artifacts.items[p.artifact],
    values = artifact.values as Record<string, unknown>;
  const fields = ['MainField', 'PassiveField1', 'PassiveField2', 'PassiveField3'].flatMap((key) =>
    Array.isArray(values[key])
      ? (values[key] as string[]).map((expression, index) => ({
          key,
          index,
          expression,
          last: key === 'MainField' && index === (values[key] as string[]).length - 1,
        }))
      : [],
  );
  const field = fields[Math.min(p.field, fields.length - 1)];
  const [min, max] = ranges[p.rank - 1];
  const level = Math.max(min, Math.min(max, p.artifactLevel));
  const result = field ? displayFormulaValue(field.expression, level, p.rank, field.last) : null;
  return (
    <AnimatedLab>
      <div className="new-lab">
        <div className="lab-controls">
          <label>
            {t('artifact')}
            <select
              value={p.artifact}
              onChange={(event) => set({ artifact: Number(event.target.value), field: 0 })}
            >
              {artifacts.items.map((item, index) => (
                <option key={item.id} value={index}>
                  {item.name[locale]}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('rank')}
            <select value={p.rank} onChange={(event) => set({ rank: Number(event.target.value) })}>
              {[1, 2, 3, 4].map((rank) => (
                <option key={rank}>{rank}</option>
              ))}
            </select>
          </label>
          <NumericControl
            label={t('artifactLevel')}
            value={level}
            min={min}
            max={max}
            onChange={(artifactLevel) => set({ artifactLevel })}
          />
          <label>
            {t('field')}
            <select
              value={Math.min(p.field, fields.length - 1)}
              onChange={(event) => set({ field: Number(event.target.value) })}
            >
              {fields.map((entry, index) => (
                <option key={`${entry.key}-${entry.index}`} value={index}>
                  {entry.key}[{entry.index}]
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="lab-caption">{t('bounds')}</p>
        {field && result ? (
          <>
            <div className="formula-walk">
              <div>
                <span>{t('source')}</span>
                <code>{field.expression || '∅'}</code>
              </div>
              <b aria-hidden="true">↓</b>
              <div>
                <span>{t('substitution')}</span>
                <code>{result.substituted || '∅'}</code>
              </div>
            </div>
            <div className="lab-stat-grid">
              <Stat
                label={t('arithmetic')}
                value={result.floating ? t('floating') : t('integer')}
              />
              <Stat
                label={t('raw')}
                value={result.raw.toLocaleString(locale, { maximumFractionDigits: 6 })}
              />
              <Stat
                label={t('display')}
                value={result.value.toLocaleString(locale, { maximumFractionDigits: 6 })}
              />
            </div>
            {field.last && <p className="lab-caption">{t('guard')}</p>}
          </>
        ) : (
          <p>{t('noFormula')}</p>
        )}
      </div>
    </AnimatedLab>
  );
}
