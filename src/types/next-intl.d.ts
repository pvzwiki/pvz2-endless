import type messages from '@/messages/en.json';
import type { Locale as SiteLocale } from '@/i18n/locales';

declare module 'next-intl' {
  interface AppConfig {
    Locale: SiteLocale;
    Messages: typeof messages;
  }
}
