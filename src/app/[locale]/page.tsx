import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/locales';
import { Link } from '@/i18n/navigation';
import { SiteHeader } from '@/components/site-header';
import { FallbackSculpture } from '@/components/wave-visual';
import { createWavePlan } from '@/lib/wave-model';
import { chapters, chapterPath } from '@/content/chapters';
import catalog from '@/data/reference-catalog.json';
import plants from '@/data/plant-catalog.json';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'home' });
  return { title: t('documentTitle'), description: t('description'), alternates: { canonical: `/${locale}/`, languages: { en: '/en/', 'zh-CN': '/zh-CN/', 'x-default': '/en/' } } };
}
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound(); setRequestLocale(locale);
  const t = await getTranslations('home'), s = await getTranslations('site');
  const c = await getTranslations('chapters');
  return <div className="home-page"><SiteHeader locale={locale} /><main id="main-content">
    <section className="hero home-hero"><div className="hero-content"><p className="hero-eyebrow"><span className="tiny-line" />{t('eyebrow')}</p><h1><span>{t('title')}</span><em>{t('accent')}</em></h1><p className="hero-subtitle">{t('description')}</p><div className="hero-actions"><Link href="/introduction/" className="button button-light">{t('start')}<span aria-hidden="true">→</span></Link></div></div>
      <figure className="hero-art home-sculpture"><FallbackSculpture plan={createWavePlan(149)} /><figcaption>{t('example')}</figcaption></figure>
    </section>
    <div className="home-index"><section id="chapters" className="home-chapters"><span className="eyebrow">{t('series')}</span>
      <Link href="/introduction/" className="intro-entry"><span>00</span><div><strong>{t('introduction')}</strong><p>{t('introDescription')}</p></div><span aria-hidden="true">↗</span></Link>
      <ol>{chapters.map((chapter) => <li key={chapter.id}><span>{String(chapter.number).padStart(2,'0')}</span>{chapter.published ? <Link href={chapterPath(chapter.id)}>{c(`${chapter.id}.title`)}<span aria-hidden="true">↗</span></Link> : <div>{c(`${chapter.id}.title`)}<small>{s('planned')}</small></div>}</li>)}</ol>
    </section><aside className="home-reference"><span className="eyebrow">{t('reference')}</span>
      <div className="home-reference-entry"><strong>{new Intl.NumberFormat(locale).format(catalog.types.length)}</strong><p>{t('referenceDescription')}</p><Link href="/zombies/" className="text-link">{t('openReference')} ↗</Link></div>
      <div className="home-reference-entry"><strong>{new Intl.NumberFormat(locale).format(plants.types.length)}</strong><p>{t('plantDescription')}</p><Link href="/plants/" className="text-link">{t('openPlants')} ↗</Link></div>
    </aside></div>
  </main><footer className="site-footer"><p>{s('footer')}</p></footer></div>;
}
