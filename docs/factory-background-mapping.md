# Factory Background Mapping

Integration of the real AVP factory photography as a **reality layer** inside the
existing 3D material-transformation journey. The photos exist to make the *first
transformation* (Raw Wood → Wood Pellet) believable — they never become a photo
gallery, a slideshow, or a separate "Factory Tour" chapter.

Source masters: `docs/source-assets/backgrounds/{outside,inside}/*.png`
Runtime assets: `public/backgrounds/{02-factory-entry,03-production}/*.webp`
All source frames are **1672 × 941** (~16:9), 2.2–2.6 MB PNG each.

---

## Engine facts that constrain placement

- The site is **one fixed full-screen R3F canvas** (`z-index: 0`). An opaque shader
  dome (`BackgroundGradient`, `renderOrder -1000`) paints the backdrop; the DOM
  overlay sits **above** the canvas. → a DOM `<img>` behind the canvas is invisible.
  **Photos must be WebGL textures inside the scene.**
- `timeline.ts` places 15 stations on an S-curve; `Atmosphere.tsx` blends a colored
  `FogExp2` + 3-point rig per station. The photo layer inherits this fog/haze/exposure
  → color-matching to the 3D is automatic when we feed the layer the active fog color.
- Station IDs are legacy; `copy.ts` maps them to the new narrative. **Do not rename.**

---

## Reality-layer window (which stations get photography)

```
forest(1)    RAW WOOD(2)   WOOD CHIPS(3)  WOOD PARTICLES(4)  DRY BIOMASS(5)  PREP(6)   PELLETIZE(7)  WOOD PELLET(8)   value-upgrading(9-14)
  ✗ nature   outside-fac.  01             02                 04              05 subtle 03            ✗ clean reveal   ✗ pure 3D technology
```

- **Before Raw Wood** → no photography. The origin of the material must feel natural.
- **Raw Wood → Pelletization** → photographic reality layer, ramping in at Raw Wood,
  strongest through Chips/Particles/Drying, easing out across Wood Pellet.
- **Wood Pellet(8)** → deliberately *sheds* the busy factory for a clean product reveal —
  "the result of the first transformation."
- **Value Upgrading onward(9–14)** → **no factory photos.** This is the technology
  chapter; photographs would weaken the advanced-tech feeling. Pure 3D.

---

## factory-aerial.webp

- **Visual content:** golden-hour aerial of the AVP facility — long white warehouse
  halls, an open **raw-log storage yard with stacked timber**, ringed by dense green
  plantation/forest. Road and gatehouse in the foreground.
- **Dominant architecture:** horizontal roofline; large negative sky at top; log yard
  lower-right; forest belt wrapping the site.
- **Camera direction:** high aerial, looking down ~30°, sun low camera-left (warm).
- **Lighting direction / temperature:** warm sunrise/sunset, ~3500–4500 K, key from left.
- **Best candidate:** **RAW WOOD (2)**, carrying into the **Raw Wood → Wood Chips** bridge.
  - *Reason:* the frame literally shows **raw logs in the yard** and the forest that
    supplied them — it is the perfect NATURE → INDUSTRY hinge. It is the moment the
    material leaves its natural origin and the real facility first becomes visible.
- **Unsuitable for:** any interior stage (it is exterior); the Value-Upgrading chapter
  (corporate/aerial reads as "arrival," not "technology").
- **Crop behavior:** anchor on the log yard + nearest hall; let sky + far forest fall
  into haze/vignette. Never center the empty sky.
- **Desktop:** wide, slow push-in toward the hall as Raw Wood → Chips progresses;
  forest belt parallaxes slower than the buildings.
- **Mobile:** static-ish, tighter crop on hall + log yard, single gentle scale.

## factory-interior-01.webp — establishing interior

- **Visual content:** wide, near-symmetric hall interior; strong vertical **light shafts**
  through side windows; conveyor + processing line center; **wood-chip pile** far right;
  rows of white FIBC bulk bags; large polished concrete floor foreground.
- **Dominant architecture:** symmetric gabled truss roof, converging perspective to a
  central vanishing point; big empty floor.
- **Camera direction:** eye-level, centered, looking straight down the hall.
- **Lighting direction / temperature:** warm side daylight (~4000 K) raking from both
  window walls; bright, airy.
- **Best candidate:** **WOOD CHIPS (3, screening).**
  - *Reason:* the **first time we are inside** — the most spacious, legible, symmetric
    frame establishes real industrial scale behind the 3D chipper/screen. The chip pile
    on the right ties directly to the chips being produced.
- **Unsuitable for:** Wood Pellet reveal (too busy/wide), Value Upgrading (not tech).
- **Crop behavior:** keep the central vanishing point roughly behind the 3D machine;
  floor foreground can be cropped/occluded by the 3D floor + dust.
- **Desktop:** slight scale-up + parallax; light shafts anchor depth.
- **Mobile:** centered crop, minimal movement.

## factory-interior-02.webp — processing line

- **Visual content:** interior with the **full processing line** more centered/complete —
  twin inclined conveyors, hopper, green machine train; chip pile + bulk bags right.
