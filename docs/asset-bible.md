# Asset Bible - Target Narrative Inventory

Companion to [`docs/05-asset-production-plan.md`](./05-asset-production-plan.md).
The structured source of truth is
[`public/asset-manifest.json`](../public/asset-manifest.json).

## Narrative Rule

Every active core asset should support the AVP Wood Pellet process:

```text
RAW MATERIAL STORAGE
-> WOODS CHIPPING
-> WET GRINDING
-> BUFFER STORAGE
-> DRYING
-> RECOVERY
-> DRIED GRINDING
-> PELLETIZER
-> FINISHED PRODUCT
```

Torrefaction, value upgrading and Black Wood Pellet assets are optional
downstream extension slots after the finished product unit. They must not be
presented as required steps in the nine-unit core line.

## Live Target Assets

| Unit / Chapter | Primary asset direction |
|---|---|
| Raw material storage Unit | Loaded log truck, receiving yard, staged logs, large plant context |
| Woods chipping Unit | Realistic chipper/feed table, grapple or handler, elevated conveyor into warehouse chip pile |
| Wet grinding Unit | First grinder for moist chips, wet particles, enclosed feed path |
| Buffer storage | Intermediate bin/silo/buffer bay, level indicator, controlled feeder to dryer |
| Drying Unit | Dryer or drying line, moisture haze, controlled exhaust and dry material outlet |
| Recovery Unit | Cyclone/filter/separator logic, usable dry material return and dust/off-size reject |
| Dried grinding Unit | Second dry grinder, final particle consistency proof, enclosed dust control |
| Pelletizer Unit | Pellet mill/ring die, feed inlet, extrusion or pellet discharge proof |
| Finished product Unit | Finished pellet collection, product bed/bin, quality-ready output |
| Optional upgrade path | Separate downstream value-upgrading route only after Unit 9 |
| Optional torrefaction | Controlled thermal-treatment extension, not part of the core line |
| Black Wood Pellet | Advanced product proof after optional treatment |
| Advanced bioenergy | Final brand close separating core line from optional upgrade |

## Upgrade Priorities

1. **Process credibility:** rebuild missing/mismatched machines in the correct
   order: buffer, recovery, dried grinding, pelletizer, finished product.
2. **Factory continuity:** keep the chipping machine partly outside the large
   hall and carry later stations inside the same plant instead of switching to
   disconnected backgrounds.
3. **Machine fidelity:** match the real chipper/conveyor/handler references
   before polishing later optional product scenes.
4. **Lighting consistency:** warm industrial proof lights plus restrained cool
   accents; no one-note palette and no top-down station shots.
5. **Performance:** keep procedural/instanced geometry as default, with GLB or
   photography only as an upgrade path.

## Manifest Discipline

- `public/asset-manifest.json` is the only active manifest.
- Legacy asset names may remain only where component filenames are still being
  used as migration slots.
- New target assets must include chapter, source, status, fallback and
  optimization notes before implementation is considered complete.
