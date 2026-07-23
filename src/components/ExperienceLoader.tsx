"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";

const Experience = dynamic(() => import("./Experience"), {
  ssr: false,
  loading: () => null,
});

export default function ExperienceLoader() {
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const startedAt = performance.now();
    const onReady = () => {
      const elapsed = performance.now() - startedAt;
      window.setTimeout(() => setReady(true), Math.max(0, 950 - elapsed));
    };

    window.addEventListener("avp:experience-ready", onReady, { once: true });
    const safety = window.setTimeout(onReady, 5200);
    return () => {
      window.clearTimeout(safety);
      window.removeEventListener("avp:experience-ready", onReady);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => setDismissed(true), 680);
    return () => window.clearTimeout(id);
  }, [ready]);

  return (
    <>
      <Experience />
      {!dismissed && <LoadingScreen exiting={ready} />}
    </>
  );
}
