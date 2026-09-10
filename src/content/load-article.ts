import type { ComponentType } from 'react';
import type { Locale } from '@/i18n/locales';
import type { ChapterId } from './chapters';

const loaders: Record<Locale, Record<ChapterId, () => Promise<{ default: ComponentType }>>> = {
  en: {
    'wave-plan': () => import('./en/01-before-the-first-zombie.mdx'),
    roster: () => import('./en/02-choosing-the-roster.mdx'),
    worlds: () => import('./en/03-world-modifiers.mdx'),
    strength: () => import('./en/04-zombie-strength.mdx'),
    placement: () => import('./en/05-zombie-placement.mdx'),
    timing: () => import('./en/06-timing-and-completion.mdx'),
    drops: () => import('./en/07-plant-food-and-loot.mdx'),
  },
  'zh-CN': {
    'wave-plan': () => import('./zh-CN/01-before-the-first-zombie.mdx'),
    roster: () => import('./zh-CN/02-choosing-the-roster.mdx'),
    worlds: () => import('./zh-CN/03-world-modifiers.mdx'),
    strength: () => import('./zh-CN/04-zombie-strength.mdx'),
    placement: () => import('./zh-CN/05-zombie-placement.mdx'),
    timing: () => import('./zh-CN/06-timing-and-completion.mdx'),
    drops: () => import('./zh-CN/07-plant-food-and-loot.mdx'),
  },
};
export async function loadArticle(locale: Locale, chapter: ChapterId) {
  const load = loaders[locale][chapter];
  return (await load()).default;
}
