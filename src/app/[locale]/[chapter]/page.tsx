import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/locales';
import { chapters, findChapter } from '@/content/chapters';
import { loadArticle } from '@/content/load-article';
import { ArticleExperience } from '@/components/article-experience';

type Params = Promise<{ locale: string; chapter: string }>;
export const dynamicParams = false;
export function generateStaticParams() { return chapters.filter((chapter) => chapter.published).map((chapter) => ({ chapter: chapter.id })); }
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, chapter: id } = await params;
  const chapter = findChapter(id);
  if (!isLocale(locale) || !chapter?.published) notFound();
  const t = await getTranslations({ locale, namespace: 'chapters' });
  return { title: t(`${chapter.id}.title`), description: t(`${chapter.id}.subtitle`),
    alternates: { canonical: `/${locale}/${chapter.id}/`, languages: { en: `/en/${chapter.id}/`, 'zh-CN': `/zh-CN/${chapter.id}/` } } };
}
export default async function ChapterPage({ params }: { params: Params }) {
  const { locale, chapter: id } = await params;
  const chapter = findChapter(id);
  if (!isLocale(locale) || !chapter?.published) notFound();
  setRequestLocale(locale);
  const Content = await loadArticle(locale, chapter.id);
  return <ArticleExperience chapter={chapter.id}><Content /></ArticleExperience>;
}
