"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { flags } from "@/lib/scrollStore";

/** Soft round sprite for the motes, generated once (no external texture). */
function makeSprite() {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Fine drifting dust/pollen motes catching the light — a cheap, cohesive depth
 * cue used across the whole flight. Pure vertex drift on the CPU; a few hundred
 * points is nothing.
 */
export default function Motes({ count = 260 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const sprite = useMemo(makeSprite, []);

  const { geometry, seeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = Math.random() * 14;
      pos[i * 3 + 2] = -Math.random() * 54 + 4;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geometry: g, seeds };
  }, [count]);

  useFrame((state) => {
    if (flags.reducedMotion || !points.current) return;
    const t = state.clock.elapsedTime;
    const arr = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] += Math.sin(t * 0.2 + seeds[i]) * 0.002;
      arr[i * 3 + 1] += 0.004 + Math.sin(t * 0.3 + seeds[i]) * 0.001;
      if (arr[i * 3 + 1] > 15) arr[i * 3 + 1] = 0;
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        map={sprite}
        size={0.13}
        sizeAttenuation
        transparent
        depthWrite={false}
        opacity={0.5}
        color="#fff4dc"
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
