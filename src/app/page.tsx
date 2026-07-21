import { COPY } from "@/lib/copy";
import ExperienceLoader from "@/components/ExperienceLoader";

export default function Page() {
  return (
    <>
      <ExperienceLoader />
      {/* Server-rendered narrative for SEO / no-JS readers. Visually hidden;
          the cinematic overlay renders the same copy from the same source. */}
      <article className="sr-only" aria-hidden={false}>
        {COPY.map((s) => (
          <section key={s.id}>
            <p>{s.eyebrow}</p>
            <h2>{s.headline.join(" ")}</h2>
            {s.body && <p>{s.body}</p>}
            {s.data && <p>{s.data}</p>}
          </section>
        ))}
      </article>
    </>
  );
}
