import * as THREE from "three";
import {
  createMetalMaterial,
  createPaintedMetalMaterial,
  createWoodMaterial,
  createBarkMaterial,
  createPelletMaterial,
  createFabricMaterial,
  createConcreteMaterial,
} from "../visual/materials";

// Shared PBR materials — created once, reused by every machine. Sourced from
// the reusable material system in three/visual/materials.ts so every surface
// family (metal, painted metal, wood, bark, pellet, fabric, concrete) gets
// the same subtle procedural surface variation instead of flat color.
export const M = {
  steel: createMetalMaterial({ color: "#687078", metalness: 0.82, roughness: 0.36 }),
  housing: createPaintedMetalMaterial({ color: "#30343a", metalness: 0.58, roughness: 0.54, envMapIntensity: 0.35 }),
  dark: createPaintedMetalMaterial({ color: "#17191b", metalness: 0.35, roughness: 0.74, envMapIntensity: 0.22 }),
  panel: createPaintedMetalMaterial({ color: "#d7d0c2", metalness: 0.08, roughness: 0.48 }),
  accentBlue: createPaintedMetalMaterial({ color: "#2f6f9f", metalness: 0.25, roughness: 0.42 }),
  safetyYellow: createPaintedMetalMaterial({ color: "#d9a530", metalness: 0.15, roughness: 0.5 }),
  rubber: createPaintedMetalMaterial({ color: "#0f1010", metalness: 0.05, roughness: 0.88, envMapIntensity: 0.06 }, { scale: 10 }),
  amber: new THREE.MeshStandardMaterial({
    color: "#a86e1e",
    emissive: "#e8a33d",
    emissiveIntensity: 0.55,
    metalness: 0.3,
    roughness: 0.5,
  }),
  emberGlow: new THREE.MeshStandardMaterial({
    color: "#1a0d06",
    emissive: "#e85d26",
    emissiveIntensity: 1.6,
    metalness: 0,
    roughness: 1,
  }),
  frostGlow: new THREE.MeshStandardMaterial({
    color: "#0d1418",
    emissive: "#7fb4c7",
    emissiveIntensity: 0.9,
    metalness: 0,
    roughness: 1,
  }),
  bark: createBarkMaterial({ color: "#6b4423", vertexColors: true }),
  woodEnd: createWoodMaterial({ color: "#c99e63", roughness: 0.88 }),
  chip: createWoodMaterial({ color: "#b8854a", roughness: 0.86, vertexColors: true }, { scale: 11 }),
  pellet: createPelletMaterial({ color: "#9c6a33", roughness: 0.74, metalness: 0.02, vertexColors: true }),
  cloth: createFabricMaterial({ color: "#d8d2c4" }),
  glass: new THREE.MeshPhysicalMaterial({
    color: "#aac8d4",
    transparent: true,
    opacity: 0.16,
    roughness: 0.15,
    metalness: 0,
    envMapIntensity: 0.7,
    side: THREE.DoubleSide,
  }),
  concrete: createConcreteMaterial({ color: "#1b1b1c" }),
};
