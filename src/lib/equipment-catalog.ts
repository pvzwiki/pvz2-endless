import artifacts from '@/data/artifact-catalog.json';
import accessories from '@/data/accessory-catalog.json';
import type { Locale } from '@/i18n/locales';
export type EquipmentKind = 'artifacts' | 'accessories';
export type Boost = { PlantBoostProps: string; Values: number[] };
export type EquipmentRecord = {
  id: string;
  name: Record<Locale, string>;
  values: Record<string, unknown>;
  status: Record<string, string>;
};
export function equipmentRecords(kind: EquipmentKind): EquipmentRecord[] {
  return kind === 'artifacts' ? artifacts.items : accessories.items;
}
export function equipmentRecord(kind: EquipmentKind, id: string) {
  return equipmentRecords(kind).find((entry) => entry.id === id);
}
export function boostType(boost: Boost) {
  const alias = boost.PlantBoostProps.match(/^RTID\(([^@]+)@/)?.[1] ?? boost.PlantBoostProps;
  return (accessories.boostTypes as Record<string, string>)[alias] ?? alias;
}
export function equipmentPath(kind: EquipmentKind, id: string) {
  return `/${kind}/${id}/`;
}
export function equipmentArticles(id: string) {
  return id === 'artifact_evolution'
    ? ['evolution', 'artifact-framework']
    : id === 'super_clock'
      ? ['purple-glove']
      : ['super_clock_14', 'super_clock_15'].includes(id)
        ? ['speed-up-clock']
        : id.startsWith('artifact_')
          ? ['artifact-framework', 'implementation-defects']
          : ['implementation-defects'];
}
export const cultivation = artifacts.cultivation;
