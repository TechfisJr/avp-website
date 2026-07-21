# Implementation Status

Last updated: 2026-07-20

## Current State

- This repository contains a Next.js / React Three Fiber cinematic AVP Biomass website.
- The codebase does not contain the FastAPI dashboard/evidence/artifact services described in the handoff context.
- Git root resolves to `/Users/ikigaiguest`; `Documents/Project/AVP-website` is currently untracked as a project folder under that root.
- No `README.md`, `docs/superpowers/`, milestone/phase docs, or previous audit reports were present in this project folder.

## Files Changed

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `src/components/Overlay.tsx`
- `src/lib/timeline.ts`
- `src/three/stations/Circular.tsx`
- `src/three/stations/Forest.tsx`
- `src/three/stations/Grinding.tsx`
- `src/three/stations/Hero.tsx`
- `src/three/Atmosphere.tsx`
- `src/three/CanvasRoot.tsx`
- `src/three/HeroPellet.tsx`
- `src/three/fx/shaders.ts`
- `src/three/kit/industrial.ts`
- `src/three/kit/biomass.tsx`
- `src/three/stations/Energy.tsx`
- `public/models/hero-pellet.glb`
- `public/asset-manifest.json`
- `scripts/generate-hero-pellet.mjs`
- `scripts/visual-smoke.mjs`
- `docs/11-premium-visual-upgrade.md`

## Implementation Summary

- Added the missing `Overlay` implementation that consumes the real `COPY` and timeline helpers.
- Added HUD elements: wordmark, CTA, progress rail, scroll cue, and QC scan ring.
- Added the missing S14 `Circular` station with procedural rings, dawn glow, and particle fields.
- Fixed React Three Fiber type issues in biomass instancing helpers.
- Removed an invalid `rotation` prop from `cylinderGeometry` in the Energy station.
- Added standard npm scripts: `dev`, `build`, and `typecheck`.
- Changed TypeScript from `7.0.2` to `5.9.3` because Next.js build requires the compiler API exposed by `typescript/lib/typescript.js`; the installed TypeScript 7 package exported only `version.cjs`, causing Next to fail with `"id" argument must be of type string. Received undefined`.
- Accepted Next's required `tsconfig.json` updates: `jsx: "react-jsx"` and `.next/dev/types/**/*.ts` in `include`.
- Generated a real `public/models/hero-pellet.glb` asset: 269 KB GLB 2.0, single mesh, rounded cylinder proportions, vertex-color PBR material.
- Replaced the runtime hero capsule geometry with the GLB pellet geometry loaded via `useGLTF`.
- Upgraded the hero pellet shader for vertex colors, cut-end handling, fiber striations, pores, double-sided cap readability, amber rim/specular and heat/dissolve narrative states.
- Added richer hero scene separation: subtle amber glow disk, warm key cue, cool fill cue and more controlled particles.
- Improved scene readability by lifting black levels, increasing station key intensity, adding global ambient/fill/rim lights and lowering fog density in dark scenes.
- Improved forest procedural realism: varied trunks, branch silhouettes, smaller foliage clusters, underbrush leaf cards, fog/light shafts and local forest fill.
- Fixed log geometry realism: separate bark sides and true cut end caps rather than a full cap-colored cylinder through the log.
- Improved chip geometry from tetrahedral shards to flatter irregular biomass flakes with instance color/scale variation.
- Improved grinder scene readability with panelled housing, accent frame, bolts, motor, belt guard, base skid, safety rails and local work lights.
- Added `docs/11-premium-visual-upgrade.md` with the requested art direction, Blender, PBR, GLB export, R3F/Three/Spline integration and scene-by-scene production guidance.
- Added `scripts/visual-smoke.mjs` and `npm run visual:smoke` for desktop/mobile Playwright screenshot smoke tests with canvas-only PNG analysis.

## Security Hardening

- The artifact manifest/path traversal hardening described in the handoff context is not applicable to this repository as checked out: there are no backend artifact APIs, output manifests, or user-controlled artifact path resolution code here.
- No fake evidence or mock production evidence was added.
- No golden outputs were overwritten.

## Tests Executed

- `npm run typecheck`
  - Result: PASS
  - Evidence: `tsc --noEmit --pretty false` completed with exit code 0.
- `npm run build`
  - Result: PASS
  - Evidence: Next.js 16.2.10 compiled successfully, finished TypeScript, generated static pages `(3/3)`, and finalized page optimization.
- `npm run generate:hero-pellet`
  - Result: PASS
  - Evidence: wrote `public/models/hero-pellet.glb` at 269 KB.
- GLB header check
  - Result: PASS
  - Evidence: first bytes are `glTF` with version `2`.
- `npm run visual:smoke`
  - Result: PASS
  - Evidence: Playwright captured desktop hero/forest/grinder and mobile hero/forest screenshots under `.next/visual-smoke/`; canvas-only PNG analysis reported nonblank frames. Desktop hero litRatio `0.7451`, forest `0.8774`, grinder `0.7796`; mobile hero `0.9144`, forest `0.8204`.
- `npm audit --omit=dev`
  - Result: FAIL / advisory present
  - Evidence: 2 moderate vulnerabilities through `next -> postcss <8.5.10`; npm's suggested forced fix would install `next@9.3.3`, a breaking downgrade, so it was not applied.

## Remaining Risks

- The project is untracked under a broad home-directory git repository, making normal `git status` noisy and risky.
- No automated unit test suite exists yet; current visual coverage is Playwright smoke-level.
- Forest and machinery are substantially improved procedurally, but true photorealism still requires authored GLB vegetation/machine assets or approved real facility plates.
- `npm audit` reports moderate PostCSS advisories via the current Next dependency range; wait for a compatible Next/PostCSS update rather than using the breaking forced downgrade.

## Recommended Next Milestone

M2 for this actual repository should be: authored asset fidelity pass.

Priority order:
1. Commission or produce authored GLB assets for forest hero trees, log pile closeups and grinder/pellet mill machine pack.
2. Bake 1K PBR maps for pellet/log/chip materials and compare against reference under neutral light.
3. Extend Playwright coverage to reduced-motion, no-WebGL fallback and more scroll positions.
4. Move the project into its own git repository or add a project-local `.git` root to avoid home-directory git noise.
