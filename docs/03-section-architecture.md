# 03 — Section Architecture

The DOM is a tall scroll track; the 3D world is a fixed canvas behind it.
Each station owns one full-viewport overlay block whose copy reveals while the
camera dwells at that station.

| # | id | Eyebrow | Headline | Data point |
|---|----|---------|----------|-----------|
| 00 | hero | AVP BIOMASS | One pellet. A complete energy cycle. | — |
| 01 | forest | ORIGIN | The forest gives what it grows back. | 100% residue & certified fiber |
| 02 | collection | RAW MATERIAL | Nothing felled for fuel. Everything used. | Sawmill residues · thinnings |
| 03 | screening | SCREENING | Only clean fiber moves forward. | Contaminant removal ≥ 99% |
| 04 | grinding | GRINDING | Force, measured to the millimeter. | Hammer mill · < 4 mm output |
| 05 | drying | DRYING | Fire needs dry wood. We make it. | Moisture 55% → 10% |
| 06 | conditioning | CONDITIONING | Steam awakens the wood’s own glue. | Lignin activation · no binders |
| 07 | pelletizing | PELLETIZING | Pressure becomes product. | 300 bar through a rotating die |
| 08 | cooling | COOLING | Heat leaves. Hardness stays. | 90°C → ambient in counterflow |
| 09 | qc | QUALITY | Every batch interrogated. | ENplus A1 · Ø6 mm · ≤10% H₂O |
| 10 | packaging | PACKAGING | Sealed at the source. | 1,000 kg jumbo bags |
| 11 | warehouse | STORAGE | Energy, resting. | 40,000 t covered capacity |
| 12 | logistics | LOGISTICS | From our quay to your boiler. | FOB/CIF · Asia & EU lanes |
| 13 | energy | ENERGY | Coal’s replacement, already burning. | −90% net CO₂ vs. coal |
| 14 | circular | CIRCULAR | The ash returns. The forest continues. | Carbon-neutral combustion loop |

## Layout system
- **Scroll track:** `height: (15 × 160)vh` (hero + 14). Lenis smooths; GSAP
  ScrollTrigger scrubs a single normalized `progress`.
- **Overlay blocks:** absolutely positioned per station window, alternating
  left/right thirds so type never covers the scene’s focal object. Mobile:
  always bottom-third, center-aligned.
- **Persistent HUD:** progress rail (left edge, desktop) with 14 ticks +
  current station label; wordmark top-left; CTA (“Request specification”)
  top-right; scroll cue bottom-center on hero only.
- **Footer:** the circular section doubles as the contact CTA — no separate
  footer page weight.

## Component tree
```
app/page.tsx
└─ <Experience>                    (client)
   ├─ <ScrollRoot>                 Lenis + ScrollTrigger → progress store
   ├─ <CanvasRoot>                 fixed R3F canvas
   │  └─ <World>
   │     ├─ <CameraRig/>           camera path + lookAt from progress
   │     ├─ <Atmosphere/>          fog + palette lerp + key lights
   │     ├─ <HeroPellet/>          protagonist w/ phase shader
   │     └─ <stations/*>           14 scene groups along the path
   └─ <Overlay>
      ├─ <Hud/>  <ProgressRail/>
      └─ <Section × 15>            copy + reveal animations
```
