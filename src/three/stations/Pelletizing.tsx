"use client";

import * as THREE from "three";
import { STATIONS, bell } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { M } from "../kit/industrial";
import { RecoveryScreenLine, SafetySign, creamMat } from "./ProcessMachines";

const I = 7;
const S = STATIONS[I];

/** S07 - Recovery unit.
 * Simplified from the real bagging/separation line: repeated enclosed recovery
 * boxes, long conveyor and jumbo bags under the discharge points. */
export default function Pelletizing({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const q = quality.particleScale;

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[24, 18]} />
      </mesh>

      <RecoveryScreenLine position={[0, 0, -0.45]} bagCount={4} />
      <SafetySign width={6.0} position={[0, 4.15, 1.35]} />

      <mesh position={[5.8, 2.15, -0.4]} material={creamMat}>
        <boxGeometry args={[1.1, 1.0, 1.0]} />
      </mesh>
      <mesh position={[6.45, 2.15, -0.4]} rotation={[0, 0, Math.PI / 2]} material={M.dark}>
        <cylinderGeometry args={[0.28, 0.28, 0.8, 12]} />
      </mesh>

      <ParticleField
        count={Math.round(65 * q) + 12}
        area={[7.5, 0.2, 0.38]}
        center={[0, 1.35, 0.3]}
        colorA="#d8c7a0"
        colorB="#8b7657"
        size={0.42}
        life={2.0}
        gravity={-1.3}
        spread={0.18}
        shape="speck"
        blending={THREE.NormalBlending}
        getIntensity={() => 0.28 * bell(state.current.local)}
      />

      <pointLight position={[-3.4, 5.2, 2.2]} color="#f1d6af" intensity={10} distance={14} decay={1.8} />
      <pointLight position={[4.6, 3.0, 1.8]} color="#e8a33d" intensity={5} distance={10} decay={2} />
    </group>
  );
}
