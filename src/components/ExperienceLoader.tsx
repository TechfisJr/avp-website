"use client";

import dynamic from "next/dynamic";

const ScrollWorldExperience = dynamic(() => import("./ScrollWorldExperience"), { ssr: false });

export default function ExperienceLoader() {
  return <ScrollWorldExperience />;
}
