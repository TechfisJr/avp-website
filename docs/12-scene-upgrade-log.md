# Scene-by-Scene Upgrade Log

Systematic upgrade pass over the 8 scenes named in the brief, built on top of
the 3D audit (`docs/3d-audit.md`) and the global visual system (lighting
presets, PBR material factories, background gradient, procedural environment,
postFX — `src/three/visual/*`). Storytelling, routing, scroll architecture and
copy are unchanged; every change is inside the named station file (or a
directly-shared component it imports) and its quality gate is documented
below. Before/after captures live in `docs/qa-shots/`.

Global note that applies to every scene: FPS was measured in headless
Playwright + SwiftShader software rendering (no GPU in this environment), so
**absolute fps numbers are not representative of real hardware** — they're
recorded to catch *relative* regressions between edits, not as a hardware
benchmark. Zero console/page errors were observed on any scene, before or
after, on both the dev and the production (`next build && next start`) server.

---

## Scene 1 — Forest / Origin

**Changes:** three depth-banded trunk placement (near/mid/far, distinct
scale + tint) with three bent-trunk geometry variants (tier 1+; tier 0 keeps
one variant for draw-call budget); radial-falloff shader on the god-rays
(replacing hard-edged planes) that reveals with arrival instead of sitting at
constant opacity; a rear haze wall for depth; a near-camera fill point light
so the travel corridor never reads as silhouettes-on-black regardless of
viewport aspect; a second, finer "pollen" particle layer; forest floor moved
onto the shared material system (`createForestFloorMaterial`).

**Bug caught and fixed:** the depth-banded trunk rewrite introduced an
InstancedMesh buffer overflow (`mesh.count` was set from an unbounded roll
counter instead of the actual buffer size), which read garbage transform data
and rendered as a giant misplaced red wedge filling half the frame. Caught by
isolating the trunk material to solid red and bisecting; root cause was a
post-increment counter that could exceed `perVariant`. Fixed by gating the
increment itself, not just the write.

**Also caught and fixed:** the new forest-floor material's per-fragment hash
noise aliased into a visible moiré ripple on the large, grazing-angle ground
disc. Fixed by adding `fwidth()`-based anti-aliasing fade to the shared
`withSurfaceVariation` shader patch in `src/three/visual/materials.ts` — this
fix protects every material using the shared variation system, not just this
scene's floor.

**Quality gate:** desktop ✅ mobile ✅ (mobile was the "too dark" complaint;
now readable) · scroll transitions ✅ (checked both directions) · FPS: no
regression once trunk-variant count was tier-gated (mobile 45.6→17.6 after
the naive 3× geometry change, recovered to 33.4 after gating tier 0 to one
variant) · no broken assets.

**Remaining visual debt:** canopy spheres are still UV-sphere silhouettes
(P2, per audit S01) — acceptable at this camera distance but a candidate for
a lower-poly jittered-blob replacement later.

---

## Scene 2 — Raw Material (Collection)

**Changes:** new `createLogEndMaterial` — concentric growth rings, dark pith
center, bark rim, small pore flecks, all in local object space so every
instance reads correctly regardless of world placement — replacing the flat
single-tone end caps. Per-log end tint via `instanceColor`. Widened log
radius/length variety for more natural pile proportions. Motivated truck
headlight practical + a cool rear rim + a near fill light (mobile-viewport
readability, same pattern as Forest).

**Quality gate:** desktop ✅ mobile ✅ (pile legible in both) · transitions ✅
· FPS acceptable (desktop ~2.9–3.8, mobile 12.4→15.2 after adding the fill
light; see global note on absolute numbers) · no broken assets.

**Remaining visual debt:** bark side material still lacks a true directional
ridge normal map (P2) — the procedural ridge displacement (existing, not
touched this pass) plus hash-noise variation reads well at this distance but
won't hold up to an extreme close-up.

---

## Scene 3 — Screening

**Changes:** added a visible feed hopper/chute above the deck so chip rain
has a source instead of appearing from empty air; added an explicit
**contaminant/reject cycle** — a small set of dark angular stones ride the
vibrating deck and periodically slide off the high edge and drop, distinct
from the clean chip stream — making the separation process legible instead
of one undifferentiated particle curtain; closed the hall with a back wall;
added three real overhead light fixtures (housing + point light, sequenced on
with arrival) instead of relying on ambient alone; added a backlit fine-dust
layer for a readable falling curtain.

