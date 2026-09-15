# Website architecture

## Content and rendering

The site uses Next.js App Router, React, MDX, and next-intl with static export. There is no runtime backend. Article identity and series membership live in `src/content/articles.ts`; English and Chinese titles live in their message catalogs. A generated import map connects the registry to the MDX files.

The registry replaces the fixed seven-chapter assumption. Article links retain their existing slugs. The current three series are Ordinary Endless, Artifacts & accessories, and Randomness & implementation.

`article-details.ts` reads each article during static rendering. Its section headings supply the contents list, its note identifiers select the evidence payload, and its lab identifiers select translations for the optional controls. The timing lab includes its nested announcement view's messages. The body, heading, related links, and permanent evidence appendix render in HTML.

The interactive evidence dialog receives only that article's localized notes. Each citation also has a real anchor into a single collapsed appendix, so the evidence remains reachable without JavaScript without repeating the list during ordinary reading.

## Models and visuals

A model returns numbers or state. A component renders those results. Motion animates changes to the rendered state; it does not decide outcomes. The game-clock inputs and animation playback speed are separate.

The Evolution view runs a connected activation trace over a supplied 3×3 region. It carries a concrete selected type from each candidate pool through a queued effect and its callback. Skipped targets consume no shuffle outputs. Rank 4 scans the occupied input board before deferred removal, queues bonus plants using the same library stream, and applies the minimum-from-one level rule. The trace exposes source costs, target order, planting reason codes, stage checks, and callback order as inputs; it does not invent terrain predicates. Plant anchors are shown on the grid. The base trigger's cooldown deadline is recorded before any target pass.

Guided playback selects snapshots from that same trace: the selection passes are summarized, then one effect is followed through removal, checking, and its outcome. A failed effect takes priority as the example, and every failure remains visible. Readers can switch to every event without recalculating the selections. URLs retain the underlying trace index. Offset searching, session calibration, and predictions for later observations belong in the analysis repository's experiment tools rather than the article interface.

The random-stream view identifies multiple callers of the shared clock reseed: weighted loot, coin-spring loot, Gashapon, Zomboss loot, and Gardener Grass. Each executes the same seed checkpoint; the display records which old game-stream position was discarded. It does not present that checkpoint as the complete caller's execution. The separate library stream keeps its position.

The Glove view applies strict chance and deadline gates. Its time inputs use clock units until the underlying clock is identified. The Clock view applies the float32 recharge fold and a separate reset roll. Formula inspection distinguishes raw arithmetic from the display guard and constrains level/rank inputs to the cultivation ladder.

`native-rng.ts` contains the MT19937 core, the game's 31-bit wrapper, and the small-list libc++ shuffle. Selected retained native outputs validate initial values and a regeneration boundary. The saved library permutations validate rejection consumption as well as ordering. Library-shuffle controls use prior engine-output counts with the fixed probe seed, rather than inventing a reseeding operation.

Integer selection models use the reconstructed game generator. Portal and special-placement shuffles use the reconstructed library algorithm. Chosen roster order and other scenario inputs are explicit; the site does not infer an entire game session's hidden state.

Optional labs load when opened. The wave and roster viewers mount only while a view is active. Their input state stays in the surrounding provider, and closing restores focus to the opener. Native dialogs provide focus containment. Reduced-motion preferences apply to animation.

The spatial wave view uses Three.js directly for its small scene. This removes React Three Fiber's React-version constraint. The renderer updates existing meshes, renders while changes settle, pauses offscreen, disposes resources, and retains the fallback diagram and external controls.

## References and search

Artifacts and accessories have collection indexes and individual static record pages in both languages. The exporter publishes selected field groups and resolved names, rather than full resource objects or database provenance. Cultivation data has one shared copy. Boost entry values remain distinct from the referenced sheet's effect type.

Pagefind builds multilingual indexes after static export. Article and equipment pages supply visible HTML. Plant and zombie records contribute selected searchable fields with URLs that open the correct existing record view, preserving duplicate aliases through their unique record keys.

The browser loads search only when needed. English and Chinese use separate module instances so a client-side language switch cannot retain the wrong language index. Generated search files are copied into the ignored public directory for local development after a build.

## Tooling and release boundary

The build toolchain uses Node 26.8.2, npm 12.0.2, and Node 26.6.1 type declarations. `.node-version` and `package.json`'s `packageManager` field select the runtime and package manager in both CI workflows. Node is used for development and static generation; the deployed site has no Node server. The application dependencies include Next.js/MDX 16.3.5, next-intl 4.14.5, React/React DOM 19.3.0, and Three.js 0.186 type declarations. Motion supplies declarative visual transitions; Pagefind supplies static search. Prettier provides one formatting command for the source, styles, configuration, and tests.

npm 12 blocks dependency install scripts by default. The manifest's `allowScripts` entries permit the pinned Parcel watcher, SWC, esbuild, and fsevents installers. When upgrading one of those packages, review its installer and refresh its entry with `npm install-scripts approve <package>` before checking a fresh `npm ci`.

Repository checks validate content, calculations, the production build, and browser interactions. The deployment job publishes the static export through GitHub Pages only from the canonical repository.
