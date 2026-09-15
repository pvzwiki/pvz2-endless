import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/locales';
import { equipmentRecords, equipmentRecord } from '@/lib/equipment-catalog';
import { EquipmentRecordPage } from '@/components/equipment-record';
export const dynamicParams = false;
export function generateStaticParams() {
  return equipmentRecords('accessories').map((record) => ({ item: record.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; item: string }>;
}): Promise<Metadata> {
  const { locale, item } = await params;
  const record = equipmentRecord('accessories', item);
  if (!isLocale(locale) || !record) notFound();
  return {
    title: record.name[locale],
    alternates: {
      canonical: `/${locale}/accessories/${item}/`,
      languages: { en: `/en/accessories/${item}/`, 'zh-CN': `/zh-CN/accessories/${item}/` },
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; item: string }>;
}) {
  const { locale, item } = await params;
  return <EquipmentRecordPage locale={locale} id={item} kind="accessories" />;
}
