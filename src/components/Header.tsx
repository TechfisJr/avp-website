"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LOCALES, NAV } from "@/lib/content";
import { useLocale } from "@/lib/i18n";
import { navigateTo } from "@/lib/navigate";
import { scroll } from "@/lib/scrollStore";
import { stationIndex } from "@/lib/timeline";

/** Nav item whose station the camera has reached — the last one at or behind it. */
function activeNavIndex(t: number): number {
  const station = stationIndex(t);
  let active = 0;
  NAV.forEach((item, i) => {
    if (typeof item.target === "number" && item.target <= station) active = i;
  });
  return active;
}

export default function Header() {
  const { locale, t, setLocale } = useLocale();
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  // Poll the mutable scroll store rather than subscribing to state updates —
  // one setState per station change instead of one per frame.
  useEffect(() => {
    let raf = 0;
    let last = -1;
    const tick = () => {
      const next = activeNavIndex(scroll.t);
      if (next !== last) {
        last = next;
        setActive(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Close the mobile menu on Escape, returning focus to its trigger.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (target: number | "contact") => {
    setOpen(false);
    navigateTo(target);
  };

  return (
    <motion.header
      className="site-header"
      initial={reduced ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <a className="skip-link" href="#contact">
        {t.ui.skipToContact}
      </a>

      <button
        type="button"
        className="brand"
        onClick={() => go(0)}
        aria-label={t.brand.legal}
      >
        {/* bare pellet glyph — the brand name is live text beside it, so the
            old baked-in "AVP BIOMASS" wordmark is neither needed nor correct */}
        <img src="/icons/logomark.svg" alt="" aria-hidden="true" width={22} height={26} />
        <span className="brand-text">
          <strong>{t.brand.name}</strong>
          <em>{t.brand.tagline}</em>
        </span>
      </button>

      <nav className="site-nav" aria-label={t.ui.menu}>
        <ul>
          {NAV.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => go(item.target)}
                aria-current={i === active ? "true" : undefined}
                className={i === active ? "active" : undefined}
              >
                {t.nav[item.id]}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="header-tools">
        <div
          className="lang-toggle"
          role="group"
          aria-label={t.ui.langLabel}
        >
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              aria-pressed={code === locale}
              className={code === locale ? "active" : undefined}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>

        <a className="header-cta" href="#contact" onClick={(e) => {
          e.preventDefault();
          go("contact");
        }}>
          {t.ui.cta}
        </a>

        <button
          ref={menuButton}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true">{open ? "✕" : "☰"}</span>
          <span className="sr-only">{t.ui.menu}</span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label={t.ui.menu}
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <ul>
              {NAV.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => go(item.target)}>
                    {t.nav[item.id]}
                  </button>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
