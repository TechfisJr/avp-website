# 11 - Premium Visual Upgrade

## 1. Improved Visual Art Direction

The site should read as a restrained industrial-luxury film, not a tech demo.
The frame language is simple: one subject, one motivated key light, visible
material detail, atmospheric separation, and a darker background that still has
lift in the shadows.

Art direction target:
- Hero: a single tactile pellet, 6 mm diameter / 16-22 mm length in real-world
  proportion, floating in a dark amber-lit volume.
- Environments: grounded, layered and believable, with industrial subjects
  separated by rim light and fill rather than buried in black.
- Materials: matte, rough and physically plausible; wood should show fiber,
  compression, color flecks and cut-end variation.
- Motion: slow, premium, deliberate. No bouncy or synthetic movement.

## 2. Quality Issues Found In The Current Scenes

- The previous hero was a capsule with shader grain, useful as a prototype but
  too abstract for a premium pellet brand.
- Forest trees were mostly cylinder/cone primitives, producing a simplified
  silhouette instead of layered woodland depth.
- Logs used a whole inner cylinder as the cap material, so cut surfaces were
  not physically credible.
- Chips were tetrahedron shards, too generic and gem-like for biomass.
- The grinder lacked panel seams, bolts, motor mass, belt guard, rails and local
  work lights, so it did not read as a real industrial machine.
- Background black levels were too low. Objects disappeared instead of reading
  as premium silhouettes.
- Materials lacked enough roughness/color variation to imply bark, cut wood,
  compressed pellet fiber and painted metal.

## 3. Corrected Hero Pellet Design Specification

Use the pellet reference only for color, texture and surface quality. Do not use
the pile photo as a hero image.

Hero model:
- Shape: short cylinder, slightly uneven radius, bevelled/rounded edges, subtly
  convex cut ends.
- Real-world scale target: 6 mm diameter, 16-22 mm length. In scene units:
  radius 0.38, length 1.9.
- Silhouette: mostly straight side wall, soft edge roll-off, no perfect capsule
  football shape.
- Surface: compressed longitudinal fibers on the side, saw-cut grain rings on
  the ends, small dark pores, tiny chips and organic radius variation.
- Material: matte/semi-matte wood, roughness 0.8-0.9, metalness 0, warm tan to
  medium brown, darker compacted grooves, lighter cut ends.
- Web asset: single mesh GLB under 350 KB, vertex colors included, no texture
  request required for first release.

Current implemented asset:
- `public/models/biomass/hero-pellet.glb`
- 269 KB
- Single mesh named `HeroWoodPellet`
- Vertex-color PBR material embedded
- Loaded by `src/three/HeroPellet.tsx`

## 4. Blender Modeling Steps

1. Set units to metric. Model at real scale or a clean proportional scale:
   diameter 6 mm, length 18 mm.
2. Add a cylinder with 48-64 radial segments and 24-40 length subdivisions.
3. Add bevels to both end edges. Keep the end faces mostly flat with slight
   convex/uneven deformation.
4. Add a Displace modifier for side roughness:
   - Direction: normal
   - Strength: 0.05-0.12 mm
   - Texture: procedural noise mixed with elongated wood-fiber streaks
5. Add a second fine bump/displace layer:
   - Directional fibers aligned with pellet length
   - Small dark pore masks and compressed groove bands
6. Sculpt or procedurally deform the cut ends:
   - Subtle radial rings
   - Small saw-cut chips
   - Slightly lighter exposed fiber
7. Apply scale, shade smooth, then add a Weighted Normal modifier.
8. Keep geometry efficient: target 4k-8k triangles for the hero pellet.
9. Name the mesh `HeroWoodPellet`.
10. Keep origin at pellet center, Y axis along pellet length.

## 5. Material Setup Steps

Base PBR material:
- Base color: warm tan/brown, around `#9b6b3d`, with procedural variation.
- Roughness: 0.82-0.9.
- Metalness: 0.
- Specular: low, broad, not glossy plastic.
- Normal/bump:
  - Side: lengthwise fiber streaks, fine grooves.
  - End caps: radial cut rings and chipped fiber.
- Color variation:
  - Dark flecks: compacted bark/wood pores.
  - Light flecks: fresh fiber highlights on cut ends.
  - Longitudinal darker bands: compressed extrusion marks.

Recommended Blender node approach:
- Noise Texture -> ColorRamp for base color variation.
- Wave Texture along pellet length -> Bump for fiber compression.
- Voronoi/Noise high scale -> dark pore mask.
- Separate material masks for side vs cap if using assigned face groups.

## 6. GLB Export Settings

