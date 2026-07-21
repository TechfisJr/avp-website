# 3D Visual & Technical Audit

**Method.** Full code review of `src/three/**` (core, kit, fx, all 15 stations),
`src/lib/timeline.ts`, `src/components/Overlay.tsx`, plus live captures of every
station at its dwell midpoint (desktop 1440×900, dev build, zero console errors).
Reference renders: [docs/audit-shots/](./audit-shots/) — `00-hero.png` … `14-circular.png`.

**Verdict.** The architecture (single fixed canvas, dwell-mapped camera spline,
mutable scroll store, one particle program, station culling) is production-grade
and should not change. The *image* is a prototype: one over-scaled hero prop
dominates half the site, machinery reads as toy primitives, materials have no
texture/environment response, and five scenes fall below legibility in exposure.
Every problem below is fixable inside the existing system.

---

## Global systemic findings (affect every scene)

### G1 · The hero pellet sabotages the compositions it appears in — **P0**
`hero-pellet.glb` (275 KB) is camera-anchored at ~3 m with scale 1 → it fills
**50–70% of the frame** in Hero, Pelletizing, Cooling, QC, Energy and Circular
(see `07-pelletizing.png`, `09-qc.png`, `13-energy.png`). It sits *on top of*
headlines, hides the ring die, the cooler, the scan moment and the furnace —
the exact subjects those scenes exist to show. Surface read: displacement is
too strong and low-frequency, striations read as rope coils, the end-cap swirl
reads as a cinnamon roll; at this screen size it reads as **bread, not a Ø6 mm
compressed pellet**.
**Fix (staging, no new asset):** shrink to 0.35–0.5 scale, re-stage per station
in the third of the frame opposite the copy (timeline `hero.off` already
supports this), and let it *share* frame with machinery, never cover it.
**Fix (asset):** regenerate GLB — cylinder with ±1.5% radial displacement,
striation frequency ×4, chamfered sheared ends, no cap swirl; polish pass in
the shader (specular tightening) rather than more displacement.

### G2 · No environment reflections → all PBR falls flat — **P0**
`Atmosphere` has ambient/hemi/key/fill/rim but **no environment map**. Metal
(`metalness .85`) with no envmap renders near-black or plasticky — this is why
the dryer drum reads as a gold pipe, the cooler cone as blue vinyl, housings as
matte rubber. Add one small studio HDRI (≤1 MB, PMREM once, `scene.environment`
with per-material `envMapIntensity` 0.2–0.6) — the single highest-leverage
material upgrade on the site; costs one texture fetch.

### G3 · Exposure floor & subject separation — **P0**
Collection, Screening, Conditioning, Cooling and Logistics average below ~4%
bright-pixel ratio; main objects silhouette into the fog (`02`, `03`, `06`,
`12`). The palette *should* be dark, but each scene needs a guaranteed
key→subject contrast: per-station key light aimed at the focus point exists,
yet intensities are tuned for the old flat materials and fog eats them. Add a
per-station `rimIntensity`/practical budget in `timeline.ts` and validate with
the smoke script's luma ratios (extend it to all 15 stations, assert
`brightRatio ≥ 0.01` and headline-zone contrast).

### G4 · Station bleed breaks the "one world" illusion — **P0**
`isActive = ±1 window` + low fog density means neighbors are visible in the
wrong composition: forest poles hang in the hero void (`00`), the pelletizer
die floats in Conditioning (`06`), warehouse racks stand behind Packaging
(`10`), a rack slab hovers over Logistics (`12`). Options (combine): raise
inter-station fog during travel, offset neighbor stations laterally out of
each other's sightlines in `timeline.ts`, and per-station "reveal" fade
(group opacity ramp on `local`).

### G5 · Particles read as bokeh confetti, not matter — **P1**
One shared program is right, but every system uses the same soft-disc sprite:
chips/pellet streams become orange blur balls (`03`, `07`, `10`). Add 2–3
sprite shapes in-shader (sharp shard, capsule-ish, soft puff selected by
`vSeed`), tighten `smoothstep(0.5, 0.06→0.28)` edge for solids, cap
`gl_PointSize` near camera, and use `NormalBlending` for solids (already done)
with darker colorB so streams read as falling material, not light.

