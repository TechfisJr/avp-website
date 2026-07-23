import * as THREE from "three";

/**
 * Global lighting preset system — six reusable rigs the whole site draws
 * from. A preset does NOT replace a station's own key light color/intensity
 * (those stay in timeline.ts, tuned per-station); it supplies the structure
 * around the key: fill/rim ratio + color, ambient level, exposure, tone
 * mapping, fog strength, and the background-gradient tint. Stations pick one
 * preset by name; Atmosphere/BackgroundGradient blend between the current
 * and next station's preset the same way they already blend fog/key color.
 */

export type PresetName =
  | "forest"
  | "warmBiomass"
  | "industrial"
  | "warehouse"
  | "logistics"
  | "heroProduct";

export type LightingPreset = {
  name: PresetName;
  /** fill light color + intensity as a ratio of the station's key intensity */
  fillColor: string;
  fillRatio: number;
  /** rim/back light color + intensity as a ratio of the station's key intensity */
  rimColor: string;
  rimRatio: number;
  /** hemisphere ambient intensity — never lets objects fall to pure black */
  ambient: number;
  /**
   * Image-based lighting strength (scene.environmentIntensity) while this
   * preset is active. This is the preset's main "how much does the world
   * reflect in this room" dial: high in the warehouse and on the hero product,
   * low in the forest where the canopy occludes the sky.
   */
  envIntensity: number;
  /** renderer exposure while this preset is active */
  exposure: number;
  toneMapping: THREE.ToneMapping;
  /** multiplier applied to the station's own fog density */
  fogRatio: number;
  /** background-gradient characteristic tint, blended with the station's fog color */
  ambientTint: string;
};

// Every preset keeps the same "never pure black" floor, but it is now held by
// image-based lighting plus the rim rather than by flat hemisphere ambient.
// Ambient was previously 0.32–0.55, which lit every surface from every
// direction at once and flattened all form — the classic plastic look. With
// real IBL doing the ambient work (SceneEnvironment + envMapIntensity in
// materials.ts), the hemisphere only has to catch the bottom of the range.
export const PRESETS: Record<PresetName, LightingPreset> = {
  forest: {
    name: "forest",
    fillColor: "#7ba05b",
    fillRatio: 0.35,
    rimColor: "#f7e3bd",
    rimRatio: 0.5,
    ambient: 0.24,
    envIntensity: 0.55,
    exposure: 1.05,
    toneMapping: THREE.ACESFilmicToneMapping,
    fogRatio: 1,
    ambientTint: "#1c3a22", // deep forest green
  },
  warmBiomass: {
    name: "warmBiomass",
    fillColor: "#d8b98a",
    fillRatio: 0.28,
    rimColor: "#f7e3bd",
    rimRatio: 0.42,
    ambient: 0.2,
    envIntensity: 0.75,
    exposure: 1.05,
    toneMapping: THREE.ACESFilmicToneMapping,
    fogRatio: 1,
    ambientTint: "#3a2210", // dark brown / amber practical
  },
  industrial: {
    name: "industrial",
    fillColor: "#7fb4c7",
    fillRatio: 0.26,
    rimColor: "#dfe8ee",
    rimRatio: 0.55,
    ambient: 0.19,
    envIntensity: 0.95,
    exposure: 1.0,
    toneMapping: THREE.ACESFilmicToneMapping,
    fogRatio: 1,
    ambientTint: "#2a3138", // charcoal / muted steel blue
  },
  warehouse: {
    name: "warehouse",
    fillColor: "#c9d4dd",
    fillRatio: 0.3,
    rimColor: "#ffffff",
    rimRatio: 0.35,
    ambient: 0.26,
    envIntensity: 1.1,
    exposure: 1.02,
    toneMapping: THREE.ACESFilmicToneMapping,
    fogRatio: 0.9,
    ambientTint: "#242a30", // charcoal, neutral cool
  },
  logistics: {
    name: "logistics",
    fillColor: "#4d6f8f",
    fillRatio: 0.3,
    rimColor: "#9ec3dd",
    rimRatio: 0.6,
    ambient: 0.18,
    envIntensity: 0.85,
    exposure: 1.05,
    toneMapping: THREE.ACESFilmicToneMapping,
    fogRatio: 0.7,
    ambientTint: "#152b40", // deep muted steel blue / navy
  },
  heroProduct: {
    name: "heroProduct",
    fillColor: "#7fb4c7",
    fillRatio: 0.15,
    rimColor: "#f7e3bd",
    rimRatio: 0.45,
    ambient: 0.15,
    envIntensity: 1.25,
    exposure: 1.08,
    toneMapping: THREE.ACESFilmicToneMapping,
    fogRatio: 1,
    ambientTint: "#2c1c0c", // charcoal + amber practical glow
  },
};

export function presetFor(name: PresetName): LightingPreset {
  return PRESETS[name];
}
