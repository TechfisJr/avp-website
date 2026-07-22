"use client";

import { useEffect, useMemo, useState } from "react";
import { TRACK_VH } from "@/lib/timeline";
import { detectQuality, type Quality } from "@/lib/quality";
import { flags, scroll } from "@/lib/scrollStore";
import { setupExperienceScroll } from "@/lib/gsapExperience";
import CanvasRoot from "@/three/CanvasRoot";
import Overlay from "./Overlay";
import NoWebGL from "./NoWebGL";

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
  const [track, setTrack] = useState<HTMLDivElement | null>(null);

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
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    scroll.t = 0;
    scroll.v = 0;
  }, [reduced]);

  useEffect(() => {
    if (!quality || !webgl || !track) return;
    const controller = setupExperienceScroll({ reducedMotion: reduced, track });
    return controller.cleanup;
  }, [quality, webgl, reduced, track]);

  if (!webgl) return <NoWebGL />;
  if (!quality) return null;

  return (
    <>
      {/* scroll body — the only element with height; everything else is fixed */}
      <div ref={setTrack} className="scroll-track" style={{ height: `${TRACK_VH}vh` }} />
      <CanvasRoot quality={quality} />
      <div className="vignette" />
      <Overlay />
      {quality.tier > 0 && <div className="grain" />}
    </>
  );
}
