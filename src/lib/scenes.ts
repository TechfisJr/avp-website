// ---------------------------------------------------------------------------
// The full scroll journey — all 7 ESG story scenes on one continuous camera
// flight down the -Z corridor. One source of truth for BOTH the camera spline
// and the DOM copy so they can never drift.
//
//   1 hero       hands cradling a pellet sphere (the Earth)        z ~   0
//   2 forest     FSC working forest                                z ~ -40
//   3 collection biomass yard (sawdust / chips / offcuts)          z ~ -80
//   4 drying     industrial rotary dryer + cleaning                z ~-116
//   5 pelletize  high-pressure pellet mill, no additives           z ~-152
//   6 export     QC scan gate -> bags -> ship at port              z ~-192
//   7 earth      clean flame -> pull back to a green planet        z ~-226
// ---------------------------------------------------------------------------

import type { Vector3Tuple } from "three";

/** Number of viewport-heights of scroll across the whole journey. */
export const PAGES = 13;

/** Scene world-space Z centres — shared by camera keys and scene components. */
export const SCENE_Z = {
  hero: 0,
  forest: -40,
  collection: -80,
  drying: -116,
  pelletizing: -152,
  export: -192,
  earth: -226,
} as const;

export type CamKey = { at: number; pos: Vector3Tuple; target: Vector3Tuple };

// Camera keyframes: position + lookAt, sampled by scroll offset via a spline.
export const CAM_KEYS: CamKey[] = [
  // 1 — hold on the pellet sphere, then dive through it
  { at: 0.0, pos: [0, 0.4, 7.4], target: [0, -0.2, 0] },
  { at: 0.06, pos: [0, 0.2, 3.4], target: [0, -0.4, -4] },
  { at: 0.11, pos: [0.3, 0.6, -1.6], target: [0, 1.2, -10] },

  // 2 — a gentle, mostly-straight walk THROUGH the forest: descend to eye
  // level and glide forward down the corridor at a steady height, always
  // looking ahead (minimal lateral sway — no lurching, no head-turning)
  { at: 0.16, pos: [1.0, 4.4, -13], target: [0, 3.0, -30] },
  { at: 0.25, pos: [0.6, 2.7, -27], target: [0, 2.8, -44] },
  { at: 0.34, pos: [-0.7, 2.7, -41], target: [0, 2.8, -58] },
  { at: 0.42, pos: [0.3, 2.9, -53], target: [0, 2.6, -70] },

  // 3 — over the biomass sort line, holding it framed left (copy sits right)
  { at: 0.48, pos: [7, 4.2, -65], target: [-0.5, 1.6, -81] },
  { at: 0.54, pos: [5, 2.9, -70], target: [-1, 1.7, -82] },

  // 4 — track alongside the drying line (pulled back so the whole dryer reads)
  { at: 0.6, pos: [12, 5.5, -98], target: [0, 3.4, -116] },
  { at: 0.65, pos: [7, 4.2, -106], target: [-1, 3.3, -118] },

  // 5 — into the pellet mill
  { at: 0.71, pos: [5.5, 3.2, -139], target: [0, 2.4, -153] },
  { at: 0.76, pos: [1.4, 2.2, -148], target: [-1.5, 2, -159] },

  // 6 — the QC gate + bags, then pan toward the ship at port
  { at: 0.82, pos: [7, 4.5, -177], target: [-2, 2.6, -191] },
  { at: 0.88, pos: [-3, 5.5, -184], target: [14, 3, -197] },

  // 7 — the clean flame, then pull up and back to reveal the green planet
  { at: 0.94, pos: [0, 3.4, -211], target: [0, 4, -226] },
  { at: 1.0, pos: [0, 9.5, -196], target: [0, 8, -239] },
];

export type Align = "center" | "left" | "right";

export type Section = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  tags?: string[];
  in: number;
  peak: number;
  out: number;
  align: Align;
};

export const SECTIONS: Section[] = [
  {
    id: "hero",
    eyebrow: "An Việt Phát · Wood Pellets",
    title: "From a single seed,\na journey to clean energy.",
    body: "Thousands of wood pellets — not merely fuel, but the seed of a low-carbon future.",
    tags: ["ESG", "Low-carbon", "FSC"],
    in: 0.0,
    peak: 0.02,
    out: 0.11,
    align: "center",
  },
  {
    id: "forest",
    eyebrow: "Sustainable working forests",
    title: "Grow.\nHarvest. Replant.",
    body: "50,000 hectares of FSC-certified forest. Every tree harvested is a new generation planted — an unbroken cycle of carbon capture.",
    tags: ["FSC FM", "50,000 ha", "Working forests"],
    in: 0.15,
    peak: 0.27,
    out: 0.45,
    align: "left",
  },
  {
    id: "collection",
    eyebrow: "The hidden resource",
    title: "Turning residue\ninto value.",
    body: "Sawdust, shavings, wood chips and offcuts — transforming overlooked waste into a high-value source of clean energy.",
    tags: ["Sawdust", "Wood chips", "Zero-waste"],
    in: 0.45,
    peak: 0.51,
    out: 0.58,
    align: "right",
  },
  {
    id: "drying",
    eyebrow: "Drying & cleaning",
    title: "Cleaner,\nburns longer.",
    body: "Bark and dust removed, moisture dried to 10%. Ash below 1% for the Premium line — a calorific value of 4,500–4,800 kcal/kg.",
    tags: ["Moisture ≤ 10%", "Ash < 1%", "Premium"],
    in: 0.58,
    peak: 0.63,
    out: 0.69,
    align: "left",
  },
  {
    id: "pelletizing",
    eyebrow: "High-pressure forming",
    title: "Bound by nature,\nnot chemistry.",
    body: "Sawdust compressed under extreme pressure fuses into solid pellets — with no additives at all. Standard diameter 6–20 mm.",
    tags: ["No additives", "6–20 mm", "High pressure"],
    in: 0.69,
    peak: 0.74,
    out: 0.80,
    align: "right",
  },
  {
    id: "export",
    eyebrow: "Quality & export",
    title: "Certified,\nshipped worldwide.",
    body: "ENplus (A1, A2, B) and FSC CoC certified. 40-lb and jumbo bags shipped through the ports of Nghi Sơn, Quy Nhơn and Cát Lái.",
    tags: ["ENplus", "FSC CoC", "Global"],
    in: 0.80,
    peak: 0.86,
    out: 0.91,
    align: "left",
  },
  {
    id: "earth",
    eyebrow: "A sustainable planet",
    title: "A clean flame\nfor a greener planet.",
    body: "A low-carbon alternative to coal and oil — An Việt Phát's green commitment to the world.",
    tags: ["Low-carbon", "Net-zero", "Green pledge"],
    in: 0.92,
    peak: 0.98,
    out: 1.02,
    align: "center",
  },
];
