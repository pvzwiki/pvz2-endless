import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/locales';
import { Link } from '@/i18n/navigation';
import { SiteHeader } from '@/components/site-header';
import baseline from '@/data/wave-baseline.json';
import English from '@/content/en/introduction.mdx';
import Chinese from '@/content/zh-CN/introduction.mdx';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'site' });
  return { title: t('aboutKicker'),
    alternates: { canonical: `/${locale}/introduction/`, languages: { en: '/en/introduction/', 'zh-CN': '/zh-CN/introduction/' } } };
}

export default async function IntroductionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('site');
  return <div className="about-page">
    <SiteHeader locale={locale} />
    <main id="main-content" className="about-main">
      <span className="eyebrow">{t('aboutKicker')}</span><h1>{t('aboutTitle')}</h1>
      <div className="about-prose">{locale === 'en' ? <English /> : <Chinese />}</div>
      <aside className="sample-identity"><span className="eyebrow">{t('sample')}</span><span>ARM64 / SHA-256</span><code>{baseline.sample.executableSha256}</code></aside>
      <Link href="/wave-plan/" className="text-link">{t('startChapter')} →</Link>
    </main>
    <footer className="site-footer"><p>{t('footer')}</p></footer>
  </div>;
}
