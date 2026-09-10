import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { isLocale, locales } from '@/i18n/locales';
import '@fontsource-variable/manrope';
import '@fontsource-variable/source-serif-4';
import '@fontsource-variable/source-serif-4/wght-italic.css';
import 'katex/dist/katex.min.css';
import '../globals.css';

export const dynamicParams = false;
export function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:4173'),
  title: { default: 'Endless, explained', template: '%s · Endless' },
  icons: { icon: '/icon.svg' },
};

export default async function LocaleLayout({ children, params }: {
  children: React.ReactNode; params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  return <html lang={locale} data-scroll-behavior="smooth"><body><NextIntlClientProvider locale={locale} messages={messages}>
    {children}
  </NextIntlClientProvider></body></html>;
}
