# 10 — Performance Strategy

## Budgets
| Metric | Target |
|--------|--------|
| JS (gzip, first load) | ≤ 450 KB incl. three/gsap |
| Geometry download | 0 KB (procedural) · upgrade GLBs ≤ 350 KB each |
| Draw calls at any t | ≤ 120 (station culling + instancing) |
| Triangles at any t | ≤ 300k desktop / 120k mobile |
| Frame budget | 16.6ms desktop, 33ms accepted on tier 0 |
| CLS | 0 (canvas fixed; overlay absolutely positioned) |

## Techniques (implemented)
- **Station culling:** only the active station ±1 neighbor is visible and
  animated; everything else `visible=false`, `useFrame` early-returns.
- **InstancedMesh everywhere** quantities exceed ~10 (trees, logs, chips,
  pellet bed, bags, rail ticks in 3D never used — DOM there).
- **One particle shader program** shared by all systems → 1 compile, tiny
  program-switch cost; counts scale by quality tier (25/55/100%).
- **No per-frame allocation:** all vectors/colors pre-allocated; store reads
  are property lookups; overlay updates via GSAP `quickSetter`.
- **DPR clamp per tier** (1.25/1.5/2) + `powerPreference: high-performance`.
- **Zero re-renders on scroll:** mutable store pattern; React renders once.
- **Fixed canvas instead of 15 pins:** avoids ScrollTrigger pin-spacer layout
  storms, keeps iOS Safari address-bar resizes cheap (`resize: debounced`).
- **Lazy 3D:** `next/dynamic ssr:false`; the DOM copy is server-rendered for
  SEO inside `<noscript>`-safe overlay, so LCP is text, not WebGL.
- **prefers-reduced-motion / no-WebGL** paths (see 08).

## Asset pipeline (upgrade path, tooling committed in manifest)
- GLB: `gltf-transform optimize in.glb out.glb --compress draco --simplify`
  + Meshopt reorder; textures → KTX2 (UASTC for normal maps, ETC1S albedo).
- Images: AVIF primary / WebP fallback via `next/image`.
- Video: WebM (VP9) + H.264 MP4 fallback, `preload=none`, poster from AVIF.
- Responsive loading: manifest `fallback` chain per asset — tier 0 loads the
  fallback (image sequence or video) instead of live particles where marked.

## Monitoring
`?debug` query flag mounts drei `<Perf>` + station index HUD. Lighthouse CI
target: Perf ≥ 90 mobile (text-first LCP), A11y ≥ 95.