### G6 · Overlay/HUD collisions — **P1** (DOM, not 3D, but visible in every shot)
The progress-rail active label collides with left-aligned section eyebrows
(`01`, `03`, `05`); the wordmark SVG clips to "AVP BIOMA"; the QC scan ring is
nearly invisible (opacity ×0.85 of a low-alpha ring on a bright pellet);
Packaging's datapoint is occluded by the hero pellet. Fixes: hide rail label
while a section is visible on the left (or move rail to `right` on
left-aligned sections), fix wordmark viewBox/width, raise scan-ring stroke
contrast, and never stage the pellet inside the copy column (G1 staging fix).

### G7 · Machinery is credible in silhouette, toy-like in close-up — **P1**
The kit-of-parts approach is correct for a stylized-industrial look, but
close-up scenes expose primitive DNA: unbeveled `BoxGeometry` edges catch no
light. A shared `bevelBox()` helper (RoundedBoxGeometry, r≈0.02–0.04) +
greeble pass (bolts, seams, pipe flanges — Grinding already shows how well
this works) would lift every machine for ~zero download cost.

---

## Per-scene audit

Legend: each scene lists only what deviates from the global findings above.

### S00 · Hero — `00-hero.png`
1. **Implementation:** void + 2 practicals + glow disc + dust/dissolve `ParticleField`s; protagonist is the camera-anchored GLB.
2. **Assets:** `hero-pellet.glb`, particle systems, glow disc.
3. **Visual problems:** pellet crosses *through* the headline (type sits half-behind warm object → contrast failure); forest trunks visible top-right before their scene (G4); pellet reads bread-like at this size (G1); bottom third empty.
4. **Technical problems:** glow disc is a flat circle that catches the eye as a UFO edge when drift moves the camera; scale-1 GLB + `renderOrder 5` guarantees overlap with centered copy.
5. **Replace:** hero GLB (regenerate per G1).
6. **Improve:** stage pellet at ~0.45 scale, offset `x +0.9`, headline column left; dissolve burst is already good.
7. **Materials:** shader spec highlight tighter (`pow 38 → 90`, intensity ×2 on cap facets); subtle anisotropic sheen along striations.
8. **Lighting:** current two-practical setup is good; add faint cool floor bounce so the void has depth gradient.
9. **Camera:** push-in is fine; bias lookAt `y +0.3` so the pellet sits in upper-right golden-ratio node, clear of copy.
10. **Perf risks:** none (2 lights, 2 particle systems).
11. **Priority: P0** (first impression + G1 epicenter).

### S01 · Forest — `01-forest.png`
1. **Implementation:** instanced trunks/canopy blobs/branches/leaf cards, 4 god-ray planes, 2 practicals, spores.
2. **Assets:** 62 trunks, ~186 canopy spheres, 128 branches, 230 leaf cards (all instanced), ray planes.
3. **Visual:** mood is 80% there — best scene. Trunks are straight capped poles (no taper break, no root flare); canopies read as dark blobs pasted mid-air; leaf cards float unattached (bottom-right `1370,815` blob); ray planes show hard edges top-left.
4. **Technical:** canopy spheres share one material tone → mass reads flat where rays hit; ray planes are static quads (visible seams when camera drifts).
5. **Replace:** nothing — this scene should stay procedural.
6. **Improve:** trunk geometry (3-segment taper + noise bend, root flare ring); cluster canopies along branch cones; attach leaf cards to canopy shells; fade ray planes with fresnel-style edge falloff shader.
7. **Materials:** bark needs a normal-ish response — cheap win: vertex-color AO bands (already has vertexColors) + higher roughness variance; canopy `emissiveIntensity` 0.28 → keyed to ray proximity.
8. **Lighting:** good; add one narrow spot as true volumetric anchor behind the two hero trunks camera-left.
9. **Camera:** dolly corridor works; lower camera 0.3 and add distant fog bank plane for depth layers.
10. **Perf:** 4 instanced draws + rays — cheap. Leaf card count fine.
11. **Priority: P2** (polish an already-working scene).

