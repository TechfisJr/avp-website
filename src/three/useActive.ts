"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scroll } from "@/lib/scrollStore";

/**
 * Culls a scene group to the scroll window it lives in — every scene stays
 * mounted (cheap React tree) but only pays draw-call cost while the camera is
 * near it. Zero React state; visibility is flipped on the mutable group ref.
 */
export function useActiveGroup(inO: number, outO: number) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const active = scroll.offset > inO && scroll.offset < outO;
    if (g.visible !== active) g.visible = active;
  });
  return ref;
}
