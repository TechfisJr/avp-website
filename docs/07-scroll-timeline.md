# 07 - Scroll Timeline

Track height: 15 stations x 160vh = 2400vh. `progress = scrollY / (track - vh)`.
Each station window = 1/15 ~= 0.0667 of global progress.

Phase 1 keeps the same 15 windows and camera math, but the content timing now
follows the supplied nine-unit AVP Wood Pellet process. Units S11-S14 are
explicitly downstream extensions after the finished product unit.

```text
global t     0.000                                                        1.000
             |S00|S01|S02|S03|S04|S05|S06|S07|S08|S09|S10|S11|S12|S13|S14|
core beat    hero raw cont chip wet  buf  dry  rec  dry  pell fin  ext  ext  ext  ext
                  mat      ping grind fer      over grind etiz prod
camera       side side side side side side side side side side side side side side side
local beats  .2 arrive -> .8 hold(scrub) -> 1.0 depart      (every station)
```

## Numeric Windows

| Station | Target section | in | out | Overlay reveal | Overlay exit |
|---|---|---:|---:|---|---|
| S00 | Hero | 0.0000 | 0.0667 | 0.000-0.020 | 0.053-0.067 |
| S01 | Raw Material Storage Unit | 0.0667 | 0.1333 | +0.013 into window | last 0.013 |
| S02 | Silent Continuation | 0.1333 | 0.2000 | +0.013 into window | last 0.013 |
| S03 | Woods Chipping Unit | 0.2000 | 0.2667 | +0.013 into window | last 0.013 |
| S04 | Wet Grinding Unit | 0.2667 | 0.3333 | +0.013 into window | last 0.013 |
| S05 | Buffer Storage | 0.3333 | 0.4000 | +0.013 into window | last 0.013 |
| S06 | Drying Unit | 0.4000 | 0.4667 | +0.013 into window | last 0.013 |
| S07 | Recovery Unit | 0.4667 | 0.5333 | +0.013 into window | last 0.013 |
| S08 | Dried Grinding Unit | 0.5333 | 0.6000 | +0.013 into window | last 0.013 |
| S09 | Pelletizer Unit | 0.6000 | 0.6667 | +0.013 into window | last 0.013 |
| S10 | Finished Product Unit | 0.6667 | 0.7333 | +0.013 into window | last 0.013 |
| S11 | Optional Upgrade Path | 0.7333 | 0.8000 | +0.013 into window | last 0.013 |
| S12 | Optional Torrefaction | 0.8000 | 0.8667 | +0.013 into window | last 0.013 |
| S13 | Black Wood Pellet Extension | 0.8667 | 0.9333 | +0.013 into window | last 0.013 |
| S14 | Advanced Bioenergy Close | 0.9333 | 1.0000 | 0.947-0.967 | persists |

Overlay windows are computed, not hand-authored: `reveal = [in + 0.2w, in + 0.45w]`,
`exit = [in + 0.8w, out]` where `w = out - in`. Single source of truth:
`src/lib/timeline.ts` exports `STATIONS[]` consumed by both the 3D world and
the DOM overlay.

## Scrub Wiring

```text
Lenis (lerp .09, syncTouch)
  -> gsap.ticker drives lenis.raf
  -> ScrollTrigger scrub on body track
  -> writes progress into a mutable store
  -> R3F useFrame reads store: CameraRig, HeroPellet, stations, Atmosphere
  -> DOM overlay reads the same store in a rAF for reveal windows
```

## Timing Guidance

Do not change `N`, `SECTION_VH` or station ids during the current cleanup.
After full QA, revisit whether optional S11-S14 should stay in the main scroll
or move behind a separate advanced-product branch.

Camera framing rule: all asset/station views should stay at side or
three-quarter side height, alternating left/right when useful. Avoid top-down
views for production assets.
