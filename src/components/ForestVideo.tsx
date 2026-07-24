"use client";

import { useEffect, useRef } from "react";
import { scroll, flags } from "@/lib/scrollStore";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

/**
 * Scene 2 forest, as a cinematic video layer — with *modern* transitions rather
 * than flat crossfades:
 *
 *  - IN (pellet sphere -> forest): the storyboard's "punch through the Earth
 *    into the woods". As the dive bottoms out, a warm light-burst flashes and
 *    the footage rushes in from a blurred push-in (scale 1.22 + blur -> sharp),
 *    as if we broke through into sunlight.
 *  - OUT (forest -> hidden value): the footage pushes forward and racks out of
 *    focus (scale up + blur + fade), handing the frame to the next 3D scene
 *    which settles into focus behind it.
 *
 * Play is gated to the range; reduced-motion holds the poster with no moves.
 */
export default function ForestVideo() {
  const wrap = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const flash = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let playing = false;
    const reduce = flags.reducedMotion;
    const tick = () => {
      const o = scroll.offset;

      const enter = smooth(0.1, 0.17, o); // 0 -> 1 arriving
      const exit = 1 - smooth(0.44, 0.49, o); // 1 -> 0 leaving (short + clean)
      const opacity = Math.min(enter, exit);

      if (wrap.current) wrap.current.style.opacity = String(opacity);

      const v = vid.current;
      if (v) {
        if (!reduce) {
          // push-in on arrival, push-out on departure (multiply/add so each is
          // neutral outside its own window). Blur is a heavy full-frame filter,
          // so keep the EXIT blur small — it overlaps the collection scene
          // waking up, and a big blur there is what made the seam lag.
          const scale = lerp(1.18, 1.0, smooth(0.1, 0.22, o)) * lerp(1.0, 1.1, smooth(0.43, 0.49, o));
          const blur = lerp(9, 0, smooth(0.1, 0.2, o)) + lerp(0, 4, smooth(0.43, 0.49, o));
          v.style.transform = `scale(${scale.toFixed(3)})`;
          v.style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : "none";

          // pause a touch earlier so the decoder is idle before the seam
          if (opacity > 0.08 && !playing) {
            v.play().catch(() => {});
            playing = true;
          } else if (opacity <= 0.08 && playing) {
            v.pause();
            playing = false;
          }
        }
      }

      // warm light-burst peaking at the punch-through
      if (flash.current && !reduce) {
        const f = smooth(0.09, 0.125, o) * (1 - smooth(0.125, 0.17, o));
        flash.current.style.opacity = (f * 0.85).toFixed(3);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <div ref={wrap} className="forest-video" aria-hidden>
        <video
          ref={vid}
          src="/video/forest.mp4"
          poster="/video/forest-poster.jpg"
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>
      <div ref={flash} className="scene-flash" aria-hidden />
    </>
  );
}
