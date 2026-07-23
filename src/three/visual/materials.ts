import * as THREE from "three";

/**
 * Reusable PBR material system.
 *
 * Every surface family (wood, bark, pellet, metal, painted metal, fabric,
 * concrete, flooring) shares one procedural "surface" shader patch instead of
 * flat, textureless colour. The patch does three things:
 *
 *   1. perturbs ROUGHNESS      — breaks up uniform specular response
 *   2. perturbs ALBEDO         — kills the "one solid colour" plastic read
 *   3. perturbs the NORMAL     — real micro-relief, the thing that actually
 *                                makes a matte surface stop looking injection-
 *                                moulded. This is done with three.js's own
 *                                bump-mapping math (screen-space derivatives of
 *                                a procedural height field), so it needs no UVs
 *                                and is correct under instancing.
 *
 * Coordinates are object-space, so the pattern travels with the mesh and reads
 * identically on every instance.
 *
 * envMapIntensity is deliberately near-physical (0.35–1.0). The previous values
 * (0.06–0.55) starved every surface of image-based lighting, which is the main
 * reason matte objects read as plastic: real materials get most of their
 * "material-ness" from what they reflect, not from direct light alone.
 */

const NOISE_GLSL = /* glsl */ `
  float pbrHash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.11, 0.19, 0.31));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  // value noise — smooth, unlike the raw hash, so it reads as material rather
  // than as television static
  float pbrNoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(pbrHash(i + vec3(0,0,0)), pbrHash(i + vec3(1,0,0)), f.x),
          mix(pbrHash(i + vec3(0,1,0)), pbrHash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(pbrHash(i + vec3(0,0,1)), pbrHash(i + vec3(1,0,1)), f.x),
          mix(pbrHash(i + vec3(0,1,1)), pbrHash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }
  // NOTE: there is deliberately no fbm here. This code runs per-fragment on
  // every surface in the scene, and each octave of 3D value noise costs eight
  // hash evaluations. A single octave, reused three ways (albedo, roughness,
  // relief), is the whole budget — see withSurfaceVariation.
  // three.js perturbNormalArb, inlined so we don't need a bumpMap texture bound
  vec3 pbrPerturb(vec3 surfPos, vec3 surfNorm, vec2 dHdxy, float faceDir) {
    vec3 sigmaX = dFdx(surfPos);
    vec3 sigmaY = dFdy(surfPos);
    vec3 R1 = cross(sigmaY, surfNorm);
    vec3 R2 = cross(surfNorm, sigmaX);
    float fDet = dot(sigmaX, R1) * faceDir;
    vec3 grad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);
    return normalize(abs(fDet) * surfNorm - grad);
  }
`;

export type VariationOpts = {
  /** object-space noise frequency — higher = finer grain */
  scale: number;
  /** +/- fraction of roughness perturbed */
  roughVar: number;
  /** +/- fraction of albedo perturbed */
  colorVar: number;
  /** micro-relief depth. 0 disables the normal perturbation entirely. */
  bump: number;
};

const DEFAULT_VARIATION: VariationOpts = {
  scale: 6,
  roughVar: 0.15,
  colorVar: 0.08,
  bump: 0.5,
};

/**
 * Patches a MeshStandard/MeshPhysical material with procedural surface detail.
 * Safe on any material using the stock physical shader (all factories below).
 */
