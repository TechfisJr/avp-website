import * as THREE from "three";
import { PALETTE } from "@/lib/theme";

// Shared stylized materials so every industrial scene reads as one clean,
// premium world (light steel + soft paint + green accents), not a grab-bag.
// Singletons — created once, reused across all instances.

export const metalMat = new THREE.MeshStandardMaterial({
  color: "#c7ccd2",
  metalness: 0.5,
  // brushed rather than mirror — a tight polished highlight was blowing out
  // under bloom; 0.5 keeps a soft sheen without the white hotspot
  roughness: 0.5,
  envMapIntensity: 1.0,
});

export const steelDarkMat = new THREE.MeshStandardMaterial({
  color: "#8b9298",
  metalness: 0.55,
  roughness: 0.52,
  envMapIntensity: 1.0,
});

export const paintMat = new THREE.MeshStandardMaterial({
  color: "#eef1ee",
  metalness: 0.1,
  roughness: 0.5,
  envMapIntensity: 0.9,
});

export const accentMat = new THREE.MeshStandardMaterial({
  color: PALETTE.green,
  metalness: 0.2,
  roughness: 0.45,
  envMapIntensity: 0.9,
});

export const emberAccentMat = new THREE.MeshStandardMaterial({
  color: PALETTE.pellet,
  metalness: 0.2,
  roughness: 0.5,
});

export const floorMat = new THREE.MeshStandardMaterial({
  color: "#d8d2c6",
  roughness: 0.98,
  metalness: 0,
});

export const rubberMat = new THREE.MeshStandardMaterial({
  color: "#3a3934",
  roughness: 0.9,
  metalness: 0,
});

export const bagMat = new THREE.MeshStandardMaterial({
  color: "#dccaa4",
  roughness: 0.92,
  metalness: 0,
});

export const skinMat = new THREE.MeshStandardMaterial({
  color: "#e3b083",
  roughness: 0.72,
  metalness: 0,
  envMapIntensity: 0.7,
});

// warm wood pellet tone for piles / streams (matches materials/pellet.ts)
export const pelletTone = new THREE.MeshStandardMaterial({
  color: PALETTE.pellet,
  roughness: 0.55,
  metalness: 0,
  envMapIntensity: 1,
});
