"use client";

import * as THREE from "three";
import { STATIONS, bell } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { Conveyor, JumboBag } from "../kit/machines";
import { useStation } from "../useStation";
import { M } from "../kit/industrial";
import { FinishedBagStack, GreenSupportFrame, SafetySign, creamMat } from "./ProcessMachines";

const I = 10;
const S = STATIONS[I];

/** S10 - Finished product unit.
 * Finished pellets are collected into bulk bags / product storage. This is the
 * endpoint of the core process, not a thermal-upgrading chamber. */
export default function Packaging({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const q = quality.particleScale;

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[25, 18]} />
      </mesh>

      <GreenSupportFrame width={8.0} depth={3.2} height={3.7} bays={3} position={[-1.6, 0, -0.6]} />
      <SafetySign width={5.6} position={[-1.6, 4.45, 0.86]} />

      <Conveyor position={[-2.8, 1.2, 0.75]} length={6.8} width={0.82} height={0.25} speed={0.75} getRun={() => bell(state.current.local)} />
      {[-3.7, -1.7, 0.3].map((x, i) => (
        <group key={x} position={[x, 0, 0.72]}>
          <mesh position={[0, 2.62, 0]} material={creamMat}>
            <boxGeometry args={[1.2, 0.9, 0.9]} />
          </mesh>
          <mesh position={[0, 1.9, 0]} material={creamMat}>
            <cylinderGeometry args={[0.18, 0.3, 0.8, 10]} />
          </mesh>
          <JumboBag position={[0, 0.02, 0]} fill={0.74 + i * 0.08} />
        </group>
      ))}

      <FinishedBagStack position={[3.0, 0, -1.1]} scale={[1.05, 1.05, 1.05]} />
      <FinishedBagStack position={[4.55, 0, 0.7]} scale={[0.9, 0.9, 0.9]} />

      <mesh position={[5.9, 0.28, -1.2]} material={M.dark}>
        <boxGeometry args={[1.4, 0.22, 0.9]} />
      </mesh>
      <mesh position={[6.25, 0.84, -1.2]} material={M.safetyYellow}>
        <boxGeometry args={[0.72, 0.72, 0.78]} />
      </mesh>
      <mesh position={[5.65, 0.74, -1.2]} material={M.dark}>
        <boxGeometry args={[0.72, 0.5, 0.72]} />
      </mesh>
      {[-0.42, 0.42].map((z) => (
        <mesh key={z} position={[5.75, 0.22, -1.2 + z]} rotation={[Math.PI / 2, 0, 0]} material={M.dark}>
          <cylinderGeometry args={[0.22, 0.22, 0.14, 12]} />
        </mesh>
      ))}

      <ParticleField
        count={Math.round(50 * q) + 10}
        area={[4.2, 0.2, 0.35]}
        center={[-1.8, 1.52, 0.72]}
        colorA="#c8964c"
        colorB="#76502d"
        size={0.45}
        life={1.8}
        gravity={-1.2}
        spread={0.15}
        shape="speck"
        getIntensity={() => 0.3 * bell(state.current.local)}
      />

      <pointLight position={[-2.4, 5.3, 2.0]} color="#f0d7b0" intensity={10} distance={14} decay={1.8} />
      <pointLight position={[4.6, 3.2, 1.4]} color="#e8a33d" intensity={5} distance={10} decay={2} />
    </group>
  );
}