function withSurfaceVariation<T extends THREE.MeshStandardMaterial>(
  material: T,
  variation: Partial<VariationOpts> = {}
): T {
  const v = { ...DEFAULT_VARIATION, ...variation };

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uVarScale = { value: v.scale };

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vObjPos;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\nvObjPos = transformed;`);

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vObjPos;
        uniform float uVarScale;
        // shared per-fragment surface state, written once in <color_fragment>
        float gSurfN = 0.5;   // the noise sample
        float gSurfAA = 1.0;  // 1 where the pattern is resolvable, 0 where it aliases
        vec2  gSurfD = vec2(0.0); // its screen-space gradient
        ${NOISE_GLSL}`
      )
      // ONE noise evaluation per fragment, reused three ways. <color_fragment>
      // runs first in the standard shader, so it is where the shared sample is
      // taken; roughness decorrelates from it by remapping rather than by
      // resampling, and the relief comes from its screen-space derivatives —
      // which the GPU already has, so the bump is effectively free.
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        {
          vec3 pC = vObjPos * uVarScale;
          // Procedural noise has no mip chain. Once one noise cell is smaller
          // than a pixel the pattern is pure aliasing, so fade the whole effect
          // out as it approaches that limit.
          gSurfAA = clamp(1.0 - length(fwidth(pC)), 0.0, 1.0);
          gSurfN = pbrNoise(pC);
          gSurfD = vec2(dFdx(gSurfN), dFdy(gSurfN));
          diffuseColor.rgb *= (1.0 + (gSurfN - 0.5) * ${v.colorVar.toFixed(3)} * gSurfAA);
        }`
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        {
          // fract(x * 7.3) decorrelates roughness from the albedo pattern
          float nR = fract(gSurfN * 7.3);
          roughnessFactor += (nR - 0.5) * ${v.roughVar.toFixed(3)} * gSurfAA;
          // Specular anti-aliasing: where the relief bends the normal fastest,
          // a smooth surface produces a sparkling mess of sub-pixel highlights.
          // Roughening in proportion to that gradient is the standard fix.
          roughnessFactor += length(gSurfD) * ${(v.bump * 0.35).toFixed(3)};
          roughnessFactor = clamp(roughnessFactor, 0.04, 1.0);
        }`
      )
      // micro-relief, from the gradient captured above. Must come after
      // normal_fragment_begin, where `normal` and `faceDirection` exist. Value
      // noise with smoothstep interpolation is C1-continuous, so the derivative
      // does not facet at cell boundaries.
      .replace(
        "#include <normal_fragment_begin>",
        v.bump > 0
          ? `#include <normal_fragment_begin>
        {
          // perturbNormalArb wants dH/dscreen in the SAME UNITS as surf_pos
          // (view space). gSurfD is the gradient of a unitless [0,1] noise, so
          // it has to be converted by the view-space size of one pixel — about
          // 0.005 units on a close surface. Feeding the raw unitless gradient
          // in over-drives the normal by roughly two orders of magnitude, which
          // is what turned every surface into golf-ball dimples. Scaling by the
          // pixel footprint also makes the relief depth independent of distance
          // and resolution, which it very much was not before.
          float pxScale = length(dFdx(vViewPosition));
          vec2 dHdxy = gSurfD * ${v.bump.toFixed(3)} * gSurfAA * pxScale;
          normal = pbrPerturb(-vViewPosition, normal, dHdxy, faceDirection);
        }`
          : "#include <normal_fragment_begin>"
      );
  };

  material.customProgramCacheKey = () =>
    `surf-${v.scale}-${v.roughVar}-${v.colorVar}-${v.bump}`;
  return material;
}

type Params = THREE.MeshStandardMaterialParameters;
type PhysParams = THREE.MeshPhysicalMaterialParameters;

export function createWoodMaterial(overrides: Params = {}, variation: Partial<VariationOpts> = {}) {
  const m = new THREE.MeshStandardMaterial({
    color: "#9c6a33",
    roughness: 0.74,
    metalness: 0.02,
    envMapIntensity: 0.55,
    ...overrides,
  });
  return withSurfaceVariation(m, {
    scale: 7,
    roughVar: 0.26,
    colorVar: 0.14,
    bump: 1.4,
    ...variation,
  });
}

export function createBarkMaterial(overrides: Params = {}, variation: Partial<VariationOpts> = {}) {
  const m = new THREE.MeshStandardMaterial({
    color: "#4a3322",
    roughness: 0.95,
    metalness: 0,
    envMapIntensity: 0.4,
    ...overrides,
  });
  // bark is the deepest relief in the scene — coarse, high-amplitude
  return withSurfaceVariation(m, {
    scale: 3.2,
    roughVar: 0.32,
    colorVar: 0.2,
    bump: 3.0,
    ...variation,
  });
}

/**
 * Wood pellet. Physical rather than Standard: extruded pellets carry a thin
 * waxy lignin sheen from the die, which is a clearcoat — that specular skin
 * over a matte fibrous body is the single strongest "this is a real pellet"
 * cue, and it's exactly what a plain rough MeshStandardMaterial cannot do.
 */
export function createPelletMaterial(
  overrides: PhysParams = {},
  variation: Partial<VariationOpts> = {}
) {
  const m = new THREE.MeshPhysicalMaterial({
    color: "#9c6a33",
    roughness: 0.66,
    metalness: 0.0,
    envMapIntensity: 0.7,
    clearcoat: 0.45,
    clearcoatRoughness: 0.42,
    // No `sheen` here, unlike the hero pellet. Sheen adds a third specular lobe
    // with its own IBL sampling, and this material is on the most numerous
    // instanced object in the world (thousands of pellets in the warehouse and
    // cooling fields). Clearcoat alone carries the lignin-skin read; sheen is
    // reserved for the single hero pellet, where it's one draw call.
    ...overrides,
  });
  return withSurfaceVariation(m, {
    scale: 14,
    roughVar: 0.2,
    colorVar: 0.14,
    bump: 1.0,
    ...variation,
  });
}

export function createMetalMaterial(overrides: Params = {}, variation: Partial<VariationOpts> = {}) {
  const m = new THREE.MeshStandardMaterial({
    color: "#6b7078",
    roughness: 0.38,
    metalness: 0.9,
    envMapIntensity: 1.0,
    ...overrides,
  });
  // brushed/worn steel: fine relief, minimal albedo drift (metals are specular)
  return withSurfaceVariation(m, {
    scale: 8,
    roughVar: 0.2,
    colorVar: 0.04,
    bump: 0.5,
    ...variation,
  });
}

