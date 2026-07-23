import { PALETTE } from "./palette";
import type { PresetName } from "@/three/visual/presets";

// ---------------------------------------------------------------------------
// The single source of truth for the whole experience.
// 15 stations (hero + 14 chapters) laid along an S-curve in world space.
// Both the 3D world and the DOM overlay read from this file — they can't drift.
// ---------------------------------------------------------------------------

export const N = 15;
export const SECTION_VH = 160; // scroll length per station
export const TRACK_VH = N * SECTION_VH;

const SPACING = 30;

type V3 = [number, number, number];

export type StationDef = {
  id: string;
  index: number;
  pos: V3; // station group origin (world)
  focus: V3; // camera lookAt (world)
  cam: V3; // camera dwell position (world)
  fog: string; // fog + background color
  key: string; // key light color
  keyIntensity: number;
  fogDensity: number;
  /** which of the 6 global lighting presets this station's rig is built from */
  preset: PresetName;
  // hero pellet staging (camera space offset; scale 0 hides it)
  hero: { off: V3; scale: number; heat: number; green: number; char: number };
};

const base = (i: number): V3 => [Math.sin(i * 0.85) * 18, 0, -i * SPACING];

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// id, focus offset, camera offset, fog, key, keyIntensity, fogDensity, preset, hero staging
// Camera rule for station assets: use side or three-quarter side views at
// machine/operator height. Do not use top-down camera offsets for asset scenes.
type Row = [string, V3, V3, string, string, number, number, PresetName, StationDef["hero"]];

const ROWS: Row[] = [
  ["hero",        [0, 2, 0],   [0, 2.2, 5],    "#090806", PALETTE.amber, 3.2, 0.02,  "heroProduct", { off: [1.25, -0.05, -3.65], scale: 0.68, heat: 0.08, green: 0, char: 0 }],
  ["forest",      [-3.6, 2.2, -60], [2.8, 1.8, 18], "#16110a", PALETTE.amber, 2.4, 0.023, "warmBiomass", { off: [0, 0, -3],    scale: 0,   heat: 0,    green: 0,    char: 0 }],
  ["collection",  [-6.4, 2.25, -30], [5.2, 2.1, 13],  "#16110a", PALETTE.amber, 2.5, 0.023, "warmBiomass", { off: [0, 0, -3],    scale: 0,   heat: 0,    green: 0,    char: 0 }],
  ["screening",   [0, 1.8, 0], [7, 1.1, 21], "#121315", "#e4d6b4", 2.1, 0.022, "industrial",  { off: [0, 0, -3],    scale: 0,   heat: 0,    green: 0,    char: 0 }],
  ["grinding",    [0, 1.65, 0], [8.6, 0.85, 8.8], "#121315", "#e4d6b4", 2.35, 0.022, "industrial",  { off: [0, 0, -3],    scale: 0,   heat: 0,    green: 0,    char: 0 }],
  ["drying",      [0, 1.75, 0], [10, 0.95, 7.5], "#170f08", "#e8b46b",   2.6, 0.024, "industrial",  { off: [0, 0, -3],    scale: 0,   heat: 0,    green: 0,    char: 0 }],
  ["conditioning",[0, 1.75, 0], [-5, 1, 8.5], "#15100a", "#e0b984",      2.3, 0.026, "industrial",  { off: [0, 0, -3],    scale: 0,   heat: 0.4,  green: 0,    char: 0 }],
  ["pelletizing", [0, 1.75, 0], [-6, 0.95, 8], "#180c08", PALETTE.ember, 3.0, 0.024, "industrial",  { off: [0, 0, -3], scale: 0, heat: 0, green: 0, char: 0 }],
  ["cooling",     [0, 1.25, 0], [7, 0.9, 8], "#0d1518", PALETTE.frost, 2.0, 0.023, "industrial",  { off: [0, 0, -3.2],scale: 0,   heat: 0, green: 0, char: 0 }],
  ["qc",          [0, 1.45, 0], [2.5, 0.9, 7.2], "#0d1518", PALETTE.frost, 2.2, 0.02,  "industrial",  { off: [0, 0, -3.55], scale: 0, heat: 0, green: 0, char: 0 }],
  ["packaging",   [0, 1.65, 0], [4.5, 0.9, 8], "#160b06", PALETTE.ember, 2.6, 0.022, "industrial",  { off: [0, 0, -4.35], scale: 0, heat: 0, green: 0, char: 0 }],
  ["warehouse",   [0, 1.7, 0], [-5, 0.9, 10.5], "#150b06", PALETTE.ember, 2.8, 0.023, "industrial",  { off: [1.9, -0.85, -5.1], scale: 0.24, heat: 0.32, green: 0, char: 1 }],
  ["logistics",   [0, 1.45, 0], [3.8, 1.1, 9], "#120906", PALETTE.ember, 2.6, 0.02,  "industrial",  { off: [1.15, -0.35, -4.1], scale: 0, heat: 0.25, green: 0, char: 1 }],
  ["energy",      [0, 1.75, 0], [-4.8, 1, 9], "#120906", PALETTE.ember, 2.8, 0.02,  "industrial",  { off: [1.25, -0.55, -4.15], scale: 0, heat: 0.22, green: 0,    char: 1 }],
  ["circular",    [0, 1.7, 0], [2.8, 1, 9], "#120906", PALETTE.ember, 2.7, 0.021, "industrial",  { off: [0.4, -0.2, -3.8],  scale: 0, heat: 0.12, green: 0, char: 1 }],
];

