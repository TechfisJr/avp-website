"use client";

import * as THREE from "three";
import { STATIONS, bell } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { M } from "../kit/industrial";
import { InclinedFeedBelt, MaterialPile, MillBank } from "./ProcessMachines";

const I = 4;
const S = STATIONS[I];

/** S04 - Wet grinding unit.
 * Real reference: repeated cream hammer-mill bodies on green steel frames,
 * square hoppers above, horizontal feed manifold and dark motors below. */
export default function Grinding({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const q = quality.particleScale;

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[22, 18]} />
      </mesh>

      <group position={[0, 0, -0.8]}>
        <MillBank count={4} active showSign />
      </group>

      <group position={[-5.7, 1.1, 1.35]} rotation={[0, 0, 0.18]}>
        <InclinedFeedBelt length={5.8} />
      </group>

      <MaterialPile kind="chips" position={[-6.9, 0.22, 1.0]} />
      <mesh position={[4.95, 0.22, 0.25]} material={M.housing}>
        <boxGeometry args={[1.6, 0.3, 1.0]} />
      </mesh>
      <MaterialPile kind="chips" position={[5.1, 0.48, 0.28]} />

      <ParticleField
        count={Math.round(70 * q) + 12}
        area={[0.8, 0.2, 0.25]}
        center={[4.55, 1.0, 0.25]}
        colorA="#c89b62"
        colorB="#8c5a2b"
        size={0.65}
        life={1.8}
        dir={[0.9, 0.25, 0]}
        gravity={-1.4}
        spread={0.26}
        shape="shard"
        getIntensity={() => 0.42 * bell(state.current.local)}
      />

      <pointLight position={[-2.8, 5.8, 2.0]} color="#f1d5ac" intensity={10} distance={13} decay={1.8} />
      <pointLight position={[3.8, 3.2, 2.5]} color="#e8a33d" intensity={7} distance={10} decay={1.9} />
    </group>
  );
}
