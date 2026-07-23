"use client";

import { stationsFor } from "@/lib/content";
import { useLocale } from "@/lib/i18n";

/**
 * Shown when WebGL is unavailable. Same words, no canvas — the narrative
 * survives as an ordinary readable document.
 */
export default function NoWebGL() {
  const { locale, t } = useLocale();
  const stations = stationsFor(locale);
  const [hero, ...rest] = stations;

  return (
    <div className="nowebgl">
      <article>
        <p className="eyebrow">
          <span className="tick" />
          {hero.eyebrow}
        </p>
        <h1>{hero.headline.join(" ")}</h1>
        {hero.body && <p className="body-copy">{hero.body}</p>}

        {rest.map((s) => (
          <section key={s.id}>
            <p className="eyebrow">
              <span className="tick" />
              {s.eyebrow}
            </p>
            <h2 className="headline" style={{ fontSize: "1.6rem" }}>
              {s.headline.join(" ")}
            </h2>
            {s.body && <p className="body-copy">{s.body}</p>}

            {s.module === "specs" && (
              <dl className="specs-static">
                {t.specs.rows.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {s.module === "stats" && (
              <ul className="stats-static">
                {t.stats.items.map((item) => (
                  <li key={item.label}>
                    {item.prefix}
                    {new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(item.to)}
                    {item.suffix} — {item.label}
                  </li>
                ))}
              </ul>
            )}
            {s.module === "markets" && (
              <ul className="stats-static">
                {t.markets.items.map((m) => (
                  <li key={m.code}>
                    <strong>{m.name}</strong> · {m.scheme} — {m.note}
                  </li>
                ))}
              </ul>
            )}

            {s.data && <p className="datapoint">{s.data}</p>}
          </section>
        ))}
      </article>
    </div>
  );
}
