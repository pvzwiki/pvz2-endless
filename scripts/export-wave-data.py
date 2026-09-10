"""Export selected article inputs; never copy the database."""

import argparse
import json
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, required=True)
args = parser.parse_args()
source = args.source.resolve()
root = Path(__file__).resolve().parents[1]
native = json.loads((source / 'catalog/endless/native-defaults.json').read_text())
declared = json.loads((source / 'catalog/endless/shared-declared-config.json').read_text())['objdata']
fields = ['MinWaveCount', 'MaxWaveCount', 'WaveAddEach', 'WaveAddInterval',
          'StartingPoints', 'BasePointIncrementPerWave', 'BasePointIncrementPerLevel']
data = {
    # Wave-count settings supplied for the guide; constructor defaults remain in the research catalog.
    'settings': {**{field: native['defaults'][field] for field in fields},
                 'MinWaveCount': 5, 'WaveAddInterval': 10},
    'flagMultiplier': 2.5,
    'bossInterval': declared['BossInterval'],
    'sample': {
        'executableSha256': native['source_binary_sha256'],
        'addressConvention': 'unslid virtual addresses',
    },
}
target = root / 'src/data/wave-baseline.json'
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
print('Exported selected wave settings.')
