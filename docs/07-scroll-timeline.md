# 07 — Scroll Timeline

Track height: 15 stations × 160vh = 2400vh. `progress = scrollY / (track - vh)`.
Each station window = 1/15 ≈ 0.0667 of global progress.

Phase 1 keeps the same 15 windows and camera math, but the content timing now
follows the target AVP Wood Pellet narrative.

```text
global t     0.000                                                        1.000
             ├─S00──┬─S01──┬─S02──┬─S03──┬─S04──┬─S05──┬─S06──┬─S07──┬─S08──┬─S09──┬─S10──┬─S11──┬─S12──┬─S13──┬─S14──┤
chapter      hero   origin origin prep   prep   prep   prep   pellet pellet value  thermal torre  value  black  advanced
target beat  thesis forest raw    chips  part.  dry    ready  form   product shift  upgrade faction create pellet bioenergy
camera       push   dolly  sweep  tilt   push   track  orbit  reveal topdwn macro  chamber reactor bridge product pullback
visual note  live   live   live   live   live   live   live   live   live   rebuilt rebuilt rebuilt rebuilt rebuilt rebuilt
local beats  .2 arrive → .8 hold(scrub) → 1.0 depart      (every station)
```

Late-stage camera labels describe the target rebuilt scenes while component
filenames remain legacy migration slots.

## Numeric windows

| Station | Target section | in | out | Overlay reveal | Overlay exit |
|---|---|---:|---:|---|---|
| S00 | Hero | 0.0000 | 0.0667 | 0.000-0.020 | 0.053-0.067 |
| S01 | Sustainable Forest | 0.0667 | 0.1333 | +0.013 into window | last 0.013 |
| S02 | Raw Wood | 0.1333 | 0.2000 | +0.013 into window | last 0.013 |
| S03 | Wood Chips | 0.2000 | 0.2667 | +0.013 into window | last 0.013 |
| S04 | Wood Particles | 0.2667 | 0.3333 | +0.013 into window | last 0.013 |
| S05 | Dry Biomass | 0.3333 | 0.4000 | +0.013 into window | last 0.013 |
| S06 | Preparation | 0.4000 | 0.4667 | +0.013 into window | last 0.013 |
| S07 | Pelletizing | 0.4667 | 0.5333 | +0.013 into window | last 0.013 |
| S08 | Wood Pellet | 0.5333 | 0.6000 | +0.013 into window | last 0.013 |
| S09 | Value Upgrading | 0.6000 | 0.6667 | +0.013 into window | last 0.013 |
| S10 | Thermal Upgrading | 0.6667 | 0.7333 | +0.013 into window | last 0.013 |
| S11 | Torrefaction | 0.7333 | 0.8000 | +0.013 into window | last 0.013 |
| S12 | Value Creation | 0.8000 | 0.8667 | +0.013 into window | last 0.013 |
| S13 | Black Wood Pellet | 0.8667 | 0.9333 | +0.013 into window | last 0.013 |
| S14 | Advanced Bioenergy | 0.9333 | 1.0000 | 0.947-0.967 | persists |

Overlay windows are computed, not hand-authored: `reveal = [in + 0.2w, in + 0.45w]`,
`exit = [in + 0.8w, out]` where `w = out - in`. Single source of truth:
`src/lib/timeline.ts` exports `STATIONS[]` consumed by both the 3D world and
the DOM overlay.

## Scrub wiring

```text
Lenis (lerp .09, syncTouch)
  → gsap.ticker drives lenis.raf
  → ScrollTrigger scrub on body track
  → writes progress into a mutable store
  → R3F useFrame reads store: CameraRig, HeroPellet, stations, Atmosphere
  → DOM overlay reads the same store in a rAF for reveal windows
```

## Timing guidance

Do not change `N`, `SECTION_VH` or station ids during the current cleanup.
After full QA, revisit whether S10-S14 should stay as five separate beats or
collapse closer to the 11-section target document.
