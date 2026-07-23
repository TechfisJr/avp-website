"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { scroll } from "@/lib/scrollStore";
import { STATIONS, N, dwellCoord, smooth, lerp } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
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
 * Fog, background exposure and the traveling rig (sun/key/fill/rim) — every
 * value blends between the current and next station's own tuning AND their
 * assigned lighting preset (src/three/visual/presets.ts), so the mood shifts as
 * one continuous rig instead of 15 unrelated light setups.
 *
 * Two things carry most of the "not plastic" weight here:
 *
 *   - The SUN is a shadow-casting directional light that tracks the active
 *     station. Its ortho frustum is kept tight around the station (stations are
 *     30 units apart) because a shadow map stretched over the whole 420-unit
 *     world would quantise to mush.
 *   - Flat ambient is deliberately LOW. It used to be pushed high to keep
 *     objects off pure black, but flooding every surface with directionless
 *     light is exactly what erases form. With real image-based lighting now
 *     doing that job (see SceneEnvironment + envMapIntensity in materials.ts),
 *     ambient only has to catch the very bottom of the range.
 */
export default function Atmosphere({ quality }: { quality: Quality }) {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  const key = useRef<THREE.PointLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const sunTarget = useRef<THREE.Object3D>(null);
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

  // A DirectionalLight aims at its `target` object, which must live in the
  // scene graph for its world matrix to be current.
  useEffect(() => {
    if (sun.current && sunTarget.current) {
      sun.current.target = sunTarget.current;
    }
  }, []);

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

    keyPos.lerpVectors(a.focus, b.focus, f);

    if (key.current) {
      keyA.copy(a.key);
      keyB.copy(b.key);
      keyA.lerp(keyB, f);
      key.current.color.copy(keyA);
      key.current.intensity = keyIntensity * 52;
      key.current.position.set(keyPos.x + 4, keyPos.y + 7, keyPos.z + 5);
    }

    // sun — the shadow caster. Same direction as the key so the cast shadow and
    // the specular highlight agree; the ortho box travels with the station.
    if (sun.current && sunTarget.current) {
      sun.current.color.copy(keyA);
      sun.current.intensity = 0.5 + keyIntensity * 0.55;
      sun.current.position.set(keyPos.x + 9, keyPos.y + 16, keyPos.z + 11);
      sunTarget.current.position.copy(keyPos);
      sunTarget.current.updateMatrixWorld();
    }

    // fill — low, neutral-ish, preset-tinted; never more than ~30% of key
    if (fill.current) {
      fillA.set(a.preset.fillColor);
      fillB.set(b.preset.fillColor);
      fillA.lerp(fillB, f);
      fill.current.color.copy(fillA);
      const fillRatio = lerp(a.preset.fillRatio, b.preset.fillRatio, f);
      fill.current.intensity = 0.45 + keyIntensity * fillRatio * 0.5;
      fill.current.position.set(keyPos.x - 9, keyPos.y + 5, keyPos.z + 10);
    }

    // rim — the subject-separation light; holds silhouettes out of the fog
    if (rim.current) {
      rimA.set(a.preset.rimColor);
      rimB.set(b.preset.rimColor);
      rimA.lerp(rimB, f);
      rim.current.color.copy(rimA);
      const rimRatio = lerp(a.preset.rimRatio, b.preset.rimRatio, f);
      rim.current.intensity = 0.8 + keyIntensity * rimRatio * 0.8;
      rim.current.position.set(keyPos.x + 8, keyPos.y + 8, keyPos.z - 8);
    }

    // ambient floor — the "never pure black" guarantee, now only a floor
    if (hemi.current) {
      hemi.current.intensity = lerp(a.preset.ambient, b.preset.ambient, f);
    }

    // image-based lighting strength — the preset's "how reflective is this
    // room" dial, blended alongside everything else
    scene.environmentIntensity = lerp(a.preset.envIntensity, b.preset.envIntensity, f);

    // exposure — renderer-level, blended per preset
    gl.toneMappingExposure = lerp(a.preset.exposure, b.preset.exposure, f);
  });

  // 1536 rather than 2048: over an 18-unit ortho box that is ~85 texels per
  // unit, already past the point where more resolution is visible, and the
  // shadow pass is redrawn every frame as the light travels.
  const mapSize = quality.tier === 2 ? 1536 : 1024;

  return (
    <>
      <ambientLight intensity={0.05} />
      <hemisphereLight ref={hemi} args={["#6d7780", "#17100b", 0.28]} />

      <directionalLight
        ref={sun}
        castShadow={quality.shadows}
        shadow-mapSize-width={mapSize}
        shadow-mapSize-height={mapSize}
        // tight box around one station — stations sit 30 units apart
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={62}
        // normalBias beats constant bias on the curved//bevelled geometry here:
        // it scales the offset by surface slope, so it kills acne on the log
        // and pellet bodies without peter-panning the flat floors.
        shadow-normalBias={0.035}
        shadow-bias={-0.0004}
      />
      <object3D ref={sunTarget} />

      <directionalLight ref={fill} />
      <directionalLight ref={rim} />
      <pointLight ref={key} distance={70} decay={1.6} />
    </>
  );
}