Blender export:
- Format: GLB binary.
- Selected Objects only: on.
- Apply Modifiers: on.
- +Y or local Y as pellet length; preserve centered origin.
- Materials: Export PBR materials.
- Images: WebP/PNG if using baked textures; keep 1K max for hero.
- Geometry compression: Draco or Meshopt after export if the final asset
  exceeds 350 KB.
- Animation: off for the hero pellet asset. Runtime handles spin/dissolve.
- Target budget: 150-350 KB for the hero pellet GLB.

Post-export optimization:
```bash
gltf-transform optimize hero-pellet.glb hero-pellet.optimized.glb \
  --compress meshopt \
  --texture-compress webp \
  --texture-size 1024
```

## 7. Web Integration Recommendations

React Three Fiber:
- Load the GLB with `useGLTF("/models/biomass/hero-pellet.glb")`.
- Reuse the GLB geometry, but apply the runtime material needed for story
  states: neutral wood, heated pellet, dissolve, circular green rim.
- Preload the model with `useGLTF.preload`.
- Keep the pellet camera-anchored for hero/QC/product shots so it remains the
  visual protagonist.
- Use Suspense around the 3D world.

Three.js:
- Use `MeshStandardMaterial` if no dissolve/heat states are needed.
- For this site, keep the custom shader but feed it GLB vertex colors.
- Do not use the pellet reference as a sprite, decal, or billboard.

Spline:
- Import `hero-pellet.glb`.
- Keep material roughness high.
- Add one soft amber key, one cool rim, and low fill.
- Avoid strong glossy reflection; pellets are compressed matte wood.

## 8. Scene-By-Scene Improvement Suggestions

Forest:
- Use mixed trunk thicknesses, slight lean, bark hue variation and natural
  spacing.
- Replace cone canopies with layered foliage clusters and foreground leaves.
- Keep a camera corridor open, but add foreground/midground/background trunks
  for parallax.
- Use warm backlight through trees plus cool-green fill.
- Keep fog visible but not opaque; silhouettes should separate by distance.

Logs:
- Use separate side bark and true end-cap geometry.
- Add radius/length variation; avoid identical cylinders.
- End caps should be lighter, flatter and show radial fiber rings.
- Bark should be rough, darker, with longitudinal ridges.
- Add amber side light to reveal log pile shape.

Wood Chips:
- Use thin flake/plank shards, not tetrahedrons.
- Vary scale, rotation, color and thickness.
- Keep chips warm and rough, with a few lighter fresh-cut surfaces.
- Light from above/side so the pile reads as biomass, not random fragments.

Grinding Machine:
- Add real industrial cues: panel seams, access doors, bolts, motor, belt guard,
  discharge flange, base skid, safety rail.
- Use brighter painted panels and blue/teal accent frames for readability.
- Keep the exposed hammer drum visible through an inspection opening.
- Add local work lights and rim lights; the machine should read even before
  particles animate.

Hero Pellet:
- Frame as a luxury product object: centered, negative space, slow spin.
- Use warm key at upper-left, cool rim from opposite side, minimal fill.
- Add amber dust motes and a subtle background glow disk.
- Keep the pellet large enough to inspect material detail.

## 9. Lighting And Color Recommendations

Do not solve premium mood by making everything black. Use controlled darkness:
- Background black floor: `#090806` to `#15100c`, not pure black.
- Hero key: warm amber `#e8a33d`, soft and directional.
- Rim: cool frost `#7fb4c7` or warm cream `#f7e3bd` depending on scene.
- Fill: low neutral, 10-20% of key intensity.
- Fog: enough to create layers, not enough to flatten contrast.
- Subject separation rule: the subject edge should always be at least 15-25%
  brighter or cooler/warmer than the local background.
- Industrial scenes: use practical work-light pools on the machine, not only
  global ambient light.

Suggested ratios:
- Hero: key 1.0, rim 0.45, fill 0.15.
- Forest: sun shaft/backlight 1.0, green fill 0.35, fog density low-medium.
- Grinder: work light 1.0, rim 0.55, ambient fill 0.25.
- Energy: furnace 1.0, smoke/fill 0.2, rim 0.35.

## 10. Final Production Recommendations

- Keep the procedural implementation for performance, but replace the most
  inspected objects with authored GLB assets: hero pellet first, then machine
  pack, log pile hero cluster, and detailed feedstock clumps.
- Build a small material library: pellet, bark, cut wood, chips, painted metal,
  worn steel, rubber, cloth, glass.
- Add visual QA as a required milestone: desktop screenshot, mobile screenshot,
  reduced-motion screenshot, and one mid-scroll screenshot per major act.
- Do not add fake evidence, fake production photos or unrelated stock plates.
  Any future photo/video plate should be real facility material or clearly
  marked as upgrade-path.
- Keep the cinematic single-scroll architecture. Improve asset fidelity and
  lighting inside it rather than rebuilding the interaction model.
