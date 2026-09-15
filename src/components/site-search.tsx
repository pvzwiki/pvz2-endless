'use client';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

type Result = { url: string; plain_excerpt: string; meta: { title: string } };
type Pagefind = {
  search: (query: string) => Promise<{ results: { data: () => Promise<Result> }[] }>;
};
const indexes = new Map<string, Promise<Pagefind>>();
function load(locale: string) {
  let index = indexes.get(locale);
  if (!index) {
    const path = `/pagefind/pagefind.js?locale=${locale}`;
    index = import(/* webpackIgnore: true */ /* turbopackIgnore: true */ path).catch((error) => {
      indexes.delete(locale);
      throw error;
    });
    indexes.set(locale, index);
  }
  return index;
}
export function SiteSearch() {
  const t = useTranslations('search'),
    locale = useLocale();
  const [query, setQuery] = useState(''),
    [ready, setReady] = useState(false),
    [results, setResults] = useState<Result[]>([]),
    [count, setCount] = useState(0),
    [limit, setLimit] = useState(12),
    [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const request = useRef(0);
  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get('q') ?? '');
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const id = ++request.current;
    if (!query.trim()) {
      setResults([]);
      setCount(0);
      setStatus('idle');
      const url = new URL(window.location.href);
      url.searchParams.delete('q');
      window.history.replaceState(window.history.state, '', url);
      return;
    }
    const timer = setTimeout(async () => {
      setStatus('loading');
      const url = new URL(window.location.href);
      url.searchParams.set('q', query);
      window.history.replaceState(window.history.state, '', url);
      try {
        const index = await load(locale);
        const found = await index.search(query);
        const items = await Promise.all(
          found.results.slice(0, limit).map((result) => result.data()),
        );
        if (id !== request.current) return;
        setResults(items.filter((result) => result.url.startsWith(`/${locale}/`)));
        setCount(found.results.length);
        setStatus('ready');
      } catch {
        if (id === request.current) setStatus('error');
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [query, limit, locale, ready]);
  return (
    <div>
      <form className="search-form" role="search" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="site-query">{t('label')}</label>
        <input
          id="site-query"
          className="search-field"
          type="search"
          value={query}
          onFocus={() => {
            void load(locale).catch(() => {});
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setLimit(12);
          }}
          placeholder={t('placeholder')}
          autoComplete="off"
        />
      </form>
      <p className="result-count" role="status">
        {status === 'loading'
          ? t('loading')
          : status === 'error'
            ? t('error')
            : status === 'idle'
              ? t('start')
              : count
                ? t('results', { count })
                : t('empty')}
      </p>
      <ul className="search-results">
        {results.map((result) => (
          <li key={result.url}>
            <a href={result.url}>
              <h2>{result.meta.title} ↗</h2>
              <p>{result.plain_excerpt}</p>
            </a>
          </li>
        ))}
      </ul>
      {results.length < count && status === 'ready' && (
        <button className="search-more" onClick={() => setLimit(limit + 12)}>
          {t('more')}
        </button>
      )}
    </div>
  );
}
