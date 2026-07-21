# Asset Bible — Production Upgrade Path

Companion to [`docs/3d-audit.md`](./3d-audit.md). That audit found *why* the
site reads as a prototype (staging, exposure, material response). This
document defines *what to build or source* to fix it — the complete inventory
of visual assets required to take the biomass storytelling experience from
prototype to premium production quality.

The structured, machine-readable version of everything here lives in
[`public/assets-manifest.json`](../public/assets-manifest.json) — 36 assets,
one entry per row below, each carrying the full field set (geometry
requirements, textures, materials, source strategy, optimization, fallbacks,
performance cost, priority). This document is the narrative walkthrough; the
JSON is the source of truth a build script or task tracker should consume.

---

## Classification system

| Code | Class | Definition |
|------|-------|------------|
| A | Realistic GLB/GLTF model | Authored or sourced mesh, Draco+Meshopt compressed |
| B | Procedural R3F geometry | Built from Three.js primitives/curves in code, no download |
| C | Instanced geometry | One geometry, many `InstancedMesh` placements |
| D | PBR texture set | Albedo/normal/roughness/AO tileable maps |
| E | HDRI / environment map | Equirectangular lighting/reflection source |
| F | Particle system | GPU points via the shared `ParticleField` engine |
| G | Real image | Photography plate (upgrade path, not required for launch) |
| H | Video fallback | WebM/MP4 loop substituting a live 3D system |
| I | Mobile fallback asset | Tier-0 substitute for an expensive live system |

Most assets below carry two codes (e.g. `A (recommended) / B (current)`)
because the recommended production path and the current procedural
implementation differ — the manifest always states both.

---

## Guiding rule

> Do not ship primitive geometry as a *final* production asset unless the
> minimal style is an intentional design choice.

Three things ARE an intentional minimal style here and should **stay
procedural**: forest canopy/foliage (instancing at this scale beats any
authored tree), the conveyor belt module (a shader-driven belt reads better
than a textured GLB at this size on screen), and all particle-based matter
(sawdust, steam, embers, spores, leaves — these are the connective tissue the
original creative brief specifically calls for as procedural).

Everything else that currently *reads* as a placeholder — the ring die, the
jumbo bag, the bulk carrier, the port environment, the boiler face — is
flagged `replace` or `improve` below, not because primitives are wrong in
principle, but because these specific assets sit close to camera, appear
across multiple scenes, or carry the emotional weight of their scene (the
pelletizing die is literally where the hero pellet is "born").

---

## Normalized project structure

```
public/
  models/
    shared/         hero-pellet-v2.glb, jumbo-bag.glb, pallet (if authored)
    environment/     forest trunk variants, foliage cards (if authored over procedural)
    machinery/       ring-die.glb (if commissioned) + any other authored machines
    logistics/       truck.glb, bulk-carrier.glb
  textures/
    wood/            log/chip/shaving sets, needle-card alpha
    bark/             bark albedo + normal + AO (shared: forest + logs)
    pellet/          compressed-pellet macro set (optional GPU-cost fallback for hero shader)
    metal/           brushed steel, painted panel, galvanized, cast iron
    fabric/          FIBC weave albedo + normal + AO
    concrete/        warehouse/plant/quay floor sets
  hdr/               studio-industrial.hdr (PMREM source)
  images/            photography upgrade-path plates (D)
  videos/            WebM/MP4 fallback loops (H)
  fallbacks/         tier-0 static substitutes (I)
  icons/             existing SVG UI assets (unchanged)
  audio/             existing ambience slot (unchanged)
```

This folder tree is created and ready in the repo (`mkdir` already run for
this task); asset files land in it as they're produced. `public/models`,
`public/textures`, `public/hdr` previously held only `.gitkeep` placeholders —
they now have the subfolder scaffolding the manifest references.

---

## Minimum asset review, by area

### Hero
**Realistic wood pellet** — `hero-pellet` in the manifest. Currently a
275 KB GLB from `scripts/generate-hero-pellet.mjs`, camera-anchored and
over-scaled (fills 50–70% of frame in six scenes). **Decision: improve** —
regenerate with 4× striation frequency, ±1.5% displacement (down from
current), chamfered sheared ends instead of a smooth cinnamon-roll cap. This
is the single most-reused asset on the site (7 appearances) and the
highest-priority fix; see `hero-staging-config` for the companion re-staging
work (scale 1 → 0.35–0.5, offset out of the copy column).

### Forest
- **Trunk variations** (`forest-trunk-variants`) — 3–4 bent/flared profiles
  replacing the single straight taper, plus a real bark texture set.
  Stay procedural; add texture.
- **Tree clusters / foliage silhouette** (`forest-canopy-clusters`,
  `forest-foliage-cards`) — reposition canopy instances onto branch anchors;
  swap flat leaf-card circles for an alpha-cutout needle-cluster sprite.
  Stay procedural.
- **Forest floor** (`forest-floor`) — add one CC0 moss/needle-litter texture.
- **Atmospheric particles** (`forest-atmosphere`) — already the
  best-reviewed system on the site; only the god-ray plane edges need a
  fresnel falloff. Keep.

