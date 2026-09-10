# PvZ2 Endless

An interactive exploration of ordinary Endless Challenge in the Chinese mainland iOS edition of Plants vs. Zombies 2.

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 4173
```

Open `/en/` or `/zh-CN/` for the homepage. The introduction starts a seven-chapter reading sequence; `/zombies/` contains the shared reference. Every route has an English and Simplified Chinese version.

Articles live in `src/content/`; interface translations in `src/messages/`. Calculations and state transitions in `src/lib/` are independent of React and rendering. Optional views live in `src/components/labs/`. `src/data/` contains selected website inputs, not the private research database.

```sh
npm test
npm run typecheck
npm run build         # static output in out/
npm run test:browser   # serves this checkout's out/ on a dedicated port
```

Tests cover arithmetic boundaries, roster accounting, state transitions, translation integrity, links, and browser controls. Assertions should protect a concrete behavior or boundary, not freeze a displayed answer that merely repeats a calculation. Exporters write website inputs only; generated result snapshots and exact game-RNG streams are outside this site's test scope.

The construction and music views generate ordinary rosters for Egypt and Eighties using the traced selection, filling, reservation, level, and leader rules. A small seeded RNG makes examples repeatable; native pointer order and game random streams are not reproduced. The construction view reports neutral ordinary-action HP and identifies the separate flag action without inventing its effective level.

The portal replay advances a queue through opening, due updates, and a separate removal callback. Placement draws from the computed remaining rows. Steam damage keeps its accumulator between updates; changing the next delta does not reset history. Timing, carrier, and saved-loot views keep explicit editable scenario inputs and calculate the resulting rules.

To regenerate the selected website inputs from the local research checkout:

```sh
python3 scripts/export-wave-data.py --source ../analyze
python3 scripts/export-zombie-data.py --source ../analyze
python3 scripts/export-mechanism-data.py --source ../analyze
```
