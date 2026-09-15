import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/locales';
import { EquipmentPage } from '@/components/equipment-page';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'equipment' });
  return {
    title: t('artifacts'),
    alternates: {
      canonical: `/${locale}/artifacts/`,
      languages: { en: '/en/artifacts/', 'zh-CN': '/zh-CN/artifacts/' },
    },
  };
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <EquipmentPage locale={locale} kind="artifacts" />;
}
