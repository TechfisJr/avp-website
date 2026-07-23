import { COPY_EN, COPY_VI, type SectionCopy } from "@/lib/copy";
import ExperienceLoader from "@/components/ExperienceLoader";

function NarrativeArticle({ copy, lang }: { copy: SectionCopy[]; lang: "en" | "vi" }) {
  return (
    <article className="sr-only" aria-hidden={false} lang={lang}>
      {copy.map((s) => (
        <section key={s.id}>
          <p>{s.eyebrow}</p>
          <h2>{s.headline.join(" ")}</h2>
          {s.body && <p>{s.body}</p>}
          {s.data && <p>{s.data}</p>}
        </section>
      ))}
    </article>
  );
}

export default function Page() {
  return (
    <>
      <ExperienceLoader />
      {/* Server-rendered narrative for SEO / no-JS readers. Visually hidden;
          the cinematic overlay renders the same copy from the same source. */}
      <NarrativeArticle copy={COPY_EN} lang="en" />
      <NarrativeArticle copy={COPY_VI} lang="vi" />
    </>
  );
}
