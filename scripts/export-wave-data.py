"""Export selected article inputs and independent reference results; never copy the database."""

import argparse
import json
from pathlib import Path
import sys

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
    'settings': {field: native['defaults'][field] for field in fields},
    'flagMultiplier': 2.5,
    'bossInterval': declared['BossInterval'],
    'sample': {
        'executableSha256': native['source_binary_sha256'],
        'addressConvention': 'unslid virtual addresses',
    },
}
sys.path.insert(0, str(source / 'src'))
from pvz2_analysis.endless import wave_layout

fixtures = [wave_layout(level) for level in range(1, 150)]
for relative, value in [('src/data/wave-baseline.json', data),
                        ('tests/fixtures/wave-plans.json', fixtures)]:
    target = root / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
print('Exported selected wave settings and 149 reference calculations. No local paths or raw objects included.')