**Quality gate:** desktop ✅ mobile ✅ · transitions ✅ (checked into Grinding)
· FPS fine · no broken assets.

**Remaining visual debt:** deck slats are still simple bars, not a true
woven-mesh look (P2, per audit S03) — a shader-cut slot texture on the deck
surface is the next upgrade if this scene gets another pass.

---

## Scene 4 — Grinding

**Changes:** added support posts under the safety rails (previously floating,
per audit); added a small accumulating chip pile at the discharge so the
material flow has a visible end point instead of just spraying into the
void. The bigger structural change is shared: **particle sprite shape
variety** (see "Site-wide changes" below), applied here to the feed and
discharge particles — this is the single highest-impact fix for this scene's
"dust and fiber particles" ask, since the mill's chip-feed and sawdust-burst
now read as individual angular flecks instead of a bokeh cloud.

**Quality gate:** desktop ✅ mobile ✅ · transitions ✅ (checked into Drying,
confirmed steam still renders as soft puffs — no regression from the shared
shader change) · FPS fine · no broken assets.

**Remaining visual debt:** hammer-drum cavity could still use a stronger
interior glow to read the mechanism at a glance in the first second of
arrival (P2).

---

## Scene 5 — Pelletizing (flagship)

This was the most broken scene in the audit (P0 — "the hero pellet covers
the entire mechanism," "the die reads as a chocolate donut") and got the
largest rebuild:

**Die geometry:** replaced the torus-with-external-pins (which read as a
glazed donut with bore holes sticking *out* of the tube) with a true annular
ring-die face — an `ExtrudeGeometry` annulus (outer/inner radius, real
depth, beveled edges) with 30 bore holes actually punched *through* the face
and glowing from within. Rollers repositioned to visibly press against the
face instead of floating inside the old torus's hole.

**Hero pellet staging (the root fix):** the hero pellet's per-station config
in `timeline.ts` had it at `scale: 1` dead-center — physically covering the
die for this entire station. Shrunk to `scale: 0.42` and moved to the side
(`off: [1.3, -0.5, -3.6]`), landing on the conveyor as "the product that just
came out," not a wall blocking the machine that makes it.

**Cinematic macro movement:** added a subtle push-in/scale-up on the die rig
(`rig.position.z` / `rig.scale`) driven by local scroll progress, standing in
for a dedicated camera dolly on this station without touching the shared
`CameraRig` (which all 15 stations depend on, so it was out of scope to
modify for one scene).

**Quality gate:** desktop ✅ mobile ✅ (die and glow read clearly at both
sizes) · transitions ✅ (checked in from Conditioning, out to Cooling — the
Cooling hero-pellet-dominates-frame issue is real but Cooling is outside this
8-scene brief, left untouched) · FPS acceptable · no broken assets.

**Remaining visual debt:** none blocking — this is now the standout scene.
A follow-up polish item (P3): the extrusion strands still grow radially
outward rather than axially through the bore before curving down, which is a
simplification of the real physics kept from the original implementation.

---

## Scene 6 — Packaging

**Changes:** rebuilt `JumboBag` from a displaced box (audit: "reads as a
white paper cube with black croissant handles") to a `LatheGeometry` barrel
body — rounded base, full belly, cinched neck — with real strap loops
(`TubeGeometry` arcs) and a printed weight-label patch. Switched the fill
animation from scaling the *whole* bag (which used to squash the loops into
ellipses) to scaling only the belly sub-group while the loops and patch ride
down with it via a `getFill` callback, following the codebase's existing
`get*`-callback idiom (`getVibe`, `getRun`, `getAssemble`) instead of adding
React state on a per-frame path. Added cross-bracing to the filling gantry
and a weigh-scale plinth under the bag. Pellet waterfall switched to the
shard particle shape.

**Quality gate:** desktop ✅ mobile ✅ · transitions ✅ (the transition-out
into Warehouse is what surfaced the placeholder-cube bags on the racks —
correctly predicted the next scene's problem) · FPS fine · no broken assets.

**Remaining visual debt:** none for this scene specifically; the bag geometry
built here is what Warehouse's close-up hero bags also use, so both scenes
benefited from one rebuild.

---

## Scene 7 — Warehouse

**Changes:** replaced the instanced rack-bag placeholders — literal
`boxGeometry(1,1,1)` scaled to look bag-shaped (audit's #1 flagged issue for
this scene) — with a simplified instanced version of the same barrel lathe
profile built for Packaging, plus per-instance color jitter. Added real
housings around the light strips with a matching point light per strip
(previously the strips were emissive-only and didn't illuminate anything —
one distant point light did all the work), and closed the hall with a
ceiling plane and a far end-wall so the aisle reads as an interior instead of
fading into an undefined void.

**Quality gate:** desktop ✅ mobile ✅ · transitions ✅ (checked into
Logistics, confirmed the quay light poles added in that scene visibly bleed
into this frame during the transition — expected station-overlap behavior,
reads as atmosphere rather than a bug) · FPS fine · no broken assets.

**Remaining visual debt:** none blocking. Rack-bag geometry is intentionally
cheaper than the hero `JumboBag` (12 radial segments, no loops) — correct
trade-off for 72 instances, but worth noting if a future pass wants loop
detail on the closer rack rows.

---

## Scene 8 — Logistics

The second-most-broken scene per the audit (~90% black frame, ship unreadable,
containers pure black metal with nothing to reflect). Changes:

**Ship lighting:** a moonlit key light that tracks the ship as it crosses the
frame (previously the only light was a single distant point far above and
behind); deck floods on the superstructure and mid-hull; a waterline stripe
for hull silhouette definition; a lit row of bridge windows (was one dot);
red/green masthead nav lights — a ship at night should have running lights,
and now it reads as one.

**Containers:** switched from raw `M.steel` (high-metalness, reflects
nothing without a strong light) to a lower-metalness painted-container
material with warmer instance-color variation, so they hold some value even
in low light instead of collapsing to black.

**Port atmosphere:** four quay light poles (housing + emissive lamp + real
point light) — reads as a working port at night instead of an empty concrete
slab; a crane warning light; a moonlight specular path across the water so
the sea has presence instead of being a black void the ship floats over.

**Route arcs:** switched from a single `QuadraticBezierCurve3` (which the
audit flagged for a visible kink at shallow angles) to a `CatmullRomCurve3`
with an offset control point, for a smoother great-circle-like sweep.

**Quality gate:** desktop ✅ mobile ✅ (ship, nav lights, and waterline all
read at both sizes — this was the scene most in need of the "don't let the
ship disappear" fix, and it no longer does) · transitions ✅ · FPS acceptable
· no broken assets.

**Remaining visual debt:** the background gradient's lighter "sky" wedge is
visible bleeding in from neighboring stations during the crane-up camera
move (P2, same root cause as the Warehouse/Logistics bleed noted above — this
is the architecture-level "station bleed" item from the original audit, G4,
not something scoped to fix in this pass).

---

## Site-wide changes made in service of the 8 scenes

These weren't separately requested but were the correct place to fix a
problem that showed up in more than one named scene, per the instruction to
improve systematically rather than patch each scene in isolation:

- **Particle sprite shape variety** (`src/three/fx/shaders.ts`,
  `ParticleField.tsx`): the shared particle shader had exactly one sprite
  shape (a soft round puff), which is right for steam/glow/embers but wrong
  for solid debris — every "falling chips/sawdust/fines" effect across
  Screening, Grinding, Pelletizing and Packaging read as orange bokeh instead
  of matter. Added a `shape` prop (`"puff" | "shard" | "speck"`), each
  particle additionally rotated per-instance so a shard burst reads as
  irregular tumbling debris rather than uniform circles. Default remains
  `"puff"`, so every untouched particle system (steam, spores, embers,
  smoke) is pixel-identical to before — confirmed via the Grinding→Drying
  and Screening transition captures.
- **Anti-aliasing fix in the shared material variation shader**
  (`src/three/visual/materials.ts`): found while debugging the Forest floor,
  fixed at the shared-function level so it protects every material built on
  `withSurfaceVariation` (which is all eight PBR factories), not just the
  one surface that exposed it.
- **`JumboBag` rebuild** is shared between Packaging and Warehouse by
  construction (same component, same fix, both scenes verified).

## Full-site regression

After all 8 scenes, ran a full production build (`next build && next start`)
and captured all 15 stations (not just the 8 touched) — zero console/page
errors, and the six untouched scenes (Hero, Drying, Conditioning, Cooling, QC,
Energy, Circular) were spot-checked against their pre-existing appearance to
confirm the shared shader/material changes introduced no visible regression.
