// All GLSL for the experience, inlined as template strings.

export const NOISE = /* glsl */ `
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.1;
      a *= 0.5;
    }
    return v;
  }
`;

// --- shared particle program -------------------------------------------------

export const PARTICLE_VERT = /* glsl */ `
  attribute vec3 aSeed;
  uniform float uTime, uLife, uSize, uRise, uGravity, uSpread, uCurl, uPx;
  uniform vec3 uDir;
  varying float vF;
  varying float vSeed;
  varying float vAngle;
  void main() {
    float f = fract(uTime / uLife + aSeed.x + aSeed.y * 7.31);
    vF = f;
    vSeed = aSeed.z;
    vAngle = aSeed.x * 6.2831853 + aSeed.y * 3.0;
    float age = f * uLife;
    vec3 vel = (aSeed - 0.5) * uSpread + uDir + vec3(0.0, uRise, 0.0);
    vec3 p = position + vel * age;
    p.y += 0.5 * uGravity * age * age;
    p.x += sin(age * 1.7 + aSeed.y * 6.2831) * uCurl * f;
    p.z += cos(age * 1.3 + aSeed.z * 6.2831) * uCurl * f;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = uSize * (0.55 + aSeed.y * 0.9);
    gl_PointSize = size * uPx * (160.0 / max(0.1, -mv.z));
  }
`;

// uShape selects the sprite silhouette family: 0 = soft puff (gas/light —
// steam, glow, embers, spores), 1 = angular shard (solid debris — chips,
// sawdust, fines, stones), 2 = fine speck (dust). Chosen per ParticleField
// use, not per-particle, but each particle still varies via vAngle/vSeed so
// a "solid" burst reads as irregular falling matter, not a bokeh cloud.
export const PARTICLE_FRAG = /* glsl */ `
  precision highp float;
  varying float vF;
  varying float vSeed;
  varying float vAngle;
  uniform vec3 uColorA, uColorB;
  uniform float uIntensity;
  uniform float uShape;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float s = sin(vAngle);
    float c = cos(vAngle);
    vec2 ruv = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);

    float shape;
    if (uShape > 1.5) {
      // fine speck — small, tight, slightly squared
      vec2 q = abs(ruv) * vec2(2.6, 2.6);
      shape = smoothstep(0.55, 0.18, max(q.x, q.y));
    } else if (uShape > 0.5) {
      // angular shard — elongated + skewed, reads as a falling chip/fleck
      vec2 q = ruv * vec2(1.5, 3.4);
      float edge = length(q) + 0.25 * sin((vSeed + 0.5) * 18.0 + atan(q.y, q.x) * 3.0);
      shape = smoothstep(0.5, 0.14, edge);
    } else {
      // soft puff — original round falloff, for gas/light effects
      shape = smoothstep(0.5, 0.06, length(uv));
    }

    float fade = smoothstep(0.0, 0.14, vF) * (1.0 - smoothstep(0.62, 1.0, vF));
    vec3 col = mix(uColorA, uColorB, clamp(vF + (vSeed - 0.5) * 0.4, 0.0, 1.0));
    float a = shape * fade * uIntensity;
    if (a < 0.012) discard;
    gl_FragColor = vec4(col, a);
  }
`;

// --- hero pellet --------------------------------------------------------------

