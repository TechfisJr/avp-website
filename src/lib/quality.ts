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
    dpr: 1.25,
    particleScale: 0.5,
    pelletCount: 900,
    shadows: false,
    drift: true,
    shimmer: true,
    envResolution: 64,
    postFX: false,
    ssao: false,
  },
  1: {
    tier: 1,
    dpr: 1.1,
    particleScale: 0.32,
    pelletCount: 620,
    shadows: false,
    drift: true,
    shimmer: true,
    envResolution: 64,
    postFX: false,
    ssao: false,
  },
  0: {
    tier: 0,
    dpr: 1,
    particleScale: 0.12,
    pelletCount: 260,
    shadows: false,
    drift: false,
    shimmer: false,
    envResolution: 32,
    postFX: false,
    ssao: false,
  },
};
