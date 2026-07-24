"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { flags } from "@/lib/scrollStore";

/** Soft round sprite shared by all emitters (generated once). */
let SPRITE: THREE.CanvasTexture | null = null;
function sprite() {
  if (SPRITE) return SPRITE;
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.45, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  SPRITE = new THREE.CanvasTexture(c);
  SPRITE.colorSpace = THREE.SRGBColorSpace;
  return SPRITE;
}

type Props = {
  count?: number;
  center?: [number, number, number];
  area?: [number, number, number];
  color?: string;
  colorB?: string;
  rise?: number;
  size?: number;
  opacity?: number;
  blending?: THREE.Blending;
};

/**
 * A tiny CPU particle emitter — points loop upward over their life within a
 * box volume. Used for steam (white, diffuse) and the clean flame (warm,
 * additive). Cheap enough to sprinkle a few per scene.
 */
export default function Puffs({
  count = 120,
  center = [0, 0, 0],
  area = [1, 2, 1],
  color = "#ffffff",
  colorB,
  rise = 1.2,
  size = 0.8,
  opacity = 0.5,
  blending = THREE.NormalBlending,
}: Props) {
  const points = useRef<THREE.Points>(null);

  const { geometry, seeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = center[0] + (Math.random() - 0.5) * 2 * area[0];
      pos[i * 3 + 1] = center[1] + Math.random() * area[1];
      pos[i * 3 + 2] = center[2] + (Math.random() - 0.5) * 2 * area[2];
      seeds[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    // vertex colours for a warm gradient (flame) — optional
    if (colorB) {
      const cols = new Float32Array(count * 3);
      const cA = new THREE.Color(color);
      const cB = new THREE.Color(colorB);
      const t = new THREE.Color();
      for (let i = 0; i < count; i++) {
        t.copy(cA).lerp(cB, Math.random());
        cols[i * 3 + 0] = t.r;
        cols[i * 3 + 1] = t.g;
        cols[i * 3 + 2] = t.b;
      }
      g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    }
    return { geometry: g, seeds };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useFrame((state, delta) => {
    if (flags.reducedMotion || !points.current) return;
    const arr = geometry.attributes.position.array as Float32Array;
    const dt = Math.min(0.05, delta);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += rise * dt * (0.6 + seeds[i]);
      arr[i * 3 + 0] +=
        Math.sin(state.clock.elapsedTime * 0.8 + seeds[i] * 6) * 0.004;
      if (arr[i * 3 + 1] > center[1] + area[1]) {
        arr[i * 3 + 1] = center[1];
      }
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        map={sprite()}
        size={size}
        sizeAttenuation
        transparent
        depthWrite={false}
        opacity={opacity}
        color={colorB ? "#ffffff" : color}
        vertexColors={!!colorB}
        blending={blending}
      />
    </points>
  );
}
