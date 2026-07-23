"use client";

import { stationsFor } from "@/lib/content";
import { useLocale } from "@/lib/i18n";

/**
 * Server-rendered narrative for search engines and no-JS readers. Visually
 * hidden; the cinematic overlay renders the same copy from the same source, so
 * the two can't drift.
 */
export default function SeoNarrative() {
  const { locale, t } = useLocale();

  return (
    <article className="sr-only">
      <h1>
        {t.brand.legal} — {t.brand.tagline}
      </h1>
      {stationsFor(locale).map((s) => (
        <section key={s.id}>
          <h2>{s.eyebrow}</h2>
          <p>{s.headline.join(" ")}</p>
          {s.body && <p>{s.body}</p>}

          {s.module === "specs" && (
            <dl>
              <dt>{t.specs.title}</dt>
              <dd>{t.specs.standard}</dd>
              {t.specs.rows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {s.module === "stats" && (
            <ul>
              {t.stats.items.map((item) => (
                <li key={item.label}>
                  {item.prefix}
                  {item.to.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
                  {item.suffix} {item.label}
                </li>
              ))}
            </ul>
          )}
          {s.module === "markets" && (
            <ul>
              {t.markets.items.map((m) => (
                <li key={m.code}>
                  {m.name} — {m.scheme}: {m.note}
                </li>
              ))}
            </ul>
          )}

          {s.data && <p>{s.data}</p>}
        </section>
      ))}
    </article>
  );
}
