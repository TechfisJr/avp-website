# 06 - Motion Specification

## Global Rules

- **Scrub everything.** No time-based autoplay animation except idle
  micro-motion, and that motion is amplitude-modulated by scroll proximity.
- **Tempo:** 160vh of scroll per station; Lenis `lerp: 0.09`, wheel multiplier
  1.0 - heavy, filmic.
- **Easing:** camera travel `power2.inOut` between stations with a 60% dwell
  plateau; typography `expo.out`; nothing bounces.
- **No generic fade-ins.** Type reveals with `clip-path` line masks and soft
  rise.

## Camera Grammar

- Path: `CatmullRomCurve3` through 15 keyframed positions; lookAt targets lerp
  per segment so the gaze leads the move.
- Dwell mapping: within a station window, progress 0-0.2 = arrive, 0.2-0.8 =
  hold, 0.8-1.0 = depart.
- FOV breathes subtly on arrival/departure.
- All production assets use side or three-quarter side views at
  machine/operator height. No top-down asset shots.

## Per-Station Key Beats

| Station | 0.2 -> 0.8 local scrub drives |
|---------|------------------------------|
| Hero | pellet rotation, dust density, title reveal |
| Raw Material Storage Unit | loaded log truck arrives/holds, logs staged at receiving yard |
| Silent Continuation | camera continues from receiving toward chipping |
| Woods Chipping Unit | handler feed, chipper drum/belt run, inclined conveyor lifts chips and drops them into warehouse pile |
| Wet Grinding Unit | first grinder RPM, wet particles/fiber stream, enclosed intake |
| Buffer Storage | buffer level settles, feeder path toward dryer becomes readable |
| Drying Unit | dryer/drying-line motion, moisture haze, dry outlet stream |
| Recovery Unit | cyclone/filter/separator pulse, usable dry material return, reject dust/off-size fraction |
| Dried Grinding Unit | second grinder RPM, final dry particle stream |
| Pelletizer Unit | die/roller pressure, pellet discharge begins |
| Finished Product Unit | finished pellet collection, product bed/bin resolves |
| Optional Upgrade Path | only if enabled, handoff after finished product |
| Optional Torrefaction | downstream thermal treatment, not core flow |
| Black Wood Pellet Extension | advanced product proof after optional treatment |
| Advanced Bioenergy Close | final brand-close particles and process summary |

## Transitions Between Stations

Transitions should prefer practical equipment over free-floating matter.
Raw material storage -> chipping uses truck/log handoff. After chipping, any
onward transport must be a smaller in-plant conveyor, chute, cart or bin
carrying material at the correct size and moisture state.

Critical order:

```text
wet grinding -> buffer storage -> drying -> recovery -> dried grinding
```

Do not skip buffer storage, do not place recovery before drying, and do not
treat wet grinding and dried grinding as the same beat.

## Typography Motion

- Headline: split to lines; each line `clip-path inset(0 0 100% 0) -> inset(0)`,
  y 24 -> 0, stagger 90ms, scrubbed over the arrive window.
- Eyebrow: tick scales x 0 -> 1, letters track in.
- Paragraph: single soft rise, 60% window.
- Departure: whole block moves upward and masks out over the depart window.

## Accessibility / Reduced Motion

`prefers-reduced-motion`: camera cuts, particles static at 30% density, type
reveals swap to opacity-only 200ms, Lenis disabled.
