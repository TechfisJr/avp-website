# 03 — Section Architecture

The DOM remains a tall scroll track and the 3D world remains a fixed canvas
behind it. Phase 1 keeps the existing 15 station ids so the site stays stable,
but the content architecture now follows the target AVP Wood Pellet narrative:

```text
FROM WOOD
↓
TO PELLET
↓
TO HIGHER VALUE
```

## Phase 1 section matrix

| # | id | Eyebrow | Headline | Data point |
|---|----|---------|----------|-----------|
| 00 | hero | AVP BIOMASS | From wood. To pellet. To higher value. | — |
| 01 | forest | SUSTAINABLE FOREST | It begins with nature. | Forest → renewable biomass |
| 02 | collection | RAW WOOD | The raw material. | Acacia · wood resources · residues |
| 03 | screening | WOOD CHIPS | Reducing size. Preparing material. | Raw wood → chipping → wood chips |
| 04 | grinding | WOOD PARTICLES | Refined for consistency. | Wood chips → grinding → particles |
| 05 | drying | DRY BIOMASS | Moisture under control. | Wet biomass → drying → dry biomass |
| 06 | conditioning | PREPARATION | Precision begins before pelletization. | Prepared biomass · ready for densification |
| 07 | pelletizing | PELLETIZING | Pressure creates form. | Compression → densification → pellet |
| 08 | cooling | WOOD PELLET | Renewable energy. Densified. | The result of the first transformation |
| 09 | qc | VALUE UPGRADING | More than a transformation. | Product → technology → higher value |
| 10 | packaging | THERMAL UPGRADING | Upgrading what biomass can become. | Wood pellet → controlled heat |
| 11 | warehouse | TORREFACTION | The technology behind the transformation. | Heat changes structure |
| 12 | logistics | VALUE CREATION | The pellet is not merely darkened. | White pellet → technology → black pellet |
| 13 | energy | BLACK WOOD PELLET | Biomass. Upgraded. | The result of the second transformation |
| 14 | circular | ADVANCED BIOENERGY | We create more value from it. | Wood → pellet → higher value |

## Chapter grouping

| Chapter | Stations | Narrative role |
|---|---|---|
| Origin | S01-S02 | Sustainable forest and selected raw wood resources |
| Material preparation | S03-S06 | Chipping, refining, drying and conditioning |
| First transformation | S07-S08 | Pelletization and finished wood pellet milestone |
| Value upgrading | S09-S12 | Technology-driven shift from product to higher value |
| Advanced product | S13-S14 | Black Wood Pellet reveal and advanced bioenergy close |

## Layout system

- **Scroll track:** `height: (15 × 160)vh`; Lenis smooths and GSAP
  ScrollTrigger scrubs one normalized `progress`.
- **Overlay blocks:** one full-viewport section per station, alternating
  left/right thirds. Mobile remains bottom-third, center-aligned.
- **Persistent HUD:** progress rail, wordmark, CTA, scroll cue and QC scan ring
  still use the existing overlay component.
- **Phase 2 note:** late-stage station ids still use old component names
  (`Packaging`, `Warehouse`, `Logistics`, `Energy`, `Circular`) until their
  visuals are rebuilt.

## Component tree

```text
app/page.tsx
└─ <Experience>                    (client)
   ├─ <ScrollRoot>                 Lenis + ScrollTrigger → progress store
   ├─ <CanvasRoot>                 fixed R3F canvas
   │  └─ <World>
   │     ├─ <CameraRig/>           camera path + lookAt from progress
   │     ├─ <Atmosphere/>          fog + palette lerp + key lights
   │     ├─ <HeroPellet/>          protagonist w/ phase shader
   │     └─ <stations/*>           15 scene groups along the path
   └─ <Overlay>
      ├─ <Hud/>  <ProgressRail/>
      └─ <Section × 15>            copy + reveal animations
```

## Cleanup rule

Do not rename station ids until visual rebuilds are stable. During phase 2,
the copy can describe the target chapter while the component name remains the
legacy implementation slot.