export const PELLET_VERT = /* glsl */ `
  attribute vec3 color;
  varying vec3 vN;
  varying vec3 vP;
  varying vec3 vW;
  varying vec3 vColor;
  void main() {
    vN = normalize(normalMatrix * normal);
    vP = position;
    vW = (modelMatrix * vec4(position, 1.0)).xyz;
    vColor = color;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const PELLET_FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vN;
  varying vec3 vP;
  varying vec3 vW;
  varying vec3 vColor;
  uniform float uTime, uHeat, uGreen, uChar, uDissolve;
  uniform vec3 uLightDir;
  ${NOISE}
  void main() {
    vec3 N = normalize(gl_FrontFacing ? vN : -vN);

    // dissolve mask (hero exit — matter becomes particles)
    float n = fbm(vP * 6.0);
    if (uDissolve > 0.001 && n < uDissolve) discard;

    // compressed wood-fiber striations along the extrusion axis.
    float sideFiber = fbm(vec3(vP.x * 4.0, vP.y * 34.0, vP.z * 4.0));
    float fineGroove = 0.5 + 0.5 * sin(vP.y * 92.0 + sideFiber * 9.0);
    float cap = smoothstep(0.55, 0.86, abs(N.y));
    float cutRing = 0.5 + 0.5 * sin(length(vP.xz) * 95.0 + fbm(vP * 18.0) * 5.0);
    float pores = step(0.78, fbm(vec3(vP.x * 36.0, vP.y * 18.0, vP.z * 36.0)));

    vec3 sideWood = mix(vec3(0.54, 0.36, 0.2), vec3(0.31, 0.2, 0.11), fineGroove);
    vec3 capWood = mix(vec3(0.62, 0.45, 0.27), vec3(0.37, 0.25, 0.13), cutRing);
    vec3 wood = mix(sideWood, capWood, cap);
    wood = mix(wood, vColor, 0.58);
    wood *= 0.86 + 0.26 * sideFiber;
    wood *= 1.0 - pores * 0.18;
    wood += cap * vec3(0.08, 0.055, 0.025);
    vec3 charWood = mix(vec3(0.12, 0.085, 0.055), vec3(0.035, 0.028, 0.022), fineGroove);
    charWood += cap * vec3(0.035, 0.027, 0.018);
    wood = mix(wood, charWood, uChar);

    vec3 V = normalize(cameraPosition - vW);
    vec3 L = normalize(uLightDir);
    float diff = max(0.0, dot(N, L));
    float halfLambert = pow(diff * 0.5 + 0.5, 1.7);
    float fill = clamp(dot(N, normalize(vec3(-0.7, 0.35, 0.55))) * 0.5 + 0.5, 0.0, 1.0);
    float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.2);
    float spec = pow(max(0.0, dot(reflect(-L, N), V)), 38.0) * (0.08 + uChar * 0.12) * (1.0 - pores * 0.6);

    vec3 col = wood * (0.22 + halfLambert * vec3(1.0, 0.96, 0.88) * 1.02 + fill * 0.3);
    col += fres * mix(vec3(1.0, 0.78, 0.46), vec3(0.9, 0.62, 0.34), uChar) * (0.42 + uChar * 0.18);
    col += spec * vec3(1.0, 0.82, 0.52);

    // ember heat from within
    float pulse = 0.75 + 0.25 * sin(uTime * 2.2 + vP.y * 4.0);
    vec3 ember = vec3(1.0, 0.42, 0.12) * (sideFiber * 1.4 + 0.3);
    col = mix(col, ember, uHeat * pulse * 0.65 * (1.0 - uChar * 0.45));
    col += uHeat * fres * vec3(1.0, 0.5, 0.15) * 0.8;

    // torrefaction: darker carbonized body with retained dense-product sheen.
    vec3 torrefied = col * 0.12 + vec3(0.014, 0.011, 0.009);
    torrefied += fres * vec3(0.36, 0.23, 0.13) * 0.42;
    torrefied += spec * vec3(1.0, 0.72, 0.42) * 1.35;
    col = mix(col, torrefied, clamp(uChar * 1.25, 0.0, 1.0));

    // legacy green accent, kept at zero in the target higher-value narrative
    col += uGreen * fres * vec3(0.45, 0.85, 0.5) * 1.2;
    col = mix(col, col + vec3(0.1, 0.3, 0.14), uGreen * 0.25);

    // glowing dissolve edge
    if (uDissolve > 0.001) {
      float edge = smoothstep(uDissolve + 0.12, uDissolve, n);
      col += edge * vec3(1.0, 0.6, 0.25) * 2.0;
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

// --- conveyor belt -------------------------------------------------------------

export const BELT_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const BELT_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime, uSpeed;
  void main() {
    float x = fract(vUv.x * 14.0 - uTime * uSpeed);
    float cleat = smoothstep(0.0, 0.05, x) * (1.0 - smoothstep(0.12, 0.17, x));
    vec3 col = mix(vec3(0.055, 0.055, 0.06), vec3(0.13, 0.12, 0.11), cleat);
    float edge = smoothstep(0.0, 0.06, vUv.y) * (1.0 - smoothstep(0.94, 1.0, vUv.y));
    col *= 0.6 + 0.4 * edge;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// --- logistics route dash -------------------------------------------------------

export const DASH_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const DASH_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime, uDraw;
  uniform vec3 uColor;
  void main() {
    if (vUv.x > uDraw) discard;
    float dash = step(0.5, fract(vUv.x * 60.0 - uTime * 0.6));
    float head = smoothstep(uDraw - 0.06, uDraw, vUv.x) * 2.0;
    float a = (0.25 + dash * 0.5 + head) * (1.0 - smoothstep(0.9, 1.0, vUv.x));
    gl_FragColor = vec4(uColor * (1.0 + head), a);
  }
`;
