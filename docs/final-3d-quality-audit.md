# Final 3D Quality Audit

**Scope.** Fresh end-to-end review of the upgraded experience, judged from
newly captured renders (not from memory of prior work). Captured all 15
stations at dwell on desktop (1440×900) and 6 key stations on mobile
(390×844), 5 scene-boundary transitions, and hero-load frames. Reference
images: [docs/qa-shots/final-audit/](./qa-shots/final-audit/) (`d-*` desktop,
`m-*` mobile, `tr-*` transitions, `load-*` first paint).

**Method note on FPS.** This environment has no GPU — Playwright renders
through SwiftShader (software). Absolute frame rates are therefore **not a
hardware benchmark** and are reported only for relative comparison between
quality tiers. A real-device pass is still required before shipping (see
Performance).

**Technical state.** `tsc --noEmit` clean. Production build compiles.
Zero console/page errors across all 15 stations on both viewports. Canvas
first-ready ~1.9s desktop / ~0.9s mobile (software renderer).

---

## Verdict: NOT production-ready

The infrastructure is production-grade and roughly half the scenes are genuinely
strong (Pelletizing, Grinding, Screening, Warehouse, Forest core, the Packaging
bag). But the experience fails the stated bar — *"all major scenes consistent,
no obvious placeholder assets"* — for three reasons that recur across multiple
scenes: an oversized hero pellet obscures the copy on 4–5 stations, two of the
narrative's most important scenes (Energy climax, Circular close) still contain
placeholder-grade geometry, and cross-station bleed drops unexplained floating
objects into several frames. These are consistency failures, not one-off bugs.

---

## 1. Blockers

### B1 — Hero pellet is oversized and centered over the copy on 4–5 scenes
`src/lib/timeline.ts` stages the hero pellet at `scale: 1` on **Cooling, QC,
Energy** and `0.9` on **Circular** (confirmed in source), plus the **Hero**
landing. At that size it fills 45–65% of the frame directly over the headline,
body copy and datapoint:
- **Cooling** (`d-08`): "Heat leaves. Hardness stays.", the body line and the
  `90°C → AMBIENT` datapoint are almost entirely behind the pellet.
- **QC** (`d-09`): pellet covers >half the frame; the scan-ring (the whole point
  of the scene) is invisible behind it; body copy occluded.
- **Energy** (`d-13`): pellet sits over "already burning" and the entire body
  paragraph.
- **Circular** (`d-14`): pellet over "The ash returns. The forest continues."
  and the body line.

Compounding it: at this magnification the GLB's end-cap swirl + low-frequency
displacement read as **a bread loaf / cinnamon roll**, not a Ø6 mm compressed
pellet. This was fixed at Pelletizing (`scale 0.42`, offset to the conveyor —
see `d-07`, which is excellent) but the same fix was never applied to the other
stations. **This is the single most pervasive quality problem in the build.**
Fix: shrink to ~0.4–0.5 and offset out of the copy column per scene, exactly as
Pelletizing already demonstrates; and regenerate the GLB with tighter, higher-
frequency striations + no cap swirl so it survives macro framing (QC needs it).

### B2 — Energy furnace and Circular ring read as placeholders
- **Energy** (`d-13`): the furnace "eye" is a flat emissive disc — reads as an
  orange egg-yolk / setting sun ("Saturn"), not a boiler mouth. The climax of
  the entire narrative currently looks unfinished.
- **Circular** (`d-14`): the carbon-loop ring renders as a thin, wobbly green
  line that reads as a **hand-drawn scribble/doodle** over the pellet, not an
  intentional orbit. The closing frame of the story looks placeholder-grade.

Both scenes were flagged in the original audit and were outside the 8-scene
upgrade pass, so they still carry those issues. For a production close they
need the same treatment the other machines got.

### B3 — Cross-station bleed drops unexplained geometry into frames
`isActive = ±1 window` plus low inter-station fog means neighbors intrude:
- **Collection** (`d-02`): large smooth ovoid lumps and a vertical bar (Forest
  canopies + a trunk) float over the log pile — they read as **placeholder
  blobs**, the exact "floating objects that don't feel physically intentional"
  the brief calls out.
