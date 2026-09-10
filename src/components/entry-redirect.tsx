'use client';

import { useEffect } from 'react';
import { isLocale, localeCookieName } from '@/i18n/locales';

export function EntryRedirect() {
  useEffect(() => {
    const language = navigator.languages?.[0] || navigator.language;
    const saved = document.cookie.split('; ').find((cookie) => cookie.startsWith(`${localeCookieName}=`))?.split('=')[1] || '';
    const locale = isLocale(saved) ? saved : language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
    window.location.replace(`/${locale}/${window.location.search}${window.location.hash}`);
  }, []);
  return <main style={{ maxWidth: 560, margin: '18vh auto', padding: 32 }}>
    <p>PVZ2 / ENDLESS</p><h1>Endless, explained.</h1><p><a href="/en/" style={{ color: 'inherit', marginRight: 24 }}>English →</a><a href="/zh-CN/" lang="zh-CN" style={{ color: 'inherit' }}>中文 →</a></p>
  </main>;
}
