"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scroll } from "@/lib/scrollStore";
import { isActive, stationLocal } from "@/lib/timeline";

/**
 * Per-station lifecycle: exposes a mutable {local, active} state read inside
 * the station's own useFrame callbacks, and culls the group when the camera
 * is more than one window away. Zero React state — all hot-path mutation.
 */
export function useStation(index: number) {
  const group = useRef<THREE.Group>(null);
  const state = useRef({ local: 0, active: false });

  useFrame(() => {
    const t = scroll.t;
    const active = isActive(t, index);
    state.current.active = active;
    state.current.local = stationLocal(t, index);
    if (group.current && group.current.visible !== active) {
      group.current.visible = active;
    }
  });

  return { group, state };
}
