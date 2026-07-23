"use client";

import { useEffect, useRef, useState } from "react";
import { getCopy } from "@/lib/copy";
import { useTranslation } from "@/lib/i18n";
import { scroll } from "@/lib/scrollStore";
import { N, W, overlayAlpha, overlayReveal, stationIndex } from "@/lib/timeline";
import RfqModal from "./RfqModal";
import FloatingWidget from "./FloatingWidget";
import SpecComparison from "./SpecComparison";

type SectionRefs = {
  root: HTMLElement | null;
  inner: HTMLDivElement | null;
  tick: HTMLSpanElement | null;
  lines: HTMLSpanElement[];
};

export default function Overlay() {
  const { locale, setLocale, t } = useTranslation();
  const COPY = getCopy(locale);

  const sections = useRef<SectionRefs[]>(
    COPY.map(() => ({ root: null, inner: null, tick: null, lines: [] }))
  );
  const scrollCue = useRef<HTMLDivElement>(null);
  const scanRing = useRef<HTMLImageElement>(null);
  const [active, setActive] = useState(0);
  const [isRfqOpen, setIsRfqOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    let lastActive = -1;

    const update = () => {
      const t = scroll.t;
      const nextActive = stationIndex(t);
      const local = (t - nextActive * W) / W;
      document.body.classList.toggle(
        "scene-is-moving",
        Math.abs(scroll.v) > 0.018 || local > 0.54
      );

      if (nextActive !== lastActive) {
        lastActive = nextActive;
        setActive(nextActive);
      }

      sections.current.forEach((refs, i) => {
        if (COPY[i]?.hidden) {
          if (refs.root) {
            refs.root.style.opacity = "0";
            refs.root.style.visibility = "hidden";
          }
          return;
        }

        const alpha = overlayAlpha(t, i);
        const reveal = overlayReveal(t, i);
        if (refs.root) {
          refs.root.style.opacity = alpha.toFixed(3);
          refs.root.style.visibility = alpha > 0.02 ? "visible" : "hidden";
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
        scrollCue.current.style.opacity = String(Math.max(0, 1 - t * 24));
      }
      if (scanRing.current) {
        const extensionAlpha = overlayAlpha(t, 13);
        scanRing.current.style.opacity = (extensionAlpha * 0.85).toFixed(3);
        scanRing.current.style.transform = `translate(-50%, -50%) rotate(${t * 220}deg)`;
      }

      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    return () => {
      document.body.classList.remove("scene-is-moving");
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [COPY]);

  const scrollToStation = (i: number) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = (i + 0.3) * W * scrollHeight;
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth"
    });
  };

  return (
    <>
      <div className="overlay" aria-hidden="true">
        {COPY.map((section, i) => (
          <section
            key={section.id}
            ref={(node) => {
              sections.current[i].root = node;
            }}
            className={`section align-${section.align}`}
          >
            {!section.hidden && (
              <div
                ref={(node) => {
                  sections.current[i].inner = node;
                }}
                className={`section-inner ${i === 9 || i === 13 ? "wide-panel" : ""}`}
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
              <h1 className="headline">
                {section.headline.map((line, lineIndex) => (
                  <span className="line" key={line}>
                    <span
                      ref={(node) => {
                        if (node) sections.current[i].lines[lineIndex] = node;
                      }}
                    >
                      {i === 0 && line.toLowerCase().includes("clean energy") ? (
                        <>
                          to <em>Clean Energy</em>
                        </>
                      ) : (
                        line
                      )}
                    </span>
                  </span>
                ))}
              </h1>
              {section.body && <p className="body-copy">{section.body}</p>}
              
              {section.tags && (
                <div className="card-tags">
                  {section.tags.map((tag) => (
                    <span key={tag} className="tag-badge">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {i === 13 && <SpecComparison />}

              {section.data && <p className="datapoint">{section.data}</p>}
              </div>
            )}
          </section>
        ))}
        <img ref={scanRing} className="scan-ring" src="/icons/scan-ring.svg" alt="" />
      </div>
      
      <div className="hud-header-bar" />
      
      <div className="hud" aria-hidden="true">
        <a className="brand" href="#top" aria-label="An Viet Phat Group">
          <img src="/icons/avp-logo-full.png" alt="An Viet Phat" className="w-auto object-contain" />
        </a>
        
        <button 
          className="cta" 
          onClick={() => setIsRfqOpen(true)}
        >
          {t("Request specification", "Yêu cầu báo giá")}
        </button>
        
        <nav className="rail" aria-label={t("Progress", "Tiến trình")}>
          {COPY.map((section, i) => (
            <div 
              key={section.id} 
              className={`tick ${i === active ? "active" : ""} ${section.hidden ? "is-hidden" : ""}`}
              onClick={section.hidden ? undefined : () => scrollToStation(i)}
            >
              <i />
              <b>{section.hidden ? "" : i === active ? section.eyebrow : `${String(i).padStart(2, "0")}`}</b>
              {!section.hidden && <span className="rail-tooltip">{section.eyebrow}</span>}
            </div>
          ))}
        </nav>
        
        <div ref={scrollCue} className="scroll-cue">
          <img src="/icons/scroll-cue.svg" alt="" width={28} height={42} />
          <span>{t("Scroll", "Kéo xuống")}</span>
        </div>
        <span className="sr-only">{active + 1} / {N}</span>
      </div>

      <FloatingWidget onOpenRfq={() => setIsRfqOpen(true)} />
      <RfqModal isOpen={isRfqOpen} onClose={() => setIsRfqOpen(false)} />
    </>
  );
}
