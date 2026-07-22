"use client";

import * as THREE from "three";
import { STATIONS, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { Truck } from "../kit/machines";
import { Logs, Shavings } from "../kit/biomass";
import { M } from "../kit/industrial";
import { createConcreteMaterial } from "../visual/materials";

const I = 1;
const S = STATIONS[I];

const yardMat = createConcreteMaterial({ color: "#17140d", roughness: 0.96 });
const laneMat = new THREE.MeshStandardMaterial({
  color: "#b78a2d",
  emissive: "#8a5f14",
  emissiveIntensity: 0.18,
  roughness: 0.72,
  metalness: 0.05,
});

/** S01 — responsible source handoff: the journey starts with a loaded log
 * truck, not a forest fly-through. This keeps the source message practical and
 * prepares the next beat: driving into the factory receiving area. */
export default function Forest({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={yardMat}>
        <circleGeometry args={[28, 24]} />
      </mesh>

      {/* simple source/loading yard architecture */}
      <mesh position={[0, 4.2, -8.5]} material={M.housing}>
        <boxGeometry args={[18, 8.4, 0.36]} />
      </mesh>
      {[-7.5, -3.8, 0, 3.8, 7.5].map((x) => (
        <mesh key={x} position={[x, 4.1, -8.25]} material={M.dark}>
          <boxGeometry args={[0.18, 7.8, 0.18]} />
        </mesh>
      ))}
      <mesh position={[-3.6, 0.035, 1.95]} rotation={[-Math.PI / 2, 0, -0.12]} material={laneMat}>
        <planeGeometry args={[6.4, 0.08]} />
      </mesh>
      <mesh position={[-3.15, 0.035, 0.78]} rotation={[-Math.PI / 2, 0, -0.12]} material={laneMat}>
        <planeGeometry args={[6.4, 0.08]} />
      </mesh>

      <group position={[1.45, 0, 1.05]} rotation={[0, -0.82, 0]} scale={0.86}>
        <Truck cargoLoad={1} />
      </group>

      <Logs count={quality.tier === 0 ? 8 : 12} position={[-5.25, 0, -1.1]} rotation={[0, 0.18, 0]} getAssemble={() => 1} />
      <Shavings count={quality.tier === 0 ? 3 : 6} position={[-4.3, 0, 1.7]} />

      {/* plant/source gate marker, deliberately abstract so it does not become
          a new forest scene. */}
      <group position={[3.8, 0, -2.2]}>
        <mesh position={[0, 1.35, 0]} material={M.housing}>
          <boxGeometry args={[2.7, 2.7, 0.22]} />
        </mesh>
        <mesh position={[0, 1.72, 0.14]} material={M.dark}>
          <boxGeometry args={[2.1, 0.18, 0.06]} />
        </mesh>
        <mesh position={[0, 1.28, 0.14]} material={M.dark}>
          <boxGeometry args={[1.55, 0.14, 0.06]} />
        </mesh>
      </group>

      <pointLight position={[2.5, 4.5, 3.8]} color="#ffd8a0" intensity={18} distance={15} decay={1.8} />
      <pointLight position={[-5.8, 3.2, -3.6]} color="#8fb4cf" intensity={6} distance={15} decay={1.9} />
      <pointLight position={[2.0, 2.4, 4.7]} color="#ffd9a0" intensity={13} distance={12} decay={1.8} />

      <ParticleField
        count={Math.round(120 * quality.particleScale) + 20}
        area={[8, 2.2, 5.5]}
        center={[-0.5, 1.5, 1]}
        colorA="#e8c48a"
        colorB="#8c5a2b"
        size={0.28}
        life={7}
        rise={0.05}
        spread={0.14}
        curl={0.28}
        getIntensity={() => 0.28 + 0.42 * bell(state.current.local)}
      />
      <ParticleField
        count={Math.round(55 * quality.particleScale) + 10}
        area={[3.2, 0.4, 2.2]}
        center={[-0.85, 0.35, 1.2]}
        colorA="#c99e63"
        colorB="#6b4423"
        size={0.42}
        life={2.8}
        spread={0.2}
        gravity={-0.7}
        shape="shard"
        blending={THREE.NormalBlending}
        getIntensity={() => 0.26 * smooth((state.current.local - 0.18) / 0.38)}
      />
    </group>
  );
}
