export type PlantValue = string | number | boolean | null;
export type PlantRecord = {
  key: string;
  id: string;
  name: { en: string; 'zh-CN': string };
  plantClass: string;
  framework: string | null;
  homeWorld: string | null;
  reference: string | null;
  values: Record<string, PlantValue>;
  status: Record<string, string>;
};
export type PlantCatalog = { schemaVersion: number; fields: string[]; types: PlantRecord[] };
