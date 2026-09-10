export const locales = ['en', 'zh-CN'] as const;
export const localeCookieName = 'ENDLESS_LOCALE';
export type Locale = typeof locales[number];
export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
