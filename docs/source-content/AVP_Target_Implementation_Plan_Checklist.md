# AVP Target Narrative — Implementation Plan Checklist

Version date: 2026-07-21
Target source: `AVP_Wood_Pellet_3D_Storytelling_Content_Final.md`

## Goal

Move the website from the current circular-energy journey toward the target
story:

```text
FOREST
↓
RAW WOOD
↓
WOOD CHIPS
↓
WOOD PARTICLES
↓
DRY BIOMASS
↓
PELLETIZATION
↓
WOOD PELLET
↓
VALUE UPGRADING
↓
THERMAL UPGRADING
↓
TORREFACTION
↓
BLACK WOOD PELLET
↓
ADVANCED BIOENERGY
```

Primary message:

```text
FROM WOOD.
TO PELLET.
TO HIGHER VALUE.
```

## Phase 0 - Alignment

Status: done

- [x] Confirm target narrative source:
  `docs/source-content/AVP_Wood_Pellet_3D_Storytelling_Content_Final.md`
- [x] Confirm current live copy source: `src/lib/copy.ts`
- [x] Confirm current timeline source: `src/lib/timeline.ts`
- [x] Confirm current 3D station root: `src/three/World.tsx`
- [x] Decide that `Value Upgrading`, `Thermal Upgrading`, `Torrefaction`,
  `Black Wood Pellet`, and `Advanced Bioenergy` are the new strategic ending.

## Phase 1 - Content Migration

Status: done

- [x] Rewrite hero message to `From wood. To pellet. To higher value.`
- [x] Rewrite origin sections around Sustainable Forest and Raw Wood.
- [x] Rewrite material preparation sections around Wood Chips, Wood Particles,
  Dry Biomass, and Preparation.
- [x] Rewrite Pelletizing as the first transformation.
- [x] Rewrite Cooling as the Wood Pellet milestone.
- [x] Add Value Upgrading after Wood Pellet.
- [x] Add Thermal Upgrading.
- [x] Add Torrefaction.
- [x] Add Value Creation.
- [x] Add Black Wood Pellet.
- [x] Add Advanced Bioenergy as the final brand close.
- [x] Update metadata title and description in `src/app/layout.tsx`.
- [x] Update No-WebGL fallback headline in `src/components/NoWebGL.tsx`.
- [x] Run `npm run typecheck`.
- [x] Run `npm run build`.
- [x] Run `npm run visual:smoke`.

Phase 1 acceptance:

- [x] Live copy now follows the target AVP Wood Pellet story.
- [x] Website build passes.
- [x] Visual smoke confirms canvas renders on desktop and mobile.

## Phase 2 - Section Architecture Cleanup

Status: done

Decision:

- [x] Keep 15 sections for now, or reduce to the 11 target sections in the
  content document.

Recommended direction:

- [x] Keep 15 sections during rebuild to reduce risk.
- [x] Reassign late-stage stations to target technology chapters.
- [x] Only reduce or merge stations after visual parity is achieved.

Implementation checklist:

- [x] Update `docs/03-section-architecture.md` with target section names.
- [x] Update `docs/02-storyboard.md` with target story beats.
- [x] Update `docs/07-scroll-timeline.md` with target chapter timing.
- [x] Update progress rail labels if needed in `src/lib/copy.ts`.
- [x] Audit overlay text length on desktop and mobile.
- [x] Decide whether `Packaging`, `Warehouse`, `Logistics`, and `Circular`
  remain as visual scenes or become replaced scenes.

Acceptance criteria:

- [x] Every section name in docs matches `src/lib/copy.ts`.
- [x] Storyboard no longer describes Logistics/Circular as the final narrative.
- [x] The target story is readable before any new 3D scene is added.

## Phase 3 - Visual Rebuild: Value Upgrading

Status: done

Current temporary station:

- `qc`

Target role:

- Chapter shift from conventional Wood Pellet to Value Upgrading.

Implementation checklist:

- [x] Restage QC/product macro as a technology decision point.
- [x] Add visual language for `Product -> Technology -> Higher Value`.
- [x] Make hero pellet feel inspected, selected, then handed into upgrading.
- [x] Reduce normal QC certification emphasis.
- [x] Add transition particles from pale pellet tone toward warmer thermal tone.
- [x] Update `src/three/stations/QualityControl.tsx`.
- [x] Update hero pellet state in `src/lib/timeline.ts` if needed.

Acceptance criteria:

- [x] Viewer understands the first product is complete.
- [x] The next chapter feels like a deliberate technology upgrade.

## Phase 4 - Visual Rebuild: Thermal Upgrading

Status: done

Current temporary station:

- `packaging`

Target role:

- Controlled thermal environment.

Implementation checklist:

- [x] Replace or heavily restage packaging visuals.
- [x] Create a controlled chamber, kiln, reactor entrance, or thermal tunnel.
- [x] Show conventional wood pellets entering a controlled heat environment.
- [x] Use heat, containment, and instrumentation instead of bag filling.
- [x] Add readable thermal control cues: temperature band, sealed chamber,
  controlled atmosphere.
