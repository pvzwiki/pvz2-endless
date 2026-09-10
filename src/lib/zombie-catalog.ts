export type FieldValue = string | number | boolean | null | Record<string, number>;
export type ZombieRecord = {
  key: string;
  id: string;
  name: { en: string; 'zh-CN': string };
  zombieClass: string | null;
  homeWorld: string | null;
  roles: Record<string, string[]>;
  reference: string | null;
  referenceStatus: string;
  candidateCount: number;
  values: Record<string, FieldValue>;
  status: Record<string, string>;
  candidates: { label: string; values: Record<string, FieldValue>; status: Record<string, string> }[];
};
export type ZombieCatalog = { schemaVersion: number; worlds: string[]; fields: string[]; types: ZombieRecord[] };

export function queryCatalog(catalog: ZombieCatalog, query: string, scope: string, world: string, sort: string, descending: boolean) {
  const term = query.normalize('NFKC').toLowerCase().trim();
  const rows = catalog.types.filter((record) => {
    if (scope === 'endless' && !Object.keys(record.roles).some((id) => catalog.worlds.includes(id))) return false;
    if (world && !record.roles[world]) return false;
    return !term || [record.id, record.name.en, record.name['zh-CN'], record.zombieClass || ''].some((value) => value.normalize('NFKC').toLowerCase().includes(term));
  });
  return rows.sort((a, b) => {
    if (sort !== 'id') {
      const av = a.values[sort], bv = b.values[sort];
      if (typeof av !== 'number' && typeof bv === 'number') return 1;
      if (typeof av === 'number' && typeof bv !== 'number') return -1;
      if (typeof av === 'number' && typeof bv === 'number' && av !== bv) return (av - bv) * (descending ? -1 : 1);
    }
    return a.id.localeCompare(b.id) || a.key.localeCompare(b.key);
  });
}