### Raw materials
- **Logs** (`raw-logs`) — keep instanced geometry, add bark displacement +
  a real end-grain ring texture (currently a flat orange disc — the most
  "cartoon" single detail in Collection).
- **Offcuts** (`raw-offcuts`) — not currently a distinct asset; net-new small
  instanced component for pile variety.
- **Wood chips** (`raw-chips`) — stays procedural, functions fine at scale.
- **Sawdust** (`raw-sawdust`) — same particle engine, needs a tighter-edge
  "solid" sprite variant so bursts read as material, not light (see the
  site-wide `pellet-fx-shape-upgrade` entry).
- **Wood shavings** (`raw-shavings`) — keep the helix geometry, just anchor
  it to the pile instead of scattering on open ground.

### Processing
- **Screening tray** (`screening-deck`) — bevel the deck, add a mesh-weave
  surface so it reads as a screen, not piano keys.
- **Hammer mill / grinder** (`hammer-mill`) — already the most-detailed
  machine on site after a recent pass; needs an interior cavity light and
  instanced bolts (currently 14 separate draws).
- **Rotary dryer** (`rotary-dryer`) — needs a galvanized-steel texture set;
  currently reads as a polished brass pipe purely because there's no
  environment map for its high metalness to reflect.
- **Pellet mill** (`pellet-mill-die`) — **the flagship replacement asset**.
  Current torus-with-protruding-bores geometry cannot read as a die face at
  any camera distance. This is the one asset in the whole bible recommended
  for professional modeling or marketplace sourcing over a procedural
  rebuild, because the flat annular face with a true bore array is
  genuinely hard to fake convincingly with primitives.
- **Cooling system** (`cooling-system`) — simplify the muddy transmission
  glass to a single thin pane (or drop it for an open-frame cooler, which is
  also more true to how counterflow coolers are actually built), move the
  warm/cool lights inside the bin.
- **Conveyor** (`conveyor-module`) — stays procedural; add a per-instance
  grime uniform so the same module looks different near the grinder vs. near
  QC.

### Packaging
- **Jumbo bags** (`jumbo-bag`) — **the second flagship replacement asset**.
  Current displaced-box-with-tori is the single least convincing asset on the
  site per the audit ("white paper cube with black croissant handles"). This
  appears in 3 scenes near camera and is worth either sourcing a low-poly
  FIBC model (several exist CC0/low-cost on Sketchfab/CGTrader) or a 1–2 hour
  Blender commission, with a proper weave texture and morph-target fill.
- **Filling station** (`packaging-filling-station`) — add a clamp-ring detail
  around the spout; otherwise functions well already.
- **Pallets** (`pallets`) — **not currently modeled at all**. Bags floating
  directly on the floor/conveyor breaks real-world logistics logic; this is a
  net-new small instanced asset needed under every staged bag.

### Warehouse
- **Industrial racks** (`warehouse-racks`) — add cross-bracing; functions
  well already.
- **Bag stacks** (`warehouse-bag-stacks`) — currently plain instanced boxes
  standing in for bags; replace with the jumbo-bag LOD mesh once that asset
  exists — the single highest-leverage warehouse fix.
- **Pallets** — shared with Packaging, see above.
- **Practical lights** (`warehouse-lighting`) — currently glowing decals with
  no matching light source and no hall envelope; needs real point lights and
  wall/roof planes to close the volume.

### Logistics
- **Truck** (`logistics-truck`) — shared between Collection and Logistics;
  current stylized silhouette is acceptable at distance but generic up close.
  Improve procedurally or source a low-poly GLB.
- **Port environment** (`port-environment`) — **currently ~90% black, the
  lowest-performing scene on the site**. Needs quay-light practicals, bollards,
  and a horizon so "sea meets sky" actually exists as a readable idea.
- **Bulk carrier / cargo ship** (`bulk-carrier`) — current container stacks
  are the wrong cargo type for a pellet bulk carrier (pellets ship under
  hatch covers, not in containers) in addition to reading as black boxes with
  no envmap. Replace container instancing with hatch-cover panels at minimum;
  sourcing a low-poly bulk-carrier GLB is the stronger path if budget allows.
- **Loading infrastructure** — covered by `port-environment` (crane, bollards,
  quay lighting) and the shared `logistics-route-arcs` (great-circle shipping
  lanes, currently has a visible geometric kink to fix).

