# 03 - Section Architecture

The DOM remains a tall scroll track and the 3D world remains a fixed canvas
behind it. Phase 1 keeps the existing 15 station ids so the site stays stable,
but the content architecture now follows the actual AVP Wood Pellet production
order supplied by the process diagram:

```text
1. Raw material storage Unit
2. Woods chipping Unit
3. Wet grinding Unit
4. Buffer storage
5. Drying Unit
6. Recovery Unit
7. Dried grinding Unit
8. Pelletizer Unit
9. Finished product Unit
```

Any torrefaction, value-upgrading or black-pellet message is a downstream
extension after Unit 9. It is not part of the core nine-unit flow.

## Phase 1 Section Matrix

| # | id | Eyebrow | Headline | Data point |
|---|----|---------|----------|-----------|
| 00 | hero | AVP WOOD PELLET PROCESS | From raw wood to finished pellets. | 9 core units |
| 01 | forest | RAW MATERIAL STORAGE UNIT | Raw wood is received. | Loaded truck -> raw material storage |
| 02 | collection | SILENT SPACER | No visible card. Camera continuation for Unit 1. | - |
| 03 | screening | WOODS CHIPPING UNIT | Logs become wood chips. | Raw wood -> chipping -> wood chips |
| 04 | grinding | WET GRINDING UNIT | Wet material is refined. | Wood chips -> wet grinding -> wet particles |
| 05 | drying | BUFFER STORAGE | Material waits in balance. | Wet particles -> buffer storage |
| 06 | conditioning | DRYING UNIT | Moisture is controlled. | Buffered biomass -> drying -> dry biomass |
| 07 | pelletizing | RECOVERY UNIT | Usable material is recovered. | Dry biomass -> recovery -> clean dry feed |
| 08 | cooling | DRIED GRINDING UNIT | Dry material is refined again. | Recovered feed -> dried grinding -> pellet feed |
| 09 | qc | PELLETIZER UNIT | Pressure creates pellets. | Pellet feed -> pelletizer -> wood pellets |
| 10 | packaging | FINISHED PRODUCT UNIT | Finished pellets are completed. | Wood pellets -> finished product |
| 11 | warehouse | OPTIONAL UPGRADE PATH | Beyond the core line. | Finished product -> optional upgrade |
| 12 | logistics | OPTIONAL TORREFACTION | Thermal treatment comes later. | Finished pellets -> torrefaction option |
| 13 | energy | BLACK WOOD PELLET | Advanced product after pellets. | Finished pellet -> upgraded pellet |
| 14 | circular | ADVANCED BIOENERGY | Core process first. Upgrade path second. | 9 core units -> optional technology extension |

## Chapter Grouping

| Chapter | Stations | Narrative role |
|---|---|---|
| Core intake | S01-S03 | Raw material storage, then chipping |
| Preprocessing | S04-S08 | Wet grinding, buffer storage, drying, recovery, dried grinding |
| Finishing | S09-S10 | Pelletizer unit and finished product unit |
| Optional extension | S11-S14 | Downstream value-upgrading story after the core line |

## Layout System

- **Scroll track:** `height: (15 x 160)vh`; Lenis smooths and GSAP
  ScrollTrigger scrubs one normalized `progress`.
- **Overlay blocks:** one full-viewport section per station, alternating
  left/right thirds. Mobile remains bottom-third, center-aligned.
- **Persistent HUD:** progress rail, wordmark, CTA, scroll cue and QC scan ring
  still use the existing overlay component.
- **Origin visual rule:** `forest` is now the visible Unit 1 raw material
  storage/receiving beat. `collection` remains the silent spacer.
- **Camera rule:** all station assets stay in side or three-quarter side views
  at machine/operator height. Avoid top-down views for production assets.
- **Migration note:** late-stage station ids still use old component names
  (`Packaging`, `Warehouse`, `Logistics`, `Energy`, `Circular`) for import
  stability. Their core/extension meaning is defined by this matrix until the
  visual components are renamed in a later cleanup.

## Component Tree

```text
app/page.tsx
└─ <Experience>                    (client)
   ├─ <ScrollRoot>                 Lenis + ScrollTrigger -> progress store
   ├─ <CanvasRoot>                 fixed R3F canvas
   │  └─ <World>
   │     ├─ <CameraRig/>           camera path + lookAt from progress
   │     ├─ <Atmosphere/>          fog + palette lerp + key lights
   │     ├─ <HeroPellet/>          protagonist w/ phase shader
   │     └─ <stations/*>           15 scene groups along the path
   └─ <Overlay>
      ├─ <Hud/>  <ProgressRail/>
      └─ <Section x 15>            copy + reveal animations
```

## Cleanup Rule

Do not rename station ids until visual rebuilds are stable and QA remains
green. For now, copy and timeline define the correct process order while a few
component filenames remain legacy implementation slots.