- [x] Update `src/three/stations/Packaging.tsx`, or create a new station file
  and swap import in `src/three/World.tsx`.
- [x] Update asset manifest for thermal-upgrading scene assets.

Acceptance criteria:

- [x] Scene reads as controlled thermal upgrading, not packaging.
- [x] Heat feels precise and technological, not combustion.

## Phase 5 - Visual Rebuild: Torrefaction

Status: done

Current temporary station:

- `warehouse`

Target role:

- Material transformation through controlled thermal treatment.

Implementation checklist:

- [x] Replace warehouse aisle visuals.
- [x] Build torrefaction reactor or treatment chamber.
- [x] Show pellet color and surface changing because material changes.
- [x] Add oxygen-limited / sealed-treatment feeling through chamber design.
- [x] Add internal transformation shader state for the hero pellet.
- [x] Add copy-aligned visual beat:
  `This is not simply a change in color. It is a change in the material.`
- [x] Update `src/three/stations/Warehouse.tsx`, or create a new station file.
- [x] Update `src/three/HeroPellet.tsx` shader uniforms if required.
- [x] Update `src/three/fx/shaders.ts` if a dedicated transformation shader is
  needed.
- [x] Update `public/asset-manifest.json` with the torrefaction chamber entry.

Acceptance criteria:

- [x] The viewer can see white pellet becoming black pellet.
- [x] The scene communicates material transformation, not smoke/dirt/burning.

## Phase 6 - Visual Rebuild: Value Creation

Status: done

Current temporary station:

- `logistics`

Target role:

- Explain why technology creates higher value.

Implementation checklist:

- [x] Decide whether to remove logistics visuals or keep them as background
  scale only.
- [x] Replace route arcs with value-flow arcs:
  `White Wood Pellet -> Torrefaction -> Black Wood Pellet`.
- [x] Add comparative visual: pale pellet, treatment core, black pellet.
- [x] Show value creation as a process result, not as a shipping promise.
- [x] Update `src/three/stations/Logistics.tsx`, or create a new station file.

Acceptance criteria:

- [x] The viewer understands the upgraded pellet has a new value layer.
- [x] The station bridges Torrefaction and Black Wood Pellet cleanly.

## Phase 7 - Visual Rebuild: Black Wood Pellet

Status: done

Current temporary station:

- `energy`

Target role:

- Hero reveal of the upgraded product.

Implementation checklist:

- [x] Restage furnace scene into Black Wood Pellet product hero.
- [x] Add black pellet material state: darker body, denser surface, premium
  highlight, lower raw-wood warmth.
- [x] Keep thermal glow as proof of upgrading, not active burning.
- [x] Show product as result of manufacturing plus technology.
- [x] Add optional comparison ghost of conventional pellet.
- [x] Update `src/three/stations/Energy.tsx`, or create a new station file.
- [x] Update `src/three/HeroPellet.tsx` for black pellet material state.
- [x] Update `src/lib/timeline.ts` hero heat/green states into a clearer
  upgrade-state progression.
- [x] Update `public/asset-manifest.json` with the Black Wood Pellet product hero.

Acceptance criteria:

- [x] Black Wood Pellet reads as the target product.
- [x] It does not look like a burnt version of the original pellet.

## Phase 8 - Final Advanced Bioenergy Close

Status: done

Current temporary station:

- `circular`

Target role:

- Final brand message: higher-value advanced bioenergy.

Implementation checklist:

- [x] Reframe closing from circular economy to advanced bioenergy.
- [x] Keep loop imagery only if it supports higher value.
- [x] Add final story logic:
  `Wood -> Pelletization -> Wood Pellet + Thermal Upgrading -> Black Wood Pellet`.
- [x] Add mission-inspired brand cues from AVP's public mission page:
  responsible resources, renewable energy, global partners and pioneer mindset.
- [x] Replace green circular emphasis with premium product/value emphasis.
- [x] Update `src/three/stations/Circular.tsx`, or create a new final station.
- [x] Update CTA copy if needed in `src/components/Overlay.tsx`.

Acceptance criteria:

- [x] Final screen resolves as `From Wood. To Pellet. To Higher Value.`
- [x] Closing message matches the target document:
  `Built from responsible resources. Shaped by technology. Created for
  higher-value advanced bioenergy.`

## Phase 9 - Technical Cleanup

Status: done for current cleanup; optional renames deferred

Implementation checklist:

- [x] Keep legacy station component filenames until visual QA is approved.
- [x] Update imports in `src/three/World.tsx` only if component filenames are
  renamed.
- [x] Keep station ids unchanged for stability while documenting migration
  slots in the docs.
- [x] Update any CSS/HUD labels that assume the old story.
- [x] Update `public/asset-manifest.json`.
- [x] Remove obsolete duplicate `public/assets-manifest.json`.
- [x] Remove obsolete docs references to Logistics/Circular as final story.
- [x] Translate remaining live-facing Vietnamese copy to English.
- [x] Defer GitNexus analysis because this pass did not rename structural
  components or station ids.

