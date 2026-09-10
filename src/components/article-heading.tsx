'use client';

import { useTranslations } from 'next-intl';
import { findChapter, type ChapterId } from '@/content/chapters';

export function ArticleHeading({ chapter }: { chapter: ChapterId }) {
  const t = useTranslations('chapters'), site = useTranslations('site');
  const entry = findChapter(chapter)!;
  return <header className="article-heading">
    <span className="eyebrow">{site('chapterLabel', { number: String(entry.number).padStart(2,'0') })}</span>
    <h1 id="article-title">{t(`${chapter}.title`)}</h1>
    <p>{t(`${chapter}.subtitle`)}</p>
  </header>;
}
