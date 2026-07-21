"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATIONS, bell } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { M } from "../kit/industrial";

const I = 5;
const S = STATIONS[I];

/** S05 — rotary dryer: long ribbed drum, inlet heat glow, steam columns. */
export default function Drying({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const drum = useRef<THREE.Group>(null);
  const q = quality.particleScale;

  useFrame((_, delta) => {
    if (!drum.current || !state.current.active) return;
    drum.current.rotation.x += delta * (0.25 + 0.55 * bell(state.current.local));
  });

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[30, 20]} />
      </mesh>

      {/* drum along x, slightly inclined */}
      <group position={[0, 2.4, 0]} rotation={[0, 0, 0.045]}>
        <group ref={drum} rotation={[0, 0, Math.PI / 2]}>
          <mesh material={M.steel}>
            <cylinderGeometry args={[1.5, 1.5, 14, 20]} />
          </mesh>
          {[-5.5, -2.75, 0, 2.75, 5.5].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.housing}>
              <torusGeometry args={[1.62, 0.1, 8, 24]} />
            </mesh>
          ))}
        </group>
        {/* inlet heat glow */}
        <mesh position={[-7.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={M.emberGlow}>
          <cylinderGeometry args={[1.32, 1.32, 0.2, 20]} />
        </mesh>
      </group>
      {/* riding supports */}
      {[-4.5, 4.5].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.55, 0]} material={M.housing}>
            <boxGeometry args={[1.4, 1.1, 2.6]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, 1.15, s * 0.85]} rotation={[0, 0, Math.PI / 2]} material={M.dark}>
              <cylinderGeometry args={[0.32, 0.32, 1.1, 12]} />
            </mesh>
          ))}
        </group>
      ))}
      <pointLight position={[-7.6, 2.4, 0]} color="#e85d26" intensity={30} distance={12} decay={1.8} />

      {/* steam rising along the drum */}
      {[-3, 0.5, 4].map((x, i) => (
        <ParticleField
          key={i}
          count={Math.round(200 * q) + 30}
          area={[1, 0.4, 0.8]}
          center={[x, 4.1, 0]}
          colorA="#cdbfae"
          colorB="#4a443c"
          size={3.2}
          life={4.5}
          rise={1.1}
          spread={0.35}
          curl={0.8}
          getIntensity={() => 0.32 * bell(state.current.local)}
        />
      ))}
    </group>
  );
}
