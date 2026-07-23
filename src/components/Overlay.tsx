"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { stationsFor } from "@/lib/content";
import { useLocale } from "@/lib/i18n";
import { flags, scroll } from "@/lib/scrollStore";
import { N, overlayAlpha, overlayReveal, smooth, stationIndex } from "@/lib/timeline";
import StatsModule from "./StatsModule";

type SectionRefs = {
  root: HTMLElement | null;
  inner: HTMLDivElement | null;
  tick: HTMLSpanElement | null;
  lines: HTMLSpanElement[];
};

const emptyRefs = (): SectionRefs => ({
  root: null,
  inner: null,
  tick: null,
  lines: [],
});

export default function Overlay() {
  const { locale, t } = useLocale();
  const stations = useMemo(() => stationsFor(locale), [locale]);

  const sections = useRef<SectionRefs[]>(stations.map(emptyRefs));
  const scrollCue = useRef<HTMLDivElement>(null);
  const scanRing = useRef<HTMLImageElement>(null);
  const [active, setActive] = useState(0);

  // Headline line counts differ between languages, so drop stale line refs when
  // the locale changes. This MUST happen during render: React attaches the ref
  // callbacks during commit, so resetting from an effect would wipe the refs
  // that were just handed to us and leave the overlay frozen at its CSS
  // default (opacity 0) until some unrelated re-render re-attached them.
  const refsLocale = useRef(locale);
  if (refsLocale.current !== locale) {
    refsLocale.current = locale;
    sections.current = stations.map(emptyRefs);
  }

  useEffect(() => {
    let raf = 0;
    let lastActive = -1;

    // The hero is fully revealed at t = 0 (see timeline.ts), so it has no
    // scroll distance to animate over. Ease it in on load instead — otherwise
    // the headline is simply already there the instant the canvas appears.
    const startedAt = performance.now();
    const INTRO_MS = 900;
    const introAt = (now: number) =>
      flags.reducedMotion ? 1 : smooth(Math.min(1, (now - startedAt) / INTRO_MS));

    const update = (now: number) => {
      const p = scroll.t;
      const intro = introAt(now);
      const nextActive = stationIndex(p);
      if (nextActive !== lastActive) {
        lastActive = nextActive;
        setActive(nextActive);
      }

      sections.current.forEach((refs, i) => {
        // station 0 only: gate the landing reveal on the intro, not on scroll
        const gate = i === 0 ? intro : 1;
        const alpha = overlayAlpha(p, i) * gate;
        const reveal = overlayReveal(p, i) * gate;
        if (refs.root) {
          refs.root.style.opacity = alpha.toFixed(3);
          refs.root.style.visibility = alpha > 0.02 ? "visible" : "hidden";
          // Consumed by CSS for the staggered spec/market row reveals.
          refs.root.style.setProperty("--reveal", reveal.toFixed(3));
        }
        if (refs.inner) {
          refs.inner.style.transform = `translate3d(0, ${(1 - alpha) * 18}px, 0)`;
        }
        if (refs.tick) {
          refs.tick.style.transform = `scaleX(${reveal.toFixed(3)})`;
        }
        refs.lines.forEach((line, lineIndex) => {
          const staggered = Math.min(1, Math.max(0, reveal * 1.25 - lineIndex * 0.12));
          line.style.transform = `translate3d(0, ${(1 - staggered) * 108}%, 0)`;
        });
      });

      if (scrollCue.current) {
        scrollCue.current.style.opacity = String(Math.max(0, 1 - p * 24));
      }
      if (scanRing.current) {
        const qcAlpha = overlayAlpha(p, 9);
        scanRing.current.style.opacity = (qcAlpha * 0.85).toFixed(3);
        scanRing.current.style.transform = `translate(-50%, -50%) rotate(${p * 220}deg)`;
      }

      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [locale]);

  return (
    <>
      <div className="overlay" aria-hidden="true">
        {stations.map((section, i) => (
          <section
            key={`${locale}-${section.id}`}
            ref={(node) => {
              sections.current[i].root = node;
            }}
            className={`section align-${section.align}${
              section.module ? ` has-${section.module}` : ""
            }`}
          >
            <div
              ref={(node) => {
                sections.current[i].inner = node;
              }}
              className="section-inner"
            >
              <p className="eyebrow">
                <span
                  ref={(node) => {
                    sections.current[i].tick = node;
                  }}
                  className="tick"
                />
                {section.eyebrow}
              </p>
              <h2 className="headline">
                {section.headline.map((line, lineIndex) => (
                  <span className="line" key={`${line}-${lineIndex}`}>
                    <span
                      ref={(node) => {
                        if (node) sections.current[i].lines[lineIndex] = node;
                      }}
                    >
                      {line}
                    </span>
                  </span>
                ))}
              </h2>
              {section.body && <p className="body-copy">{section.body}</p>}

              {section.module === "specs" && (
                <div className="specs">
                  <p className="module-title">
                    {t.specs.title}
                    <span className="standard">{t.specs.standard}</span>
                  </p>
                  <dl>
                    {t.specs.rows.map((row, rowIndex) => (
                      <div
                        className="spec-row"
                        key={row.label}
                        style={{ "--i": rowIndex } as React.CSSProperties}
                      >
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {section.module === "stats" && <StatsModule station={i} />}

              {section.module === "markets" && (
                <ul className="markets">
                  {t.markets.items.map((m, mIndex) => (
                    <li
                      className="market"
                      key={m.code}
                      style={{ "--i": mIndex } as React.CSSProperties}
                    >
                      <span className="market-code">{m.code}</span>
                      <span className="market-body">
                        <strong>
                          {m.name}
                          <em>{m.scheme}</em>
                        </strong>
                        <span>{m.note}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {section.data && <p className="datapoint">{section.data}</p>}
            </div>
          </section>
        ))}
        <img ref={scanRing} className="scan-ring" src="/icons/scan-ring.svg" alt="" />
      </div>

      <div className="hud" aria-hidden="true">
        <nav className="rail" aria-label={t.ui.progress}>
          {/* ticks only — the expanded station label used to sit on top of
              left-aligned copy (and now the spec table). The header nav
              already names the current section. */}
          {stations.map((section, i) => (
            <div key={section.id} className={`tick ${i === active ? "active" : ""}`} />
          ))}
        </nav>
        <div ref={scrollCue} className="scroll-cue">
          <img src="/icons/scroll-cue.svg" alt="" width={28} height={42} />
          <span>{t.ui.scrollCue}</span>
        </div>
        <span className="sr-only">
          {active + 1} / {N}
        </span>
      </div>
    </>
  );
}
