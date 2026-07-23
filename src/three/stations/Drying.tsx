"use client";

import * as THREE from "three";
import { STATIONS, bell } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { M } from "../kit/industrial";
import { InclinedFeedBelt, LargeBufferSilo, MaterialPile, creamMat } from "./ProcessMachines";

const I = 5;
const S = STATIONS[I];

/** S05 - Buffer storage.
 * The buffer is a real intermediate storage volume, not a dryer. It stabilizes
 * wet-ground material before the drying/recovery line. */
export default function Drying({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const q = quality.particleScale;

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[24, 18]} />
      </mesh>

      <LargeBufferSilo position={[0, 0, -0.25]} />

      <group position={[-4.2, 1.05, 1.45]} rotation={[0, 0, 0.48]}>
        <InclinedFeedBelt length={7.2} />
      </group>
      <group position={[3.85, 0.95, 0.85]} rotation={[0, Math.PI, -0.18]}>
        <InclinedFeedBelt length={5.4} />
      </group>

      <mesh position={[0, 0.26, 1.58]} material={creamMat}>
        <boxGeometry args={[1.8, 0.22, 0.72]} />
      </mesh>
      <MaterialPile kind="chips" position={[0, 0.5, 1.56]} />

      <ParticleField
        count={Math.round(60 * q) + 10}
        area={[0.65, 0.16, 0.34]}
        center={[-1.6, 4.9, 1.25]}
        colorA="#caa069"
        colorB="#8c5a2b"
        size={0.58}
        life={1.5}
        gravity={-1.8}
        spread={0.2}
        shape="shard"
        getIntensity={() => 0.35 * bell(state.current.local)}
      />

      <pointLight position={[-2.7, 6.1, 2.0]} color="#f0d8b0" intensity={11} distance={13} decay={1.8} />
      <pointLight position={[2.9, 4.2, -0.5]} color="#e8a33d" intensity={6} distance={10} decay={2} />
    </group>
  );
}
