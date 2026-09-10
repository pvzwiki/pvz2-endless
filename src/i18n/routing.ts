import { defineRouting } from 'next-intl/routing';
import { locales, localeCookieName } from '@/i18n/locales';

export const routing = defineRouting({ locales, defaultLocale: 'en', localePrefix: 'always', localeCookie: { name: localeCookieName } });
