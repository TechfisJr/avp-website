import * as THREE from "three";

// A tiny mutable bridge between the R3F render loop (which owns the smoothed
// scroll offset + camera focus) and the DOM overlay / post pipeline. No React
// state on the hot path — every side reads/writes this object each frame.
// offset is 0..1 across the whole scroll track.

export const scroll = { offset: 0 };

/** World point the camera is looking at — shared with depth-of-field so the
 *  lens always focuses on whatever the shot is about. */
export const focus = new THREE.Vector3();

export const flags = { reducedMotion: false };
