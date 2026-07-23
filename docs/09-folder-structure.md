# 09 — Folder Structure

```
/docs                          deliverables 01–10 (this set)
/public
  asset-manifest.json          full asset inventory (all categories)
  /models                      GLB upgrade path (Draco+Meshopt) — see manifest
  /textures                    KTX2/WebP upgrade path
  /images                      photography plates (D) upgrade path
  /videos                      WebM fallbacks (E) upgrade path
  /icons                       shipped SVG assets (F): wordmark, scan-ring,
                               scroll-cue, grain, rail ticks
  /hdr                         HDRI slot (lighting is analytic today)
  /audio                       ambience slot (muted-by-default upgrade)
/src
  /app
    layout.tsx                 fonts (Fraunces + Space Grotesk), metadata
    page.tsx                   server shell → dynamic <Experience>
    globals.css                tokens, overlay layout, type system, grain
  /components
    Experience.tsx             client root: scroll init + canvas + overlay
    ScrollRoot.tsx             Lenis + ScrollTrigger → scrollStore
    Overlay.tsx                HUD, progress rail, 15 <Section> blocks
    Section.tsx                eyebrow/headline/para/datapoint + reveal logic
    NoWebGL.tsx                accessible static fallback
  /three
    CanvasRoot.tsx             <Canvas> config, dpr/tier, color mgmt
    World.tsx                  assembles rig + atmosphere + stations
    CameraRig.tsx              curve, dwell easing, fov breathe, drift
    Atmosphere.tsx             fog + palette lerp + lights
    HeroPellet.tsx             protagonist (phase shader, path follow)
    /stations                  Forest.tsx Collection.tsx Screening.tsx
                               Grinding.tsx Drying.tsx Conditioning.tsx
                               Pelletizing.tsx Cooling.tsx QualityControl.tsx
                               Packaging.tsx Warehouse.tsx Logistics.tsx
                               Energy.tsx Circular.tsx
                               Note: late-stage filenames are migration slots;
                               copy maps them to the corrected process slots:
                               Recovery, Dried Grinding, Pelletizer, Finished
                               Product, then optional downstream extensions.
    /fx
      ParticleField.tsx        the shared GPU particle engine
      shaders.ts               all GLSL (pellet, particles, belt, dash)
    /kit
      industrial.ts            shared PBR materials
      machines.tsx             Frame/Hopper/Duct/Conveyor/Bag primitives
      biomass.tsx              Logs, Chips, PelletBed (instanced)
  /lib
    timeline.ts                STATIONS[] — single source of truth
    scrollStore.ts             mutable progress store
    quality.ts                 GPU-aware tier detection
    copy.ts                    all site copy (eyebrow/headline/para/data)
    palette.ts                 color tokens shared 3D ↔ CSS
```
