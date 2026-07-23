"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function ExperienceReadySignal() {
  const sent = useRef(false);

  useFrame(() => {
    if (sent.current) return;
    sent.current = true;
    window.dispatchEvent(new Event("avp:experience-ready"));
  });

  return null;
}
