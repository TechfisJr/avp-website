"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PARTICLE_VERT, PARTICLE_FRAG } from "./shaders";
import { isVisibleInTree } from "../kit/visibility";

export type ParticleProps = {
  count: number;
  /** spawn volume half-extents (box) */
  area?: [number, number, number];
  /** spawn volume center (local) */
  center?: [number, number, number];
  colorA: string;
  colorB?: string;
  size?: number;
  life?: number;
  rise?: number;
  gravity?: number;
  spread?: number;
  curl?: number;
  dir?: [number, number, number];
  blending?: THREE.Blending;
  /** sprite silhouette family: "puff" (gas/light, default), "shard" (solid
   *  debris — chips/sawdust/fines/stones), "speck" (fine dust) */
  shape?: "puff" | "shard" | "speck";
  /** called each frame — return 0..1 emission intensity (scrub hook) */
  getIntensity: () => number;
};

const SHAPE_ID: Record<NonNullable<ParticleProps["shape"]>, number> = { puff: 0, shard: 1, speck: 2 };

/**
 * The one particle engine used site-wide (spores, dust, chips, sawdust,
 * steam, smoke, sparks, embers, leaf-motes). One shader program, per-use
 * uniforms. Particles loop over life on the clock; scroll modulates
 * intensity so emission is fully scrub-controlled.
 */
export default function ParticleField({
  count,
  area = [4, 4, 4],
  center = [0, 0, 0],
  colorA,
  colorB,
  size = 1,
  life = 4,
  rise = 0,
  gravity = 0,
  spread = 0.6,
  curl = 0,
  dir = [0, 0, 0],
  blending = THREE.AdditiveBlending,
  shape = "puff",
  getIntensity,
}: ParticleProps) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const points = useRef<THREE.Points>(null);

  const { geometry, uniforms } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = center[0] + (Math.random() - 0.5) * 2 * area[0];
      pos[i * 3 + 1] = center[1] + (Math.random() - 0.5) * 2 * area[1];
      pos[i * 3 + 2] = center[2] + (Math.random() - 0.5) * 2 * area[2];
      seed[i * 3 + 0] = Math.random();
      seed[i * 3 + 1] = Math.random();
      seed[i * 3 + 2] = Math.random();
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 3));
    geo.boundingSphere = new THREE.Sphere(
      new THREE.Vector3(...center),
      Math.max(...area) * 3 + life * (Math.abs(rise) + spread) + 4
    );
    const u = {
      uTime: { value: 0 },
      uLife: { value: life },
      uSize: { value: size },
      uRise: { value: rise },
      uGravity: { value: gravity },
      uSpread: { value: spread },
      uCurl: { value: curl },
      uPx: { value: Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1) },
      uDir: { value: new THREE.Vector3(...dir) },
      uIntensity: { value: 0 },
      uShape: { value: SHAPE_ID[shape] },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB ?? colorA) },
    };
    return { geometry: geo, uniforms: u };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useFrame((state) => {
    if (!mat.current) return;
    if (!isVisibleInTree(points.current)) return;
    const u = mat.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uIntensity.value = getIntensity();
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={PARTICLE_VERT}
        fragmentShader={PARTICLE_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={blending}
      />
    </points>
  );
}
