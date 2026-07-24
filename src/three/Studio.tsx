"use client";

import { Environment } from "@react-three/drei";
import { PALETTE } from "@/lib/theme";

/**
 * Lighting for the 3D scenes: a dim studio HDRI (Poly Haven) for the dark
 * cinematic mood, plus a warm dramatic key and a cool back-rim. (Scene 2, the
 * forest, is a full-frame video layer and needs none of this.)
 */
export default function Studio() {
  return (
    <>
      <Environment
        files="/hdri/brown_photostudio_02_1k.hdr"
        environmentIntensity={0.6}
        resolution={512}
      />

      <ambientLight intensity={0.05} color={PALETTE.sky} />

      <directionalLight
        position={[6, 12, 4]}
        intensity={1.9}
        color={PALETTE.sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-camera-left={-34}
        shadow-camera-right={34}
        shadow-camera-top={34}
        shadow-camera-bottom={-34}
        shadow-normalBias={0.03}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-8, 6, -10]} intensity={0.9} color={PALETTE.sky} />
    </>
  );
}
