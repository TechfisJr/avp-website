"use client";

import * as THREE from "three";
import { STATIONS, bell } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { Logs, Shavings } from "../kit/biomass";
import { Truck } from "../kit/machines";
import { createConcreteMaterial } from "../visual/materials";

const I = 2;
const S = STATIONS[I];

const groundMat = createConcreteMaterial({ color: "#151109", roughness: 1 });

/** S02 — factory receiving: loaded wood arrives and stages before chipping. */
export default function Collection({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={groundMat}>
        <circleGeometry args={[30, 24]} />
      </mesh>

      <Logs
        count={quality.tier === 0 ? 14 : 20}
        position={[-4.15, 0, -1.75]}
        scale={0.72}
        getAssemble={() => 1}
      />
      <Shavings count={quality.tier === 0 ? 4 : 8} position={[-2.2, 0, 1.85]} />
      <Truck
        position={[3.65, 0, 2.55]}
        rotation={[0, -0.68, 0]}
        scale={0.74}
        cargoLoad={1}
      />

      {/* motivated headlight practical raking across the pile */}
      <pointLight position={[8.3, 1.3, 0.7]} color="#ffd9a0" intensity={20} distance={15} decay={1.7} />
      {/* cool factory-yard rim behind the pile */}
      <pointLight position={[-5, 3.5, -6]} color="#8fb4cf" intensity={5} distance={16} decay={1.9} />
      {/* near fill — guarantees the pile reads regardless of viewport crop */}
      <pointLight position={[-1, 3, 4]} color="#d8b98a" intensity={7} distance={13} decay={2} />

      {/* sawdust motes hanging in the headlight beams */}
      <ParticleField
        count={Math.round(220 * quality.particleScale) + 30}
        area={[8, 2.5, 6]}
        center={[2, 1.6, 1]}
        colorA="#e8c48a"
        colorB="#8c5a2b"
        size={0.4}
        life={8}
        rise={0.06}
        spread={0.18}
        curl={0.35}
        getIntensity={() => 0.3 + 0.55 * bell(state.current.local)}
      />
    </group>
  );
}
