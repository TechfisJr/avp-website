// Brand palette for An Việt Phát wood pellets.
// Warm wood ambers + sustainability greens on a bright, airy neutral base —
// the "premium stylized" direction (clean product-viz, not photoreal).

export const PALETTE = {
  // wood / pellet ambers
  pellet: "#c69350",
  pelletLight: "#e0b878",
  pelletDeep: "#8a5f2e",
  bark: "#6f4e30",

  // sustainability greens
  green: "#4a8a5a",
  greenLight: "#8fc27a",
  greenDeep: "#2f5d3c",
  canopy: "#3d7a4a",

  // bright neutral base (airy, era-residence feel)
  cream: "#f2ede3",
  sand: "#e6ddcc",
  ink: "#2b2620",
  inkSoft: "#6b6459",

  // light / accents
  sky: "#dfe9ee",
  sun: "#ffe6b8",
  ember: "#ff7a3c",

  // dark cinematic base (the new mood)
  night: "#0c0e0a",
  nightSoft: "#15180f",
  inkLight: "#ece7db",
  inkMute: "#9a9484",
} as const;

export const ACCENT = PALETTE.green;
