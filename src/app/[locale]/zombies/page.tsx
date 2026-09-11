import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/locales';
import { SiteHeader, WaveMark } from '@/components/site-header';
import { ZombieReference } from '@/components/zombie-reference';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'catalog' });
  return { title: t('metadataTitle'), description: t('description'), alternates: { canonical: `/${locale}/zombies/`, languages: { en: '/en/zombies/', 'zh-CN': '/zh-CN/zombies/' } } };
}
export default async function CatalogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound(); setRequestLocale(locale);
  const t = await getTranslations('catalog');
  return <div className="reference-page"><SiteHeader locale={locale} /><main id="main-content" className="reference-main">
    <div className="reference-heading"><span className="eyebrow">{t('eyebrow')}</span><h1>{t('title')}</h1><p>{t('description')}</p><WaveMark /></div>
    <ZombieReference />
  </main></div>;
}