### S02 · Collection — `02-collection.png`
1. **Implementation:** `Logs` (assembling), `Shavings`, `Truck`, dust motes, ground disc.
2. **Assets:** 26 instanced logs + end caps, 9 helix shavings, primitive truck.
3. **Visual:** scene floats in blackness — no ground read (G3); log *ends are flat orange discs* (cartoon); bark is untextured dark cylinder; shavings read as orange spirals scattered on nothing; truck almost invisible top-right; captured mid-assembly, pile looks broken rather than assembling.
4. **Technical:** end-cap material has no ring texture (the manifest promised a procedural canvas ring texture — never built); `Logs` updates matrices every frame even when idle; assembly window (`local 0.1–0.55`) means the *dwell* midpoint still shows scatter.
5. **Replace:** truck with a mid-detail GLB (shared with Logistics) — silhouette primitives don't survive this close.
6. **Improve:** logs (keep instanced; add bark displacement shader + procedural ring-texture caps); shavings (halve count, tint darker, ground them next to the pile).
7. **Materials:** bark normal/roughness via triplanar noise in `onBeforeCompile`; end rings via 256² canvas texture (near-free).
8. **Lighting:** truck headlights should be real spot cones lighting the pile (motivated key!); add cool moon rim from behind pile; ground needs a pool of light to sit objects.
9. **Camera:** finish assembly by `local 0.45`; frame pile lower-left, truck beams raking across it toward camera.
10. **Perf:** per-frame matrix writes ×26 — gate on `state.current.active`.
11. **Priority: P1**.

### S03 · Screening — `03-screening.png`
1. **Implementation:** `ScreenDeck` + static `Chips` on deck + 2 particle systems (chip rain, fines), 4 columns.
2. **Assets:** slotted deck primitive, tetra chips, particles.
3. **Visual:** deck floats in a void (G3) — white slats read as piano keys; chip rain = orange bokeh (G5); static chips clump like debris; the industrial hall promised by columns is invisible.
4. **Technical:** chip-rain spawn box is offset from the deck (particles land beside it); fines fall from mid-air, not through the deck plane.
5. **Replace:** nothing structurally.
6. **Improve:** deck (bevel, mesh-grid shader on slats instead of solid bars, feed chute above so the rain has a source); add back wall + floor with practical strip lights to give the hall depth.
7. **Materials:** deck steel needs envmap (G2) + wear streaks along slats (shader stripe noise).
8. **Lighting:** one hard down-light over the deck (the "inspection" light), cool fill; light the falling curtain from behind for readable silhouettes.
9. **Camera:** the promised overhead tilt-down never reads — raise arrival Y by 2 and look down 15° more at `local<0.3`.
10. **Perf:** fine.
11. **Priority: P1**.

### S04 · Grinding — `04-grinding.png`
1. **Implementation:** housing + panel + painted frame + bolts + drum w/ 12 hammers + hopper + motor/belt + duct + skid + rails, 3 particle systems, 2 practicals.
2. **Assets:** all kit primitives (recently upgraded — visibly the best machine).
3. **Visual:** direction is right; remaining issues: drum reads as dark blob inside cream panel (interior unlit); hopper is a bare cone (no flange/feed throat, `04` top-center); safety-yellow rails float unsupported; teal+yellow+cream palette drifts toy-ward — needs grime unification; sawdust burst is bokeh (G5).
4. **Technical:** duct top-right belongs to Drying's neighbor bleed (G4); camera shake promised in the motion spec is absent.
5. **Replace:** candidate for the single commissioned "hero machine" GLB *if* budget exists — else keep upgrading procedurally.
6. **Improve:** light the drum cavity (small warm point inside), hammer plates with worn-edge vertex color; hopper flange + bolt ring; posts under rails.
7. **Materials:** unify with dirt/AO tint pass; envmap for painted steel (G2).
8. **Lighting:** interior cavity light + harder key from upper-left so the opening reads as the subject.
9. **Camera:** add the spec'd 0.03 rad shake at drum peak (scrub-safe, amplitude × `bell`).
10. **Perf:** bolt meshes are individual draws (~14) — merge into one instanced mesh.
11. **Priority: P1**.

