import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/locales';
import { Link } from '@/i18n/navigation';
import { SiteHeader } from '@/components/site-header';
import { ArticleIndex } from '@/components/article-index';
import { ReferenceIndex } from '@/components/reference-index';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'home' });
  return {
    title: t('documentTitle'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/`,
      languages: { en: '/en/', 'zh-CN': '/zh-CN/', 'x-default': '/en/' },
    },
  };
}
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('home'),
    s = await getTranslations('site');
  return (
    <div className="home-page">
      <SiteHeader locale={locale} />
      <main id="main-content">
        <section className="mechanics-hero">
          <div>
            <p className="hero-eyebrow">
              <span className="tiny-line" />
              {t('eyebrow')}
            </p>
            <h1>
              {t('title')}
              <em>{t('accent')}</em>
            </h1>
            <p className="hero-subtitle">{t('description')}</p>
            <Link href="/introduction/" className="button button-light">
              {t('start')}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <Link href="/evolution/" className="featured-mechanism">
            <div className="cover-board" aria-hidden="true">
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i} className={i === 4 ? 'cover-source' : ''}>
                  {i === 4 ? '↗' : i === 1 || i === 7 ? '•' : ''}
                </span>
              ))}
            </div>
            <span className="eyebrow">{t('featured')}</span>
            <h2>{t('featureTitle')}</h2>
            <p>{t('featureDescription')}</p>
            <strong>{t('featureLink')} ↗</strong>
          </Link>
        </section>
        <div className="home-library" id="chapters">
          <div className="section-heading">
            <h2>{t('series')}</h2>
            <span>01 — 03</span>
          </div>
          <ArticleIndex locale={locale} />
          <section className="home-references">
            <header>
              <span className="eyebrow">{s('reference')}</span>
              <h2>{t('reference')}</h2>
              <p>{t('referenceDescription')}</p>
            </header>
            <ReferenceIndex />
          </section>
        </div>
      </main>
      <footer className="site-footer">
        <p>{s('footer')}</p>
        <Link href="/introduction/#method">{s('method')} ↗</Link>
      </footer>
    </div>
  );
}
