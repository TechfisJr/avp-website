"use client";

import { useEffect, useRef } from "react";
import { SECTIONS } from "@/lib/scenes";
import { scroll } from "@/lib/scrollStore";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// serpentine plant layout: 4 stations across the top, 3 back along the bottom
const NODES: [number, number][] = [
  [26, 30],
  [62, 30],
  [98, 30],
  [134, 30],
  [134, 66],
  [98, 66],
  [62, 66],
];
const LINE = "M 26 30 H 158 Q 170 30 170 42 V 54 Q 170 66 158 66 H 62";

/**
 * A compact plant schematic pinned bottom-left: the production line drawn as a
 * serpentine path through the building, with the traced progress and the active
 * station following the scroll. Gives the tour an orientation cue — where you
 * are in the process — the way a real facility overview would.
 *
 * Driven entirely by a rAF reading the shared scroll offset (no React re-renders
 * on the hot path), and hidden on small screens where it would crowd the copy.
 */
export default function MiniMap() {
  const root = useRef<HTMLDivElement>(null);
  const trace = useRef<SVGPathElement>(null);
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const label = useRef<HTMLSpanElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    let lastIdx = -1;
    let lastOpacity = "";
    const tick = () => {
      const o = scroll.offset;

      // reveal once the hero has handed off, then keep it up for the tour
      const vis = smooth(0.05, 0.12, o).toFixed(3);
      if (vis !== lastOpacity && root.current) {
        root.current.style.opacity = vis;
        lastOpacity = vis;
      }

      // trace the path as the journey advances
      if (trace.current) {
        trace.current.style.strokeDashoffset = String(1 - clamp01(o));
      }

      // active station = last one whose window has started
      let idx = 0;
      for (let i = 0; i < SECTIONS.length; i++) {
        if (o >= SECTIONS[i].in) idx = i;
      }
      if (idx !== lastIdx) {
        lastIdx = idx;
        dots.current.forEach((d, i) => {
          if (!d) return;
          const on = i <= idx;
          d.setAttribute("r", i === idx ? "6.2" : "3.4");
          d.setAttribute("class", `mm-dot${i === idx ? " is-active" : on ? " is-done" : ""}`);
        });
        if (label.current) label.current.textContent = SECTIONS[idx].eyebrow;
        if (count.current)
          count.current.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(
            SECTIONS.length
          ).padStart(2, "0")}`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={root} className="minimap" aria-hidden>
      <div className="minimap-head">
        <span>Production line</span>
        <span ref={count} className="minimap-count">
          01 / {String(SECTIONS.length).padStart(2, "0")}
        </span>
      </div>

      <svg viewBox="0 0 196 96" role="presentation">
        {/* building outline */}
        <rect x="6" y="10" width="184" height="76" rx="8" className="mm-hall" />
        {/* the line, dim */}
        <path d={LINE} className="mm-line" />
        {/* the line, traced to current progress */}
        <path ref={trace} d={LINE} className="mm-trace" pathLength={1} />
        {NODES.map(([x, y], i) => (
          <circle
            key={i}
            ref={(el) => {
              dots.current[i] = el;
            }}
            cx={x}
            cy={y}
            r={i === 0 ? 6.2 : 3.4}
            className={`mm-dot${i === 0 ? " is-active" : ""}`}
          />
        ))}
      </svg>

      <div className="minimap-label">
        <span ref={label}>{SECTIONS[0].eyebrow}</span>
      </div>
    </div>
  );
}
