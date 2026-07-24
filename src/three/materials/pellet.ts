import * as THREE from "three";
import { PALETTE } from "@/lib/theme";

/**
 * The wood-pellet surface. Pressed sawdust reads as a warm, semi-matte body
 * with a faint waxy sheen along the compression grain. We get the "premium"
 * look almost entirely from the studio environment map (see Studio.tsx) rather
 * than from expensive shading, so this stays a plain StandardMaterial that
 * instances cheaply by the thousand. Per-instance tint comes from
 * InstancedMesh.setColorAt (three applies instanceColor automatically).
 */
export function createPelletMaterial() {
  const mat = new THREE.MeshStandardMaterial({
    color: PALETTE.pellet,
    roughness: 0.52,
    metalness: 0.0,
    envMapIntensity: 1.05,
    // a touch of warmth in shadow so pellets never go muddy-brown
    emissive: new THREE.Color(PALETTE.pelletDeep),
    emissiveIntensity: 0.06,
  });
  return mat;
}
