"""Build a curated catalog and its Egypt view from the private index."""
import argparse
from contextlib import closing
import json
from pathlib import Path
import re
import sys

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', required=True, type=Path)
source = parser.parse_args().source.resolve()
root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(source / 'src'))
from pvz2_analysis.zombie_query import open_index, find_zombies, zombie_record, summarize_fields

fields = ['WavePointCost', 'Weight', 'Hitpoints', 'HelmHitpoints', 'EatDPS', 'Speed', 'SizeType',
          'HitRect', 'AttackRect', 'GridExtents', 'CanSpawnPlantFood', 'CanBeLaunchedByPlants',
          'CanTriggerZombieWin', 'FirstWave', 'Cost', 'type.HastyOnStart']
strings = (source / 'analysis/resources/supplied/strings/config/PROPERTIES/LAWNSTRINGS.TXT').read_text(encoding='utf-8-sig')
names = dict(re.findall(r'\[([^\]\r\n]+)\]\s*([^\r\n]+)', strings))
english = {'mummy': 'Mummy', 'camel_onehump': 'Camel', 'explorer': 'Explorer', 'mummy_armor1': 'Conehead Mummy', 'mummy_armor2': 'Buckethead Mummy', 'pharaoh': 'Pharaoh', 'ra': 'Ra', 'tomb_raiser': 'Tomb Raiser', 'egypt_gargantuar_danger': 'Endless Gargantuar'}
worlds = json.loads((source / 'catalog/endless/worlds.json').read_text())['worlds']
standard = [world['world'] for world in worlds if not world['world'].startswith('uncharted_mausoleum')]
world = next(world for world in worlds if world['world'] == 'egypt')
ids = [world['stage_zombies']['basic'], *world['zombie_pool']]

def selected(values):
    result = {}
    for field in fields:
        value = values.get(field)
        if field in ['HitRect', 'AttackRect'] and isinstance(value, dict):
            value = {key: value[key] for key in ['mX', 'mY', 'mWidth', 'mHeight'] if key in value}
        if field == 'GridExtents' and isinstance(value, dict):
            value = {key: value[key] for key in ['mX', 'mY'] if key in value}
        result[field] = value
    return result

records = []
with closing(open_index(source / 'analysis/index/zombies.sqlite')) as connection:
    rows, count = find_zombies(connection, limit=0)
    for row in rows:
        raw = zombie_record(connection, row, fields, full=True)
        id = raw['zombie']
        zh_name = names.get('ZOMBIE_' + id.upper())
        if not zh_name and id.endswith('_danger'):
            base_name = names.get('ZOMBIE_' + id.upper().removesuffix('_DANGER'))
            if base_name:
                zh_name = base_name + '（无尽）'
        candidates = []
        if len(raw['property_candidates']) > 1 or raw['qualified_sheet_reference']:
            for index, candidate in enumerate(raw['property_candidates']):
                obj = candidate['object']
                values, status = summarize_fields([obj], [field for field in fields if not field.startswith('type.')])
                values['type.HastyOnStart'] = raw['declared_values']['type.HastyOnStart']
                status['type.HastyOnStart'] = raw['value_status']['type.HastyOnStart']
                candidates.append({'label': ' / '.join(obj.get('aliases', [])) or obj.get('uid') or obj.get('objclass') or str(index + 1),
                                   'values': selected(values), 'status': status})
        source_identity = raw['type_definition']['object'].get('uid') or str(raw['type_definition']['source_ordinal'])
        records.append({'key': id + '@' + str(source_identity), 'id': id, 'name': {'en': english.get(id, id), 'zh-CN': zh_name or id},
                        'zombieClass': raw['zombie_class'], 'homeWorld': raw['home_world'],
                        'roles': raw['roles_by_world'], 'reference': raw['property_reference'],
                        'referenceStatus': raw['reference_resolution'], 'candidateCount': raw['property_candidate_count'],
                        'values': selected(raw['declared_values']), 'status': raw['value_status'], 'candidates': candidates})
assert len(records) == count and len({record['key'] for record in records}) == count
catalog = {'schemaVersion': 1, 'worlds': standard, 'fields': fields, 'types': records}
egypt_types = []
for id in ids:
    matches = [record for record in records if record['id'] == id]
    assert len(matches) == 1
    row = matches[0]
    assert row['referenceStatus'] == 'unique_in_snapshot'
    assert all(row['status'][field] == 'declared' for field in ['WavePointCost', 'Weight'])
    egypt_types.append({'id': id, 'name': row['name'], 'cost': row['values']['WavePointCost'], 'weight': row['values']['Weight'],
                        'properties': {field: row['values'][field] for field in fields[2:]},
                        'status': {field: row['status'][field] for field in fields[2:]}})
data = {'world': 'egypt', 'basic': ids[0], 'pool': world['zombie_pool'], 'types': egypt_types}
outputs = [('src/data/reference-catalog.json', catalog), ('src/data/egypt-roster.json', data)]
for path, value in outputs:
    text = json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
    assert not re.search(r'/Users/|/home/|file://|source_json|type_object_id|object_id', text)
    (root / path).write_text(text)
print(f'Exported {len(records)} curated definitions; Egypt is a generated view of the same records.')
print('Reference states:', {state: sum(r['referenceStatus'] == state for r in records) for state in sorted({r['referenceStatus'] for r in records})})
