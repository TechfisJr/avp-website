"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { scroll } from "@/lib/scrollStore";
import { STATIONS, N, dwellCoord, smooth, lerp } from "@/lib/timeline";
import { presetFor } from "./visual/presets";

const fogA = new THREE.Color();
const fogB = new THREE.Color();
const keyA = new THREE.Color();
const keyB = new THREE.Color();
const fillA = new THREE.Color();
const fillB = new THREE.Color();
const rimA = new THREE.Color();
const rimB = new THREE.Color();
const keyPos = new THREE.Vector3();

/**
 * Fog, background exposure and the traveling 3-point rig (key/fill/rim) —
 * every value blends between the current and next station's own tuning
 * AND their assigned lighting preset (src/three/visual/presets.ts), so the
 * mood shifts as one continuous rig instead of 15 unrelated light setups.
 * Subject-separation rule enforced here: ambient + rim never drop to zero,
 * so no object is ever pure-black-on-black.
 */
export default function Atmosphere() {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  const key = useRef<THREE.PointLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);

  const fog = useMemo(() => new THREE.FogExp2("#0b0a08", 0.028), []);

  const stationData = useMemo(
    () =>
      STATIONS.map((s) => ({
        fog: new THREE.Color(s.fog),
        key: new THREE.Color(s.key),
        keyIntensity: s.keyIntensity,
        fogDensity: s.fogDensity,
        focus: new THREE.Vector3(...s.focus),
        preset: presetFor(s.preset),
      })),
    []
  );

  scene.fog = fog;
  // background is painted by BackgroundGradient; keep the scene fallback null
  // so there's no flat-color flash competing with the gradient dome.
  scene.background = null;

  useFrame(() => {
    const s = dwellCoord(scroll.t);
    const i = Math.min(N - 2, Math.floor(s));
    const f = smooth(s - i);
    const a = stationData[i];
    const b = stationData[Math.min(N - 1, i + 1)];
    const keyIntensity = lerp(a.keyIntensity, b.keyIntensity, f);

    fogA.copy(a.fog);
    fogB.copy(b.fog);
    fogA.lerp(fogB, f);
    fog.color.copy(fogA);
    fog.density = lerp(a.fogDensity * a.preset.fogRatio, b.fogDensity * b.preset.fogRatio, f);

    if (key.current) {
      keyA.copy(a.key);
      keyB.copy(b.key);
      keyA.lerp(keyB, f);
      key.current.color.copy(keyA);
      key.current.intensity = keyIntensity * 60;
      keyPos.lerpVectors(a.focus, b.focus, f);
      key.current.position.set(keyPos.x + 4, keyPos.y + 7, keyPos.z + 5);
    }

    // fill — low, neutral-ish, preset-tinted; never more than ~30% of key
    if (fill.current) {
      fillA.set(a.preset.fillColor);
      fillB.set(b.preset.fillColor);
      fillA.lerp(fillB, f);
      fill.current.color.copy(fillA);
      const fillRatio = lerp(a.preset.fillRatio, b.preset.fillRatio, f);
      fill.current.intensity = 0.7 + keyIntensity * fillRatio * 0.6;
      fill.current.position.set(keyPos.x - 9, keyPos.y + 5, keyPos.z + 10);
    }

    // rim — the subject-separation light; holds silhouettes out of the fog
    if (rim.current) {
      rimA.set(a.preset.rimColor);
      rimB.set(b.preset.rimColor);
      rimA.lerp(rimB, f);
      rim.current.color.copy(rimA);
      const rimRatio = lerp(a.preset.rimRatio, b.preset.rimRatio, f);
      rim.current.intensity = 0.9 + keyIntensity * rimRatio * 0.7;
      rim.current.position.set(keyPos.x + 8, keyPos.y + 8, keyPos.z - 8);
    }

    // ambient floor — the "never pure black" guarantee
    if (hemi.current) {
      hemi.current.intensity = lerp(a.preset.ambient, b.preset.ambient, f);
    }

    // exposure — renderer-level, blended per preset
    gl.toneMappingExposure = lerp(a.preset.exposure, b.preset.exposure, f);
  });

  return (
    <>
      <ambientLight intensity={0.14} />
      <hemisphereLight ref={hemi} args={["#6d7780", "#17100b", 0.45]} />
      <directionalLight ref={fill} />
      <directionalLight ref={rim} />
      <pointLight ref={key} distance={70} decay={1.6} />
    </>
  );
}
