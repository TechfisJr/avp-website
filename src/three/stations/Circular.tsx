"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATIONS, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { M } from "../kit/industrial";

const I = 14;
const S = STATIONS[I];

const ringMat = new THREE.MeshStandardMaterial({
  color: "#1a2d1d",
  emissive: "#7ba05b",
  emissiveIntensity: 1.1,
  roughness: 0.55,
});

const dawnMat = new THREE.MeshBasicMaterial({
  color: "#7ba05b",
  transparent: true,
  opacity: 0.08,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
  depthWrite: false,
});

/** S14 — circular economy: embers cool into leaf motes and close the loop. */
export default function Circular({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const ring = useRef<THREE.Group>(null);
  const dawn = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!state.current.active) return;
    const local = state.current.local;
    const form = smooth((local - 0.15) / 0.55);
    if (ring.current) {
      ring.current.rotation.y += delta * (0.18 + form * 0.45);
      ring.current.rotation.z += delta * 0.08;
      ring.current.scale.setScalar(0.45 + form * 0.75);
    }
    if (dawn.current) {
      (dawn.current.material as THREE.MeshBasicMaterial).opacity = 0.04 + form * 0.12;
    }
  });

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[28, 24]} />
      </mesh>

      <mesh ref={dawn} position={[0, 3.2, -4]} rotation={[0.25, 0, 0]} material={dawnMat}>
        <circleGeometry args={[18, 48]} />
      </mesh>

      <group ref={ring} position={[0, 2.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh material={ringMat}>
          <torusGeometry args={[3.2, 0.035, 8, 96]} />
        </mesh>
        {[0, 1, 2].map((k) => (
          <mesh key={k} rotation={[0, 0, (k * Math.PI) / 3]} material={ringMat}>
            <torusGeometry args={[2.2 + k * 0.85, 0.018, 6, 96]} />
          </mesh>
        ))}
      </group>

      <ParticleField
        count={Math.round(520 * quality.particleScale) + 70}
        area={[3.2, 2.2, 3.2]}
        center={[0, 2.4, 0]}
        colorA="#b8d49a"
        colorB="#7ba05b"
        size={0.75}
        life={5.5}
        rise={0.1}
        spread={0.75}
        curl={1.8}
        getIntensity={() => 0.35 + 0.65 * bell(state.current.local)}
      />

      <ParticleField
        count={Math.round(220 * quality.particleScale) + 30}
        area={[1.5, 1.2, 1.5]}
        center={[0, 2.5, 0]}
        colorA="#ffb35c"
        colorB="#7ba05b"
        size={0.55}
        life={3.8}
        rise={0.35}
        spread={0.55}
        curl={1.2}
        getIntensity={() => 0.5 * (1 - smooth((state.current.local - 0.35) / 0.45))}
      />
    </group>
  );
}
