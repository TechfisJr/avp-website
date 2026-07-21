# 08 — Technical Architecture

## Stack
Next.js 16 (App Router) · TypeScript strict · React Three Fiber 9 · Three.js
0.185 · Drei 10 · GSAP 3 + ScrollTrigger · Lenis 1. Spline: not used — no
scene here benefits over hand-written procedural shaders (decision recorded;
`asset-manifest.json` keeps a B-slot for future marketing scenes).

## Rendering model
- `page.tsx` (server) → `<Experience>` via `next/dynamic` `ssr:false`.
- One fixed, full-viewport `<Canvas>` for the whole site. DOM scroll track
  behind it provides native scrollbar + accessibility.
- Frameloop: `always` while any motion is live; `demand` + invalidate when the
  tab is hidden or reduced-motion is on.

## State: the progress store (no React state on the hot path)
`src/lib/scrollStore.ts` — a plain mutable object `{ t, velocity }` written by
ScrollTrigger's onUpdate. 3D reads it in `useFrame`; overlay reads it in one
rAF loop. Zero re-renders during scroll.

## Single source of truth: `src/lib/timeline.ts`
```ts
type Station = {
  id: string; index: number;
  camPos: Vec3; lookAt: Vec3;        // world-space keyframes
  fog: string; key: string;          // palette per station
  window: [number, number];          // global t in/out (computed)
}
```
World positions lay the 14 stations along a gentle S-curve in world space
(each ~24 units apart) so travel shots pass through real geometry.
`CameraRig` builds a CatmullRomCurve3 from `camPos[]`; a `dwell()` easing maps
global t → curve parameter with per-station holds. Helpers exported:
`stationLocal(t, i)` → 0..1 local scrub, and `window(i)`.

## Component contracts
Every station component receives nothing and reads the store itself:
```ts
function useStation(i: number) {
  // returns { local, active, ref } — local = dwell-scrub 0..1,
  // active = window ±1 neighbor (else the group sets visible=false)
}
```
Culling: stations outside `active` skip their useFrame work and hide — only
~2–3 station groups render at any time despite one continuous world.

## Shaders
- `heroPellet.frag/vert` — fbm wood fiber, phase morph uniform.
- `particles.vert/frag` — one program for all particle systems; per-system
  uniforms (curl, gravity, ramp) + per-particle attributes (seed, life).
- `belt`, `heatShimmer` (fullscreen quad in cooling only), `routeDash`.
All inlined as TS template strings (no loader plumbing, tree-shakes fine).

## Quality tiers (`src/lib/quality.ts`)
Detected once: `deviceMemory`, `hardwareConcurrency`, pointer coarseness,
WebGL renderer string, screen size → `tier: 0|1|2`.
| | tier 2 desktop | tier 1 tablet | tier 0 mobile/weak |
|--|--|--|--|
| DPR cap | 2 | 1.5 | 1.25 |
| Particles | 100% | 55% | 25% |
| Instanced pellets | 3000 | 1500 | 700 |
| Shadows | 1 key PCF | off | off |
| Fog/shimmer shaders | full | full | shimmer off |
| Handheld drift | on | on | off |

## Directory structure — see `docs/09` (folders) and repo tree.

## Failure modes handled
- No WebGL → `<NoWebGL>` static SVG-illustrated fallback page with full copy.
- `prefers-reduced-motion` → cut-based camera, opacity reveals, Lenis off.
- Context loss → R3F recovers; overlay copy is always readable regardless.
