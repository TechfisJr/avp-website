# 05 — 3D Asset Production Plan

Classification (see `public/asset-manifest.json` for the full inventory):
A Custom 3D Model · B Spline Scene · C Procedural Three.js · D Photography ·
E Video · F SVG/UI · G AI-generated · H Reusable Shared

## Production decision
This build ships **100% procedural (C) + SVG (F)** assets, generated in code
at runtime. Rationale:
- Zero network weight for geometry (the entire world costs ~0 KB of downloads;
  it is math). Draco/Meshopt budgets in `10-performance-strategy.md` apply to
  the optional authored-model upgrade path (A), which the manifest tracks with
  `status: "upgrade-path"` and a procedural `fallback` that is already live.
- Every asset is real and on screen from day one — no placeholders.

## Procedural asset recipes

### Hero & product
- **Hero pellet (H/C):** `CapsuleGeometry(0.5, 1.6)` + custom `ShaderMaterial`;
  triplanar wood-fiber noise (fbm), radial extrusion striations, `uPhase`
  uniform morphs albedo/roughness raw-bark → fiber → compressed → ember-hot →
  torrefied product. One asset, reused in S00 and the transformation beats.
- **Pellet mass (H/C):** `InstancedMesh` capsules — cooler bed 3,000 (desktop)
  / 900 (mobile); streams use the shared GPU particle engine with capsule
  sprites. Per-instance hue jitter via `instanceColor`.

### Biomass
- **Logs:** instanced open cylinders, vertex-noise displaced bark shader,
  ring-texture end caps (procedural canvas texture).
- **Wood chips:** instanced low-poly tetrahedra/shards, 2-tone vertex color.
- **Sawdust / fibers:** GPU points, curl-noise turbulence, 1px–3px size ramp.
- **Shavings:** instanced helix ribbons (`TubeGeometry` on a spiral curve), few.

### Machinery (shared kit-of-parts, H)
`materials/industrial.ts` exports brushed-steel, safety-amber, dark-housing
PBR materials + a `Frame`, `Hopper`, `Duct`, `Guard` primitive kit. Machines:
- **Screen deck:** inclined slotted box (shader-cut slots), spring mounts,
  sinusoidal vibration in `useFrame`.
- **Hammer mill:** housing + rotating drum with hammer plates, intake hopper.
- **Rotary dryer:** 14m ribbed cylinder (radial `TorusGeometry` ribs), riding
  rings, slow axis rotation, inlet heat-glow emissive.
- **Conditioner:** vertical vessel + paddle shaft + steam nozzles.
- **Pellet mill:** ring die (`CylinderGeometry` with instanced hole plugs +
  emissive bore rim), two rollers, extrusion strands (scaling capsules).
- **Counterflow cooler:** glass-walled bin (transmission material) over a
  discharge grid, pellet bed inside.
- **Conveyors (H):** parameterized belt module (rails, rollers, scrolling
  UV-striped belt shader) reused across pelletizing, cooling and upgrading.
- **Value upgrading gate:** selection ring, completed pellet bed, technology
  handoff portal and warm value-flow arcs.
- **Thermal upgrading chamber:** sealed entry conveyor, transparent preheat
  tunnel, heater rings, rotating airlock door and instrumentation panel.
- **Torrefaction chamber:** sealed reactor tube, heater rings, controlled
  atmosphere and pellet-gradient material change.
- **Value creation bridge:** pale pellet cluster, torrefaction core, black
  pellet cluster and comparative value markers.
- **Black Wood Pellet product hero:** premium plinth, darker dense-pellet
  material state, comparison ghost and thermal proof halo.
- **Advanced bioenergy close:** value ladder from wood to pellet to higher
  value, Black Wood Pellet proof point and final brand-close arcs.
- **Material flow bridges:** world-space transition objects in
  `src/three/bridges/`, mounted outside station groups and visible only during
  camera travel windows.

### Effects (all C, one shared engine)
`fx/ParticleField` — a single BufferGeometry points system with per-use config
{count, spawn volume, velocity field, curl strength, size, color ramp, opacity
over life, gravity}. Instances: spores, dust motes, chip rain, sawdust burst,
steam, controlled-atmosphere haze, heat motes, ember rise and value particles.
Value arcs use `TubeGeometry` + dash shader instead.

### SVG/UI (F)
Wordmark, progress-rail ticks, scroll cue, QC scan-ring, section eyebrow tick,
noise/grain overlay (SVG turbulence) — authored in `public/icons/`.

## Upgrade path (A/B/D/E — tracked in manifest)
If photoreal models are later commissioned: export GLB → `gltf-transform`
Draco + Meshopt + KTX2; drop into `/public/models`; each station component
accepts a `model` prop that swaps the procedural group for the GLB while
keeping animation hooks. Photography/video (D/E) slots should support source,
process and product proof only; packaging/logistics plates are no longer part
of the primary target narrative.
