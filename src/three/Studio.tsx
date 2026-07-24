"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { PALETTE } from "@/lib/theme";
import { scroll } from "@/lib/scrollStore";

/**
 * Lighting for the 3D scenes: a dim studio HDRI (Poly Haven) for the dark
 * cinematic mood, plus a warm dramatic key and a cool back-rim. (Scene 2, the
 * forest, is a full-frame video layer and needs none of this.)
 *
 * The key light's shadow map is re-rendered every frame by default. While the
 * forest video covers the screen nothing here is visible, so the shadow pass is
 * parked for that stretch and refreshed once on the way out.
 */
export default function Studio() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const shadowsOn = useRef(true);

  useFrame(() => {
    const s = sun.current;
    if (!s) return;
    const covered = scroll.offset > 0.21 && scroll.offset < 0.42;
    const want = !covered;
    if (want !== shadowsOn.current) {
      shadowsOn.current = want;
      s.shadow.autoUpdate = want;
      if (want) s.shadow.needsUpdate = true; // one refresh on resume
    }
  });

  return (
    <>
      <Environment
        files="/hdri/brown_photostudio_02_1k.hdr"
        environmentIntensity={0.6}
        resolution={512}
      />

      <ambientLight intensity={0.05} color={PALETTE.sky} />

      <directionalLight
        ref={sun}
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
