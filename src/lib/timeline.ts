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
  hero: { off: V3; scale: number; heat: number; green: number };
};

const base = (i: number): V3 => [Math.sin(i * 0.85) * 18, 0, -i * SPACING];

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// id, focus offset, camera offset, fog, key, keyIntensity, fogDensity, preset, hero staging
type Row = [string, V3, V3, string, string, number, number, PresetName, StationDef["hero"]];

const ROWS: Row[] = [
  ["hero",        [0, 2, 0],   [0, 2.2, 5],    "#090806", PALETTE.amber, 2.8, 0.022, "heroProduct", { off: [0, 0, -3.4],  scale: 1,   heat: 0.02, green: 0 }],
  ["forest",      [0, 4, 0],   [7, 2, 12],     "#111b12", "#c9e3a5",     2.2, 0.036, "forest",      { off: [0, 0, -3],    scale: 0,   heat: 0,    green: 0 }],
  ["collection",  [0, 1.5, 0], [9, 3, 10],     "#16110a", PALETTE.amber, 2.3, 0.026, "warmBiomass", { off: [0, 0, -3],    scale: 0,   heat: 0,    green: 0 }],
  ["screening",   [0, 2.5, 0], [1, 8, 10],     "#121315", "#e4d6b4",     2.1, 0.022, "industrial",  { off: [0, 0, -3],    scale: 0,   heat: 0,    green: 0 }],
  ["grinding",    [0, 2, 0],   [8, 2.5, 9],    "#15100c", PALETTE.amber, 2.6, 0.022, "industrial",  { off: [0, 0, -3],    scale: 0,   heat: 0,    green: 0 }],
  ["drying",      [0, 2.5, 0], [11, 3.5, 7],   "#170f08", "#e8b46b",     2.6, 0.024, "industrial",  { off: [0, 0, -3],    scale: 0,   heat: 0,    green: 0 }],
  ["conditioning",[0, 3, 0],   [-9, 3.5, 9],   "#15100a", "#e0b984",     2.3, 0.026, "industrial",  { off: [0, 0, -3],    scale: 0,   heat: 0.4,  green: 0 }],
  ["pelletizing", [0, 2.5, 0], [0, 2.8, 8],    "#180c08", PALETTE.ember, 3.0, 0.024, "industrial",  { off: [1.3, -0.5, -3.6], scale: 0.42, heat: 0.95, green: 0 }],
  ["cooling",     [0, 1.5, 0], [0.5, 9, 7],    "#0d1518", PALETTE.frost, 2.0, 0.023, "industrial",  { off: [0.9, 0, -3.2],scale: 1,   heat: 0.25, green: 0 }],
  ["qc",          [0, 2, 0],   [0, 2.4, 5],    "#0d1518", PALETTE.frost, 2.2, 0.02,  "industrial",  { off: [0, 0, -2.6],  scale: 1,   heat: 0,    green: 0 }],
  ["packaging",   [0, 2, 0],   [5, 1.6, 8],    "#12100d", "#e0d4bd",     2.1, 0.021, "warehouse",   { off: [1.4, -0.3, -4], scale: 0.9, heat: 0,  green: 0 }],
  ["warehouse",   [0, 2.5, 0], [0, 2.6, 15],   "#101114", "#d2dce5",     1.9, 0.024, "warehouse",   { off: [0, 0, -3],    scale: 0,   heat: 0,    green: 0 }],
  ["logistics",   [0, 0, 0],   [2, 13, 27],    "#09111b", "#9ec3dd",     1.8, 0.014, "logistics",   { off: [0, 0, -3],    scale: 0,   heat: 0,    green: 0 }],
  ["energy",      [0, 4, 0],   [1, 3.5, 13],   "#170b06", PALETTE.ember, 3.1, 0.022, "industrial",  { off: [0, -0.1, -3], scale: 1,   heat: 1,    green: 0 }],
  ["circular",    [0, 2.2, 0], [0, 2.4, 10],   "#0a160d", PALETTE.moss,  2.4, 0.024, "forest",      { off: [0, 0, -3.2],  scale: 0.9, heat: 0.1,  green: 0.85 }],
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
  const inA = smooth((local - 0.12) / 0.22);
  const last = i === N - 1;
  const outA = last ? 1 : 1 - smooth((local - 0.72) / 0.2);
  return clamp01(Math.min(inA, outA));
}

/** reveal progress 0..1 (drives line masks; separate from alpha for stagger) */
export function overlayReveal(t: number, i: number): number {
  const local = (t - i * W) / W;
  return smooth((local - 0.1) / 0.3);
}
