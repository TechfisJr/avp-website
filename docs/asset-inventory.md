# Asset Inventory

This inventory separates runtime assets in `public/` from source/master files in
`docs/source-assets/`. The GSAP/R3F site should load only runtime assets from
`public/`.

## Target Runtime Structure

```txt
public/
├── backgrounds/
│   ├── 01-forest/
│   │   └── forest-hero.webp
│   ├── 02-factory-entry/
│   │   ├── factory-aerial.webp
│   │   ├── factory-approach.webp
│   │   ├── factory-gate.webp
│   │   └── factory-descent.webp
│   ├── 03-production/
│   │   ├── factory-interior-01.webp
│   │   ├── factory-interior-02.webp
│   │   ├── factory-interior-03.webp
│   │   ├── factory-interior-04.webp
│   │   └── factory-interior-05.webp
│   └── 04-value-upgrading/
│       └── thermal-upgrading.webp
├── models/
│   ├── biomass/
│   │   ├── log-stack.glb
│   │   ├── wood-chips.glb
│   │   └── hero-pellet.glb
│   └── machines/
│       ├── pellet-mill.glb
│       └── torrefaction-reactor.glb
├── textures/
│   ├── wood/
│   ├── chips/
│   ├── pellet/
│   └── industrial/
└── effects/
    ├── dust.webp
    ├── smoke.webp
    └── heat-noise.webp
```

`public/icons/`, `public/favicon.ico`, and `public/asset-manifest.json` are kept
as application UI metadata outside the storytelling asset tree.

## KEEP

| Asset | Location | Reason |
| --- | --- | --- |
| Factory aerial runtime plate | `public/backgrounds/02-factory-entry/factory-aerial.webp` | Live factory-entry backdrop. |
| Production runtime plates | `public/backgrounds/03-production/factory-interior-01.webp` through `factory-interior-05.webp` | Live factory reality layer for production stations. |
| Hero pellet GLB | `public/models/biomass/hero-pellet.glb` | Live protagonist model loaded by `HeroPellet`. |
| HUD/brand icons | `public/icons/*` | Live logo, grain, scan ring, scroll cue, favicon support. |
| Favicon | `public/favicon.ico` | Browser metadata. |
| Asset manifest | `public/asset-manifest.json` | Canonical inventory used by project docs. |
| Background PNG masters | `docs/source-assets/backgrounds/{outside,inside}/*.png` | Source masters for regenerating optimized WebP runtime plates. |
| Content source docs | `docs/source-content/*` | Source/reference material; moved out of public serving path. |

## UPGRADE

| Asset Slot | Current State | Upgrade Needed |
| --- | --- | --- |
| Forest hero plate | `public/backgrounds/01-forest/.gitkeep` | Add `forest-hero.webp`; art direction should feel natural, not factory-like. |
| Factory approach/gate/descent | Only `factory-aerial.webp` exists | Add the three missing entry sequence plates for a richer GSAP scroll arrival. |
| Thermal upgrading plate | `public/backgrounds/04-value-upgrading/.gitkeep` | Add `thermal-upgrading.webp` if value-upgrading needs a photographic anchor. |
| Wood textures | Empty `public/textures/wood/` | Add bark/end-grain base color, normal, roughness maps. |
| Chips textures | Empty `public/textures/chips/` | Add sawdust/chip albedo + roughness/normal maps. |
| Pellet textures | Empty `public/textures/pellet/` | Add optional PBR maps for authored pellet variants. |
| Industrial textures | Empty `public/textures/industrial/` | Add painted metal, concrete, rubber and warning-stripe maps. |
| Effects sprites | Empty `public/effects/` | Add `dust.webp`, `smoke.webp`, `heat-noise.webp` for particle/material upgrades. |
| AVP logo SVG | `public/icons/avp-logo.svg` is about 940KB | Optimize or replace with a smaller production SVG/PNG if it stays public. |

## REPLACE

| Procedural Asset | Current Implementation | Replacement Target |
| --- | --- | --- |
| Log stack | `src/three/kit/biomass.tsx#Logs` | `public/models/biomass/log-stack.glb` with optimized bark/end-cap geometry. |
| Wood chips | `src/three/kit/biomass.tsx#Chips` and particle shards | `public/models/biomass/wood-chips.glb` for hero piles, procedural particles for flow. |
| Pellet mill | `src/three/stations/Pelletizing.tsx` procedural primitives | `public/models/machines/pellet-mill.glb`; keep procedural strands/particles. |
| Torrefaction reactor | `src/three/stations/Warehouse.tsx` procedural reactor | `public/models/machines/torrefaction-reactor.glb`; keep animated pellet stream. |
| Generic machine pack slot | `public/asset-manifest.json` references machine-pack upgrade path | Replace with individually named machine GLBs in `public/models/machines/`. |

## DELETE / QUARANTINE

| Asset | Current Location | Reason |
| --- | --- | --- |
| `.DS_Store` files | `docs/deleted-assets/public-junk/**/.DS_Store` | OS metadata; should not be runtime assets. |
| Old mobile WebP duplicates | `docs/deleted-assets/public-junk/images/background/**/*.m.webp` | Loader now uses the normalized `public/backgrounds/**/*.webp` paths. |
| `Archive.zip` | `docs/deleted-assets/public-junk/images/background/Archive.zip` | Source archive should not be served from `public`. |
| Empty legacy slots | `docs/deleted-assets/public-junk/{audio,hdr,videos}/.gitkeep` | Not part of the requested runtime architecture. |
| Old `public/images/background` tree | Removed from public; PNG masters moved to `docs/source-assets/backgrounds/` | Runtime backgrounds now live under `public/backgrounds/`. |