export function createPaintedMetalMaterial(
  overrides: Params = {},
  variation: Partial<VariationOpts> = {}
) {
  const m = new THREE.MeshStandardMaterial({
    color: "#30343a",
    roughness: 0.52,
    metalness: 0.15,
    envMapIntensity: 0.75,
    ...overrides,
  });
  // industrial paint over sheet: shallow orange-peel relief
  return withSurfaceVariation(m, {
    scale: 5,
    roughVar: 0.18,
    colorVar: 0.07,
    bump: 0.6,
    ...variation,
  });
}

export function createFabricMaterial(overrides: Params = {}, variation: Partial<VariationOpts> = {}) {
  // Standard, not Physical: woven bulk bags would love a sheen lobe, but they
  // are background dressing and the extra IBL sampling is not worth it.
  const m = new THREE.MeshStandardMaterial({
    color: "#d8d2c4",
    roughness: 0.88,
    metalness: 0,
    envMapIntensity: 0.45,
    ...overrides,
  });
  return withSurfaceVariation(m, {
    scale: 12,
    roughVar: 0.22,
    colorVar: 0.09,
    bump: 0.8,
    ...variation,
  });
}

export function createConcreteMaterial(
  overrides: Params = {},
  variation: Partial<VariationOpts> = {}
) {
  const m = new THREE.MeshStandardMaterial({
    color: "#1b1b1c",
    roughness: 0.92,
    metalness: 0,
    envMapIntensity: 0.5,
    ...overrides,
  });
  return withSurfaceVariation(m, {
    scale: 4,
    roughVar: 0.24,
    colorVar: 0.07,
    bump: 1.8,
    ...variation,
  });
}

export function createFlooringMaterial(
  overrides: Params = {},
  variation: Partial<VariationOpts> = {}
) {
  const m = new THREE.MeshStandardMaterial({
    color: "#202224",
    roughness: 0.6,
    metalness: 0.05,
    envMapIntensity: 0.7,
    ...overrides,
  });
  // polished-ish plant floor: shallow relief, but enough to smear reflections
  return withSurfaceVariation(m, {
    scale: 3,
    roughVar: 0.18,
    colorVar: 0.05,
    bump: 0.7,
    ...variation,
  });
}

export function createForestFloorMaterial(
  overrides: Params = {},
  variation: Partial<VariationOpts> = {}
) {
  const m = new THREE.MeshStandardMaterial({
    color: "#16240f",
    roughness: 0.96,
    metalness: 0,
    envMapIntensity: 0.3,
    ...overrides,
  });
  return withSurfaceVariation(m, {
    scale: 1.6,
    roughVar: 0.24,
    colorVar: 0.26,
    bump: 2.6,
    ...variation,
  });
}

/**
 * Cut log end-grain — concentric growth rings + a dark pith center and bark
 * rim, radiating from the geometry's local origin (so it reads correctly on
 * every instance regardless of world placement). Supports per-instance
 * tinting via InstancedMesh.setColorAt, applied on top of the ring pattern.
 */
export function createLogEndMaterial(overrides: Params = {}) {
  const m = new THREE.MeshStandardMaterial({
    color: "#c9a06a",
    roughness: 0.78,
    metalness: 0,
    envMapIntensity: 0.45,
    ...overrides,
  });
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vObjPos;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\nvObjPos = transformed;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vObjPos;\n${NOISE_GLSL}`)
      // saw-kerf relief: the rings are physically raised/recessed, not painted on
      .replace(
        "#include <normal_fragment_begin>",
        `#include <normal_fragment_begin>
        {
          float dB = length(vObjPos.xz);
          float hB = sin(dB * 30.0) * 0.5 + pbrFbm(vObjPos * 26.0) * 0.5;
          vec2 dHdxy = vec2(dFdx(hB), dFdy(hB)) * 0.6;
          normal = pbrPerturb(-vViewPosition, normal, dHdxy, faceDirection);
        }`
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        {
          float d = length(vObjPos.xz);
          float wobble = pbrHash(vec3(floor(d * 5.0), 0.0, 0.0)) * 0.35;
          float ring = 0.5 + 0.5 * sin(d * 30.0 + wobble * 6.0);
          float ringSoft = smoothstep(0.3, 0.85, ring);
          vec3 ringCol = mix(vec3(0.32, 0.2, 0.1), vec3(0.64, 0.47, 0.27), ringSoft);
          float pith = 1.0 - smoothstep(0.0, 0.1, d);
          ringCol = mix(ringCol, vec3(0.16, 0.09, 0.04), pith);
          float rim = smoothstep(0.4, 0.5, d);
          ringCol = mix(ringCol, vec3(0.2, 0.13, 0.07), rim);
          float fleck = step(0.94, pbrHash(vObjPos * 40.0));
          ringCol = mix(ringCol, vec3(0.08, 0.05, 0.03), fleck * 0.6);
          diffuseColor.rgb = ringCol;
          #ifdef USE_INSTANCING_COLOR
            diffuseColor.rgb *= mix(vec3(1.0), vColor.rgb, 0.6);
          #endif
        }`
      );
  };
  m.customProgramCacheKey = () => "log-end";
  return m;
}
