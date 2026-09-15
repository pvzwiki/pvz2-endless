import type { Locale } from '@/i18n/locales';
import en from '../messages/en.json' with { type: 'json' };
import zh from '../messages/zh-CN.json' with { type: 'json' };

export const series = ['endless', 'equipment', 'implementation'] as const;
export type SeriesId = (typeof series)[number];
type ArticleDefinition = {
  id: string;
  file: string;
  series: SeriesId;
  order: number;
  experiment: 'waves' | 'roster' | null;
  related: readonly string[];
};
export const articles = [
  {
    id: 'wave-plan',
    file: '01-before-the-first-zombie',
    series: 'endless',
    order: 1,
    experiment: 'waves',
    related: ['roster'],
  },
  {
    id: 'roster',
    file: '02-choosing-the-roster',
    series: 'endless',
    order: 2,
    experiment: 'roster',
    related: ['worlds', 'randomness'],
  },
  {
    id: 'worlds',
    file: '03-world-modifiers',
    series: 'endless',
    order: 3,
    experiment: null,
    related: ['placement', 'randomness'],
  },
  {
    id: 'strength',
    file: '04-zombie-strength',
    series: 'endless',
    order: 4,
    experiment: null,
    related: ['timing', 'artifact-framework'],
  },
  {
    id: 'placement',
    file: '05-zombie-placement',
    series: 'endless',
    order: 5,
    experiment: null,
    related: ['evolution', 'timing'],
  },
  {
    id: 'timing',
    file: '06-timing-and-completion',
    series: 'endless',
    order: 6,
    experiment: null,
    related: ['drops', 'implementation-defects'],
  },
  {
    id: 'drops',
    file: '07-plant-food-and-loot',
    series: 'endless',
    order: 7,
    experiment: null,
    related: ['purple-glove', 'randomness'],
  },
  {
    id: 'evolution',
    file: 'evolution',
    series: 'equipment',
    order: 1,
    experiment: null,
    related: ['artifact-framework', 'randomness', 'implementation-defects'],
  },
  {
    id: 'purple-glove',
    file: 'purple-glove',
    series: 'equipment',
    order: 2,
    experiment: null,
    related: ['drops', 'speed-up-clock', 'randomness'],
  },
  {
    id: 'speed-up-clock',
    file: 'speed-up-clock',
    series: 'equipment',
    order: 3,
    experiment: null,
    related: ['purple-glove', 'implementation-defects'],
  },
  {
    id: 'artifact-framework',
    file: 'artifact-framework',
    series: 'equipment',
    order: 4,
    experiment: null,
    related: ['evolution', 'implementation-defects'],
  },
  {
    id: 'randomness',
    file: 'randomness',
    series: 'implementation',
    order: 1,
    experiment: null,
    related: ['evolution', 'roster', 'implementation-defects'],
  },
  {
    id: 'implementation-defects',
    file: 'implementation-defects',
    series: 'implementation',
    order: 2,
    experiment: null,
    related: ['evolution', 'speed-up-clock', 'randomness'],
  },
] as const satisfies readonly ArticleDefinition[];
export type ArticleId = (typeof articles)[number]['id'];
export function findArticle(id: string) {
  return articles.find((article) => article.id === id);
}
export function articlePath(id: string) {
  return `/${id}/`;
}
export function articleText(id: ArticleId, locale: Locale) {
  return (locale === 'en' ? en : zh).articles[id];
}
export function seriesText(id: SeriesId, locale: Locale) {
  return (locale === 'en' ? en : zh).collections[id];
}
export function seriesArticles(id: SeriesId) {
  return articles.filter((article) => article.series === id);
}
export const referencePaths = ['plants', 'zombies', 'artifacts', 'accessories'] as const;