- **Logistics** (`d-12`, `tr-11`): a large flat **gray triangular wedge** (the
  background-gradient dome's lighter upper band) occupies the right third and
  reads as an untextured plane, not sky. The warehouse→logistics transition
  (`tr-11`) is mostly this gray wedge over near-black — a disconnected-feeling
  boundary.

Fix is the architecture-level item from the original audit (G4): lateral
station offsets, a travel-fog boost, and/or per-station reveal fade.

---

## 2. High-priority polish

### P1 — Over-bright / oversized particles (excessive-bloom read)
- **Drying** (`d-05`): steam is huge near-white bokeh dominating the top third.
- **Conditioning** (`d-06`): steam jets are big white blobs that streak
  horizontally *through* the headline "glue.".
- **Forest** (`d-01`): god-rays blow out to near-white wedges bottom-right and
  wash out the "REQUEST SPECIFICATION" CTA.
These read as excessive bloom / too-bright assets. Reduce steam sprite size and
peak opacity, cap the god-ray additive intensity, and/or lower the bloom
threshold's reach on these emissive-heavy scenes.

### P2 — Typography contrast: no desktop scrim behind copy
Mobile correctly places a dark scrim behind bottom-anchored copy (`m-07`,
`m-12` are clean). Desktop has none, so wherever a bright object crosses the
copy column the text loses contrast: Hero body, Conditioning headline, all of
Cooling's copy, Energy body, Packaging body. Add a subtle radial/edge scrim
behind the desktop text block (or enforce the B1 staging so objects never enter
the copy column).

### P3 — Progress-rail label collides with left-aligned section text
On every left-aligned scene the rail's active label (e.g. "RAW MATERIAL",
"SCREENING", "DRYING", "CONDITIONING", "LOGISTICS", "CIRCULAR ECONOMY") renders
directly over the section eyebrow/headline — the same words stacked twice
(clearest in `d-02`, `d-03`, `d-05`, `d-06`). Hide the rail label while a
left-aligned section is on screen, or move the rail to the right edge there.

### P4 — Wordmark clips the final letter
`public/icons/wordmark.svg` renders as "AVP BIOMA" — the SVG `width`/viewBox
(132) is too narrow for the "BIOMASS" text at its x-offset, clipping the final
"S". Visible in the top-left of every frame. Widen the viewBox/width.

### P5 — Packaging: finished bag floats over the copy
`d-10`: the horizontal "finished" jumbo bag hovers above the vertical bag below
it (reads as levitating) and overlaps "at the source." + body copy. Reposition
the finished-bag row out of the copy column and seat it on a surface.

---

## 3. Nice-to-have polish

- **No loading state.** Suspense fallback is `null`, so first paint is a black
  canvas + HUD text for ~1–2s while the 269 KB GLB and the three/drei/postpro
  bundle load (`load-early`). Text-first is good for LCP, but a minimal fade-in
  or loader would smooth the entrance.
- **Conditioning vessel** is still a featureless black dome (dark-on-dark, low
  surface information) — the one machine that never got a detail pass.
- **Cooling** glass bin + pellet bed reads slightly muddy through the tinted
  glass; brightening the bed instance colors or thinning the glass would help.
- **Datapoint tick/underline** overlaps the bullet on a couple of scenes
  (`d-02`) — minor alignment.
- **Shavings** in Collection (`d-02`) still read a little like loose scribbles;
  grounding them against the pile would sell them as wood curls.

---

## 4. Performance

- **Tiering works.** Tier 0 (mobile) correctly drops postFX/SSAO and scales
  particle + pellet counts; tier 2 adds SSAO + bloom at DPR 2. Relative software
  cost (not hardware): tier 2 is roughly 4× heavier than tier 0, with SSAO the
  dominant term — consistent with it being tier-2-only.
- **Bundle:** largest chunk ~1.4 MB uncompressed (three + drei + postprocessing
  + gsap); hero GLB 269 KB. Geometry is otherwise procedural (near-zero
  download). Acceptable for a flagship 3D site; gzip will roughly halve the JS.
- **Must verify on real hardware before shipping.** SSAO + EffectComposer at
  DPR 2 is the first thing to reduce if mid-range laptops drop frames; the
  `?q=0|1|2` override already exists to test this. I cannot certify real-device
  FPS from this environment.

---

## 5. Readiness score

### 72 / 100

**Strong (carry forward as-is):** the global visual system (lighting presets,
PBR variation, environment map, tiered postFX), and the upgraded machine scenes
— Pelletizing is genuinely excellent, Grinding/Screening/Warehouse are solid,
the Packaging FIBC bag and Collection log-ends are convincing, Forest has real
depth. Zero errors, clean build, sane tiering.

**Why not higher:** the score is capped by *consistency*, which is the explicit
gate. Roughly a third of the journey — Cooling, QC, Energy, Circular, and the
Hero landing to a degree — is dragged down by one unfixed decision (hero pellet
scale/staging), and the two scenes that should land the story hardest (Energy
climax, Circular close) still show placeholder-grade geometry. Cross-station
bleed puts stray objects in several frames. None of this is deep — B1 is a
handful of numbers in `timeline.ts` plus a GLB regen, B2 is two focused scene
passes, B3 is the known G4 architecture fix — but until it's done the
experience does not read as uniformly finished.

**Path to production-ready (est. 90+):** clear B1–B3 and P1–P4. B1 alone
(re-staging the pellet on 4 scenes, the way Pelletizing already does it) is the
highest-leverage change and would lift the readiness materially on its own.