### S05 · Drying — `05-drying.png`
1. **Implementation:** 14 m ribbed rotating drum, inlet glow disc, supports, steam ×3, ember practical.
2. **Assets:** cylinder drum + torus ribs, primitives.
3. **Visual:** composition (diagonal drum + steam) is strong, but the drum reads as a **polished gold/brass pipe** — metalness high + warm key + no envmap (G2); ribs are smooth donuts (should be bolted tyre rings); steam is white popcorn bokeh (G5); inlet fire glow barely registers (the story beat!).
4. **Technical:** drum is one smooth cylinder — no panel seams, so rotation is invisible except at ribs.
5. **Replace:** no.
6. **Improve:** drum shader — weathered galvanized steel (desaturate, roughness noise bands, panel-seam stripes so rotation reads); rib rings → riding rings with support rollers (already half-built); inlet: animated ember shader disc + heat-shimmer cone + stronger red practical.
7. **Materials:** G2 envmap + `roughnessMap`-style procedural bands; emissive inlet keyed to `bell(local)`.
8. **Lighting:** current is close; add cool top skylight strip so the top of the drum separates from the brown fog.
9. **Camera:** tracking shot works; end the move looking into the glowing inlet (payoff frame).
10. **Perf:** fine.
11. **Priority: P2**.

### S06 · Conditioning — `06-conditioning.png`
1. **Implementation:** vessel + dome + base + paddle shaft + 4 nozzles, 2 steam jets, fiber vortex.
2. **Assets:** primitives + particles.
3. **Visual:** vessel is a **featureless black dome** — zero surface information, reads as a void bell (G2+G3 worst case); steam jets fire horizontally as disconnected white puffs; two random pellets float mid-air (HeroPellet travel-blend leak); pelletizer die visible top-left (G4).
4. **Technical:** paddle shaft spins *above* the closed dome — mechanically nonsensical up close; hero pellet `heat 0.4` staging at S06 makes it appear during travel even though `scale` should hide it — check the lerp window.
5. **Replace:** no.
6. **Improve:** vessel — vertical weld seams, bolted man-way hatch, side ladder, pressure-gauge cluster (all kit primitives); move paddles behind a sight-glass window with interior warm light; nozzle jets need cone-shaped fast steam (narrow spawn, high dir velocity, short life).
7. **Materials:** insulated-steel wrap (brushed bands) + envmap; sight-glass emissive interior.
8. **Lighting:** strong rim from camera-right so the vessel silhouette separates; small practicals on the gauge cluster.
9. **Camera:** orbit is fine but arrives too close to a featureless mid-section — raise lookAt to the dome/hatch line.
10. **Perf:** fine.
11. **Priority: P1**.

