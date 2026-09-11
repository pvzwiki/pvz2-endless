"""Export selected plant declarations for the website, without index provenance."""
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
from pvz2_analysis.plant_query import find_plants, plant_record
from pvz2_analysis.resource_query import open_index

# Only scalar game fields cross into the public dataset. Never copy full objects.
fields = ['Cost', 'Hitpoints', 'PacketCooldown', 'StartingCooldown', 'type.Rare',
          'type.Quality', 'type.Enabled', 'type.Profession', 'PlantGridType',
          'MinLevel', 'MaxLevel', 'PowerCost', 'BoostRate']
strings = (source / 'analysis/resources/supplied/strings/config/PROPERTIES/LAWNSTRINGS.TXT').read_text(encoding='utf-8-sig')
names = dict(re.findall(r'\[([^\]\r\n]+)\]\s*([^\r\n]+)', strings))
english = {'peashooter': 'Peashooter', 'sunflower': 'Sunflower', 'wallnut': 'Wall-nut',
           'potatomine': 'Potato Mine', 'cabbagepult': 'Cabbage-pult', 'repeater': 'Repeater',
           'snowpea': 'Snow Pea', 'cherrybomb': 'Cherry Bomb', 'tallnut': 'Tall-nut'}
records, occurrences = [], {}
with closing(open_index(source / 'analysis/index/plants.sqlite', namespace='PlantTypes')) as connection:
    rows, count = find_plants(connection, limit=0)
    for row in rows:
        raw = plant_record(connection, row, fields)
        # A changed index must not silently collapse conflicting declarations.
        if raw['reference_resolution'] != 'unique_in_snapshot':
            raise ValueError(f"Review property candidates before exporting {raw['plant']}")
        id = raw['plant']
        occurrences[id] = occurrences.get(id, 0) + 1
        values = {field: raw['declared_values'][field] for field in fields}
        statuses = {field: raw['value_status'][field] for field in fields}
        for field, value in values.items():
            if isinstance(value, dict) and '$rton_duplicate_values' in value:
                repeated = value['$rton_duplicate_values']
                if not repeated or any(item != repeated[0] for item in repeated):
                    raise ValueError(f'Review conflicting declarations for {id}: {field}')
                values[field] = repeated[0]
                statuses[field] = 'agrees_across_declarations'
        assert all(value is None or isinstance(value, (str, int, float, bool)) for value in values.values())
        records.append({'key': f'{id}@{occurrences[id]}', 'id': id,
                        'name': {'en': english.get(id, id), 'zh-CN': names.get(id.upper(), id)},
                        'plantClass': raw['type_class'], 'framework': raw['plant_framework'],
                        'homeWorld': raw['home_world'], 'reference': raw['property_reference'],
                        'values': values, 'status': statuses})
assert len(records) == count and len({row['key'] for row in records}) == count
catalog = {'schemaVersion': 1, 'fields': fields, 'types': records}
text = json.dumps(catalog, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
assert not re.search(r'/Users/|/home/|file://|source_json|type_object_id|object_id|researchRevision', text)
(root / 'src/data/plant-catalog.json').write_text(text)
print(f'Exported {len(records)} plant definitions with selected game fields only.')