### Energy
- **Industrial boiler** (`boiler-furnace`) — **the climax scene, currently
  the least convincing machine on the site** ("a glowing ball behind a
  chocolate torus"). Needs a recessed aperture (not a flush disc), a layered
  fire-bed shader for interior depth, and a rivet/panel-seam texture on the
  boiler face.
- **Energy environment** (`energy-embers`, `energy-plume`) — embers currently
  spawn as uniform confetti across the whole frame instead of originating
  from the furnace opening; the plume spawns outside the framed shot
  entirely and is wasted particle budget. Both are placement/parameter fixes,
  no new assets.

---

## Site-wide systemic assets (apply everywhere, not one scene)

- **`studio-hdri`** — zero environment map currently exists anywhere on the
  site. Every metal, every painted panel, the glass cooler — all of it is
  rendering flat because there is nothing for physically-based materials to
  reflect. One ≤1.2 MB HDRI, one PMREM compute at load, is the single highest
  return-on-effort item in this entire bible.
- **`pellet-fx-shape-upgrade`** — the shared particle shader currently has
  one sprite silhouette (soft disc) for every use case from dust motes to
  falling pellets to sparks. A 2–3 shape branch (shard / capsule / puff)
  selected per-particle fixes the "bokeh confetti" read across every scene
  in one shader edit.
- **`bevel-box-helper`** — every machine in the kit is built from raw
  `BoxGeometry` with hard, light-catching-nothing edges. One shared
  rounded-box helper applied incrementally across `kit/machines.tsx` lifts
  every machine's close-up credibility for effectively free.

---

## Optimization commitments

- **Models (A):** Draco geometry compression + Meshopt reordering on every
  GLB, target sizes stated per-asset in the manifest (120–250 KB range).
- **Textures (D):** 1K tileable sets everywhere (not 2K/4K) — nothing here is
  filmed in extreme macro except the hero pellet, which stays procedural/
  shader-driven specifically to avoid needing a 4K texture. KTX2 compression
  recommended for any texture that ships; WebP/AVIF for the photography
  upgrade-path plates in `public/images`.
- **Instancing (C):** every repeated element (logs, chips, pellets, bags,
  rack frames, trunks, canopy) already uses or will use `InstancedMesh` —
  the manifest calls this out per-asset so no repeated element regresses to
  individual draw calls during the upgrade.
- **HDRI (E):** single equirect source, PMREM computed once; tier-0 devices
  either get a 512px downsample or skip environment lighting entirely
  (flat fallback is already visually acceptable at that tier per the audit).
- **Mobile fallbacks (I):** every asset in the manifest states its tier-0
  behavior explicitly — usually "same geometry, skip the texture/shader
  layer" rather than a wholesale swap, keeping the single-codebase,
  quality-tiered approach already established in `src/lib/quality.ts`.

---

## Prioritized asset decisions

### 1 — P0 replacement assets
These are either net-new or full rebuilds, and block judgment of everything
downstream of them:

| Asset | Why it's P0 |
|---|---|
| Hero pellet v2 (regenerate) | Appears in 7 scenes, currently reads as bread at scale |
| Hero staging config (re-stage) | Currently occludes headlines and machinery everywhere it appears |
| Studio HDRI (net-new) | Zero environment map anywhere; blocks every material fix below it |
| Pellet mill ring die (replace) | Flagship scene is currently unreadable as a die |
| Jumbo bag (replace) | Least convincing asset on the site, appears in 3 scenes near camera |
| Port environment (relight) | Currently ~90% black, the lowest-performing scene |
| Bulk carrier (replace) | Wrong cargo type modeled (containers vs. hatch covers) + unlit |
| Boiler furnace (re-stage + shader) | Climax scene currently reads as a toy |

### 2 — P1 asset upgrades
Logs (bark + ring texture), sawdust (solid sprite), screening deck (bevel +
mesh weave), hammer mill (cavity light + instancing), conditioning vessel
(seams/hatch/sight-glass), extrusion strands (unblocked once the die ships),
cooling system (thin pane + brighter bed), pallets (net-new), warehouse bag
stacks (swap to bag LOD), warehouse lighting (real fixtures + envelope),
logistics truck, route arcs (geometry fix), energy embers (directional),
site-wide particle shape upgrade.

### 3 — Assets that can stay procedural
Wood chips, offcuts, shavings, conveyor module, packaging filling station,
warehouse racks, energy plume, the bevel-box helper itself, all forest
canopy/foliage/floor/atmosphere systems, and the rotary dryer geometry
(texture upgrade only, not a rebuild). These either already read correctly
at their screen size or are explicitly the site's intentional minimal-style
elements (particles, instancing-heavy forest).

### 4 — Assets to source externally or model professionally
Ranked by return on investment:
1. **Pellet mill ring die** — highest ROI; a flat annular face with a real
   bore array is the one geometry in this bible that's genuinely difficult
   to fake with primitives, and it's the flagship scene.
2. **Jumbo bag** — appears three times near camera; a commissioned or
   marketplace-sourced low-poly FIBC with proper weave texture and fill
   morph targets would resolve the site's single worst-reviewed asset.
3. **Bulk carrier** *(optional)* — a procedural v2 with hatch-cover instancing
   replacing containers is a viable zero-cost alternative if sourcing isn't
   pursued; only escalate to modeling if budget allows the fuller lit-window/
   deck-crane treatment.
4. **Truck** *(optional)* — the procedural silhouette is already acceptable
   at the distances it's shown; sourcing is a nice-to-have, not a blocker.

**Sequencing note.** Ship the HDRI and hero pellet fixes first — they are
prerequisites for judging whether anything else needs replacing versus
merely re-lighting. Re-capture all 15 scenes after those two land, then
proceed through the P0 replacement list.
