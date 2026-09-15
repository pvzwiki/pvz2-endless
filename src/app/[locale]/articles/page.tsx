import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/locales';
import { SiteHeader } from '@/components/site-header';
import { ArticleIndex } from '@/components/article-index';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'home' });
  return {
    title: t('series'),
    description: t('articlesDescription'),
    alternates: {
      canonical: `/${locale}/articles/`,
      languages: { en: '/en/articles/', 'zh-CN': '/zh-CN/articles/' },
    },
  };
}
export default async function ArticlesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('home');
  return (
    <>
      <SiteHeader locale={locale} />
      <main id="main-content" className="directory-main">
        <header className="directory-heading">
          <span className="eyebrow">{t('series')}</span>
          <h1>{t('articlesTitle')}</h1>
          <p>{t('articlesDescription')}</p>
        </header>
        <ArticleIndex locale={locale} />
      </main>
    </>
  );
}
