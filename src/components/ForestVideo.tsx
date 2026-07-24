"use client";

import { useEffect, useRef } from "react";
import { scroll, flags } from "@/lib/scrollStore";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

const FULL = 74; // clip-circle radius (%) that fully covers the frame
const FEATHER = 28; // softness of the descent wipe's leading edge, in %

/**
 * Scene 2 forest video. Two different seams: a soft DESCENT WIPE on the way in
 * (mask gradient sweeping down), a CIRCULAR IRIS on the way out.
 *
 * Perf notes — this layer sits full-screen over a live WebGL canvas, so it is
 * deliberately frugal:
 *   - styles are only written when they actually CHANGE (re-assigning
 *     clip-path/mask every frame invalidates the compositor layer constantly)
 *   - during the hold, clip-path and mask are set to "none" so the video
 *     composites plainly, with no per-frame clipping work at all
 */
export default function ForestVideo() {
  const wrap = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const flash = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let playing = false;
    const reduce = flags.reducedMotion;
    const last = { clip: "", mask: "", op: "", tf: "", flash: "" };

    const tick = () => {
      const o = scroll.offset;
      const e = smooth(0.1, 0.19, o); // arriving (descent wipe)
      const x = 1 - smooth(0.44, 0.5, o); // leaving (circular iris)
      const p = Math.min(e, x);

      const w = wrap.current;
      if (w) {
        const op = reduce ? String(p) : p > 0.001 ? "1" : "0";
        if (op !== last.op) {
          w.style.opacity = op;
          last.op = op;
        }

        if (!reduce) {
          // only clip while actually leaving; "none" during the hold
          const clip =
            x < 0.999 ? `circle(${(FULL * x).toFixed(2)}% at 50% 50%)` : "none";
          if (clip !== last.clip) {
            w.style.clipPath = clip;
            last.clip = clip;
          }
          // only mask while actually arriving; "none" during the hold
          let mask = "none";
          if (e < 0.999) {
            const b = lerp(0, 100 + FEATHER + 16, e);
            mask = `linear-gradient(to bottom, #000 ${(b - FEATHER).toFixed(1)}%, transparent ${b.toFixed(1)}%)`;
          }
          if (mask !== last.mask) {
            w.style.maskImage = mask;
            w.style.webkitMaskImage = mask;
            last.mask = mask;
          }
        }
      }

      const v = vid.current;
      if (v && !reduce) {
        // settle out of the overscan while arriving, then leave it alone
        const tf =
          e < 0.999
            ? `translate3d(0, ${lerp(-6, 0, e).toFixed(2)}%, 0) scale(${lerp(1.1, 1.0, smooth(0.1, 0.26, o)).toFixed(3)})`
            : "none";
        if (tf !== last.tf) {
          v.style.transform = tf;
          last.tf = tf;
        }

        if (p > 0.08 && !playing) {
          v.play().catch(() => {});
          playing = true;
        } else if (p <= 0.08 && playing) {
          v.pause();
          playing = false;
        }
      }

      if (flash.current && !reduce) {
        const f = smooth(0.09, 0.125, o) * (1 - smooth(0.125, 0.17, o));
        const fs = (f * 0.85).toFixed(3);
        if (fs !== last.flash) {
          flash.current.style.opacity = fs;
          last.flash = fs;
        }
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
