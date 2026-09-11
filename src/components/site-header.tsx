'use client';

import { Link, usePathname, useRouter } from '@/i18n/navigation';
import type { Locale } from '@/i18n/locales';
import { useTranslations } from 'next-intl';

export function WaveMark() {
  return <svg viewBox="0 0 30 30" fill="none" aria-hidden="true"><path d="M4 23V17M11 23V10M18 23V4M25 23V13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>;
}

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = useTranslations('site');
  const pathname = usePathname();
  const router = useRouter();
  const changeLanguage = (event: React.MouseEvent<HTMLAnchorElement>, language: Locale) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    router.push(`${pathname}${window.location.search}${window.location.hash}`, { locale: language });
  };
  return <>
    <a className="skip-link" href="#main-content">{t('skip')}</a>
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label={`${t('brand')} ${t('brandSub')}`}>
        <WaveMark /><span>{t('brand')}<small>{t('brandSub')}</small></span>
      </Link>
      <nav className="desktop-nav" aria-label={locale === 'en' ? 'Main navigation' : '主导航'}>
        <Link href="/#chapters">{t('series')}</Link>
        <Link href="/zombies/" aria-current={pathname.startsWith('/zombies') ? 'page' : undefined}>{t('zombies')}</Link>
        <Link href="/plants/" aria-current={pathname.startsWith('/plants') ? 'page' : undefined}>{t('plants')}</Link>
      </nav>
      <div className="header-right">
        <div className="language-switch" aria-label={locale === 'en' ? 'Language' : '语言'}>
          <Link href={pathname} locale="en" onClick={(event) => changeLanguage(event, 'en')} lang="en" aria-label="English" aria-current={locale === 'en' ? 'page' : undefined}>EN</Link>
          <span aria-hidden="true">/</span>
          <Link href={pathname} locale="zh-CN" onClick={(event) => changeLanguage(event, 'zh-CN')} lang="zh-CN" aria-label="中文" aria-current={locale === 'zh-CN' ? 'page' : undefined}>中文</Link>
        </div>
        <details className="mobile-nav"><summary aria-label={locale === 'en' ? 'Open navigation' : '打开导航'}><span /><span /></summary>
          <nav><Link href="/#chapters">{t('series')}</Link><Link href="/zombies/">{t('zombies')}</Link><Link href="/plants/">{t('plants')}</Link></nav>
        </details>
      </div>
    </header>
  </>;
}
