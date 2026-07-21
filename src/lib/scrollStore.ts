// Mutable progress store — written by ScrollTrigger, read in rAF/useFrame.
// Never touches React state, so scrolling causes zero re-renders.
export const scroll = {
  t: 0, // global progress 0..1
  v: 0, // normalized velocity
};

export const flags = {
  reducedMotion: false,
};
