"use client";

import { Suspense, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import type { Quality } from "@/lib/quality";
import World from "./World";
import BackgroundGradient from "./visual/BackgroundGradient";
import SceneEnvironment from "./visual/SceneEnvironment";
import PostFX from "./visual/PostFX";

export default function CanvasRoot({ quality }: { quality: Quality }) {
  // detectQuality() guesses from device memory / core count / pointer type,
  // which says nothing about the actual GPU. This measures the real frame rate
  // and walks the resolution down if the guess was optimistic — the cheapest
  // lever available, and the one that scales smoothly rather than popping
  // effects on and off mid-scroll.
  const [dprScale, setDprScale] = useState(1);

  return (
    <div className="canvas-root">
      <Canvas
        dpr={[1, Math.max(1, quality.dpr * dprScale)]}
        camera={{ fov: 42, near: 0.1, far: 160, position: [0, 2.2, 5] }}
        gl={{
          antialias: quality.tier > 0,
          powerPreference: "high-performance",
        }}
        // explicit type: R3F's `shadows={true}` selects PCFSoftShadowMap, which
        // three deprecated — it silently falls back to PCF and logs a warning
        shadows={quality.shadows ? { type: THREE.PCFShadowMap } : false}
        frameloop="always"
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <PerformanceMonitor
          onDecline={() => setDprScale((s) => Math.max(0.6, s - 0.2))}
          onIncline={() => setDprScale((s) => Math.min(1, s + 0.1))}
          flipflops={3}
          // after three oscillations, stop adjusting and stay at the low end
          // rather than pulsing the resolution while the user scrolls
          onFallback={() => setDprScale(0.6)}
        >
          <Suspense fallback={null}>
            <BackgroundGradient />
            <SceneEnvironment resolution={quality.envResolution} />
            <World quality={quality} />
            <PostFX quality={quality} />
          </Suspense>
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
}
