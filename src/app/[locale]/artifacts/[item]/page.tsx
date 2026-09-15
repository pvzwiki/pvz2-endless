import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/locales';
import { equipmentRecords, equipmentRecord } from '@/lib/equipment-catalog';
import { EquipmentRecordPage } from '@/components/equipment-record';
export const dynamicParams = false;
export function generateStaticParams() {
  return equipmentRecords('artifacts').map((record) => ({ item: record.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; item: string }>;
}): Promise<Metadata> {
  const { locale, item } = await params;
  const record = equipmentRecord('artifacts', item);
  if (!isLocale(locale) || !record) notFound();
  return {
    title: record.name[locale],
    alternates: {
      canonical: `/${locale}/artifacts/${item}/`,
      languages: { en: `/en/artifacts/${item}/`, 'zh-CN': `/zh-CN/artifacts/${item}/` },
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; item: string }>;
}) {
  const { locale, item } = await params;
  return <EquipmentRecordPage locale={locale} id={item} kind="artifacts" />;
}
