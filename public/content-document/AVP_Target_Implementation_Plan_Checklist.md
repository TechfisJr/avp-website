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
  `public/content-document/AVP_Wood_Pellet_3D_Storytelling_Content_Final.md`
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

Status: in progress

Decision needed:

- [ ] Keep 15 sections for now, or reduce to the 11 target sections in the
  content document.

Recommended direction:

- [x] Keep 15 sections during rebuild to reduce risk.
- [x] Reassign late-stage stations to target technology chapters.
- [x] Only reduce or merge stations after visual parity is achieved.

Implementation checklist:

- [x] Update `docs/03-section-architecture.md` with target section names.
- [x] Update `docs/02-storyboard.md` with target story beats.
- [x] Update `docs/07-scroll-timeline.md` with target chapter timing.
- [ ] Update progress rail labels if needed in `src/lib/copy.ts`.
- [ ] Audit overlay text length on desktop and mobile.
- [ ] Decide whether `Packaging`, `Warehouse`, `Logistics`, and `Circular`
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

- [ ] Restage QC/product macro as a technology decision point.
- [ ] Add visual language for `Product -> Technology -> Higher Value`.
- [ ] Make hero pellet feel inspected, selected, then handed into upgrading.
- [ ] Reduce normal QC certification emphasis.
- [ ] Add transition particles from pale pellet tone toward warmer thermal tone.
- [ ] Update `src/three/stations/QualityControl.tsx`.
- [ ] Update hero pellet state in `src/lib/timeline.ts` if needed.

Acceptance criteria:

- [ ] Viewer understands the first product is complete.
- [ ] The next chapter feels like a deliberate technology upgrade.

## Phase 4 - Visual Rebuild: Thermal Upgrading

Status: planned

Current temporary station:

- `packaging`

Target role:

- Controlled thermal environment.

Implementation checklist:

- [ ] Replace or heavily restage packaging visuals.
- [ ] Create a controlled chamber, kiln, reactor entrance, or thermal tunnel.
- [ ] Show conventional wood pellets entering a controlled heat environment.
- [ ] Use heat, containment, and instrumentation instead of bag filling.
- [ ] Add readable thermal control cues: temperature band, sealed chamber,
  controlled atmosphere.
- [ ] Update `src/three/stations/Packaging.tsx`, or create a new station file
  and swap import in `src/three/World.tsx`.
- [ ] Update asset manifest for thermal-upgrading scene assets.

Acceptance criteria:

- [ ] Scene reads as controlled thermal upgrading, not packaging.
- [ ] Heat feels precise and technological, not combustion.

## Phase 5 - Visual Rebuild: Torrefaction

Status: planned

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

Status: planned

Current temporary station:

- `logistics`

Target role:

- Explain why technology creates higher value.

Implementation checklist:

- [ ] Decide whether to remove logistics visuals or keep them as background
  scale only.
- [ ] Replace route arcs with value-flow arcs:
  `White Wood Pellet -> Torrefaction -> Black Wood Pellet`.
- [ ] Add comparative visual: pale pellet, treatment core, black pellet.
- [ ] Show value creation as a process result, not as a shipping promise.
- [ ] Update `src/three/stations/Logistics.tsx`, or create a new station file.

Acceptance criteria:

- [ ] The viewer understands the upgraded pellet has a new value layer.
- [ ] The station bridges Torrefaction and Black Wood Pellet cleanly.

## Phase 7 - Visual Rebuild: Black Wood Pellet

Status: planned

Current temporary station:

- `energy`

Target role:

- Hero reveal of the upgraded product.

Implementation checklist:

- [ ] Restage furnace scene into Black Wood Pellet product hero.
- [ ] Add black pellet material state: darker body, denser surface, premium
  highlight, lower raw-wood warmth.
- [ ] Keep thermal glow as proof of upgrading, not active burning.
- [ ] Show product as result of manufacturing plus technology.
- [ ] Add optional comparison ghost of conventional pellet.
- [ ] Update `src/three/stations/Energy.tsx`, or create a new station file.
- [ ] Update `src/three/HeroPellet.tsx` for black pellet material state.
- [ ] Update `src/lib/timeline.ts` hero heat/green states into a clearer
  upgrade-state progression.

Acceptance criteria:

- [ ] Black Wood Pellet reads as the target product.
- [ ] It does not look like a burnt version of the original pellet.

## Phase 8 - Final Advanced Bioenergy Close

Status: planned

Current temporary station:

- `circular`

Target role:

- Final brand message: higher-value advanced bioenergy.

Implementation checklist:

- [ ] Reframe closing from circular economy to advanced bioenergy.
- [ ] Keep loop imagery only if it supports higher value.
- [ ] Add final story logic:
  `Wood -> Pelletization -> Wood Pellet + Thermal Upgrading -> Black Wood Pellet`.
- [ ] Replace green circular emphasis with premium product/value emphasis.
- [ ] Update `src/three/stations/Circular.tsx`, or create a new final station.
- [ ] Update CTA copy if needed in `src/components/Overlay.tsx`.

Acceptance criteria:

- [ ] Final screen resolves as `From Wood. To Pellet. To Higher Value.`
- [ ] Closing message matches the target document:
  `We don't just transform biomass. We create more value from it.`

## Phase 9 - Technical Cleanup

Status: planned

Implementation checklist:

- [ ] Rename station components only after scene rebuild is stable.
- [ ] Update imports in `src/three/World.tsx`.
- [ ] Update station ids in `src/lib/timeline.ts` only if the ids become
  misleading.
- [ ] Update any CSS/HUD labels that assume the old story.
- [ ] Update `public/asset-manifest.json`.
- [ ] Update `public/assets-manifest.json` if still used.
- [ ] Remove obsolete docs references to Logistics/Circular as final story.
- [ ] Re-run GitNexus analysis after structural code changes.

Acceptance criteria:

- [ ] File names, station ids, docs, copy and visuals describe one story.
- [ ] No obsolete chapter remains as a primary website endpoint.

## Phase 10 - QA Checklist

Status: planned

Commands:

```text
npm run typecheck
npm run build
npm run visual:smoke
```

Manual QA:

- [ ] Desktop hero: headline readable, pellet not covering text.
- [ ] Mobile hero: headline wraps cleanly.
- [ ] S01-S08: first transformation reads as wood-to-pellet.
- [ ] S09: chapter shift to Value Upgrading is clear.
- [ ] S10: Thermal Upgrading reads as controlled heat.
- [x] S11: Torrefaction reads as material transformation.
- [ ] S12: Value Creation explains higher value.
- [ ] S13: Black Wood Pellet reads as upgraded product.
- [ ] S14: final message closes on higher value.
- [ ] No scene copy contradicts its visual.
- [ ] No old `coal replacement / logistics / circular economy` message remains
  as the final narrative.

## Current Known Gaps

- [ ] Late-stage visuals still need rebuild after phase 1 copy migration.
- [ ] `Packaging.tsx`, `Logistics.tsx`, `Energy.tsx`, and `Circular.tsx` still
  carry old visual semantics.
- [x] Core docs `02-storyboard`, `03-section-architecture`, and
  `07-scroll-timeline` now describe the target story.
- [ ] Asset manifest still needs thermal-upgrading and black pellet entries.

## Priority Order

1. Black Wood Pellet product hero.
2. Thermal Upgrading controlled environment.
3. Value Upgrading transition.
4. Final Advanced Bioenergy close.
5. Asset manifest cleanup.
6. Remaining docs cleanup outside the core storyboard/architecture/timeline.
