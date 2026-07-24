"use client";

import { LOCALES, NAV, setLocale, useLocale } from "@/lib/locale";

/** Minimal, quiet chrome — the visual identity comes from the 3D, not the UI. */
export default function Header() {
  const locale = useLocale();
  const t = NAV[locale];

  return (
    <header className="site-header">
      <a className="brand" href="#">
        <span className="brand-mark">AVP</span>
        <span className="brand-name">{t.tagline}</span>
      </a>

      <div className="header-right">
        <nav className="site-nav">
          <a href="#">{t.products}</a>
          <a href="#">{t.sustainability}</a>
          <a className="nav-cta" href="#">
            {t.contact}
          </a>
        </nav>

        <div className="lang-switch" role="group" aria-label="Language">
          {LOCALES.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`lang-btn${l.id === locale ? " is-active" : ""}`}
              aria-pressed={l.id === locale}
              onClick={() => setLocale(l.id)}
              title={l.label}
            >
              <span className="lang-flag" aria-hidden>
                {l.flag}
              </span>
              <span className="lang-code">{l.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
