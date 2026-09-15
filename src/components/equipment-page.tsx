import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/locales';
import { equipmentRecords, equipmentPath, type EquipmentKind } from '@/lib/equipment-catalog';
import { SiteHeader } from './site-header';
import { ClientMessages } from './client-messages';
import { EquipmentIndex } from './equipment-index';
export async function EquipmentPage({ locale, kind }: { locale: string; kind: EquipmentKind }) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('equipment');
  const records = equipmentRecords(kind).map((row) => ({
    id: row.id,
    name: row.name,
    quality: typeof row.values.Quality === 'string' ? row.values.Quality : '',
    href: equipmentPath(kind, row.id),
  }));
  return (
    <>
      <SiteHeader locale={locale} />
      <main id="main-content" className="directory-main">
        <header className="directory-heading">
          <span className="eyebrow">{t('referenceTitle')}</span>
          <h1>{t(kind)}</h1>
          <p>
            {t(kind === 'artifacts' ? 'artifactDescription' : 'accessoryDescription', {
              count: records.length,
            })}
          </p>
        </header>
        <ClientMessages namespaces={['equipment']}>
          <EquipmentIndex records={records} />
        </ClientMessages>
      </main>
    </>
  );
}
