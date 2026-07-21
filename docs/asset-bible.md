# Asset Bible — Target Narrative Inventory

Companion to [`docs/05-asset-production-plan.md`](./05-asset-production-plan.md).
The structured source of truth is
[`public/asset-manifest.json`](../public/asset-manifest.json).

## Narrative Rule

Every asset should support the AVP Wood Pellet story:

```text
FROM WOOD.
TO PELLET.
TO HIGHER VALUE.
```

Packaging, warehouse, logistics and circular-economy assets are no longer the
primary narrative endpoint. They may stay in the manifest only as legacy slots
or future optional modules.

## Live Target Assets

| Chapter | Primary asset direction |
|---|---|
| Sustainable Forest | Procedural canopy, trunks, forest floor, atmosphere particles |
| Raw Wood | Logs, offcuts, selected wood resources, chip-prep material |
| Wood Chips | Instanced chips, screening deck, chip rain and separation particles |
| Wood Particles | Hammer mill, sawdust/fiber particles, process lighting |
| Dry Biomass | Rotary dryer, steam/haze, controlled moisture visual language |
| Preparation | Conditioner vessel, steam nozzles, prepared biomass stream |
| Pelletizing | Ring die, rollers, extrusion strands, pellet-forming proof |
| Wood Pellet | Counterflow cooler, pellet bed, finished conventional pellet state |
| Value Upgrading | Product selection ring, technology gate, value handoff arcs |
| Thermal Upgrading | Controlled thermal chamber, heater rings, airlock, instrumentation |
| Torrefaction | Sealed reactor tube, oxygen-limited atmosphere, color/material change |
| Value Creation | Pale pellet, technology core, black pellet, comparative value bridge |
| Black Wood Pellet | Premium product plinth, dense dark material, thermal proof halo |
| Advanced Bioenergy | Value ladder and final Black Wood Pellet proof point |

## Upgrade Priorities

1. **Hero pellet material fidelity:** preserve compressed wood-fiber detail,
   improve torrefied dark-product sheen and avoid a burnt/dirty read.
2. **Process credibility:** keep chambers sealed, instrumented and controlled;
   heat should read as technology, not combustion.
3. **Value visualization:** arcs, ladders and comparison elements should clarify
   higher value without returning to shipping or generic sustainability claims.
4. **Lighting consistency:** warm industrial proof lights plus cool precision
   accents; no final green circular-economy emphasis.
5. **Performance:** keep procedural/instanced geometry as default, with GLB or
   photography only as an upgrade path.

## Manifest Discipline

- `public/asset-manifest.json` is the only active manifest.
- `public/assets-manifest.json` was removed as an obsolete duplicate.
- Legacy assets may remain only with `status: "slot"` and a clear fallback
  note explaining they are not part of the current target narrative.
- New target assets must include chapter, source, status, fallback and
  optimization notes before implementation is considered complete.