- **Dominant architecture:** asymmetric, machine mass left-of-center, deep right wall.
- **Camera direction:** eye-level, angled slightly right along the line.
- **Lighting / temperature:** warm daylight, window shafts camera-left.
- **Best candidate:** **WOOD PARTICLES (4, grinding).**
  - *Reason:* the busiest *machinery* frame — conveyors + mill train read as active
    size-reduction/handling, matching grinding into fine particles.
- **Unsuitable for:** Raw Wood (interior), clean Wood Pellet reveal.
- **Crop behavior:** favor the machine mass; let far right wall haze out.
- **Desktop:** lateral pan following material flow left→right.
- **Mobile:** crop to the machine cluster.

## factory-interior-03.webp — machine cluster (close)

- **Visual content:** closest view of the machine cluster — hopper, inclined conveyor,
  green mill/press train with visible drives and framework; tighter, more mechanical.
- **Dominant architecture:** machinery fills most of the frame; less floor/sky.
- **Camera direction:** eye-level, closer standoff, looking into the machine.
- **Lighting / temperature:** warm, contrasty; shafts behind the machine.
- **Best candidate:** **PELLETIZATION (7, pelletizing).**
  - *Reason:* the most machine-dominant, detailed frame supports the press/densification
    hero moment without upstaging the 3D pellet mill.
- **Unsuitable for:** establishing shots (too tight), Wood Pellet reveal.
- **Crop behavior:** machine mass held behind the 3D mill; keep it *supporting*, dim its
  center so the 3D transformation stays the focus.
- **Desktop:** slow push toward the machine as pelletization peaks.
- **Mobile:** tight crop, static.

## factory-interior-04.webp — air handling / ducting

- **Visual content:** machine line left; prominent **cyclone ducting and pipework on the
  right wall**; bulk bags; chip pile far right.
- **Dominant architecture:** horizontal duct runs high on the right; machine mass left.
- **Camera direction:** eye-level, looking right toward the duct wall.
- **Lighting / temperature:** warm, slightly hazier/dustier feel.
- **Best candidate:** **DRY BIOMASS (5, drying).**
  - *Reason:* the visible **pneumatic ducting / air-handling** reads as the drying air
    system (rotary dryer + cyclones) — the strongest semantic match for moisture control.
- **Unsuitable for:** Raw Wood, Wood Pellet reveal.
- **Crop behavior:** feature the duct wall on the side away from the text column.
- **Desktop:** gentle parallax, warm dry haze layered on top.
- **Mobile:** crop toward ducting, static.

## factory-interior-05.webp — full line + chip pile

- **Visual content:** widest working shot — machine line left, **large raw wood-chip pile
  foreground-right**, cyclone/duct runs, bulk bags. Most "everything at once."
- **Dominant architecture:** big chip pile lower-right; deep hall.
- **Camera direction:** eye-level, wide, slightly right.
- **Lighting / temperature:** warm, dusty daylight.
- **Best candidate (optional/subtle):** **PREPARATION / conditioning (6).**
  - *Reason:* a staging/handling frame that bridges Drying → Pelletization; the prominent
    material pile reads as biomass staged and ready for densification.
  - *If repetition risk is high, conditioning instead inherits a hazed continuation of 04
    and 05 is dropped.* Do not force it.
- **Unsuitable for:** Wood Pellet reveal, Value Upgrading.
- **Crop behavior:** anchor the chip pile opposite the text; strong foreground haze.
- **Desktop:** very subtle, low opacity — a transitional environment, not a hero plate.
- **Mobile:** omit (perf) or single static crop.

---

## Transition logic (material motivates every change)

Photography never cross-fades on its own timer — it is gated to the **same scroll
windows** the stations and existing material-flow bridges already use.

1. **Raw Wood → Wood Chips:** log rides forward → `factory-aerial` rises in depth →
   camera pushes toward the hall → architectural mass wipes the frame → interior `01`
   resolves as the log enters the chipper. Exterior beat is short.
2. **Wood Chips → Particles → Dry Biomass → Pelletization:** each interior plate cross-
   fades *behind* the existing FlowBridge material stream (`ScreeningToGrinding`,
   `GrindingToDrying`, `DryingToConditioning`, `ConditioningToPelletizing`). The moving
   chips/particles/bridge in front carry the eye; the plate swap happens under cover.
3. **Pelletization → Wood Pellet:** photography dissolves to near-zero; fog + gradient
   dome take over for a clean product reveal.
4. **Wood Pellet → Value Upgrading:** no photography returns. The world becomes 3D tech.

## Do-not / quality guardrails

- No plate darker than the station fog; no heavy black overlay; readable at all times.
- Photo layer is always *behind* 3D machinery, particles, and bridges — never competes.
- Match plate tint to the active `Atmosphere` fog color so photography and 3D share a
  color temperature (no mismatched warm-photo / cool-3D seam).
- No hard rectangular edges: soft radial + top/bottom feather on the plate.
- Reduce, don't repeat: reuse a frame only in a distinctly different crop.
