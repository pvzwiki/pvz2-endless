import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/locales';
import { SiteHeader } from '@/components/site-header';
import { SiteSearch } from '@/components/site-search';
import { ClientMessages } from '@/components/client-messages';
import { ArticleIndex } from '@/components/article-index';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'search' });
  return { title: t('title'), robots: { index: false, follow: true } };
}
export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('search');
  return (
    <>
      <SiteHeader locale={locale} />
      <main id="main-content" className="directory-main">
        <header className="directory-heading">
          <h1>{t('title')}</h1>
          <p>{t('description')}</p>
        </header>
        <ClientMessages namespaces={['search']}>
          <SiteSearch key={locale} />
        </ClientMessages>
        <ArticleIndex locale={locale} />
      </main>
    </>
  );
}
