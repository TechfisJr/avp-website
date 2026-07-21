"use client";

import type { ReactElement } from "react";
import { EffectComposer, Bloom, Vignette, BrightnessContrast, HueSaturation, SSAO } from "@react-three/postprocessing";
import type { Quality } from "@/lib/quality";

/**
 * Restrained cinematic post pipeline — subtle bloom (only true highlights:
 * ember glow, emissive machinery, hero rim), a light color-grade, a soft
 * vignette, and SSAO gated to the top quality tier only (the single most
 * expensive effect here). Nothing here should be visible as "an effect" —
 * if a station looks different with PostFX on vs. off, the settings are
 * too strong.
 */
export default function PostFX({ quality }: { quality: Quality }) {
  if (!quality.postFX) return null;

  const effects = [
    quality.ssao && (
      <SSAO
        key="ssao"
        samples={11}
        radius={0.32}
        intensity={13}
        luminanceInfluence={0.5}
        worldDistanceThreshold={1}
        worldDistanceFalloff={1}
        worldProximityThreshold={1}
        worldProximityFalloff={1}
      />
    ),
    <Bloom
      key="bloom"
      intensity={quality.tier === 2 ? 0.32 : 0.2}
      luminanceThreshold={0.82}
      luminanceSmoothing={0.3}
      mipmapBlur
      radius={0.6}
    />,
    <BrightnessContrast key="grade-bc" brightness={0.0} contrast={0.05} />,
    <HueSaturation key="grade-hs" saturation={0.04} />,
    <Vignette key="vignette" eskil={false} offset={0.22} darkness={0.5} />,
  ].filter(Boolean) as ReactElement[];

  return (
    <EffectComposer multisampling={quality.tier === 2 && !quality.ssao ? 4 : 0} enableNormalPass={quality.ssao}>
      {effects}
    </EffectComposer>
  );
}
