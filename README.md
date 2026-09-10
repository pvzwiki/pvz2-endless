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
npm run test:browser   # starts a local server if needed
npm run build         # static output in out/
```

To regenerate the selected inputs and comparison fixtures from the local research checkout:

```sh
python3 scripts/export-wave-data.py --source ../analyze
python3 scripts/export-zombie-data.py --source ../analyze
python3 scripts/export-mechanism-data.py --source ../analyze
```
