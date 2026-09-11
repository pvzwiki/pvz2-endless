import { useFormatter, useTranslations } from 'next-intl';
import inputs from '@/data/mechanism-inputs.json';

export function EndlessStrengthTable() {
  const t = useTranslations('strengthReference'), format = useFormatter();
  return <table><thead><tr><th>{t('level')} ℓ</th><th>{t('health')} hℓ</th><th>{t('reportedAttack')}</th></tr></thead>
    <tbody>{inputs.reportedStrength.health.map((health, index) => <tr key={index}><td>{index + 1}</td><td>{format.number(health)}</td><td>{format.number(inputs.reportedStrength.attack[index])}</td></tr>)}</tbody>
  </table>;
}

export function PackagedStrengthTables() {
  const t = useTranslations('strengthReference'), format = useFormatter();
  const tables = [{ id: 'dangerRoom', alias: 'DefaultDangerRoomProps', rows: inputs.strengthRows }, ...inputs.otherStrengthTables];
  const labels = {
    dangerRoom: t('dangerRoom'), rift: t('rift'), main: t('main'),
    newPvp: t('newPvp'), legacy: t('legacy'), local: t('local'),
  };
  return <details className="strength-comparison"><summary>{t('compare')}</summary>
    <p>{t('packageNote')}</p>
    {tables.map((table) => <div key={table.id}>
      <h3>{labels[table.id as keyof typeof labels]}</h3><code>{table.alias}</code>
      <table><thead><tr><th>{t('level')} ℓ</th><th>HitPointsLevel</th><th>AttackLevel</th></tr></thead>
        <tbody>{table.rows.map((row, index) => <tr key={index}><td>{index + 1}</td><td>{format.number(row.HitPointsLevel)}</td><td>{format.number(row.AttackLevel)}</td></tr>)}</tbody>
      </table>
    </div>)}
  </details>;
}
