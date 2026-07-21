"use client";

import { useEffect, useMemo, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { scroll, flags } from "@/lib/scrollStore";
import { TRACK_VH } from "@/lib/timeline";
import { detectQuality, type Quality } from "@/lib/quality";
import CanvasRoot from "@/three/CanvasRoot";
import Overlay from "./Overlay";
import NoWebGL from "./NoWebGL";

gsap.registerPlugin(ScrollTrigger);

function webglAvailable(): boolean {
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

  useEffect(() => {
    if (!quality || !webgl) return;

    let lenis: Lenis | null = null;
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.09, syncTouch: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis!.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    const st = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        scroll.t = self.progress;
        scroll.v = self.getVelocity() / 4000;
      },
    });

    return () => {
      st.kill();
      lenis?.destroy();
    };
  }, [quality, webgl, reduced]);

  if (!webgl) return <NoWebGL />;
  if (!quality) return null;

  return (
    <>
      {/* scroll body — the only element with height; everything else is fixed */}
      <div className="scroll-track" style={{ height: `${TRACK_VH}vh` }} />
      <CanvasRoot quality={quality} />
      <div className="vignette" />
      <Overlay />
      {quality.tier > 0 && <div className="grain" />}
    </>
  );
}
