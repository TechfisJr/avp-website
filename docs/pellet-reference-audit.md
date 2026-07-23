# Pellet Reference Audit

Audit of the real-world reference images supplied for the pellet / material
visuals. **Classification is by actual visual content, not filename.**

> ⚠️ File-access note: the 9 images were supplied *inline in chat*, not as files
> on disk. They could not be moved/renamed automatically (no byte access to
> pasted images). The folder structure + intended filenames below are created so
> the images can be dropped in; the classifications drive the procedural material
> rebuild regardless. See `public/references/pellets/README.md`.

Legend for categories:
`WHITE_PELLET_REFERENCE`, `BLACK_PELLET_REFERENCE`, `INTERMEDIATE_TORREFIED_REFERENCE`,
`PELLET_MACRO_REFERENCE`, `PELLET_WIDE_PILE_REFERENCE`, `PELLET_INDUSTRIAL_CONTEXT`,
plus process-stage environment refs (`FOREST_REFERENCE`, `RAW_WOOD_REFERENCE`,
`WOOD_CHIPS_REFERENCE`) that also arrived in the batch.

---

### IMG 1 — Plantation forest, dirt road, morning mist
- **Classification:** FOREST_REFERENCE (bonus — stage 01 Sustainable Forest)
- **Recommended filename:** `forest-plantation-ref-01.jpg`
- **Purpose:** origin-scene colour/atmosphere (fresh green, soft daylight, depth).
- **Content:** managed acacia/eucalyptus rows on hillsides, winding forest road,
  layered mist, distant mountains, warm morning sun, blue sky.
- **Lighting:** soft golden-hour side light, high dynamic range, airy.
- **Camera:** wide landscape, deep focus.
- **Usefulness:** high for stage 01; not a pellet reference.

### IMG 2 — White | Black pellet split macro (studio)
- **Classification:** PELLET_MACRO_REFERENCE (dual white + black)
- **Recommended filename:** `pellet-macro-ref-01.jpg`
- **Content:** left half pale beige compressed-wood pellets, right half dark
  torrefied/black pellets, meeting in the middle. THE single best transformation
  reference — shows white↔black side by side at identical geometry.
- **Pellet colour:** white = warm beige/ivory with tan speckle; black = deep
  charcoal-brown (NOT pure black), some low sheen.
- **Geometry:** short cylinders, Ø≈6–8 mm, length ≈1–2.5× diameter, many broken
  ends, imperfect faces, random orientation.
- **Fiber texture:** visible longitudinal grain + speckle; end faces show
  compressed radial fibre.
- **Surface:** matte (white) to low sheen (black).
- **Lighting:** soft diffuse studio.
- **Camera:** macro, shallow DoF.
- **Usefulness:** VERY HIGH — colour truth for both white and black + the "same
  geometry, material changes" story.

### IMG 3 — Golden wood-chip pile + conveyor
- **Classification:** WOOD_CHIPS_REFERENCE / INDUSTRIAL_CONTEXT (stage 03/04)
- **Recommended filename:** `wood-chips-ref-01.jpg`
- **Content:** heap of golden-tan irregular wood chips, blurred conveyor & warm
  industrial background. Angular flakes, NOT pellets.
- **Usefulness:** high for stage 03 Wood Chips material colour; not pellets.

### IMG 4 — Stacked raw logs, log yard
- **Classification:** RAW_WOOD_REFERENCE (stage 02 Raw Wood)
- **Recommended filename:** `raw-wood-ref-01.jpg`
- **Content:** stacked debarked/bark logs, cut ends showing growth rings, forest
  behind, warm light.
- **Usefulness:** high for stage 02; not pellets.

### IMG 5 — Hands cupping white pellets
- **Classification:** WHITE_PELLET_REFERENCE (macro, human scale)
- **Recommended filename:** `white-pellet-ref-01.jpg`
- **Content:** two hands holding a heap of beige pellets over a pellet bed.
- **Colour:** pale warm beige, subtle tan variation pellet-to-pellet.
- **Geometry:** short cylinders, consistent Ø, varied length, broken ends.
- **Scale cue:** pellets are small relative to a hand — confirms "many small
  pellets, not one giant object."
- **Usefulness:** HIGH — scale + white colour truth.

### IMG 6 — White pellet mound, shallow depth of field
- **Classification:** WHITE_PELLET_REFERENCE / PELLET_WIDE_PILE_REFERENCE
- **Recommended filename:** `white-pellet-ref-02.jpg`
- **Content:** dense mound of pale beige pellets, sharp foreground → blurred
  background. Natural scattered stacking, random orientation, occasional broken
  piece.
- **Lighting:** soft, neutral, bright.
- **Camera:** macro with shallow DoF — the ideal WHITE PELLET HERO composition.
- **Usefulness:** VERY HIGH — hero composition + density reference.

### IMG 7 — Black pellet pile on wood surface
- **Classification:** BLACK_PELLET_REFERENCE (macro)
- **Recommended filename:** `black-pellet-ref-01.jpg`
- **Content:** heap of charcoal/near-black torrefied pellets on a warm wood
  surface.
- **Colour:** deep charcoal-brown — retains biomass character, NOT plastic black;
  broken ends slightly lighter brown inside.
- **Surface:** matte with faint sheen; visible compressed texture and roughness.
- **Usefulness:** VERY HIGH — black-pellet colour truth + "must stay readable."

### IMG 8 — Pellets in rusty industrial bin
- **Classification:** PELLET_INDUSTRIAL_CONTEXT
- **Recommended filename:** `pellet-industrial-ref-01.jpg`
- **Content:** greyish-tan pellet pile inside a rusty steel container, dark
  factory hall, overhead light.
- **Usefulness:** medium — factory storage/handling scale; muted colour (dusty),
  not for hero colour.

### IMG 9 — White pellets on conveyor, factory roof
- **Classification:** PELLET_INDUSTRIAL_CONTEXT (white, production line)
- **Recommended filename:** `pellet-industrial-ref-02.jpg`
- **Content:** beige pellets piled/flowing on a conveyor, metal factory roof,
  blue tie-line.
- **Usefulness:** medium-high — production-scale white pellet context / soft
  background behind hero.

---

## Summary counts
| Category | Images |
| --- | --- |
| WHITE_PELLET_REFERENCE | IMG 5, IMG 6 |
| BLACK_PELLET_REFERENCE | IMG 7 (+ black half of IMG 2) |
| PELLET_MACRO_REFERENCE (white+black) | IMG 2 |
| PELLET_WIDE_PILE_REFERENCE | IMG 6 |
| PELLET_INDUSTRIAL_CONTEXT | IMG 8, IMG 9 |
| FOREST_REFERENCE | IMG 1 |
| RAW_WOOD_REFERENCE | IMG 4 |
| WOOD_CHIPS_REFERENCE | IMG 3 |
| INTERMEDIATE_TORREFIED_REFERENCE | none supplied → derive between IMG 6 & IMG 7 |

## Material truths extracted (drive the procedural rebuild)
- **White pellet:** warm beige / ivory (≈ hsl 36°, 28%, 70%), matte, fibrous,
  per-pellet tan variation. NOT pure white, NOT glossy.
- **Black pellet:** deep charcoal-brown (≈ hsl 25°, 22%, 15%), matte→low sheen,
  visible texture + broken ends, warm rim highlights. NOT RGB-black, NOT plastic.
- **Intermediate:** dry mid-brown (≈ hsl 27°, 42%, 40%) between the two — no
  unrelated orange.
- **Geometry (all states):** short cylinders, fairly consistent Ø, natural length
  variation, imperfect/broken ends, random orientation, natural pile stacking.
