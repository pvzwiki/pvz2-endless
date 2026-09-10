import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import raw from '../src/data/reference-catalog.json';
import egypt from '../src/data/egypt-roster.json';
import { queryCatalog, type ZombieCatalog } from '../src/lib/zombie-catalog';
const catalog = raw as unknown as ZombieCatalog;

test('catalog records have unique keys even when aliases repeat', () => {
  assert.equal(new Set(catalog.types.map((row) => row.key)).size, catalog.types.length);
});
test('the Egypt article view agrees with the shared catalog', () => {
  for (const type of egypt.types) {
    const record = catalog.types.find((row) => row.id === type.id)!;
    assert.equal(type.cost, record.values.WavePointCost);
    assert.equal(type.weight, record.values.Weight);
    assert.deepEqual(type.name, record.name);
    for (const [field, value] of Object.entries(type.properties)) assert.deepEqual(value, record.values[field]);
  }
});
test('catalog search accepts names and aliases, sorting leaves missing values last', () => {
  assert.ok(queryCatalog(catalog, '木乃伊', 'all', '', 'id', false).length > 1);
  const rows = queryCatalog(catalog, 'mummy_armor1', 'all', '', 'WavePointCost', true);
  assert.ok(rows.some((row) => row.id === 'mummy_armor1'));
  const sorted = queryCatalog(catalog, '', 'all', '', 'Hitpoints', true);
  const firstMissing = sorted.findIndex((row) => typeof row.values.Hitpoints !== 'number');
  assert.ok(firstMissing > 0 && sorted.slice(firstMissing).every((row) => typeof row.values.Hitpoints !== 'number'));
});
test('website inputs exclude local paths and private database fields', () => {
  const directory = new URL('../src/data/', import.meta.url);
  for (const file of readdirSync(directory).filter((name) => name.endsWith('.json'))) {
    assert.doesNotMatch(readFileSync(new URL(file, directory), 'utf8'),
      /\/Users\/|\/home\/|source_json|type_object_id|object_id|file:\/\//, file);
  }
});
