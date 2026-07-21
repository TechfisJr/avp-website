import * as THREE from "three";

/**
 * Reusable PBR material system. Every surface family (wood, bark, pellet,
 * metal, painted metal, fabric, concrete, flooring) shares one small
 * "subtle variation" shader patch instead of flat, textureless color —
 * a cheap single-tap hash noise perturbing roughness and albedo in object
 * space, so hero-adjacent assets read as real material even before any
 * authored texture (D-class assets in the asset bible) lands. Any factory
 * accepts standard MeshStandardMaterial params (baseColor via `color`,
 * roughness, metalness, optional map/normalMap/aoMap for the texture
 * upgrade path) plus its own variation tuning.
 */

const HASH_GLSL = /* glsl */ `
  float pbrHash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.11, 0.19, 0.31));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
`;

export type VariationOpts = {
  /** object-space noise frequency — higher = finer grain */
  scale: number;
  /** +/- fraction of roughness perturbed */
  roughVar: number;
  /** +/- fraction of albedo perturbed */
  colorVar: number;
};

const DEFAULT_VARIATION: VariationOpts = { scale: 6, roughVar: 0.15, colorVar: 0.08 };

/**
 * Patches a MeshStandardMaterial's shader with cheap per-fragment surface
 * variation. Safe to call on any material using the stock physical shader
 * (all factories below do this once at creation).
 */
function withSurfaceVariation(
  material: THREE.MeshStandardMaterial,
  variation: Partial<VariationOpts> = {}
): THREE.MeshStandardMaterial {
  const v = { ...DEFAULT_VARIATION, ...variation };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uVarScale = { value: v.scale };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vObjPos;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\nvObjPos = transformed;`);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>\nvarying vec3 vObjPos;\nuniform float uVarScale;\n${HASH_GLSL}`
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>\n{\n  vec3 pR = vObjPos * uVarScale;\n  float aaR = clamp(1.0 - length(fwidth(pR)), 0.0, 1.0);\n  float nR = pbrHash(pR);\n  roughnessFactor = clamp(roughnessFactor + (nR - 0.5) * ${v.roughVar.toFixed(3)} * aaR, 0.04, 1.0);\n}`
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>\n{\n  vec3 pC = vObjPos * uVarScale * 1.7 + 11.0;\n  float aaC = clamp(1.0 - length(fwidth(pC)), 0.0, 1.0);\n  float nC = pbrHash(pC);\n  diffuseColor.rgb *= (1.0 + (nC - 0.5) * ${v.colorVar.toFixed(3)} * aaC);\n}`
      );
  };
  material.customProgramCacheKey = () => `variation-${v.scale}-${v.roughVar}-${v.colorVar}`;
  return material;
}

type Params = THREE.MeshStandardMaterialParameters;

export function createWoodMaterial(overrides: Params = {}, variation: Partial<VariationOpts> = {}) {
  const m = new THREE.MeshStandardMaterial({
    color: "#9c6a33",
    roughness: 0.78,
    metalness: 0.02,
    envMapIntensity: 0.16,
    ...overrides,
  });
  return withSurfaceVariation(m, { scale: 7, roughVar: 0.22, colorVar: 0.12, ...variation });
}

export function createBarkMaterial(overrides: Params = {}, variation: Partial<VariationOpts> = {}) {
  const m = new THREE.MeshStandardMaterial({
    color: "#4a3322",
    roughness: 0.95,
    metalness: 0,
    envMapIntensity: 0.08,
    ...overrides,
  });
  return withSurfaceVariation(m, { scale: 3.2, roughVar: 0.3, colorVar: 0.16, ...variation });
}

