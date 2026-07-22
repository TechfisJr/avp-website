import { N } from "@/lib/timeline";

// ---------------------------------------------------------------------------
// Factory reality layer — centralized configuration.
//
// Maps the real AVP factory photography onto the first-transformation stations
// (Raw Wood → Pelletization). Each entry is a cinematic plate rendered by
// <FactoryBackdrop> as a camera-anchored, hazed, dimmed matte behind the 3D
// machinery. See docs/factory-background-mapping.md for the reasoning behind
// every image→station assignment and crop.
//
// Timing is expressed in GLOBAL scroll progress t ∈ [0,1] via `at(station,
// local)`, so plates stay locked to the same windows the stations and the
// FlowBridge material streams already use — photography never cross-fades on
// its own timer; the moving material in front always covers the swap.
// ---------------------------------------------------------------------------

/** global scroll t at a local 0..1 offset inside station `s`'s window */
export const at = (s: number, local: number): number => (s + local) / N;

export type BackdropDef = {
  id: string;
  /** timeline station index this plate is anchored to */
  station: number;
  /** base path without extension; loader appends `.webp` / `.m.webp` */
  src: string;
  /** opacity envelope in global scroll t (trapezoid: rise → hold → fall) */
  enterAt: number;
  holdFrom: number;
  holdTo: number;
  exitAt: number;
  /** peak opacity at hold (0..1) — kept below 1 so the 3D always leads */
  maxOpacity: number;
  /** cinematic push-in: uv zoom at window start → end (1 = no zoom) */
  zoomFrom: number;
  zoomTo: number;
  /** uv pan (parallax-free lateral drift) at window start → end */
  panFrom: [number, number];
  panTo: [number, number];
  /** cover-crop focal anchor in uv (0.5,0.5 = center) */
  anchor: [number, number];
  /** blend toward the live Atmosphere fog color — color-match + haze (0..1) */
  tintAmt: number;
  /** overall darkening so the plate never fights the 3D (0 = full, 1 = black) */
  dim: number;
  /** load eagerly at startup (near the beginning of the journey) */
  preload: boolean;
  /** wired into the scene now — flip to extend the reality layer */
  active: boolean;
};

const BACKGROUNDS = "/backgrounds";

export const FACTORY_BACKDROPS: BackdropDef[] = [
  // --- RAW WOOD (2) — exterior: NATURE → INDUSTRY hinge -------------------
  // Aerial with the real raw-log yard; pushes toward the hall, carrying into
  // the Wood Chips entrance where it crossfades under the log→chipper motion.
  {
    id: "raw-wood-exterior",
    station: 2,
    src: `${BACKGROUNDS}/02-factory-entry/factory-aerial`,
    enterAt: at(2, 0.1),
    holdFrom: at(2, 0.45),
    holdTo: at(2, 0.8),
    exitAt: at(3, 0.2),
    maxOpacity: 0.9,
    zoomFrom: 1.05,
    zoomTo: 1.16,
    panFrom: [0, 0],
    panTo: [0.02, -0.03],
    anchor: [0.42, 0.62], // bias to the log yard, lower-center
    tintAmt: 0.28,
    dim: 0.12,
    preload: true,
    active: true,
  },

  // --- WOOD CHIPS (3) — establishing interior (01) -----------------------
  {
    id: "wood-chips-interior",
    station: 3,
    src: `${BACKGROUNDS}/03-production/factory-interior-01`,
    enterAt: at(3, 0.02), // overlaps the exterior exit → crossfade at entry
    holdFrom: at(3, 0.3),
    holdTo: at(3, 0.72),
    exitAt: at(4, 0.18),
    maxOpacity: 0.92,
    zoomFrom: 1.04,
    zoomTo: 1.12,
    panFrom: [-0.01, 0],
    panTo: [0.02, 0],
    anchor: [0.5, 0.5], // symmetric hall, vanishing point centered
    tintAmt: 0.24,
    dim: 0.14,
    preload: true,
    active: true,
  },

  // --- WOOD PARTICLES (4) — processing line (02) -------------------------
  {
    id: "wood-particles-interior",
    station: 4,
    src: `${BACKGROUNDS}/03-production/factory-interior-02`,
    enterAt: at(4, 0.05),
    holdFrom: at(4, 0.3),
    holdTo: at(4, 0.7),
    exitAt: at(5, 0.1),
    maxOpacity: 0.9,
    zoomFrom: 1.05,
    zoomTo: 1.13,
    panFrom: [0.02, 0],
    panTo: [-0.03, 0], // pan following material flow across the line
    anchor: [0.45, 0.5], // machine mass left-of-center
    tintAmt: 0.26,
    dim: 0.16,
    preload: false,
    active: true,
  },

  // === PENDING (next pass) — fully specified, flip `active` to extend =====

  // --- DRY BIOMASS (5) — air handling / ducting (04) ---------------------
  {
    id: "dry-biomass-interior",
    station: 5,
    src: `${BACKGROUNDS}/03-production/factory-interior-04`,
    enterAt: at(5, 0.05),
    holdFrom: at(5, 0.3),
    holdTo: at(5, 0.7),
    exitAt: at(6, 0.15),
    maxOpacity: 0.85,
    zoomFrom: 1.04,
    zoomTo: 1.11,
    panFrom: [0, 0],
    panTo: [0.02, 0],
    anchor: [0.62, 0.5], // feature the duct wall (right)
    tintAmt: 0.3, // warm dry haze
    dim: 0.16,
    preload: false,
    active: false,
  },

  // --- PREPARATION / conditioning (6) — subtle staging (05) --------------
  // Included per direction, deliberately subtle: low peak opacity + higher dim
  // so it reads as a transitional environment, not a hero plate.
  {
    id: "preparation-interior",
    station: 6,
    src: `${BACKGROUNDS}/03-production/factory-interior-05`,
    enterAt: at(6, 0.1),
    holdFrom: at(6, 0.35),
    holdTo: at(6, 0.65),
    exitAt: at(7, 0.12),
    maxOpacity: 0.6,
    zoomFrom: 1.05,
    zoomTo: 1.1,
    panFrom: [0, 0],
    panTo: [-0.02, 0],
    anchor: [0.6, 0.55], // chip pile / staged material, right
    tintAmt: 0.34,
    dim: 0.24,
    preload: false,
    active: false,
  },

  // --- PELLETIZATION (7) — machine cluster (03) --------------------------
  // Dimmed center so the 3D pellet mill stays the focus; dissolves toward the
  // clean Wood Pellet reveal at cooling(8).
  {
    id: "pelletization-interior",
    station: 7,
    src: `${BACKGROUNDS}/03-production/factory-interior-03`,
    enterAt: at(7, 0.05),
    holdFrom: at(7, 0.28),
    holdTo: at(7, 0.62),
    exitAt: at(8, 0.1),
    maxOpacity: 0.7,
    zoomFrom: 1.04,
    zoomTo: 1.12,
    panFrom: [0, 0],
    panTo: [0.02, 0],
    anchor: [0.5, 0.48],
    tintAmt: 0.28,
    dim: 0.3,
    preload: false,
    active: false,
  },
];