export const STATIONS: StationDef[] = ROWS.map((r, i) => {
  const p = base(i);
  return {
    id: r[0],
    index: i,
    pos: p,
    focus: add(p, r[1]),
    cam: add(add(p, r[1]), r[2]),
    fog: r[3],
    key: r[4],
    preset: r[7],
    keyIntensity: r[5],
    fogDensity: r[6],
    hero: r[8],
  };
});

// --- progress helpers -------------------------------------------------------

export const W = 1 / N;

export function windowOf(i: number): [number, number] {
  return [i * W, (i + 1) * W];
}

/** local 0..1 progress inside station i's window (clamped) */
export function stationLocal(t: number, i: number): number {
  return Math.min(1, Math.max(0, (t - i * W) / W));
}

/** station index the camera currently dwells at */
export function stationIndex(t: number): number {
  return Math.min(N - 1, Math.max(0, Math.floor(t * N)));
}

/** is station i within render distance of t (self ± 1 window) */
export function isActive(t: number, i: number): boolean {
  const [a, b] = windowOf(i);
  return t > a - W && t < b + W;
}

/** render a little earlier than the animation window so the browser can warm
 * the next station before the camera arrives. Animation still uses isActive. */
export function isRenderWarm(t: number, i: number): boolean {
  const [a, b] = windowOf(i);
  return t > a - W * 1.2 && t < b + W * 0.45;
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

/** rises over the arrive phase, holds, falls over the depart phase */
export const bell = (local: number) =>
  smooth(local / 0.22) * (1 - smooth((local - 0.78) / 0.22));

/**
 * Dwell mapping: within each window the camera holds (with a slight creep)
 * for 60% and travels to the next station over the last 40%.
 * Returns fractional station coordinate s ∈ [0, N-1].
 */
export function dwellCoord(t: number): number {
  const i = stationIndex(t);
  const local = stationLocal(t, i);
  const creep = 0.1 * (local / 0.6);
  if (local < 0.6) return Math.min(N - 1, i + creep);
  const travel = smooth((local - 0.6) / 0.4);
  return Math.min(N - 1, i + 0.1 + travel * 0.9);
}

/** overlay visibility 0..1 for station i at global t (reveal → hold → exit) */
export function overlayAlpha(t: number, i: number): number {
  const local = (t - i * W) / W; // unclamped
  if (local < -0.1 || local > 1.05) return 0;
  if (i === 0) {
    const inA = smooth((local - 0.08) / 0.24);
    const outA = 1 - smooth((local - 0.72) / 0.2);
    return clamp01(Math.min(inA, outA));
  }
  if (i === 1 || i === 2) {
    const inA = smooth((local - 0.02) / 0.14);
    const outA = 1 - smooth((local - 0.74) / 0.2);
    return clamp01(Math.min(inA, outA));
  }
  const inA = smooth((local - 0.12) / 0.22);
  const last = i === N - 1;
  const outA = last ? 1 : 1 - smooth((local - 0.72) / 0.2);
  return clamp01(Math.min(inA, outA));
}

/** reveal progress 0..1 (drives line masks; separate from alpha for stagger) */
export function overlayReveal(t: number, i: number): number {
  const local = (t - i * W) / W;
  if (i === 0) return smooth((local - 0.08) / 0.28);
  if (i === 1 || i === 2) return smooth((local - 0.02) / 0.18);
  return smooth((local - 0.1) / 0.3);
}
