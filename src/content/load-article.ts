// Generated from articles.ts by scripts/prepare-content.ts.
import type { ComponentType } from 'react';
import type { Locale } from '@/i18n/locales';
import type { ArticleId } from './articles';
const loaders: Record<Locale, Record<ArticleId, () => Promise<{ default: ComponentType }>>> = {
  en: {
    'wave-plan': () => import('./en/01-before-the-first-zombie.mdx'),
    roster: () => import('./en/02-choosing-the-roster.mdx'),
    worlds: () => import('./en/03-world-modifiers.mdx'),
    strength: () => import('./en/04-zombie-strength.mdx'),
    placement: () => import('./en/05-zombie-placement.mdx'),
    timing: () => import('./en/06-timing-and-completion.mdx'),
    drops: () => import('./en/07-plant-food-and-loot.mdx'),
    evolution: () => import('./en/evolution.mdx'),
    'purple-glove': () => import('./en/purple-glove.mdx'),
    'speed-up-clock': () => import('./en/speed-up-clock.mdx'),
    'artifact-framework': () => import('./en/artifact-framework.mdx'),
    randomness: () => import('./en/randomness.mdx'),
    'implementation-defects': () => import('./en/implementation-defects.mdx'),
  },
  'zh-CN': {
    'wave-plan': () => import('./zh-CN/01-before-the-first-zombie.mdx'),
    roster: () => import('./zh-CN/02-choosing-the-roster.mdx'),
    worlds: () => import('./zh-CN/03-world-modifiers.mdx'),
    strength: () => import('./zh-CN/04-zombie-strength.mdx'),
    placement: () => import('./zh-CN/05-zombie-placement.mdx'),
    timing: () => import('./zh-CN/06-timing-and-completion.mdx'),
    drops: () => import('./zh-CN/07-plant-food-and-loot.mdx'),
    evolution: () => import('./zh-CN/evolution.mdx'),
    'purple-glove': () => import('./zh-CN/purple-glove.mdx'),
    'speed-up-clock': () => import('./zh-CN/speed-up-clock.mdx'),
    'artifact-framework': () => import('./zh-CN/artifact-framework.mdx'),
    randomness: () => import('./zh-CN/randomness.mdx'),
    'implementation-defects': () => import('./zh-CN/implementation-defects.mdx'),
  },
};
export async function loadArticle(locale: Locale, article: ArticleId) {
  return (await loaders[locale][article]()).default;
}