export function createPelletMaterial(overrides: Params = {}) {
  const m = new THREE.MeshStandardMaterial({
    color: "#a47846",
    roughness: 0.78,
    metalness: 0.02,
    envMapIntensity: 0.16,
    ...overrides,
  });
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vObjPos;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\nvObjPos = transformed;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vObjPos;\n${HASH_GLSL}`)
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        {
          // Extrusion fiber noise (stretched along Y axis)
          vec3 pExt = vObjPos * vec3(50.0, 5.0, 50.0);
          float fibers = pbrHash(pExt);
          
          // Extrusion compression rings along Y axis
          float rings = sin(vObjPos.y * 65.0 + pbrHash(vec3(0.0, floor(vObjPos.y * 65.0), 0.0)) * 4.0);
          float ringSoft = smoothstep(-0.35, 0.65, rings);
          
          // Combine fibers and compression rings
          float surface = mix(fibers, ringSoft, 0.4);
          
          // Speckled wood particles
          float speckle = step(0.93, pbrHash(vObjPos * 140.0));
          
          // Apply wood color variations
          diffuseColor.rgb *= (0.82 + 0.32 * surface);
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.52, speckle * 0.65);
          
          #ifdef USE_INSTANCING_COLOR
            diffuseColor.rgb *= vColor.rgb;
          #endif
        }`
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        {
          // Compression rings are rougher, sheared surfaces are slightly glossier
          float ringRough = sin(vObjPos.y * 65.0);
          roughnessFactor = clamp(roughnessFactor + (ringRough - 0.5) * 0.16, 0.45, 0.95);
        }`
      );
  };
  return m;
}

export function createHotPelletMaterial(overrides: Params = {}) {
  return createPelletMaterial({
    color: "#b96b24",
    emissive: "#ff6a22",
    emissiveIntensity: 1.2,
    roughness: 0.58,
    metalness: 0.02,
    envMapIntensity: 0.22,
    ...overrides,
  });
}

export function createBlackPelletMaterial(overrides: Params = {}) {
  return createPelletMaterial({
    color: "#17110c",
    emissive: "#6a3518",
    emissiveIntensity: 0.12,
    roughness: 0.64,
    metalness: 0.04,
    envMapIntensity: 0.24,
    ...overrides,
  });
}

export function createMetalMaterial(overrides: Params = {}, variation: Partial<VariationOpts> = {}) {
  const m = new THREE.MeshStandardMaterial({
    color: "#6b7078",
    roughness: 0.36,
    metalness: 0.85,
    envMapIntensity: 0.55,
    ...overrides,
  });
  return withSurfaceVariation(m, { scale: 8, roughVar: 0.12, colorVar: 0.05, ...variation });
}

export function createPaintedMetalMaterial(overrides: Params = {}, variation: Partial<VariationOpts> = {}) {
  const m = new THREE.MeshStandardMaterial({
    color: "#30343a",
    roughness: 0.5,
    metalness: 0.15,
    envMapIntensity: 0.3,
    ...overrides,
  });
  return withSurfaceVariation(m, { scale: 5, roughVar: 0.16, colorVar: 0.06, ...variation });
}

export function createFabricMaterial(overrides: Params = {}, variation: Partial<VariationOpts> = {}) {
  const m = new THREE.MeshStandardMaterial({
    color: "#d8d2c4",
    roughness: 0.85,
    metalness: 0,
    envMapIntensity: 0.18,
    ...overrides,
  });
  return withSurfaceVariation(m, { scale: 22, roughVar: 0.2, colorVar: 0.08, ...variation });
}

export function createConcreteMaterial(overrides: Params = {}, variation: Partial<VariationOpts> = {}) {
  const m = new THREE.MeshStandardMaterial({
    color: "#1b1b1c",
    roughness: 0.92,
    metalness: 0,
    envMapIntensity: 0.22,
    ...overrides,
  });
  return withSurfaceVariation(m, { scale: 4, roughVar: 0.22, colorVar: 0.05, ...variation });
}

export function createFlooringMaterial(overrides: Params = {}, variation: Partial<VariationOpts> = {}) {
  const m = new THREE.MeshStandardMaterial({
    color: "#202224",
    roughness: 0.62,
    metalness: 0.05,
    envMapIntensity: 0.32,
    ...overrides,
  });
  return withSurfaceVariation(m, { scale: 3, roughVar: 0.14, colorVar: 0.04, ...variation });
}

export function createForestFloorMaterial(overrides: Params = {}, variation: Partial<VariationOpts> = {}) {
  const m = new THREE.MeshStandardMaterial({
    color: "#16240f",
    roughness: 0.96,
    metalness: 0,
    envMapIntensity: 0.06,
    ...overrides,
  });
  return withSurfaceVariation(m, { scale: 1.6, roughVar: 0.2, colorVar: 0.22, ...variation });
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
    roughness: 0.8,
    metalness: 0,
    envMapIntensity: 0.14,
    ...overrides,
  });
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vObjPos;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\nvObjPos = transformed;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vObjPos;\n${HASH_GLSL}`)
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        {
          float d = length(vObjPos.xz);
          float angle = atan(vObjPos.z, vObjPos.x);
          
          // Organic wavy ring deformation
          float wave = sin(angle * 6.0) * 0.035 + sin(angle * 13.0) * 0.015;
          wave += pbrHash(vObjPos * 6.0) * 0.02;
          float wavyD = d + wave;
          
          // Growth rings
          float ring = 0.5 + 0.5 * sin(wavyD * 48.0);
          float ringSoft = smoothstep(0.25, 0.75, ring);
          
          // Warm acacia wood tones
          vec3 woodLight = vec3(0.72, 0.54, 0.35);
          vec3 woodDark = vec3(0.42, 0.28, 0.15);
          vec3 ringCol = mix(woodDark, woodLight, ringSoft);
          
          // Dark pith center (organic shape)
          float pithD = d + sin(angle * 4.0) * 0.02;
          float pith = 1.0 - smoothstep(0.04, 0.14, pithD);
          ringCol = mix(ringCol, vec3(0.24, 0.14, 0.08), pith);
          
          // Bark rim transition
          float rim = smoothstep(0.92, 0.98, d);
          ringCol = mix(ringCol, vec3(0.22, 0.15, 0.11), rim);
          
          // Radial drying cracks (Checks)
          float crackNoise = pbrHash(vec3(floor(angle * 22.0), 0.0, 0.0));
          float isCrack = step(0.94, crackNoise) * step(0.2, d);
          float crackLine = step(0.97, cos(angle * 22.0 + crackNoise * 5.0));
          ringCol = mix(ringCol, vec3(0.12, 0.08, 0.05), isCrack * crackLine * 0.9);
          
          // Fine wood grain noise
          float grain = pbrHash(vObjPos * 80.0);
          ringCol = mix(ringCol, ringCol * 0.9, grain * 0.15);
          
          diffuseColor.rgb = ringCol;
          #ifdef USE_INSTANCING_COLOR
            diffuseColor.rgb *= mix(vec3(1.0), vColor.rgb, 0.65);
          #endif
        }`
      );
  };
  return m;
}
