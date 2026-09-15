import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import plants from '@/data/plant-catalog.json';
import zombies from '@/data/reference-catalog.json';
import artifacts from '@/data/artifact-catalog.json';
import accessories from '@/data/accessory-catalog.json';
export async function ReferenceIndex() {
  const s = await getTranslations('site'),
    t = await getTranslations('equipment');
  const entries = [
    { id: 'plants', name: s('plants'), count: plants.types.length },
    { id: 'zombies', name: s('zombies'), count: zombies.types.length },
    { id: 'artifacts', name: t('artifacts'), count: artifacts.items.length },
    { id: 'accessories', name: t('accessories'), count: accessories.items.length },
  ];
  return (
    <div className="reference-grid">
      {entries.map((entry) => (
        <Link key={entry.id} href={`/${entry.id}/`}>
          <span className="reference-count">{entry.count}</span>
          <strong>{entry.name}</strong>
          <span aria-hidden="true">↗</span>
        </Link>
      ))}
    </div>
  );
}
