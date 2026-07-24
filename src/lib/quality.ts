// Lightweight device tiering. Deliberately minimal — the render budget is small
// enough (light post, culled scenes, capped DPR) that we only need to scale a
// couple of counts and the resolution, not toggle whole subsystems.

export type Quality = {
  tier: 0 | 1 | 2;
  dpr: number;
  pelletCount: number;
  motes: number;
  shadows: boolean;
};

export function detectQuality(): Quality {
  if (typeof window === "undefined") return TIERS[2];

  const forced = new URLSearchParams(window.location.search).get("q");
  if (forced === "0" || forced === "1" || forced === "2") return TIERS[Number(forced)];

  const nav = navigator as Navigator & { deviceMemory?: number };
  const mem = nav.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  let score: 0 | 1 | 2 = 2;
  if (coarse || mem <= 4 || cores <= 4) score = 1;
  if (mem <= 2 || cores <= 2) score = 0;
  return TIERS[score];
}

const TIERS: Record<number, Quality> = {
  2: { tier: 2, dpr: 1.75, pelletCount: 1400, motes: 260, shadows: true },
  1: { tier: 1, dpr: 1.5, pelletCount: 900, motes: 160, shadows: true },
  0: { tier: 0, dpr: 1.25, pelletCount: 500, motes: 80, shadows: false },
};