### S07 · Pelletizing — `07-pelletizing.png` — *the centerpiece*
1. **Implementation:** ring die (torus + 26 emissive bores) + 2 rollers + 22 strand instances + pellet rain + glow motes + conveyor.
2. **Assets:** primitives + particles + belt shader.
3. **Visual:** **the hero pellet covers the entire mechanism** (G1 — worst case); the die reads as a glossy **chocolate donut** (smooth torus + warm key + no envmap); strands are barely visible; extrusion — the money shot of the whole site — never reads; conveyor is a flat black plane band; ember bokeh everywhere (G5).
4. **Technical:** die bores stick out of the torus as emissive pins (should be holes in a flat die *face*); rollers hidden inside the torus are invisible; strand instances scale from zero at the rim without a die face to emerge *from*.
5. **Replace:** the die assembly — this one deserves a real modeled/authored ring-die GLB (flat annular face, chamfered bore array, roller pair) OR a lathe-built procedural v2 with a true bore-hole texture (parallax holes). This is the #1 asset investment on the site.
6. **Improve:** stage the hero pellet *being born*: camera inside the die → strand extrudes toward camera → breaks → becomes the (small) hero pellet. Pellet rain should fall *from the die face* onto the conveyor with capsule sprites (G5).
7. **Materials:** die face machined steel (radial anisotropic brush), bore rims emissive ember; strands matte fresh-pellet tone (lighter than cured pellets).
8. **Lighting:** ember practical *inside* the die ring so bores glow from within; cool rim to hold the machine silhouette.
9. **Camera:** current framing is fine once the pellet is out of the way; add the pull-back beat as rain begins (`local 0.5`).
10. **Perf:** 26 bore meshes → instanced; strands already instanced.
11. **Priority: P0** (flagship scene, currently unreadable).

### S08 · Cooling — `08-cooling.png`
1. **Implementation:** grid base + `PelletBed` (instanced) + glass box + posts + plenum + cone + warm/cool cross-fading lights + steam.
2. **Assets:** 3000-instance bed, glass `MeshPhysical`, primitives.
3. **Visual:** hero pellet covers the right half over the copy (G1); bed reads as **grey gravel in a dark aquarium** — pellet instance colors are swallowed by the teal light + glass tint (G3); blue vinyl cone on the plenum draws more attention than the bed; scene floats in void.
4. **Technical:** `M.glass` opacity .16 double-sided over a dark interior = mud; warm→cool light crossfade happens but both lights sit outside the glass so the *bed* never receives the story's color shift.
5. **Replace:** no.
6. **Improve:** put the warm→cool lights *inside* the bin above the bed; brighten pellet instance HSL (l 0.3–0.48 → 0.38–0.56); glass → thin front pane only (single `MeshPhysicalMaterial` plane with fresnel) or drop transmission look entirely for open-frame cooler (truer to counterflow coolers anyway).
7. **Materials:** bed capsules get the same striation micro-shader as the hero pellet (one material, instanced) so the product is recognizably *the same object* at scale.
8. **Lighting:** steam backlit warm at start of dwell, cool at exit — carries the temperature narrative better than the wall lights.
9. **Camera:** top-down arrival is good; end closer to bed level so pellets fill the lower frame as text appears.
10. **Perf:** transmission material + 3000 instances is the priciest scene — the front-pane simplification also buys perf back.
11. **Priority: P1**.

### S09 · Quality Control — `09-qc.png`
1. **Implementation:** small `ScreenDeck` + thin `PelletBed` + fines + 2 emissive bars + DOM scan ring.
2. **Assets:** reused kit + SVG ring.
3. **Visual:** **hero pellet fills ~65% of the frame** (G1) — the macro beat is right in *concept* but the pellet's bread-like surface can't survive this magnification; scan ring invisible against it (G6); rim-light bars read as floating blue sticks; background lab is a distant clutter smudge.
4. **Technical:** scan ring rotates via `transform` overriding its centering translate each frame (works but couples rotation to translate string); QC HUD values promised in the motion spec (count-ins) don't exist.
5. **Replace:** hero GLB fix is a hard prerequisite (G1) — at macro scale it needs the ×4 striation + pore detail pass.
6. **Improve:** make this a true *lab* macro: dark backdrop plane, pellet at 0.5 scale center-left, calipers/ring light as a modeled prop replacing floating bars; DOM data callouts (Ø, moisture, ash) revealing around the ring.
7. **Materials:** pellet spec pass (tight highlight) is what sells "dense, gleaming".
8. **Lighting:** two-bar rim is the right idea — attach the bars to a visible fixture; add soft top box light like product photography.
9. **Camera:** lock drift to near-zero during this dwell (macro shots amplify handheld); slight rotation around the pellet instead.
10. **Perf:** fine.
11. **Priority: P1** (concept right, execution blocked by G1).