Acceptance criteria:

- [x] Docs, copy and visuals describe one story; legacy filenames are documented
  migration slots.
- [x] No obsolete chapter remains as a primary website endpoint.

## Phase 10 - QA Checklist

Status: technical verification passed; manual visual QA still open

Commands:

```text
npm run typecheck
npm run build
npm run visual:smoke
```

- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run visual:smoke`

Manual QA:

- [ ] Desktop hero: headline readable, pellet not covering text.
- [ ] Mobile hero: headline wraps cleanly.
- [ ] S01-S08: first transformation reads as wood-to-pellet.
- [x] S09: chapter shift to Value Upgrading is clear.
- [x] S10: Thermal Upgrading reads as controlled heat.
- [x] S11: Torrefaction reads as material transformation.
- [x] S12: Value Creation explains higher value.
- [x] S13: Black Wood Pellet reads as upgraded product.
- [x] S14: final message closes on higher value.
- [ ] No scene copy contradicts its visual.
- [x] No old `coal replacement / logistics / circular economy` message remains
  as the final narrative.
- [x] No Vietnamese remains in live-facing English UI/content.

## Phase 11 - Material Flow Continuity

Status: full target-story bridge rollout implemented and smoke-verified

Approach:

- [x] Use Approach B: transition objects that travel between stations.
- [x] Keep bridges outside station groups so objects can move in world space.
- [x] Use global scroll windows instead of clamped `stationLocal()` values, so
  bridges cannot remain visible after their transition ends.
- [x] Avoid adding `handoffExit` / `handoffEnter` fields to `timeline.ts`; each
  bridge owns its offsets until a later refactor is needed.
- [x] Use material-state-specific transition objects: logs, chips, fibers, dry
  biomass, conditioned biomass, hot pellets, cooled pellets and black pellets.
- [x] Keep pellet-cylinder geometry out of every transition before
  `Pelletizing -> Cooling`.
- [x] Keep the camera-anchored hero pellet visible in the opening, then hidden
  after the Forest handoff until the Pelletizing station fade-in, so
  Preparation still reads as loose conditioned biomass.

Implemented bridges:

- [x] `ForestToCollection`: organic log travels from source forest into Raw
  Wood.
- [x] `CollectionToScreening`: short log drops into the cutter/screen intake.
- [x] `ScreeningToGrinding`: chip stream rains into the grinder hopper.
- [x] `GrindingToDrying`: fiber cloud narrows as it is pulled into drying.
- [x] `DryingToConditioning`: dry biomass ribbon slides into Preparation.
- [x] `ConditioningToPelletizing`: conditioned biomass squeezes into the die
  inlet.
- [x] `PelletizingToCooling`: hot extruded pellet cluster cools into the Wood
  Pellet milestone.
- [x] `CoolingToValueUpgrading`: cooled pellet sample enters Value Upgrading.
- [x] `ValueUpgradingToThermal`: approved pellet batch enters Thermal
  Upgrading.
- [x] `ThermalToTorrefaction`: heated pellet cluster enters Torrefaction.
- [x] `TorrefactionToValueCreation`: Black Wood Pellet cluster carries the
  torrefaction result into Value Creation.
- [x] `ValueCreationToBlackPellet`: product proof moves into Black Wood Pellet.
- [x] `BlackPelletToAdvancedBioenergy`: black pellet proof resolves into the
  final Advanced Bioenergy close.

Acceptance criteria:

- [x] Bridges add continuity without competing with the main station visuals.
- [x] Bridges do not cover overlay text on desktop or mobile.
- [x] Only the bridge for the current travel window is visible by construction.
- [x] Bridge objects disappear before the destination dwell scene takes over by
  construction.

Verification:

- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run visual:smoke`
- [x] Production bridge spot QA across 13 transition screenshots:
  `.next/full-bridge-smoke/`

## Current Known Gaps

- [x] Late-stage visuals have been rebuilt after phase 1 copy migration.
- [x] `QualityControl.tsx`, `Packaging.tsx`, `Warehouse.tsx`, `Logistics.tsx`,
  `Energy.tsx`, and `Circular.tsx` now carry target visual semantics.
- [x] Core docs `02-storyboard`, `03-section-architecture`, and
  `07-scroll-timeline` now describe the target story.
- [x] Asset manifest has value-upgrading, thermal-upgrading, torrefaction,
  value-creation, Black Wood Pellet and Advanced Bioenergy entries.
- [x] Asset manifest includes the full Material Flow Continuity bridge system
  and all 13 live bridge assets.
- [x] Content-document folder remains lean: target story, implementation
  checklist, docs index and the source PPT only.

## Priority Order

1. Visual-review the full bridge rollout across all station transitions.
2. Tune any bridge that competes with overlay text or main station visuals.
3. Optional component/station rename cleanup after visuals are stable.
4. Optional section-count decision after the 15-section version is approved.
