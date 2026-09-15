# PvZ2, explained

A bilingual guide to the mechanisms of Plants vs. Zombies 2, with articles, searchable references, and interactive explanations. Ordinary Endless is the first series; artifacts, accessories, randomness, and implementation defects extend the guide.

Use Node **26.8.2** from `.node-version` and npm **12.0.2** from `package.json`'s `packageManager` field. Both CI workflows use those same versions. After switching Node with your version manager, install the selected npm version with `npm install --global npm@12.0.2`.

```sh
npm ci
npm run build
npm run dev -- --hostname 127.0.0.1 --port 4173
```

Open `/en/` or `/zh-CN/`. `/articles/` groups the three series, and `/reference/` opens the plant, zombie, artifact, and accessory collections. The first build also makes the search index available to the development server.

## Structure

- `src/content/articles.ts` defines article identity, series order, and related reading. Existing article URLs stay stable.
- `src/content/en/` and `src/content/zh-CN/` hold the articles. `scripts/prepare-content.ts` generates their explicit MDX import map before development and builds.
- The article shell renders at build time. Its contents list comes from the article's section headings. Evidence is selected and localized per article, with both dialogs and permanent section anchors.
- `src/components/labs/` contains optional views. Pure calculations and transitions live in `src/lib/`; animation displays their state.
- `src/data/` contains selected website inputs. Research databases and original packages remain outside this repository.
- Pagefind indexes the built articles and equipment pages, plus selected plant/zombie records whose results open the existing record views. Its generated assets remain outside Git.

Read [Architecture](docs/architecture.md) for the implementation and [Editorial direction](docs/editorial-direction.md) for writing and evidence rules.

## Validation

```sh
npm test
npm run typecheck
npm run format:check
npm run build
npm run test:browser
```

Run the build before the browser suite: it serves this checkout's static `out/` directory on a dedicated port. The suite covers navigation, bilingual content, evidence access, controls, and meaningful state transitions in Chromium and WebKit. Pure-model tests protect arithmetic boundaries and state transitions. The reconstructed generators are compared with selected independent native outputs and recorded libc++ permutations, including regeneration and rejection consumption.

The generator modules reproduce the checked routines. Scenario seeds, stream positions, candidate order, timing events, and other inputs remain explicit. A diagram's animation speed is a presentation control; game-time values come from its model inputs.

## Updating selected data

```sh
python3 scripts/export-wave-data.py --source /path/to/research-data
python3 scripts/export-zombie-data.py --source /path/to/research-data
python3 scripts/export-plant-data.py --source /path/to/research-data
python3 scripts/export-mechanism-data.py --source /path/to/research-data
python3 scripts/export-equipment-data.py --source /path/to/research-data
```

Exporters select fields and preserve missing values. Ambiguous identities, conflicting declarations, or unexpected references require review. Artifact descriptions and runtime effects have distinct consumers; a formula field must not automatically be presented as a final gameplay value.

This repository publishes [pvzwiki.com](https://pvzwiki.com). Pull requests run the website checks; changes merged to `main` deploy through GitHub Pages. The deployment workflow runs only for the canonical repository.
