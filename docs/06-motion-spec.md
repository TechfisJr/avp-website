# 06 — Motion Specification

## Global rules
- **Scrub everything.** No time-based autoplay animation except idle micro-motion
  (pellet rotation, particle drift, machinery spin) which runs on the clock but
  is amplitude-modulated by scroll proximity to its station.
- **Tempo:** 160vh of scroll per station ⇒ a full read of the site is a slow
  ~2.5-minute dolly. Lenis `lerp: 0.09`, wheel multiplier 1.0 — heavy, filmic.
- **Easing:** camera travel `power2.inOut` between stations with a 60% dwell
  plateau; typography `expo.out`; nothing bounces.
- **No generic fade-ins.** Type reveals with `clip-path: inset()` line masks +
  8px rise; data points count up; eyebrow tick draws in via stroke-dashoffset.

## Camera grammar
- Path: `CatmullRomCurve3` through 15 keyframed positions; lookAt targets
  lerped per segment with their own ease so the gaze leads the move.
- Dwell mapping: within a station window, progress 0–0.2 = arrive,
  0.2–0.8 = hold (local scene animation scrubs), 0.8–1.0 = depart.
- FOV breathes 38° ↔ 46° on arrival/departure for a subtle dolly-zoom feel.
- Micro-drift: ±0.05m Perlin handheld float, scaled to 0 on mobile.

## Per-station key beats (scrubbed within each dwell)
| Station | 0.2 → 0.8 local scrub drives |
|---------|------------------------------|
| Hero | pellet rotation ×1.5, dust density ↑, title tracking-in |
| Responsible Wood Source | loaded log truck idles, source light/fog settles, headlights motivate the handoff |
| Raw Wood Receiving | loaded truck arrives at the plant, logs are staged for chipping |
| Wood Chips | crane/grapple feed, chipper drum/belt run, inclined conveyor lifts chips and drops them to pile |
| Grinding | drum RPM 0→peak, sawdust burst emission, 0.03 rad camera shake at peak |
| Drying | drum rotation, steam emission, moisture counter 55→10 |
| Conditioning | vortex curl strength, steam jet length |
| Pelletizing | die rotation, strand extrusion scale 0→1, pellet rain rate, ember glow |
| Cooling | color temp lerp amber→teal, shimmer amplitude→0, steam→0 |
| Value Upgrading | scan-selection ring pulse, value arcs draw in, pellet handoff warms |
| Thermal Upgrading | conveyor run, heater-ring pulse, chamber glow and controlled-atmosphere particles |
| Torrefaction | reactor heat pulse, pellet color/material shift, sealed-treatment particles |
| Value Creation | white-to-black value-flow arcs, technology-core pulse, comparison score bars |
| Black Wood Pellet | product halo, black pellet cluster shimmer, premium value particles |
| Advanced Bioenergy | value ladder reveal, Black Wood Pellet proof halo, final brand-close particles |

## Transitions between stations (the connective tissue)
Transitions should prefer practical equipment over free-floating matter.
Origin handoff uses the loaded log truck: source context -> factory receiving.
Raw Wood -> Wood Chips uses the same large log truck only up to the chipping
line. After chips are produced, any onward transport must be a smaller in-plant
cart, chute, conveyor or bin carrying chip-sized material, not full logs. Fog
color and key-light color still lerp across the boundary (defined per station in
`lib/timeline.ts`).

## Typography motion
- Headline: split to lines; each line `clip-path inset(0 0 100% 0) → inset(0)`,
  y 24→0, stagger 90ms, `expo.out`, scrubbed over the arrive window.
- Eyebrow: tick scales x 0→1, letters tracking 0.4em→0.14em.
- Paragraph: single soft rise, 60% window.
- Departure: whole block y −24, opacity→0 over the depart window (masked, not
  a naked fade — the block exits under a moving gradient mask).

## Accessibility / reduced motion
`prefers-reduced-motion`: camera cuts (no travel), particles static at 30%
density, type reveals swap to opacity-only 200ms, Lenis disabled.
