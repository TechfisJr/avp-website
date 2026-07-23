"use client";

import dynamic from "next/dynamic";

// New lightweight 2.5D engine (Lenis + GSAP ScrollTrigger, native scroll).
const ScrollWorldExperience = dynamic(() => import("./ScrollWorldExperience"), { ssr: false });
// Legacy engine (custom RAF smooth-scroll). Kept behind a flag until the new
// implementation is visually approved: set NEXT_PUBLIC_SCROLL_ENGINE=legacy.
const ScrollWorldLegacy = dynamic(() => import("./ScrollWorldExperience.legacy"), { ssr: false });

export default function ExperienceLoader() {
  const useLegacy = process.env.NEXT_PUBLIC_SCROLL_ENGINE === "legacy";
  return useLegacy ? <ScrollWorldLegacy /> : <ScrollWorldExperience />;
}
