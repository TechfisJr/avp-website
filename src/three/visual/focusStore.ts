import * as THREE from "three";

/**
 * Where the lens is focused, shared between HeroPellet (which owns focus
 * whenever the protagonist is on screen) and PostFX's depth of field.
 *
 * The pellet is anchored in CAMERA space, so its distance from the lens has
 * nothing to do with the station's world focus point. Focusing DOF on the
 * station while the pellet floats 3.4 units in front of the camera put the
 * hero object permanently out of focus — the one thing that must always be
 * sharp.
 */
export const focusStore = {
  /** world-space point the lens should be focused on */
  point: new THREE.Vector3(),
  /** true while the hero pellet is visible and owns focus */
  heroOwnsFocus: false,
};
