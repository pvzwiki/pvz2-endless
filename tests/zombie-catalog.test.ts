import test from 'node:test';
import assert from 'node:assert/strict';
import raw from '../src/data/reference-catalog.json';
import egypt from '../src/data/egypt-roster.json';
import { queryCatalog, type ZombieCatalog } from '../src/lib/zombie-catalog';
const catalog = raw as unknown as ZombieCatalog;

test('the full curated catalog preserves unresolved and duplicate references', () => {
  assert.equal(catalog.types.length, 1030);
  assert.equal(new Set(catalog.types.map((row) => row.key)).size, 1030);
  assert.ok(catalog.types.some((row) => row.referenceStatus === 'duplicate_alias' && row.candidates.length > 1));
  assert.ok(catalog.types.some((row) => row.referenceStatus === 'context_required'));
  assert.ok(catalog.types.some((row) => row.referenceStatus === 'unresolved_reference'));
  assert.equal(queryCatalog(catalog, '', 'endless', '', 'id', false).length, 175);
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
test('curated exports exclude local paths and internal database identities', () => {
  assert.doesNotMatch(JSON.stringify(raw), /\/Users\/|\/home\/|source_json|type_object_id|object_id|file:\/\//);
});
