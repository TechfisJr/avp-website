"use client";

import type { ReactElement } from "react";
import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
  BrightnessContrast,
  HueSaturation,
  SSAO,
  DepthOfField,
  ChromaticAberration,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { scroll } from "@/lib/scrollStore";
import { STATIONS, N, dwellCoord, smooth, lerp } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import { focusStore } from "./focusStore";

/**
 * Cinematic post pipeline.
 *
 * The previous pass was tuned so conservatively it was effectively off — a
 * bloom threshold of 0.82 means almost nothing in a dark scene ever blooms, and
 * there was no depth of field at all despite the brief calling for it. Flat,
 * uniformly-sharp frames with no highlight response is a large part of what
 * reads as "cheap render" rather than "photographed".
 *
 * What each stage is doing here:
 *   SSAO        contact darkening in creases — the cheap half of the grounding
 *               job that real shadows now do properly
 *   DOF         separates subject from background; the focus distance tracks
 *               the active station so the hero object is always the sharp thing
 *   Bloom       highlight response on embers, work lights, hot dies
 *   Grade       slight contrast + saturation lift
 *   CA          a few tenths of a pixel of lens fringing at the edges
 *   Noise       fine grain, which also dithers away gradient banding in the fog
 *   Vignette    lens falloff
 */
export default function PostFX({ quality }: { quality: Quality }) {
  const dof = useRef<{ target?: THREE.Vector3 } | null>(null);
  const focus = useRef(new THREE.Vector3());

  // The hero pellet owns the lens whenever it's on screen; otherwise focus
  // tracks the station the camera is dwelling at, blended across the travel
  // phase exactly like the lighting rig.
  useFrame(({ camera }) => {
    if (!dof.current) return;

    if (focusStore.heroOwnsFocus) {
      focus.current.copy(focusStore.point);
    } else {
      const s = dwellCoord(scroll.t);
      const i = Math.min(N - 2, Math.floor(s));
      const f = smooth(s - i);
      const a = STATIONS[i].focus;
      const b = STATIONS[Math.min(N - 1, i + 1)].focus;
      focus.current.set(lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f));
    }

    // guard against a degenerate focus distance when the camera sits on top of
    // the focus point, which would blur the whole frame
    if (camera.position.distanceTo(focus.current) > 0.4) {
      dof.current.target = focus.current;
    }
  });

  if (!quality.postFX) return null;

  const top = quality.tier === 2;

  const effects = [
    quality.ssao && (
      <SSAO
        key="ssao"
        // Sample count and intensity trade off against each other: too few
        // samples at high intensity turns the estimator's own noise into a
        // visible dimpled pattern across every flat surface. 16/4 at a modest
        // intensity is clean; 9/3 at intensity 22 was not.
        samples={16}
        rings={4}
        radius={0.3}
        intensity={14}
        luminanceInfluence={0.6}
        worldDistanceThreshold={1}
        worldDistanceFalloff={1}
        worldProximityThreshold={1}
        worldProximityFalloff={1}
      />
    ),
    top && (
      <DepthOfField
        key="dof"
        ref={dof as never}
        focusDistance={0}
        focalLength={0.03}
        bokehScale={1.6}
        // DOF runs at half res; the blur hides the resolution loss entirely
        height={360}
      />
    ),
    <Bloom
      key="bloom"
      intensity={top ? 0.5 : 0.35}
      // low enough that hot dies, work lights and ember particles catch, high
      // enough that a warmly-lit diffuse surface does not — below ~0.6 the
      // amber key alone is enough to make whole objects halo
      luminanceThreshold={0.68}
      luminanceSmoothing={0.25}
      mipmapBlur
      radius={0.7}
    />,
    <BrightnessContrast key="grade-bc" brightness={-0.01} contrast={0.08} />,
    <HueSaturation key="grade-hs" saturation={0.04} />,
    top && (
      <ChromaticAberration
        key="ca"
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0006, 0.0006)}
        radialModulation
        modulationOffset={0.35}
      />
    ),
    <Noise key="grain" premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.28} />,
    <Vignette key="vignette" eskil={false} offset={0.2} darkness={0.62} />,
  ].filter(Boolean) as ReactElement[];

  return (
    <EffectComposer
      multisampling={top ? 4 : 0}
      enableNormalPass={quality.ssao}
    >
      {effects}
    </EffectComposer>
  );
}
