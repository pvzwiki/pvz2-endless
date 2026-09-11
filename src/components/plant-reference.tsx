'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import type { PlantCatalog, PlantRecord, PlantValue } from '@/lib/plant-catalog';
import rawCatalog from '@/data/plant-catalog.json';

const catalog = rawCatalog as PlantCatalog;
const coreFields = ['Cost', 'Hitpoints', 'PacketCooldown', 'type.Rare'];
const rarities = [...new Set(catalog.types.flatMap((row) => typeof row.values['type.Rare'] === 'number' ? [row.values['type.Rare']] : []))].sort((a, b) => a - b);

export function PlantReference() {
  const t = useTranslations('plants'), c = useTranslations('catalog');
  const locale = useLocale(), format = useFormatter();
  const [query, setQuery] = useState(''), [rare, setRare] = useState('');
  const [sort, setSort] = useState('id'), [descending, setDescending] = useState(false), [page, setPage] = useState(0);
  const [selected, setSelected] = useState<PlantRecord | null>(null), [ready, setReady] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null), returnFocus = useRef<HTMLElement | null>(null);
  const rows = useMemo(() => {
    const term = query.normalize('NFKC').toLowerCase().trim();
    return catalog.types.filter((row) => {
      const value = row.values['type.Rare'];
      if (rare === 'missing' ? value !== null : rare !== '' && value !== Number(rare)) return false;
      return !term || [row.id, row.name.en, row.name['zh-CN'], row.framework || ''].some((text) => text.normalize('NFKC').toLowerCase().includes(term));
    }).sort((a, b) => {
      if (sort !== 'id') {
        const av = a.values[sort], bv = b.values[sort];
        if (typeof av !== 'number' && typeof bv === 'number') return 1;
        if (typeof av === 'number' && typeof bv !== 'number') return -1;
        if (typeof av === 'number' && typeof bv === 'number' && av !== bv) return (av - bv) * (descending ? -1 : 1);
      }
      return a.id.localeCompare(b.id) || a.key.localeCompare(b.key);
    });
  }, [query, rare, sort, descending]);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(rows.length / 40) - 1));
  const labels = [t('cost'), c('health'), t('cooldown'), t('rare')];
  const fieldStatus = (status: string) => status === 'declared' ? c('declared') : status === 'agrees_across_declarations' ? t('repeated') : c('omittedStatus');
  const valueText = (value: PlantValue | undefined) => value === null || value === undefined ? '—'
    : typeof value === 'boolean' ? value ? c('yes') : c('no')
    : typeof value === 'number' ? format.number(value, { maximumFractionDigits: 10 }) : value;
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get('q') || '');
    const filter = params.get('rare') || '';
    setRare(filter === 'missing' || rarities.some((n) => String(n) === filter) ? filter : '');
    setSelected(catalog.types.find((row) => row.key === params.get('plant')) || null);
    setReady(true);
  }, []);
  useEffect(() => { setPage(0); }, [query, rare, sort, descending]);
  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    for (const [key, value] of [['q', query], ['rare', rare], ['plant', selected?.key || '']]) {
      if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    }
    window.history.replaceState(window.history.state, '', url);
  }, [query, rare, selected, ready]);
  useEffect(() => {
    if (selected && !dialog.current?.open) { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; dialog.current?.showModal(); }
    if (!selected && dialog.current?.open) dialog.current?.close();
  }, [selected]);
  const changeSort = (field: string) => { if (sort === field) setDescending(!descending); else { setSort(field); setDescending(field !== 'id'); } };
  return <>
    <section className="catalog-browser" aria-label={t('title')}>
      <div className="catalog-filters">
        <label className="catalog-search">{c('search')}<input type="search" placeholder={t('placeholder')} value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label>{t('rare')}<select value={rare} onChange={(event) => setRare(event.target.value)}><option value="">{c('all')}</option>{rarities.map((value) => <option key={value} value={value}>{value}</option>)}<option value="missing">{c('omittedStatus')}</option></select></label>
      </div>
      <div className="catalog-summary"><span aria-live="polite">{c('results', { count: rows.length })}</span><p>{c('omitted')}</p></div>
      <p className="catalog-context">{t('scopeNote')}</p>
      <div className="catalog-table-scroll"><table className="catalog-table"><thead><tr>
        <th><button onClick={() => changeSort('id')}>{c('type')}</button></th>
        {coreFields.map((field, index) => <th key={field} aria-sort={sort === field ? descending ? 'descending' : 'ascending' : 'none'}><button aria-label={c('sort', { field })} onClick={() => changeSort(field)}>{labels[index]}<span>{sort === field ? descending ? '↓' : '↑' : '↕'}</span></button></th>)}
      </tr></thead><tbody>{rows.slice(currentPage * 40, (currentPage + 1) * 40).map((record) => <tr key={record.key}>
        <th scope="row"><button className="catalog-name" aria-label={c('open', { name: record.name[locale] })} onClick={(event) => { event.currentTarget.focus({ preventScroll: true }); setSelected(record); }}><strong className={record.name[locale] === record.id ? 'identifier-name' : ''}>{record.name[locale]}</strong>{record.name[locale] !== record.id && <code>{record.id}</code>}</button></th>
        {coreFields.map((field) => <td key={field} title={fieldStatus(record.status[field])}>{valueText(record.values[field])}</td>)}
      </tr>)}</tbody></table></div>
      {!rows.length && <p className="empty-state">{c('empty')}</p>}
      <div className="catalog-pagination"><span>{c('page', { start: rows.length ? currentPage * 40 + 1 : 0, end: Math.min((currentPage + 1) * 40, rows.length), total: rows.length })}</span><div><button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} aria-label={c('previous')}>←</button><button disabled={(currentPage + 1) * 40 >= rows.length} onClick={() => setPage(currentPage + 1)} aria-label={c('next')}>→</button></div></div>
    </section>
    <dialog ref={dialog} className="record-dialog" aria-labelledby="plant-title" onClose={() => { setSelected(null); returnFocus.current?.focus({ preventScroll: true }); }} onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
      {selected && <div className="record-content"><div className="record-top"><span className="eyebrow">{c('source')}</span><button className="close-view" aria-label={t('close')} onClick={() => setSelected(null)}>×</button></div>
        <h2 id="plant-title">{selected.name[locale]}</h2><code className="record-identifier">{selected.id}</code>
        <div className="record-core">{coreFields.map((field, index) => <div key={field}><span>{labels[index]}</span><strong>{valueText(selected.values[field])}</strong><code>{field}</code></div>)}</div>
        <h3>{c('identity')}</h3><dl className="record-fields">{[['PlantType', selected.plantClass], ['PlantFramework', selected.framework], ['HomeWorld', selected.homeWorld], [c('reference'), selected.reference]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
        <h3>{c('other')}</h3><dl className="record-fields">{catalog.fields.filter((field) => !coreFields.includes(field)).map((field) => <div key={field}><dt>{field}</dt><dd title={fieldStatus(selected.status[field])}>{valueText(selected.values[field])}</dd></div>)}</dl>
        <p className="catalog-context">{t('fieldNote')}</p>
      </div>}
    </dialog>
  </>;
}
