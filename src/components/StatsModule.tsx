"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/lib/i18n";
import { flags, scroll } from "@/lib/scrollStore";
import { overlayReveal } from "@/lib/timeline";

/**
 * Scroll-scrubbed count-up. The numbers are a function of scroll position, not
 * of elapsed time — scrolling back down counts them straight back, which keeps
 * them honest in a scrubbed timeline.
 */
export default function StatsModule({ station }: { station: number }) {
  const { locale, t } = useLocale();
  const items = t.stats.items;
  const nodes = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const fmt = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US");

    const paint = (reveal: number) => {
      items.forEach((item, i) => {
        const node = nodes.current[i];
        if (!node) return;
        // Stagger: each tile finishes a little after the one before it.
        const local = Math.min(1, Math.max(0, (reveal - i * 0.06) * 1.35));
        const eased = 1 - Math.pow(1 - local, 3);
        node.textContent = fmt.format(Math.round(item.to * eased));
      });
    };

    if (flags.reducedMotion) {
      paint(1); // no scrubbing — show the final figures immediately
      return;
    }

    let raf = 0;
    let last = -1;
    const tick = () => {
      const reveal = overlayReveal(scroll.t, station);
      if (Math.abs(reveal - last) > 0.002) {
        last = reveal;
        paint(reveal);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [items, locale, station]);

  return (
    <dl className="stats">
      {items.map((item, i) => (
        <div className="stat" key={item.label} style={{ "--i": i } as React.CSSProperties}>
          <dt className="sr-only">{item.label}</dt>
          <dd>
            <span className="stat-value">
              {item.prefix}
              <span
                ref={(n) => {
                  nodes.current[i] = n;
                }}
              >
                0
              </span>
              {item.suffix}
            </span>
            <span className="stat-label" aria-hidden="true">
              {item.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
