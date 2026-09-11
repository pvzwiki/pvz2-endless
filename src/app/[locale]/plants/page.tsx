import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/locales';
import { SiteHeader, WaveMark } from '@/components/site-header';
import { PlantReference } from '@/components/plant-reference';
import { Link } from '@/i18n/navigation';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'plants' });
  return { title: t('metadataTitle'), description: t('description'), alternates: { canonical: `/${locale}/plants/`, languages: { en: '/en/plants/', 'zh-CN': '/zh-CN/plants/' } } };
}
export default async function PlantsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound(); setRequestLocale(locale);
  const t = await getTranslations('plants'), c = await getTranslations('catalog'), s = await getTranslations('site');
  return <div className="reference-page"><SiteHeader locale={locale} /><main id="main-content" className="reference-main">
    <div className="reference-heading"><span className="eyebrow">{c('eyebrow')}</span><h1>{t('title')}</h1><p>{t('description')}</p><WaveMark /></div>
    <nav className="reference-tabs" aria-label={s('reference')}><Link href="/zombies/">{s('zombies')}</Link><Link href="/plants/" aria-current="page">{s('plants')}</Link></nav>
    <PlantReference />
  </main></div>;
}
