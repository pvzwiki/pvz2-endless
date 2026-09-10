"""Export focused inputs for the article labs from the research catalog and curated website view."""
import argparse
import json
from pathlib import Path
import sys

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', required=True, type=Path)
source = parser.parse_args().source.resolve()
root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(source / 'src'))
from pvz2_analysis.endless import zombie_level_range, wave_layout, plantfood_by_wave
from pvz2_analysis.jams import apply_jams
from pvz2_analysis.rng import GameRng

worlds = json.loads((source / 'catalog/endless/worlds.json').read_text())['worlds']
shared = json.loads((source / 'catalog/endless/shared-declared-config.json').read_text())['objdata']
portals = json.loads((source / 'catalog/endless/modern-portals.json').read_text())['portals']
modules = json.loads((source / 'analysis/decoded/full/config/PACKAGES/LEVELMODULES.json').read_text())['objects']
loot = next(row['objdata']['Entries'] for row in modules if 'DefaultLootTable' in row.get('aliases', []))
reference = json.loads((root / 'src/data/reference-catalog.json').read_text())['types']
world_view = []
for world in worlds:
    if world['world'].startswith('uncharted_mausoleum'):
        continue
    world_view.append({'id': world['world'], 'basic': world['stage_zombies']['basic'],
                      'flag': world['stage_zombies']['flag'], 'pool': world['zombie_pool'],
                      'localWaveIncrement': world['declared_generator_values']['BasePointIncrementPerWave'],
                      'designers': [{'class': row['class'], 'values': {key: val for key,val in row['declared_values'].items() if key != 'ZombiePool'}} for row in world['listed_designers']]})
portal_view = [{'family': p['family'], 'types': [x['ZombieTypeName'] for x in p['declared_values']['ZombieTypesToSpawn']]} for p in portals if p['in_native_modern_fallback']]
ids = {id for world in world_view for id in [world['basic'],world['flag'],*world['pool']]}
ids.update(id for portal in portal_view for id in portal['types'])
ids.update(['air_missile_launcher','skycity','dark_king','beach_fisherman','mummy','mummy_armor1','mummy_armor2'])
fields = ['WavePointCost','Weight','Hitpoints','HelmHitpoints','EatDPS','Speed','SizeType','HitRect','GridExtents','CanSpawnPlantFood','CanBeLaunchedByPlants','type.HastyOnStart']
types = []
for record in reference:
    if record['id'] in ids:
        types.append({'id':record['id'], 'key':record['key'], 'name':record['name'], 'zombieClass':record['zombieClass'], 'values':{key:record['values'][key] for key in fields}, 'status':{key:record['status'][key] for key in fields}})
inputs = {'worlds':world_view,'portals':portal_view,'types':types,
          'flagRows':shared['FlagWaveSetupList'],'foodRows':shared['PlantfoodSetupList'],
          'strengthRows':shared['ZombieLevelStats'],'leaderRate':shared['LeaderStrengthenRate'],
          'lootEntries':[row for row in loot if not row.get('World')]}
(root / 'src/data/mechanism-inputs.json').write_text(json.dumps(inputs,ensure_ascii=False,indent=2)+'\n')
levels = [{'level':level,**zombie_level_range(level)} for level in range(1,150)]
food = []
for level in [1,4,6,16,31,41,49,51,54,56,149]:
    for seed in [1,7,19]:
        food.append({'level':level,'seed':seed,'quota':plantfood_by_wave(level,shared['FlagWaveSetupList'],shared['PlantfoodSetupList'],GameRng(seed))})
jams = []
for level in [1,6,7,14,16,36,49,51,149]:
    for seed in [1,7]:
        inputs_waves = [[{'zombie':['eighties','eighties_armor1','eighties_armor2','eighties_punk'][i%4], 'level':1+i%5, 'leader':i==0} for i in range(8)] for _ in range(wave_layout(level)['wave_count'])]
        output,events = apply_jams(level,inputs_waves,GameRng(seed))
        jams.append({'level':level,'seed':seed,'input':inputs_waves,'output':output,'events':events})
for file,content in [('levels',levels),('food',food),('jams',jams)]:
    (root / f'tests/fixtures/{file}-mechanism.json').write_text(json.dumps(content,ensure_ascii=False,indent=2)+'\n')
print(f'Exported {len(world_view)} worlds, {len(portal_view)} portal families, {len(types)} selected type definitions, and component fixtures.')
