'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLocale, useTranslations } from 'next-intl';
import { chapters, findChapter, chapterPath, type ChapterId } from '@/content/chapters';
import ExperimentHost from './experiment-host';
import { ArticleHeading } from './article-heading';
import { EvidenceProvider } from './evidence-notes';
import { SiteHeader } from './site-header';

function ArticleFrame({ children, chapter }: { children: ReactNode; chapter: ChapterId }) {
  const locale = useLocale();
  const t = useTranslations('site');
  const text = useTranslations('chapters');
  const published = chapters.filter((entry) => entry.published);
  const index = published.findIndex((entry) => entry.id === chapter);
  const previous = published[index - 1], next = published[index + 1];
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.fromTo('.article-heading > *', { y: 12 }, { y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out' });
        gsap.utils.toArray<HTMLElement>('.prose-section h2').forEach((heading) => {
          gsap.fromTo(heading, { y: 22 }, { y: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: heading, start: 'top 90%', once: true } });
        });
      }, root);
      return () => context.revert();
    });
    const tracker = ScrollTrigger.create({ trigger: '#main-content', start: 'top 90px', end: 'bottom 75%', onUpdate: (self) => {
      if (progress.current) progress.current.style.transform = `scaleX(${self.progress})`;
    } });
    return () => { media.revert(); tracker.kill(); };
  }, [chapter]);
  return <div ref={root} className="article-experience">
    <div className="reading-progress" ref={progress} aria-hidden="true" />
    <SiteHeader locale={locale} />
    <ArticleHeading chapter={chapter} />
    <div className="article-layout">
      <main id="main-content" className="article-prose" lang={locale}>{children}</main>
    </div>
    <nav className="chapter-pagination" aria-label={t('chapterNavigation')}>
      {previous && <Link href={chapterPath(previous.id)}><span>{t('previousChapter')}</span><strong>← {text(`${previous.id}.title`)}</strong></Link>}
      {next && <Link href={chapterPath(next.id)} className="next-chapter-link"><span>{t('nextChapter')}</span><strong>{text(`${next.id}.title`)} →</strong></Link>}
    </nav>
    <footer className="site-footer"><p>{t('footer')}</p><Link href="/introduction/#method">{t('method')} ↗</Link></footer>
  </div>;
}

export function ArticleExperience({ children, chapter = 'wave-plan' }: { children: ReactNode; chapter?: ChapterId }) {
  const entry = findChapter(chapter)!;
  const frame = <ArticleFrame chapter={chapter}>{children}</ArticleFrame>;
  return <EvidenceProvider>{entry.experiment ? <ExperimentHost kind={entry.experiment}>{frame}</ExperimentHost> : frame}</EvidenceProvider>;
}
