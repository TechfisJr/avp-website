"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Quality } from "@/lib/quality";
import { scroll } from "@/lib/scrollStore";
import { stationIndex, stationLocal } from "@/lib/timeline";

function motionDprFor(quality: Quality) {
  if (quality.tier === 0) return Math.min(quality.dpr, 0.86);
  if (quality.tier === 1) return Math.min(quality.dpr, 0.92);
  return Math.min(quality.dpr, 1.0);
}

export default function RenderPerformanceGovernor({ quality }: { quality: Quality }) {
  const setDpr = useThree((state) => state.setDpr);
  const activeDpr = useRef(quality.dpr);
  const lastSwitch = useRef(0);

  useEffect(() => {
    activeDpr.current = quality.dpr;
    setDpr(quality.dpr);
  }, [quality.dpr, setDpr]);

  useFrame((state) => {
    const local = stationLocal(scroll.t, stationIndex(scroll.t));
    const cameraTravel = local > 0.44;
    const fastScroll = Math.abs(scroll.v) > 0.018;
    const target = cameraTravel || fastScroll ? motionDprFor(quality) : quality.dpr;

    if (Math.abs(activeDpr.current - target) < 0.015) return;

    const now = state.clock.elapsedTime;
    const lowering = target < activeDpr.current;
    if (!lowering && now - lastSwitch.current < 0.42) return;

    activeDpr.current = target;
    lastSwitch.current = now;
    setDpr(target);
  });

  return null;
}
