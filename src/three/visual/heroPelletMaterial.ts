import * as THREE from "three";

/**
 * The hero pellet's material.
 *
 * This replaces a hand-written raw ShaderMaterial. That shader lit the pellet
 * with a single hardcoded light direction that never matched the scene, and —
 * because a raw ShaderMaterial does not include three's <tonemapping_fragment>
 * or <colorspace_fragment> chunks — its output skipped ACES tone mapping and
 * the sRGB conversion that every other surface goes through. The protagonist
 * was literally being graded differently from the world around it, which is
 * why it read as a flat beige prop sitting on top of the render.
 *
 * Building on MeshPhysicalMaterial instead means the pellet gets, for free and
 * correctly: the travelling key/fill/rim rig, image-based lighting off
 * SceneEnvironment, shadow receipt, fog, ACES, and sRGB. The narrative states
 * (heat, green, dissolve) and the wood-fibre surface detail are injected as
 * shader patches on top.
 *
 * PERFORMANCE: the surface pattern is sampled ONCE, in <color_fragment>, into
 * globals that every later chunk reuses. Sampling per-chunk instead (the
 * obvious way to write this) costs nine noise evaluations per fragment on the
 * largest object on screen, which is enough to halve the frame rate on its own.
 */

const PELLET_NOISE = /* glsl */ `
  float hpHash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float hpNoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hpHash(i + vec3(0,0,0)), hpHash(i + vec3(1,0,0)), f.x),
          mix(hpHash(i + vec3(0,1,0)), hpHash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hpHash(i + vec3(0,0,1)), hpHash(i + vec3(1,0,1)), f.x),
          mix(hpHash(i + vec3(0,1,1)), hpHash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }
  vec3 hpPerturb(vec3 surfPos, vec3 surfNorm, vec2 dHdxy, float faceDir) {
    vec3 sigmaX = dFdx(surfPos);
    vec3 sigmaY = dFdy(surfPos);
    vec3 R1 = cross(sigmaY, surfNorm);
    vec3 R2 = cross(surfNorm, sigmaX);
    float fDet = dot(sigmaX, R1) * faceDir;
    vec3 grad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);
    return normalize(abs(fDet) * surfNorm - grad);
  }
`;

export type HeroPelletUniforms = {
  uTime: { value: number };
  uHeat: { value: number };
  uGreen: { value: number };
  uDissolve: { value: number };
};