### S10 · Packaging — `10-packaging.png`
1. **Implementation:** gantry + spout + scaling bag + waterfall + dust + conveyor + 3 finished bags.
2. **Assets:** `JumboBag` (displaced box), primitives, particles.
3. **Visual:** bags read as **white paper cubes with black croissant handles** — the single least convincing asset on the site; the *filling* bag scales as a whole (inflating box) instead of filling; pellet waterfall is orange bokeh (G5); warehouse racks bleed behind (G4); hero pellet floats over the paragraph (G1/G6); a giant bag looms at frame-right (scale/staging bug — it's one of the "finished" bags placed in the travel path).
4. **Technical:** `JumboBag` scale-Y trick crushes the strap tori; bag cloth material has zero weave/sheen response (G2).
5. **Replace:** `JumboBag` with a modeled FIBC GLB (cloth-sim once, baked; woven-poly normal + AO; fill morph target) — bags appear in 3 scenes and near camera; highest-value single model after the pellet/die.
6. **Improve (interim):** lathe-based bag v2 (rounded shoulders, cinched top, strap loops as extruded ribbons), fill via morph between slack/full geometries not scale.
7. **Materials:** woven poly = white with 0.35 sheen-style spec + fine cross-hatch normal (procedural canvas), stencil print "AVP 1000 kg" decal — instant realism + branding.
8. **Lighting:** the fill spout needs a task light; keep the rest low-key.
9. **Camera:** low angle is right; move finished-bag row out of the travel path (the looming bag).
10. **Perf:** bags are multi-mesh — instanced bag body + strap batch for the row.
11. **Priority: P1** (P0 for the bag asset itself).

### S11 · Warehouse — `11-warehouse.png`
1. **Implementation:** floor + instanced rack frames/shelves + instanced bag boxes + 2 close `JumboBag`s + light strips + beacon.
2. **Assets:** instanced boxes throughout.
3. **Visual:** bags-on-racks are **plain white boxes** — reads as cardboard, not FIBC (real pellet warehouses floor-stack bags 2–3 high or rack super-sacks with visible slump); near-camera "hero bags" are enormous brown/white slabs breaking scale; light strips float with no housings; one-point aisle idea reads, but the hall has no walls/roof so blackness swallows it (G3).
4. **Technical:** strip `emissiveIntensity` animates a *shared* material — fine, but strips don't illuminate (no matching light), so they read as stickers; beacon light sweeps but has no forklift body.
5. **Replace:** rack bag-boxes → instanced *slumped bag* geometry (one displaced lathe, ~600 tris, instanced 72×) — the whole scene upgrades with one mesh.
6. **Improve:** add corrugated wall planes + roof trusses (instanced) to close the volume; floor markings (aisle lines, shader stripes); hang strip housings; add forklift silhouette under the beacon.
7. **Materials:** bag weave (shared with S10), galvanized rack steel with envmap (G2), sealed-concrete floor with subtle reflection (cheap `MeshStandard` low roughness stripe).
8. **Lighting:** strips should each carry a faint `RectAreaLight`-feel via emissive plane + one shared down-light; keep pools of light / valleys of dark rhythm down the aisle.
9. **Camera:** aisle dolly good; slow to near-stop at dwell for the "calm" beat.
10. **Perf:** watch instanced count if racks extend; currently cheap.
11. **Priority: P1**.

### S12 · Logistics — `12-logistics.png`
1. **Implementation:** ocean plane + quay + truck + crane + ship (hull boxes + instanced containers) + 3 dash-shader route arcs + key light.
2. **Assets:** primitives + tube arcs.
3. **Visual:** **scene is ~90% black** (G3 worst offender) — ship unreadable, ocean invisible, quay a smudge; route arcs render as faint dotted diagonals with a stray V-kink center-frame (control-point artifact); container block bleeds from Warehouse top-left (G4); a mysterious lit slab bottom-center is the *next* station's glow. The "crane up to near-orbital wide" storyboard beat never materializes.
4. **Technical:** containers on the ship are `M.steel` (metal, no envmap → black at night); sea has `roughness .25 metalness .7` but nothing to reflect (G2 again); arcs' `QuadraticBezierCurve3` mid-point makes a kink at shallow angles — needs `CatmullRom` through 3+ points or great-circle sampling.
5. **Replace:** ship with a stylized-but-authored bulk-carrier GLB (low poly is fine — it's the *lighting* that must change); containers are wrong for a pellet bulk carrier anyway — replace stacks with hatch covers + deck cranes.
6. **Improve:** moonlight path on the sea (animated normal-ish shader stripe or simple specular streak plane), nav lights + bridge windows emissive on the ship, port lights string on the quay horizon, arc geometry fix, and a soft horizon gradient plane so "sea meets sky" exists.
7. **Materials:** sea = dark `MeshStandard` + moving procedural normal in `onBeforeCompile`; hull matte with waterline stripe.
8. **Lighting:** cold moon key from behind-left of ship (rim the superstructure), warm sodium quay practicals for contrast.
9. **Camera:** crane-up exists in data but reads as nothing because nothing is lit at altitude — light first, then extend the crane move higher with the arcs drawing at apex.
10. **Perf:** big planes cheap; keep arcs at 3.
11. **Priority: P0** (currently a black screen with dots — lowest-performing scene).

### S13 · Energy — `13-energy.png`
1. **Implementation:** boiler mass + furnace eye (rings + emissive core) + stack + pipes + feed conveyor + 3 particle systems + breathing fire light.
2. **Assets:** primitives + particles.
3. **Visual:** hero pellet blocks the furnace (G1); the furnace eye reads as a **glowing ball behind a chocolate torus** — "Saturn", not a boiler; ember field is even confetti across the whole frame (G5, no depth grouping); pipes bottom-right are floating brown cylinders; boiler mass is an unlit black wall (G3).
4. **Technical:** furnace core is a flat emissive circle — no interior; breathing intensity works but illuminates nothing structured; plume spawns at y≈17 far outside the framed area (wasted particles).
5. **Replace:** no single asset — this scene needs *re-staging*: furnace viewport as a framed dark wall aperture (boiler face with rivet field, sight-glass ring), interior = layered emissive noise shader (fire depth), pellet stream entering frame-left into the glow.
6. **Improve:** ember particles: two systems (near sparse large / far dense small) both spawning from the fire aperture, rising with curl — directional story instead of confetti; give the boiler face panel seams + gauge practicals so the black mass reads as machine.
7. **Materials:** fire aperture shader (fbm ember bed + heat gradient); boiler face dark cast iron w/ envmap.
8. **Lighting:** the fire is the key — everything else rim/fill at 10%; let fire light paint the pellet feed and the floor.
9. **Camera:** approach-the-eye works once the pellet is staged small entering the glow (the storyboard's beat, currently inverted).
10. **Perf:** fine; move plume spawn into frame or cull it.
11. **Priority: P0** (climax scene; currently comic).

### S14 · Circular — `14-circular.png`
1. **Implementation:** ground + dawn glow disc + 3-ring emissive orbit group + leaf motes + ember-to-leaf fade systems.
2. **Assets:** torus rings + particles.
3. **Visual:** leaf motes = green bokeh (G5 — needs actual leaf sprite shape); rings read as a **hand-drawn ellipse doodle** behind the pellet (silhouette + thin torus at grazing angle); hero pellet again center-frame over the headline (G1); dawn disc edge visible top-left; the "loop closes" idea (return to forest framing) doesn't land — no forest elements return.
4. **Technical:** ring group scales/rotates but its Z-tilt makes it cross the pellet awkwardly; ember→leaf color handoff happens in two overlapping systems (reads as noise, not transformation).
5. **Replace:** no.
6. **Improve:** make the orbit *particulate* — leaves flowing along a torus knot path (points constrained to ring parametric, not box+curl) so the ring IS the particles; reprise 3–4 forest trunks fading in at the horizon + moss palette (visual rhyme with S01); pellet small, center, green-rimmed (uGreen already supports).
7. **Materials:** leaf sprite in the particle shader (shaped alpha); rings, if kept, as light streaks (additive dash shader from Logistics) not solid tori.
8. **Lighting:** dawn key from behind-low (silhouette-with-rim of the pellet), green bounce floor.
9. **Camera:** pull-back should end on the S00 framing — currently ends wider and lower; copy the S00 cam offset for continuity.
10. **Perf:** fine.
11. **Priority: P2**.

---

## Remediation roadmap (prioritized)

### P0 — Critical (the site is judged on these)
| # | Item | Scope | Scenes |
|---|------|-------|--------|
| P0-1 | **Hero pellet v2**: regenerate GLB (×4 striation, ±1.5% displacement, chamfered ends, pore detail) + re-stage at 0.35–0.5 scale opposite copy column in every appearance | asset + `timeline.ts` hero configs | 00,07,08,09,13,14 |
| P0-2 | **Environment map**: 1 studio HDRI ≤1 MB, PMREM, per-material `envMapIntensity` | `Atmosphere` + `kit/industrial.ts` | all |
| P0-3 | **Exposure & separation pass**: per-station light budget tuning against luma assertions; extend `visual:smoke` to all 15 stations with `brightRatio ≥ 0.01` gate | `timeline.ts` + stations + script | 02,03,06,08,12 first |
| P0-4 | **Station bleed containment**: lateral offsets, travel fog boost, per-station reveal fade | `timeline.ts` + `useStation` | 00,06,10,12 |
| P0-5 | **Pelletizing rebuild**: die with real bore face + strand-to-pellet birth staging | station + possible authored GLB | 07 |
| P0-6 | **Logistics relight/rebuild**: moon path, ship lights, arc geometry fix, bulk-carrier silhouette | station | 12 |
| P0-7 | **Energy re-staging**: framed furnace aperture + fire shader + directional embers, pellet enters the glow | station | 13 |

### P1 — High
| # | Item | Scenes |
|---|------|--------|
| P1-1 | Particle shape pass (shard/capsule/puff sprites, size clamp, solid-vs-light blending discipline) | all |
| P1-2 | Jumbo bag v2 (modeled FIBC or lathe rebuild + weave material + fill morph + print decal) | 10,11 |
| P1-3 | Warehouse: slumped-bag instances, hall envelope, floor markings, forklift silhouette | 11 |
| P1-4 | Conditioning vessel detail + sight-glass + jet cones; fix hero-pellet travel leak | 06 |
| P1-5 | Collection: motivated headlight key, bark/ring-cap materials, assembly timing, truck GLB (shared w/ S12) | 02 |
| P1-6 | Screening: hall envelope, feed chute, deck bevel/mesh, curtain backlight | 03 |
| P1-7 | Cooling: interior lights, bed color lift, glass simplification, pellet micro-shader on instances | 08 |
| P1-8 | QC macro lab staging + DOM data callouts + scan ring contrast | 09 |
| P1-9 | Overlay/HUD fixes: rail-label collision, wordmark clip, pellet-vs-copy staging rule | all |
| P1-10 | Grinding cavity light, hopper flange, bolt instancing, scrub-safe shake | 04 |

### P2 — Medium
Forest trunk taper/canopy clustering/ray falloff (S01) · Drying drum material + inlet payoff (S05) · Circular ring-as-particles + forest reprise + S00 framing rhyme (S14) · bevelBox rollout across kit · Logs per-frame matrix gating.

### P3 — Polish
Heat-shimmer shader (S05/S08/S13) · film-grade per-station color LUT via fog/light tint curve · scroll-velocity particle response · ambience audio bed (muted default) · `?debug` Perf HUD.

**Sequencing note.** P0-1 and P0-2 unblock visual judgment of everything else —
do them first, re-capture all 15 shots, then re-triage P1 (several P1 items may
drop a level once materials respond to an environment).
