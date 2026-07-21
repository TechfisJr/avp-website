"use client";

import { COPY } from "@/lib/copy";

export default function NoWebGL() {
  return (
    <div className="nowebgl">
      <article>
        <img src="/icons/wordmark.svg" alt="AVP Biomass" height={24} />
        <h1>One pellet. A complete energy cycle.</h1>
        {COPY.slice(1).map((s) => (
          <section key={s.id}>
            <p className="eyebrow">
              <span className="tick" />
              {s.eyebrow}
            </p>
            <h2 className="headline" style={{ fontSize: "1.6rem" }}>
              {s.headline.join(" ")}
            </h2>
            {s.body && <p className="body-copy">{s.body}</p>}
            {s.data && <p className="datapoint">{s.data}</p>}
          </section>
        ))}
        <a className="cta" href="mailto:sales@avpbiomass.example">
          Request specification
        </a>
      </article>
    </div>
  );
}
