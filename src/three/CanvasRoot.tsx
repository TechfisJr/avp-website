"use client";

import { Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import type { Quality } from "@/lib/quality";
import World from "./World";
import RenderPerformanceGovernor from "./RenderPerformanceGovernor";
import BackgroundGradient from "./visual/BackgroundGradient";
import SceneEnvironment from "./visual/SceneEnvironment";
import PostFX from "./visual/PostFX";

export default function CanvasRoot({ quality }: { quality: Quality }) {
  return (
    <div className="canvas-root">
      <Canvas
        dpr={[1, quality.dpr]}
        camera={{ fov: 42, near: 0.1, far: 160, position: [0, 2.2, 5] }}
        gl={{
          antialias: quality.tier > 0,
          powerPreference: "high-performance",
        }}
        shadows={quality.shadows}
        frameloop="always"
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <Suspense fallback={null}>
          <BackgroundGradient />
          <SceneEnvironment resolution={quality.envResolution} />
          <World quality={quality} />
          <RenderPerformanceGovernor quality={quality} />
          <PostFX quality={quality} />
        </Suspense>
      </Canvas>
    </div>
  );
}
