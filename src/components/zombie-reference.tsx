'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { queryCatalog, type FieldValue, type ZombieCatalog, type ZombieRecord } from '@/lib/zombie-catalog';
import rawCatalog from '@/data/reference-catalog.json';

const catalog = rawCatalog as unknown as ZombieCatalog;
const coreFields = ['WavePointCost', 'Weight', 'Hitpoints', 'HelmHitpoints'];

export function ZombieReference() {
  const t = useTranslations('catalog');
  const locale = useLocale();
  const format = useFormatter();
  const [query, setQuery] = useState(''), [scope, setScope] = useState('all'), [world, setWorld] = useState('');
  const [sort, setSort] = useState('id'), [descending, setDescending] = useState(false), [page, setPage] = useState(0);
  const [selected, setSelected] = useState<ZombieRecord | null>(null), [candidate, setCandidate] = useState(-1);
  const [ready, setReady] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null), returnFocus = useRef<HTMLElement | null>(null);
  const rows = useMemo(() => queryCatalog(catalog, query, scope, world, sort, descending), [query, scope, world, sort, descending]);
  const pageCount = Math.max(1, Math.ceil(rows.length / 40)), currentPage = Math.min(page, pageCount - 1);
  const visible = rows.slice(currentPage * 40, (currentPage + 1) * 40);
  const status = (value: string) => {
    switch (value) {
      case 'declared': return t('declared'); case 'agrees_across_candidates': return t('agrees_across_candidates');
      case 'ambiguous': return t('ambiguous'); case 'context_required': return t('context_required');
      case 'unresolved_reference': return t('unresolved_reference'); case 'unique_in_snapshot': return t('unique_in_snapshot');
      case 'duplicate_alias': return t('duplicate_alias'); case 'qualified_candidates': return t('qualified_candidates');
      default: return t('omittedStatus');
    }
  };
  const valueText = (value: FieldValue | undefined) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? t('yes') : t('no');
    if (typeof value === 'number') return Number.isInteger(value) && Math.abs(value) < 1e9 ? format.number(value) : String(value);
    if (typeof value === 'object') return Object.entries(value).map(([key, entry]) => `${key}: ${entry}`).join(' · ');
    return value;
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get('q') || ''); setScope(params.get('scope') === 'endless' ? 'endless' : 'all');
    setWorld(catalog.worlds.includes(params.get('world') || '') ? params.get('world')! : '');
    const id = params.get('zombie'); if (id) setSelected(catalog.types.find((row) => row.key === id) || null);
    setReady(true);
  }, []);
  useEffect(() => { setPage(0); }, [query, scope, world, sort, descending]);
  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    for (const [key, value] of [['q',query],['scope',scope === 'all' ? '' : scope],['world',world],['zombie',selected?.key || '']]) {
      if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    }
    window.history.replaceState(window.history.state, '', url);
  }, [query, scope, world, selected, ready]);
  useEffect(() => {
    setCandidate(-1);
    if (selected && !dialog.current?.open) { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; dialog.current?.showModal(); }
    if (!selected && dialog.current?.open) dialog.current?.close();
  }, [selected]);
  const values = selected && candidate >= 0 ? selected.candidates[candidate].values : selected?.values;
  const statuses = selected && candidate >= 0 ? selected.candidates[candidate].status : selected?.status;
  const changeSort = (field: string) => { if (sort === field) setDescending(!descending); else { setSort(field); setDescending(field !== 'id'); } };
  return <>
    <section className="catalog-browser" aria-label={t('title')}>
      <div className="catalog-filters"><label className="catalog-search">{t('search')}<input type="search" placeholder={t('placeholder')} value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label>{t('scope')}<select value={scope} onChange={(event) => setScope(event.target.value)}><option value="all">{t('all')}</option><option value="endless">{t('endless')}</option></select></label>
        <label>{t('world')}<select value={world} onChange={(event) => setWorld(event.target.value)}><option value="">{t('allWorlds')}</option>{catalog.worlds.map((id) => <option key={id} value={id}>{id}</option>)}</select></label>
      </div>
      <div className="catalog-summary"><span aria-live="polite">{t('results', { count: rows.length })}</span><p>{t('omitted')}</p></div>
      <div className="catalog-table-scroll"><table className="catalog-table"><thead><tr><th><button onClick={() => changeSort('id')}>{t('type')} {sort === 'id' ? '↓' : ''}</button></th>
        {coreFields.map((field, index) => <th key={field} aria-sort={sort === field ? descending ? 'descending' : 'ascending' : 'none'}><button aria-label={t('sort', { field })} onClick={() => changeSort(field)}>{[t('cost'),t('weight'),t('health'),t('helmet')][index]}<span>{sort === field ? descending ? '↓' : '↑' : '↕'}</span></button></th>)}<th><span className="sr-only">{t('values')}</span></th></tr></thead>
        <tbody>{visible.map((record) => <tr key={record.key}><th scope="row"><button className="catalog-name" onClick={(event) => { event.currentTarget.focus({ preventScroll: true }); setSelected(record); }} aria-label={t('open', { name: record.name[locale] })}>
          <strong className={record.name[locale] === record.id ? 'identifier-name' : ''}>{record.name[locale]}</strong>{record.name[locale] !== record.id && <code>{record.id}</code>}
          {record.referenceStatus !== 'unique_in_snapshot' && <span className="reference-badge">{status(record.referenceStatus)}</span>}
        </button></th>{coreFields.map((field) => <td key={field} title={status(record.status[field])}>{valueText(record.values[field])}{record.status[field] === 'ambiguous' && <span className="ambiguity-mark">?</span>}</td>)}
          <td><button className="record-plus" aria-label={t('open', { name: record.key })} onClick={(event) => { event.currentTarget.focus({ preventScroll: true }); setSelected(record); }}>+</button></td></tr>)}</tbody></table></div>
      {!rows.length && <p className="empty-state">{t('empty')}</p>}
      <div className="catalog-pagination"><span>{t('page', { start: rows.length ? currentPage * 40 + 1 : 0, end: Math.min((currentPage + 1) * 40, rows.length), total: rows.length })}</span><div><button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} aria-label={t('previous')}>←</button><button disabled={currentPage === pageCount - 1} onClick={() => setPage(currentPage + 1)} aria-label={t('next')}>→</button></div></div>
    </section>
    <dialog ref={dialog} className="record-dialog" aria-labelledby="record-title" onClose={() => { setSelected(null); returnFocus.current?.focus({ preventScroll: true }); }} onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
      {selected && <div className="record-content"><div className="record-top"><span className="eyebrow">{t('source')}</span><button className="close-view" aria-label={t('close')} onClick={() => setSelected(null)}>×</button></div>
        <h2 id="record-title">{selected.name[locale]}</h2><code className="record-identifier">{selected.key}</code><span className="reference-badge">{status(selected.referenceStatus)}</span>
        {selected.candidates.length > 0 && <label className="candidate-select">{t('candidates')}<select value={candidate} onChange={(event) => setCandidate(Number(event.target.value))}><option value="-1">{t('consensus')}</option>{selected.candidates.map((item, index) => <option key={index} value={index}>{t('candidate', { number: index + 1 })} · {item.label}</option>)}</select></label>}
        <div className="record-core">{coreFields.map((field, index) => <div key={field}><span>{[t('cost'),t('weight'),t('health'),t('helmet')][index]}</span><strong>{valueText(values?.[field])}</strong><code>{field}</code></div>)}</div>
        <h3>{t('identity')}</h3><dl className="record-fields"><div><dt>{t('zombieClass')}</dt><dd>{selected.zombieClass || '—'}</dd></div><div><dt>{t('homeWorld')}</dt><dd>{selected.homeWorld || '—'}</dd></div><div><dt>{t('reference')}</dt><dd>{selected.reference || '—'}</dd></div></dl>
        <h3>{t('geometry')}</h3><dl className="record-fields geometry-fields">{['HitRect','AttackRect','GridExtents','SizeType'].map((field) => <div key={field}><dt>{field}</dt><dd title={status(statuses?.[field] || '')}>{valueText(values?.[field])}</dd></div>)}</dl>
        <h3>{t('other')}</h3><dl className="record-fields">{catalog.fields.filter((field) => ![...coreFields,'HitRect','AttackRect','GridExtents','SizeType'].includes(field)).map((field) => <div key={field}><dt>{field}</dt><dd title={status(statuses?.[field] || '')}>{valueText(values?.[field])}</dd></div>)}</dl>
        {Object.keys(selected.roles).length > 0 && <><h3>{t('roles')}</h3><dl className="record-fields">{Object.entries(selected.roles).map(([id, roles]) => <div key={id}><dt>{id}</dt><dd>{roles.join(' · ')}</dd></div>)}</dl></>}
        <Link href="/roster/#cost-and-weight" className="text-link" onClick={() => setSelected(null)}>{t('viewMechanism')} ↗</Link>
      </div>}
    </dialog>
  </>;
}
