"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scroll } from "@/lib/scrollStore";
import { isActive, isRenderWarm, stationLocal } from "@/lib/timeline";

/**
 * Per-station lifecycle: exposes a mutable {local, active} state read inside
 * the station's own useFrame callbacks. The visual group becomes renderable
 * before the station is active so WebGL can warm shaders and buffers off the
 * critical phase-change moment. Zero React state — all hot-path mutation.
 */
export function useStation(index: number) {
  const group = useRef<THREE.Group>(null);
  const state = useRef({ local: 0, active: false });

  useLayoutEffect(() => {
    const t = scroll.t;
    state.current.active = isActive(t, index);
    state.current.local = stationLocal(t, index);
    if (group.current) group.current.visible = isRenderWarm(t, index);
  }, [index]);

  useFrame(() => {
    const t = scroll.t;
    const active = isActive(t, index);
    const renderWarm = isRenderWarm(t, index);
    state.current.active = active;
    state.current.local = stationLocal(t, index);
    if (group.current && group.current.visible !== renderWarm) {
      group.current.visible = renderWarm;
    }
  });

  return { group, state };
}
