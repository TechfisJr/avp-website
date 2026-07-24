"use client";

import { useEffect, useRef } from "react";
import { SECTIONS } from "@/lib/scenes";
import { scroll } from "@/lib/scrollStore";

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1)));
  return t * t * (3 - 2 * t);
};

/**
 * Fixed, pointer-transparent copy layer. Each section fades up as the camera
 * arrives at its scene and fades out as it leaves — driven off the shared
 * scroll offset in a single rAF loop rather than React state, so it stays in
 * lockstep with the render loop and never re-renders mid-scroll.
 */
export default function Overlay() {
  const blocks = useRef<(HTMLDivElement | null)[]>([]);
  const rail = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const o = scroll.offset;
      SECTIONS.forEach((s, i) => {
        const el = blocks.current[i];
        if (!el) return;
        // the first section greets on landing — fully shown at offset 0, no fade-in
        const up = i === 0 ? 1 : smoothstep(s.in, s.peak, o);
        const down = 1 - smoothstep(s.peak + (s.out - s.peak) * 0.45, s.out, o);
        const a = Math.max(0, up * down);
        el.style.opacity = String(a);
        el.style.transform = `translateY(${(1 - a) * 18}px)`;
      });
      if (rail.current) rail.current.style.transform = `scaleX(${o})`;
      if (cue.current) cue.current.style.opacity = String(1 - smoothstep(0, 0.05, o));
      // the hero "base" scrim grounds the floating sphere and gives the copy a
      // clean band; it fades away as the camera dives into the cloud
      if (scrim.current)
        scrim.current.style.opacity = String(1 - smoothstep(0.06, 0.26, o));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="overlay" aria-hidden={false}>
      <div ref={scrim} className="hero-scrim" />
      {SECTIONS.map((s, i) => (
        <div
          key={s.id}
          ref={(el) => {
            blocks.current[i] = el;
          }}
          className={`copy copy--${s.align}`}
        >
          <p className="eyebrow">{s.eyebrow}</p>
          <h2 className="title">
            {s.title.split("\n").map((line, j) => (
              <span key={j}>{line}</span>
            ))}
          </h2>
          <p className="body">{s.body}</p>
          {s.tags && (
            <ul className="tags">
              {s.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <div ref={cue} className="cue">
        <span>Scroll to explore</span>
        <div className="cue-line" />
      </div>

      <div className="rail">
        <div ref={rail} className="rail-fill" />
      </div>
    </div>
  );
}
