"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useEnvironment } from "@react-three/drei";
import { PALETTE } from "@/lib/theme";
import { scroll } from "@/lib/scrollStore";

const darkFog = new THREE.Color("#0c0e09");
const brightFog = new THREE.Color("#b7c0c2");
const fogTmp = new THREE.Color();
const lerp = THREE.MathUtils.lerp;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Lighting + environment. Both HDRIs load up front (so the swap never suspends
 * mid-scroll): a dim studio HDRI carries the dark cinematic mood for most
 * scenes, and the modern factory (Scene 3, collection) swaps in a BRIGHT studio
 * HDRI + a light fog so the stainless steel reflects a clean, daylit room
 * instead of a dark void — the reason the machines read new, not grimy.
 *
 * The shadow map re-renders every frame by default; while the forest video
 * fully covers the screen nothing here is visible, so the pass is parked and
 * refreshed once on the way out.
 */
export default function Studio() {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  const darkEnv = useEnvironment({ files: "/hdri/brown_photostudio_02_1k.hdr" });
  const brightEnv = useEnvironment({ files: "/hdri/studio_small_09_1k.hdr" });
  const sun = useRef<THREE.DirectionalLight>(null);
  const shadowsOn = useRef(true);

  useFrame(() => {
    const o = scroll.offset;

    // collection (modern factory) window: bright env + light fog, but a LOWER
    // exposure so the daylight reads clean instead of blowing out to white
    const bf = Math.min(smooth(0.44, 0.47, o), 1 - smooth(0.57, 0.6, o));
    const env = bf > 0.5 ? brightEnv : darkEnv;
    if (scene.environment !== env) scene.environment = env;
    scene.environmentIntensity = lerp(0.6, 0.95, bf);
    gl.toneMappingExposure = lerp(0.95, 0.82, bf);

    if (scene.fog instanceof THREE.Fog) {
      fogTmp.copy(darkFog).lerp(brightFog, bf);
      scene.fog.color.copy(fogTmp);
      scene.fog.near = lerp(14, 42, bf); // keep the machine clear of haze
      scene.fog.far = lerp(88, 155, bf);
    }

    // park the shadow pass while the forest video covers everything
    const s = sun.current;
    if (s) {
      const covered = o > 0.21 && o < 0.42;
      const want = !covered;
      if (want !== shadowsOn.current) {
        shadowsOn.current = want;
        s.shadow.autoUpdate = want;
        if (want) s.shadow.needsUpdate = true;
      }
    }
  });

  return (
    <>
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
