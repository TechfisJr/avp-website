"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATIONS, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { PelletBed } from "../kit/biomass";
import { M } from "../kit/industrial";

const I = 8;
const S = STATIONS[I];

/** S08 — counterflow cooler: glass bin over a pellet bed; the warm haze
 *  thins out and the light slides amber → teal as the bed settles. */
export default function Cooling({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const warm = useRef<THREE.PointLight>(null);
  const cool = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (!state.current.active) return;
    const cooled = smooth((state.current.local - 0.2) / 0.5);
    if (warm.current) warm.current.intensity = 26 * (1 - cooled) * bell(state.current.local);
    if (cool.current) cool.current.intensity = 30 * cooled;
  });

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[24, 20]} />
      </mesh>

      {/* discharge grid base */}
      <mesh position={[0, 0.5, 0]} material={M.housing}>
        <boxGeometry args={[5.2, 1, 5.2]} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[-2.1 + i * 0.7, 1.02, 0]} material={M.dark}>
          <boxGeometry args={[0.14, 0.06, 4.8]} />
        </mesh>
      ))}
      {/* the pellet bed — thousands of instanced capsules */}
      <PelletBed count={quality.pelletCount} position={[0, 1.15, 0]} area={[2.2, 0.4, 2.2]} />
      {/* glass walls */}
      {quality.tier > 0 && (
        <mesh position={[0, 2.6, 0]} material={M.glass}>
          <boxGeometry args={[4.9, 3, 4.9]} />
        </mesh>
      )}
      {/* corner posts + air plenum */}
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}${z}`} position={[x * 2.45, 2.6, z * 2.45]} material={M.steel}>
            <boxGeometry args={[0.16, 3.2, 0.16]} />
          </mesh>
        ))
      )}
      <mesh position={[0, 4.4, 0]} material={M.housing}>
        <boxGeometry args={[5.2, 0.5, 5.2]} />
      </mesh>
      <mesh position={[0, 5, 0]} material={M.steel}>
        <cylinderGeometry args={[0.8, 1.2, 0.8, 12]} />
      </mesh>

      <pointLight ref={warm} position={[0, 3, 2]} color="#e8a33d" distance={12} decay={1.8} />
      <pointLight ref={cool} position={[0, 4, -2]} color="#7fb4c7" distance={14} decay={1.8} />

      {/* thinning steam wisps */}
      <ParticleField
        count={Math.round(220 * quality.particleScale) + 30}
        area={[2.2, 0.5, 2.2]}
        center={[0, 1.8, 0]}
        colorA="#cdc4b5"
        colorB="#4a443c"
        size={2.6}
        life={3.2}
        rise={0.9}
        spread={0.3}
        curl={0.6}
        getIntensity={() => 0.45 * (1 - smooth((state.current.local - 0.2) / 0.5)) * bell(state.current.local)}
      />
    </group>
  );
}
