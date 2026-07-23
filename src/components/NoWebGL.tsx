"use client";

import { getCopy } from "@/lib/copy";
import { useTranslation } from "@/lib/i18n";

export default function NoWebGL() {
  const { locale, t } = useTranslation();
  const COPY = getCopy(locale);
  const hero = COPY[0];

  return (
    <div className="nowebgl">
      <article>
        <img src="/icons/wordmark.svg" alt="AVP Biomass" height={24} />
        <h1>{hero.headline.join(" ")}</h1>
        {hero.body && <p className="body-copy">{hero.body}</p>}
        {COPY.slice(1).map((s) => (
          <section key={s.id}>
            {s.headline.length > 0 && (
              <>
                <p className="eyebrow">
                  <span className="tick" />
                  {s.eyebrow}
                </p>
                <h2 className="headline" style={{ fontSize: "1.6rem" }}>
                  {s.headline.join(" ")}
                </h2>
                {s.body && <p className="body-copy">{s.body}</p>}
                {s.data && <p className="datapoint">{s.data}</p>}
              </>
            )}
          </section>
        ))}
        <a className="cta" href="mailto:sales@avpbiomass.example">
          {t("Request specification", "Yêu cầu báo giá")}
        </a>
      </article>
    </div>
  );
}
