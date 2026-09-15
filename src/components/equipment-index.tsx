'use client';
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
export type EquipmentSummary = {
  id: string;
  name: { en: string; 'zh-CN': string };
  quality: string;
  href: string;
};
export function EquipmentIndex({ records }: { records: EquipmentSummary[] }) {
  const locale = useLocale(),
    t = useTranslations('equipment');
  const [query, setQuery] = useState(''),
    [quality, setQuality] = useState(''),
    [ready, setReady] = useState(false);
  const qualities = [...new Set(records.map((row) => row.quality).filter(Boolean))];
  useEffect(() => {
    const url = new URL(window.location.href);
    setQuery(url.searchParams.get('q') || '');
    const q = url.searchParams.get('quality') || '';
    setQuality(qualities.includes(q) ? q : '');
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    for (const [key, value] of [
      ['q', query],
      ['quality', quality],
    ]) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    window.history.replaceState(window.history.state, '', url);
  }, [query, quality, ready]);
  const rows = useMemo(() => {
    const term = query.normalize('NFKC').trim().toLowerCase();
    return records.filter(
      (row) =>
        (!quality || row.quality === quality) &&
        [row.id, row.name.en, row.name['zh-CN']].some((value) =>
          value.normalize('NFKC').toLowerCase().includes(term),
        ),
    );
  }, [records, query, quality]);
  return (
    <section>
      <div className="equipment-filters">
        <label>
          {t('search')}
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        {qualities.length > 0 && (
          <label>
            {t('quality')}
            <select value={quality} onChange={(event) => setQuality(event.target.value)}>
              <option value="">{t('all')}</option>
              {qualities.map((value) => (
                <option key={value} value={value}>
                  {t(value as 'super')}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <p className="result-count" role="status">
        {t('results', { count: rows.length })}
      </p>
      <div className="equipment-grid">
        {rows.map((row) => (
          <Link key={row.id} href={row.href}>
            <span className="eyebrow">
              {row.quality ? t(row.quality as 'super') : t('artifacts')}
            </span>
            <h2>{row.name[locale]}</h2>
            <code>{row.id}</code>
            <span className="record-arrow" aria-hidden="true">
              ↗
            </span>
          </Link>
        ))}
      </div>
      {!rows.length && <p>{t('noResults')}</p>}
    </section>
  );
}
