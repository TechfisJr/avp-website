"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATIONS, bell } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { M } from "../kit/industrial";

const I = 6;
const S = STATIONS[I];

/** S06 — conditioner: vertical vessel, steam jets, controlled fiber vortex. */
export default function Conditioning({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const paddles = useRef<THREE.Group>(null);
  const q = quality.particleScale;

  useFrame((_, delta) => {
    if (!paddles.current || !state.current.active) return;
    paddles.current.rotation.y += delta * (0.6 + 2.2 * bell(state.current.local));
  });

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[24, 20]} />
      </mesh>

      {/* vessel */}
      <mesh position={[0, 2.6, 0]} material={M.steel}>
        <cylinderGeometry args={[1.7, 1.7, 3.6, 20]} />
      </mesh>
      <mesh position={[0, 4.4, 0]} material={M.housing}>
        <sphereGeometry args={[1.7, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 0.55, 0]} material={M.housing}>
        <cylinderGeometry args={[1.9, 2.1, 0.5, 20]} />
      </mesh>
      {/* paddle shaft above the vessel mouth */}
      <group ref={paddles} position={[0, 5.4, 0]}>
        <mesh material={M.dark}>
          <cylinderGeometry args={[0.12, 0.12, 1.6, 8]} />
        </mesh>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[0, -0.3 + k * 0.3, 0]} rotation={[0, (k * Math.PI) / 3, 0]} material={M.steel}>
            <boxGeometry args={[1.5, 0.08, 0.22]} />
          </mesh>
        ))}
      </group>
      {/* steam nozzles */}
      {[0, 1, 2, 3].map((k) => {
        const a = (k / 4) * Math.PI * 2 + 0.4;
        return (
          <mesh
            key={k}
            position={[Math.cos(a) * 1.95, 2.4 + k * 0.35, Math.sin(a) * 1.95]}
            rotation={[0, -a, Math.PI / 2]}
            material={M.amber}
          >
            <cylinderGeometry args={[0.07, 0.07, 0.5, 8]} />
          </mesh>
        );
      })}

      {/* steam jets */}
      {[0, 2].map((k) => {
        const a = (k / 4) * Math.PI * 2 + 0.4;
        return (
          <ParticleField
            key={k}
            count={Math.round(140 * q) + 20}
            area={[0.15, 0.15, 0.15]}
            center={[Math.cos(a) * 2.2, 2.5 + k * 0.35, Math.sin(a) * 2.2]}
            colorA="#d8cdbb"
            colorB="#5a534a"
            size={2}
            life={1.6}
            dir={[Math.cos(a) * 1.8, 0.5, Math.sin(a) * 1.8]}
            spread={0.4}
            curl={0.5}
            getIntensity={() => 0.5 * bell(state.current.local)}
          />
        );
      })}
      {/* fiber vortex swirling above */}
      <ParticleField
        count={Math.round(380 * q) + 50}
        area={[1.6, 1.4, 1.6]}
        center={[0, 6.2, 0]}
        colorA="#e8c48a"
        colorB="#a06a32"
        size={0.7}
        life={3.4}
        rise={0.35}
        spread={0.5}
        curl={1.6}
        getIntensity={() => bell(state.current.local)}
      />
    </group>
  );
}
