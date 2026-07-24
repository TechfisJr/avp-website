"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Preload } from "@react-three/drei";
import World from "@/three/World";
import Post from "@/three/Post";
import { PAGES } from "@/lib/scenes";
import { detectQuality, type Quality } from "@/lib/quality";
import { flags, scroll } from "@/lib/scrollStore";
import Overlay from "./Overlay";
import Header from "./Header";
import Loader from "./Loader";
import ForestVideo from "./ForestVideo";
import MiniMap from "./MiniMap";

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Experience() {
  const [quality, setQuality] = useState<Quality | null>(null);
  const [webgl, setWebgl] = useState(true);

  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    flags.reducedMotion = reduced;
    setWebgl(webglAvailable());
    setQuality(detectQuality());
  }, [reduced]);

  // While the forest video fully covers the screen, nothing on the canvas is
  // visible — but the post chain (DoF + bloom + SMAA + noise + vignette) was
  // still running every frame at full DPR, starving the video's decode and
  // compositing. Drop it for that stretch. Both toggle points sit inside the
  // fully-covered window, so the composer's teardown/rebuild is never seen.
  const [covered, setCovered] = useState(false);
  useEffect(() => {
    let raf = 0;
    let cur = false;
    const tick = () => {
      const c = scroll.offset > 0.21 && scroll.offset < 0.42;
      if (c !== cur) {
        cur = c;
        setCovered(c);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!webgl) {
    return (
      <div className="fallback">
        <h1>An Việt Phát · Wood Pellets</h1>
        <p>Your browser does not support WebGL, which is required for the 3D experience.</p>
      </div>
    );
  }
  if (!quality) return <div className="boot" aria-hidden />;

  return (
    <>
      <Header />
      <div className="canvas-root">
        <Canvas
          dpr={[1, quality.dpr]}
          shadows={quality.shadows}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          camera={{ fov: 42, near: 0.1, far: 120, position: [0, 0.4, 7.2] }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.95;
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
        >
          <Suspense fallback={null}>
            <ScrollControls pages={PAGES} damping={0.22}>
              <World quality={quality} />
            </ScrollControls>
            {!covered && <Post />}
            <Preload all />
          </Suspense>
        </Canvas>
      </div>
      <ForestVideo />
      <Overlay />
      <MiniMap />
      <Loader />
    </>
  );
}
