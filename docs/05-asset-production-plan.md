# 05 - 3D Asset Production Plan

Classification (see `public/asset-manifest.json` for the full inventory):
A Custom 3D Model, B Spline Scene, C Procedural Three.js, D Photography,
E Video, F SVG/UI, G AI-generated, H Reusable Shared.

## Production Decision

This build ships procedural (C) + SVG (F) assets generated in code at runtime.
The authored-model path remains available for later GLB upgrades, but the live
experience should already read as a real continuous factory line.

## Core Process Asset Recipes

### Hero & product

- **Hero pellet (H/C):** compressed wood-fiber pellet material used for the
  opening and final product proof only. It should not imply black pellet or
  torrefaction inside the core nine-unit process.
- **Pellet mass (H/C):** instanced capsule pellets for finished product bins,
  beds or discharge streams after the pelletizer.

### Biomass

- **Logs:** instanced open cylinders with bark sides and cut end caps.
- **Wood chips:** irregular flake geometry for the chipping unit and chip pile.
- **Wet particles / fibers:** GPU points and small fiber ribbons for wet
  grinding output.
- **Dry particles:** lighter sawdust/fiber streams after drying and recovery.

### Machinery

- **Raw material storage Unit:** loaded log truck, receiving yard, staged log
  piles and a large factory-hall context.
- **Woods chipping Unit:** reference the real machine: blue feed table/hopper,
  red chipper drum area, elevated discharge conveyor, chip pile inside the
  warehouse, and a handler/grapple beside the line.
- **Wet grinding Unit:** enclosed hammer/grinding equipment for moist chip
  feed. This is the first grinding step only.
- **Buffer storage:** bin/silo/buffer bay after wet grinding and before drying,
  with level mass and controlled feeder path.
- **Drying Unit:** dryer or drying line with moisture haze, exhaust logic and
  dry biomass outlet.
- **Recovery Unit:** cyclone/filter/separator system that recovers usable dry
  material and rejects dust/off-size fractions.
- **Dried grinding Unit:** second grinder for dry recovered biomass, with dust
  control and final particle consistency.
- **Pelletizer Unit:** pellet mill/ring die, feed inlet and pellet discharge
  proof.
- **Finished product Unit:** finished pellet bed/bin, collection or storage
  proof as the core product endpoint.
- **Conveyors (H):** parameterized belt module reused between machines. Use
  conveyors/chutes/bins for handoffs instead of uncontrolled particle bursts.

### Optional extension assets

Value upgrading, torrefaction, Black Wood Pellet and advanced bioenergy scenes
may remain as downstream extension modules after Unit 9. They should not be
described as part of the core nine-unit line.

## Effects

`fx/ParticleField` remains the shared GPU particle system for dust, chip rain,
steam/haze, heat motes and ambient factory particles. Effects must support
physical machine behavior: chip discharge goes up a conveyor then falls into a
pile; material does not fly randomly across the scene.

## SVG/UI

Wordmark, progress rail ticks, scroll cue, scan ring, section eyebrow tick and
grain overlay remain authored SVG/UI assets.

## Upgrade Path

If photoreal models are later commissioned: export GLB -> `gltf-transform`
Draco + Meshopt + KTX2; drop into `/public/models`; each station component can
swap the procedural group for the GLB while keeping animation hooks.

Prioritize commissioned models in this order:

1. Realistic woods chipping machine + handler + warehouse entrance.
2. Buffer storage, dryer, recovery and dried grinding chain.
3. Pelletizer and finished product unit.
4. Optional torrefaction / black pellet extension.
