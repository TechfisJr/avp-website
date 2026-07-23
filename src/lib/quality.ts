export type Quality = {
  tier: 0 | 1 | 2;
  dpr: number;
  particleScale: number;
  pelletCount: number;
  shadows: boolean;
  drift: boolean;
  shimmer: boolean;
  /** procedural environment map resolution (PMREM cube face size) */
  envResolution: number;
  /** run the postprocessing composer at all */
  postFX: boolean;
  /** screen-space ambient occlusion (most expensive single effect) */
  ssao: boolean;
};

export function detectQuality(): Quality {
  if (typeof window === "undefined") return TIERS[2];

  // QA override, e.g. https://…/?q=1 — forces a tier for perf/visual comparison.
  const forced = new URLSearchParams(window.location.search).get("q");
  if (forced === "0" || forced === "1" || forced === "2") {
    return TIERS[Number(forced)];
  }

  const nav = navigator as Navigator & { deviceMemory?: number };
  const mem = nav.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 480;

  let score = 2;
  if (coarse || mem <= 4 || cores <= 4) score = 1;
  if (small || mem <= 2 || cores <= 2) score = 0;
  return TIERS[score];
}

const TIERS: Record<number, Quality> = {
  2: {
    tier: 2,
    dpr: 2,
    particleScale: 1,
    pelletCount: 3000,
    shadows: true,
    drift: true,
    shimmer: true,
    envResolution: 128,
    postFX: true,
    ssao: true,
  },
  1: {
    tier: 1,
    dpr: 1.5,
    particleScale: 0.55,
    pelletCount: 1500,
    // Shadows are the single biggest contributor to objects reading as solid,
    // so mid-tier keeps them (at a 1024 map, see Atmosphere) and gives up SSAO
    // and depth of field instead.
    shadows: true,
    drift: true,
    shimmer: true,
    envResolution: 128,
    postFX: true,
    ssao: false,
  },
  0: {
    tier: 0,
    dpr: 1.25,
    particleScale: 0.25,
    pelletCount: 700,
    shadows: false,
    drift: false,
    shimmer: false,
    envResolution: 32,
    postFX: false,
    ssao: false,
  },
};