export function createHeroPelletMaterial(): {
  material: THREE.MeshPhysicalMaterial;
  uniforms: HeroPelletUniforms;
} {
  const uniforms: HeroPelletUniforms = {
    uTime: { value: 0 },
    uHeat: { value: 0 },
    uGreen: { value: 0 },
    uDissolve: { value: 0 },
  };

  const material = new THREE.MeshPhysicalMaterial({
    // albedo is authored entirely in the shader patch below, so the base colour
    // and the GLB's vertex colours must not tint it a second time
    color: "#ffffff",
    vertexColors: false,
    roughness: 0.62,
    metalness: 0.0,
    envMapIntensity: 1.0,
    // the waxy lignin skin left by the die — a thin specular coat over a matte
    // fibrous body. This is the cue that separates a real pellet from a dowel.
    clearcoat: 0.55,
    clearcoatRoughness: 0.38,
    sheen: 0.3,
    sheenRoughness: 0.65,
    sheenColor: new THREE.Color("#d09a5c"),
    side: THREE.DoubleSide,
  });

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vObjPos;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\nvObjPos = transformed;`);

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vObjPos;
        uniform float uTime, uHeat, uGreen, uDissolve;
        // shared per-fragment surface samples, written once in <color_fragment>
        float gFiber = 0.5;   // longitudinal die-drag striation
        float gPores = 0.0;   // open pore mask
        float gCap = 0.0;     // 0 = barrel side, 1 = cut face
        float gHeight = 0.0;  // combined relief height for the bump pass
        float gDis = 1.0;     // dissolve noise, sampled in <clipping_planes>
        ${PELLET_NOISE}`
      )

      // --- dissolve: discard before any lighting work is done ---------------
      // The branch is on a uniform, so it is coherent across the whole draw and
      // costs nothing when the pellet is solid (which is most of the timeline).
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
        if (uDissolve > 0.001) {
          gDis = hpNoise(vObjPos * 6.0) * 0.7 + hpNoise(vObjPos * 13.0) * 0.3;
          if (gDis < uDissolve) discard;
        }`
      )

      // --- albedo: wood fibre, cut ends, pores. Samples for everything. -----
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        {
          gFiber = hpNoise(vec3(vObjPos.x * 4.0, vObjPos.y * 30.0, vObjPos.z * 4.0));
          gPores = step(0.72, hpNoise(vObjPos * 30.0));
          gCap = smoothstep(0.55, 0.86, abs(normalize(vObjPos).y));

          float fineGroove = 0.5 + 0.5 * sin(vObjPos.y * 92.0 + gFiber * 9.0);
          float cutRing = 0.5 + 0.5 * sin(length(vObjPos.xz) * 95.0 + gFiber * 5.0);

          // relief: fibre drag on the barrel, compression rings on the cut face
          gHeight = mix(gFiber, sin(length(vObjPos.xz) * 90.0) * 0.5 + 0.5, gCap);

          // Absolute LINEAR albedo. These are deliberately not multiplied into
          // the incoming diffuseColor: doing that stacked the material colour,
          // the GLB's baked vertex colour and this wood tint on top of each
          // other and drove the pellet to a saturated orange. Softwood pellet
          // albedo is a fairly desaturated warm tan.
          vec3 sideWood = mix(vec3(0.295, 0.198, 0.105), vec3(0.170, 0.108, 0.052), fineGroove);
          vec3 capWood  = mix(vec3(0.360, 0.256, 0.140), vec3(0.205, 0.138, 0.068), cutRing);
          vec3 wood = mix(sideWood, capWood, gCap);
          wood *= 0.90 + 0.20 * gFiber;
          wood *= 1.0 - gPores * 0.16;

          diffuseColor.rgb = wood;
        }`
      )

      // --- roughness: pores are matte, the extruded skin is not -------------
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        roughnessFactor = clamp(roughnessFactor + (gFiber - 0.5) * 0.22 + gPores * 0.2, 0.08, 1.0);`
      )

      // --- surface relief, from the derivatives of gHeight ------------------
      .replace(
        "#include <normal_fragment_begin>",
        `#include <normal_fragment_begin>
        {
          // dHdxy must be in view-space units, not the unitless [0,1] height —
          // see the same correction in materials.ts. Without the pixel-footprint
          // scale the relief is over-driven by ~2 orders of magnitude and the
          // pellet reads as woven basketwork rather than compressed fibre.
          float pxScale = length(dFdx(vViewPosition));
          vec2 dHdxy = vec2(dFdx(gHeight), dFdy(gHeight)) * 3.5 * pxScale;
          normal = hpPerturb(-vViewPosition, normal, dHdxy, faceDirection);
        }`
      )

      // --- narrative states ride on emissive, so they survive tone mapping --
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        if (uHeat > 0.001 || uGreen > 0.001 || uDissolve > 0.001) {
          vec3 V = normalize(vViewPosition);
          float fres = pow(1.0 - clamp(dot(normalize(normal), V), 0.0, 1.0), 2.4);

          // ember heat from within (pelletizing → furnace)
          float pulse = 0.75 + 0.25 * sin(uTime * 2.2 + vObjPos.y * 4.0);
          vec3 ember = vec3(1.0, 0.34, 0.09) * (gFiber * 1.5 + 0.35);
          totalEmissiveRadiance += ember * uHeat * pulse * 1.5;
          totalEmissiveRadiance += vec3(1.0, 0.45, 0.12) * uHeat * fres * 1.1;

          // circular-economy green rim
          totalEmissiveRadiance += vec3(0.32, 0.85, 0.42) * uGreen * fres * 1.4;

          // glowing dissolve edge
          if (uDissolve > 0.001) {
            float edge = smoothstep(uDissolve + 0.12, uDissolve, gDis);
            totalEmissiveRadiance += edge * vec3(1.0, 0.55, 0.22) * 3.0;
          }
        }`
      );
  };

  material.customProgramCacheKey = () => "hero-pellet-v2";
  return { material, uniforms };
}
