"use client";

import {
  EffectComposer,
  Bloom,
  Vignette,
  DepthOfField,
  Noise,
  SMAA,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { focus } from "@/lib/scrollStore";

/**
 * Cinematic post — the other half of "photographed, not rendered":
 *   DoF     focuses the lens on the camera's gaze point (shared via `focus`),
 *           melting everything else into bokeh so the subject reads
 *   Bloom    highlight response on the flame / work lights (threshold high so
 *           polished metal doesn't blow out)
 *   Grade    handled by ACES tone mapping on the renderer
 *   Grain    fine film grain — also dithers away gradient banding in the fog
 *   Vignette gentle lens falloff
 * Still far lighter than the old SSAO+DOF+CA pile — DoF is the one heavy pass.
 */
export default function Post() {
  return (
    <EffectComposer multisampling={2}>
      <DepthOfField
        target={focus}
        focalLength={0.02}
        bokehScale={2.4}
        height={480}
      />
      <Bloom
        intensity={0.34}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.3}
        mipmapBlur
        radius={0.62}
      />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.2} />
      <Vignette eskil={false} offset={0.2} darkness={0.55} />
      <SMAA />
    </EffectComposer>
  );
}
