"""Export selected artifact, accessory, and Evolution inputs for the website."""

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
from pvz2_analysis.artifact_query import (
    artifact_record, find_artifacts, open_artifact_index, shared_objects,
)
from pvz2_analysis.accessory_query import (
    accessory_record, find_accessories, open_accessory_index,
)
from pvz2_analysis.resource_query import object_record

artifact_fields = ['ClassName', 'MainField', 'PassiveField1', 'PassiveField2',
                   'PassiveField3', 'TargetablePlantTypes', 'plantBlackList']
accessory_fields = ['Quality', 'MaxLevel', 'MinEnabledLevel', 'RequiredPieces',
                    'Boosts', 'SuperBoostList', 'DisabledPlants', 'SteadyList']
names = {
    'artifact_evolution': 'Evolution', 'artifact_gashapon': 'Gashapon',
    'artifact_bowling': 'Bowling', 'artifact_wind': 'Wind',
    'artifact_guitar': 'Guitar', 'artifact_trident': 'Trident',
    'super_clock': 'Purple Glove', 'super_clock_7': 'Cowboy Glove',
    'super_clock_15': 'Speed-up Clock', 'super_clock_14': 'Small Clock',
    'super_clock_6': 'Queen Ice Crown', 'super_clock_5': 'Princess Ice Crown',
    'super_clock_3': 'Sun Helmet', 'super_clock_4': 'Moon Helmet',
    'super_clock_1': 'Red Candle', 'super_clock_2': 'White Candle',
    'super_clock_8': 'Power Battery', 'super_clock_9': 'Energy-saving Battery',
    'super_clock_10': 'Strong Pesticide', 'super_clock_11': 'Pesticide',
    'super_clock_12': 'Large Firecracker', 'super_clock_13': 'Firecracker',
    'super_clock_16': 'Police Stun Baton', 'super_clock_17': 'Stun Baton',
}


def selected_record(raw, kind):
    alias = raw[kind]
    if raw['alias_status'] != 'unique_in_snapshot':
        raise ValueError(f'Review ambiguous {kind}: {alias}')
    if raw['name_status'] not in ('unique_in_snapshot', 'agrees_across_candidates'):
        raise ValueError(f'Review ambiguous name: {alias}')
    values = raw['declared_values']
    for key, value in values.items():
        if isinstance(value, dict) and '$rton_duplicate_values' in value:
            raise ValueError(f'Review repeated field: {alias}.{key}')
    # Upgrade preview text is not a second source for numerical effect values.
    if values.get('SteadyList') is not None:
        values['SteadyList'] = [
            {'CurrentLevel': row['CurrentLevel'], 'Require': row['Require']}
            for row in values['SteadyList']
        ]
    return {'id': alias, 'name': {'en': names.get(alias, raw['name'] or alias),
            'zh-CN': raw['name'] or alias}, 'values': values,
            'status': raw['value_status']}


with closing(open_artifact_index(source / 'analysis/index/artifacts.sqlite')) as conn:
    rows, total = find_artifacts(conn, limit=0)
    artifacts = [selected_record(artifact_record(conn, row, artifact_fields), 'artifact') for row in rows]
    assert len(artifacts) == total
    tables = shared_objects(conn, 'cultivation')
    if len(tables) != 1:
        raise ValueError('Review shared cultivation tables')
    cultivation = tables[0]['object']['objdata']
    cultivation = {key: cultivation[key] for key in ['LevelUpPrice', 'RankUpPrice']}

with closing(open_accessory_index(source / 'analysis/index/accessories.sqlite')) as conn:
    rows, total = find_accessories(conn, limit=0)
    accessories = [selected_record(accessory_record(conn, row, accessory_fields), 'accessory') for row in rows]
    assert len(accessories) == total
    boosts = {}
    for row in conn.execute("SELECT id FROM objects WHERE class_name='PlantBoostPropertySheet'"):
        obj = object_record(conn, row[0])['object']
        for alias in obj.get('aliases', []):
            if alias in boosts:
                raise ValueError(f'Review duplicate boost: {alias}')
            boosts[alias] = obj['objdata']['Type']

inputs = json.loads((source / 'catalog/plants/evolution-inputs.json').read_text())
fields = ['plant', 'type_class', 'cost', 'enabled', 'hero_properties',
          'is_consumable', 'valid_stages', 'black_list_stages']
plants = []
for row in inputs['plants']:
    if row['properties_resolution'] != 'unique_in_snapshot':
        raise ValueError(f"Review plant properties: {row['plant']}")
    plants.append({key: row[key] for key in fields if key in row})
evolution = {'schemaVersion': 1, 'plants': plants,
             'blacklist': inputs['artifact']['plant_black_list']}

documents = {
    'artifact-catalog.json': {'schemaVersion': 1, 'items': artifacts, 'cultivation': cultivation},
    'accessory-catalog.json': {'schemaVersion': 1, 'items': accessories, 'boostTypes': boosts},
    'evolution-inputs.json': evolution,
}
# Validate all outputs before replacing any tracked file.
outputs = {}
for name, document in documents.items():
    text = json.dumps(document, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
    if re.search(r'/Users/|/home/|file://|source_json|object_id|researchRevision|analysis/', text):
        raise ValueError(f'Private provenance in {name}')
    outputs[name] = text
for name, text in outputs.items():
    (root / 'src/data' / name).write_text(text)
print(f'Exported {len(artifacts)} artifacts, {len(accessories)} accessories, and {len(plants)} Evolution inputs.')
