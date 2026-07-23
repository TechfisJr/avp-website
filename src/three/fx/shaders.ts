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
