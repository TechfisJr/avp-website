"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { scroll } from "@/lib/scrollStore";
import { STATIONS, N, stationIndex, stationLocal, smooth, lerp, clamp01 } from "@/lib/timeline";
import { createHeroPelletMaterial } from "./visual/heroPelletMaterial";
import { focusStore } from "./visual/focusStore";

const off = new THREE.Vector3();
const MODEL_URL = "/models/hero-pellet.glb";

/**
 * The protagonist. Anchored in camera space so it stays perfectly framed;
 * staging (offset/scale/heat/green) interpolates between per-station configs
 * from timeline.ts. Dissolves into particles at the hero exit and again as it
 * enters the furnace.
 */
export default function HeroPellet() {
  const mesh = useRef<THREE.Mesh>(null);
  const gltf = useGLTF(MODEL_URL);
  const geometry = useMemo(() => {
    let found: THREE.BufferGeometry | null = null;
    gltf.scene.traverse((child) => {
      if (!found && (child as THREE.Mesh).isMesh) {
        found = (child as THREE.Mesh).geometry;
      }
    });
    return found;
  }, [gltf.scene]);

  const { material, uniforms } = useMemo(() => createHeroPelletMaterial(), []);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = scroll.t;
    const i = stationIndex(t);
    const local = stationLocal(t, i);

    // blend hero staging between this station and the next during travel
    const f = smooth(clamp01((local - 0.6) / 0.4));
    const a = STATIONS[i].hero;
    const b = STATIONS[Math.min(N - 1, i + 1)].hero;

    const scale = lerp(a.scale, b.scale, f);
    uniforms.uHeat.value = lerp(a.heat, b.heat, f);
    uniforms.uGreen.value = lerp(a.green, b.green, f);
    uniforms.uTime.value = state.clock.elapsedTime;

    // dissolve on hero exit (S00) and furnace entry (S13 end)
    let dissolve = 0;
    if (i === 0) dissolve = smooth((local - 0.68) / 0.28) * 0.98;
    if (i === 13) dissolve = smooth((local - 0.78) / 0.2) * 0.98;
    if (i === 14) dissolve = Math.max(0, 0.98 - smooth(local / 0.25));
    uniforms.uDissolve.value = dissolve;

    const visible = scale > 0.02;
    mesh.current.visible = visible;
    // The pellet claims the lens whenever it's on screen — see focusStore.
    focusStore.heroOwnsFocus = visible;
    if (!visible) return;

    // camera-space anchoring
    off.set(
      lerp(a.off[0], b.off[0], f),
      lerp(a.off[1], b.off[1], f),
      lerp(a.off[2], b.off[2], f)
    );
    off.applyQuaternion(state.camera.quaternion);
    mesh.current.position.copy(state.camera.position).add(off);
    mesh.current.scale.setScalar(scale);
    focusStore.point.copy(mesh.current.position);

    // slow protagonist spin, gently coupled to scroll velocity
    const e = state.clock.elapsedTime;
    mesh.current.rotation.set(
      e * 0.14 + t * 6,
      e * 0.2,
      0.6 + Math.sin(e * 0.23) * 0.12
    );
  });

  if (!geometry) return null;

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={5}
      // The pellet is anchored in camera space, so a cast shadow would land in
      // the world at a position that has nothing to do with what you see.
      // It still RECEIVES, which is what grounds it in each station's light.
      receiveShadow
      userData={{ noShadow: true }}
    />
  );
}

useGLTF.preload(MODEL_URL);
