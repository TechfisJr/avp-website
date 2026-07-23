import type Lenis from "lenis";

// Mutable progress store — written by ScrollTrigger, read in rAF/useFrame.
// Never touches React state, so scrolling causes zero re-renders.
export const scroll = {
  t: 0, // global progress 0..1 across the cinematic track (excludes the footer)
  v: 0, // normalized velocity
};

export const flags = {
  reducedMotion: false,
};

// The live Lenis instance, registered by <Experience> so that nav links can
// scroll smoothly through the same driver. Null under reduced motion, where
// we deliberately fall back to native scrolling.
export const smoothScroll: { instance: Lenis | null } = { instance: null };
