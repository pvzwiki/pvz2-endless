import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/locales';
import { articles, articleText, findArticle } from '@/content/articles';
import { loadArticle } from '@/content/load-article';
import { ArticleExperience } from '@/components/article-experience';

type Params = Promise<{ locale: string; chapter: string }>;
export const dynamicParams = false;
export function generateStaticParams() {
  return articles.map((article) => ({ chapter: article.id }));
}
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, chapter: id } = await params;
  const article = findArticle(id);
  if (!isLocale(locale) || !article) notFound();
  const text = articleText(article.id, locale);
  return {
    title: text.title,
    description: text.subtitle,
    alternates: {
      canonical: `/${locale}/${id}/`,
      languages: { en: `/en/${id}/`, 'zh-CN': `/zh-CN/${id}/` },
    },
    openGraph: { title: text.title, description: text.subtitle, type: 'article' },
  };
}
export default async function ArticlePage({ params }: { params: Params }) {
  const { locale, chapter: id } = await params;
  const article = findArticle(id);
  if (!isLocale(locale) || !article) notFound();
  setRequestLocale(locale);
  const Content = await loadArticle(locale, article.id);
  return (
    <ArticleExperience article={article.id}>
      <Content />
    </ArticleExperience>
  );
}
