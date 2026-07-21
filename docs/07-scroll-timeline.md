# 07 — Scroll Timeline

Track height: 15 stations × 160vh = 2400vh. `progress = scrollY / (track - vh)`.
Each station window = 1/15 ≈ 0.0667 of global progress.

```
global t     0.000                                                        1.000
             ├─S00──┬─S01──┬─S02──┬─S03──┬─S04──┬─S05──┬─S06──┬─S07──┬─S08──┬─S09──┬─S10──┬─S11──┬─S12──┬─S13──┬─S14──┤
             hero   forest collect screen grind  dry    cond   pellet cool   qc     pack   whse   logis  energy circular
camera       push   dolly  sweep  tilt   push   track  orbit  reveal topdwn macro  lowang aisle  crane  approach pullback
palette      ink→   pine/  bark   steel  steel  amber  amber  ember  →frost frost  bone   bone   navy   ember   →moss
key partic.  motes  spores chips  chips  sawdust steam  vortex pellets steam  fines  fall   —      arcs   embers  leaves
local beats  .2 arrive → .8 hold(scrub) → 1.0 depart      (every station)
```

## Numeric windows (global t)
| Station | in | out | Overlay reveal | Overlay exit |
|---------|-----|-----|----------------|--------------|
| S00 hero | 0.0000 | 0.0667 | 0.000–0.020 | 0.053–0.067 |
| S01 forest | 0.0667 | 0.1333 | +0.013 into window | last 0.013 |
| … (identical pattern for S02–S13) | | | | |
| S14 circular | 0.9333 | 1.0000 | 0.947–0.967 | — (persists w/ CTA) |

Overlay windows are computed, not hand-authored: `reveal = [in + 0.2w, in + 0.45w]`,
`exit = [in + 0.8w, out]` where `w = out − in`. Single source of truth:
`src/lib/timeline.ts` exports `STATIONS[]` consumed by both the 3D world and
the DOM overlay — the two layers can never drift apart.

## Scrub wiring
```
Lenis (lerp .09, syncTouch)
  → gsap.ticker drives lenis.raf
  → ScrollTrigger scrub on body track (no pinning needed; canvas is fixed)
  → writes progress into a mutable store (no React re-render)
  → R3F useFrame reads store: CameraRig, HeroPellet, stations, Atmosphere
  → DOM overlay reads the same store in a rAF for reveal windows (GSAP quickTo)
```
Pinned sections are unnecessary — the fixed canvas *is* one global pin, which
avoids 15 nested pin spacers and keeps mobile Safari stable.
