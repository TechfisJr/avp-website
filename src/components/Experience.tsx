"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { flags, scroll, smoothScroll } from "@/lib/scrollStore";
import { TRACK_VH } from "@/lib/timeline";
import { TRACK_ID } from "@/lib/navigate";
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
  const track = useRef<HTMLDivElement>(null);

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
    if (!quality || !webgl || !track.current) return;

    let lenis: Lenis | null = null;
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.09, syncTouch: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis!.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      smoothScroll.instance = lenis;
    }

    // Progress 0..1 is measured across the cinematic track ONLY, so the
    // contact footer that follows it scrolls normally instead of eating the
    // last part of the timeline.
    const st = ScrollTrigger.create({
      trigger: track.current,
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
      smoothScroll.instance = null;
    };
  }, [quality, webgl, reduced]);

  if (!webgl) return <NoWebGL />;
  if (!quality) return null;

  return (
    <>
      {/* the only element with height; the canvas and overlay are fixed on top */}
      <div
        ref={track}
        id={TRACK_ID}
        className="scroll-track"
        style={{ height: `${TRACK_VH}vh` }}
      />
      <CanvasRoot quality={quality} />
      <div className="vignette" />
      <Overlay />
      {/* CSS grain only where the post pipeline is off — otherwise the
          composer's Noise pass handles it and the two would compound */}
      {!quality.postFX && <div className="grain" />}
    </>
  );
}
