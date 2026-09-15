import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/locales';
import { SiteHeader } from '@/components/site-header';
import { ReferenceIndex } from '@/components/reference-index';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'equipment' });
  return {
    title: t('referenceTitle'),
    description: t('referenceDescription'),
    alternates: {
      canonical: `/${locale}/reference/`,
      languages: { en: '/en/reference/', 'zh-CN': '/zh-CN/reference/' },
    },
  };
}
export default async function ReferencePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('equipment');
  return (
    <>
      <SiteHeader locale={locale} />
      <main id="main-content" className="directory-main">
        <header className="directory-heading">
          <span className="eyebrow">PVZ2</span>
          <h1>{t('referenceTitle')}</h1>
          <p>{t('referenceDescription')}</p>
        </header>
        <ReferenceIndex />
      </main>
    </>
  );
}
