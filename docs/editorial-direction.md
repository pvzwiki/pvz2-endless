# Editorial direction

The site is a PvZ2 mechanics guide, with Ordinary Endless as its first series. Articles explain mechanics through evidence, worked examples, and interactive views.

## Write the mechanism directly

Keep sample identity, methodology, and general verification limitations in the introduction. Do not repeat them in later articles, captions, or reference introductions. Evidence notes identify the relevant instructions, fields, and distinctions necessary to interpret a particular claim.

Deleting a disclaimer must not strengthen the claim. Write the narrower supported statement. Use terms such as effective source cost, display value, or final runtime value when the distinction matters. Keep uncertainty attached to the specific unresolved link in its evidence annotation.

English is the editorial source. Chinese preserves the same mechanisms, equations, identifiers, numerical examples, and evidence references.

## Visuals explain the evidence

- Build an interactive calculation or state transition from the traced mechanism and selected input data.
- Render model results. Animation must not invent an outcome merely because it looks plausible.
- Identify scenario inputs. A game-time value and a presentation playback interval are different quantities.
- Keep independent random streams independent. An imported-library probe is a distinct evidence category from a native game trace.
- Give the reader a useful action: change a real input, inspect a boundary, or step through an event order.
- Use reduced-motion support, keyboard controls, and a readable static explanation.
- Keep ordinary playback focused on the explanation, with the complete event trace available on demand. Keep session fitting and experiment workflows in the analysis scripts.

## Describe defects as part of the mechanism

Explain the trigger, the faulty operation, and its consequence. Confirmed defects belong in the relevant article. Do not infer developer motives, disguise a mistake as deliberate design, or imply that every naming problem changes gameplay.

The current articles cover removal before final validation, an incorrect weighted-selection loop, a minimum initialized at the lower bound, stale tooltip values, and unexpected resets of shared random state. Describe the 30 clock reseed sites as a cross-system pattern; Gardener Grass is one example, not the scope of the defect. Naming inconsistencies and unused fields receive proportionate treatment.

## Article coverage

| Article | Central explanation |
| --- | --- |
| Evolution: how the replacement is chosen | Targeting, filters, asymmetric costs, the ceiling, deferred replacement, and passives |
| The Purple Glove and the credit for a kill | Damage credit, strict chance and deadline gates, and the matrix caller |
| Three different meanings of faster | Planting recharge, reset chance, and attack speed |
| The numbers behind an artifact | Level/rank progression, formula arithmetic, and display/runtime paths |
| Randomness has a history | Separate generators, draw consumption, clock reseeding, and weighted selection |
| When implementation changes the rules | Concrete defects and their consequences across those mechanisms |

## Reconciled and bounded claims

- The runtime formula path through `0x100272790` reaches the same arithmetic engine used by descriptions. The framework report's broader display-only claim must not be repeated.
- The display helper has a zero-to-one guard on the final MainField entry. The bare formula does not establish that rank 1 displays zero uses.
- Evolution's 257 candidates describe the catalog-filter pool before cost and location checks. The final checks can further narrow it.
- The Glove deadline increment is 8.0 in the relevant clock. Its units stay explicit rather than being silently relabeled as seconds.
- The library's seed-5489 replay is tied to the maintained libc++ probe. A single repeated result does not prove an entire game's sequence deterministic.
- The legacy offset test's 3% came from one false positive in 30 trials and a matcher that permitted overlapping shuffle intervals. The corrected research tool tracks complete consumption and keeps experiment-specific counts out of general article claims.
- The crossed glove image identifiers are not sufficient evidence that the displayed icons are swapped.

## Keep the implementation useful

A sound structure matters more than a small diff. Avoid complexity without a concrete purpose. Tests should protect meaningful boundaries, independent evidence, or user-visible behavior; do not add tests that only restate a calculation. Batch independent checks, and repeat them when changes or failures justify another run.

The implemented structure is documented in [Architecture](architecture.md).
