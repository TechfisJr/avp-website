"use client";

import * as THREE from "three";
import { STATIONS, bell } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { M } from "../kit/industrial";
import { CyclonePair, GreenSupportFrame, InclinedFeedBelt, creamMat } from "./ProcessMachines";

const I = 6;
const S = STATIONS[I];

/** S06 - Drying unit.
 * Based on the real plant language: tall cream cyclones, green platforms and
 * ducting in the same large hall, not an isolated decorative vessel. */
export default function Conditioning({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const q = quality.particleScale;

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[24, 18]} />
      </mesh>

      <group position={[-4.15, 0, 0.2]}>
        <GreenSupportFrame width={9.2} depth={3.4} height={5.2} bays={3} position={[0, 0, -0.35]} />
        <group position={[2.8, 0.1, -0.5]}>
          <CyclonePair />
        </group>
        <group position={[-2.55, 0.1, -0.5]}>
          <CyclonePair />
        </group>

        <mesh position={[0, 3.9, 1.05]} rotation={[Math.PI / 2, 0, Math.PI / 2]} material={creamMat}>
          <cylinderGeometry args={[0.2, 0.2, 8.2, 12]} />
        </mesh>
        <mesh position={[0, 1.3, 1.1]} rotation={[Math.PI / 2, 0, Math.PI / 2]} material={creamMat}>
          <cylinderGeometry args={[0.16, 0.16, 7.2, 12]} />
        </mesh>

        <group position={[-5.4, 1.0, 1.45]} rotation={[0, 0, 0.22]}>
          <InclinedFeedBelt length={5.8} />
        </group>
        <mesh position={[4.9, 0.62, 1.0]} material={M.housing}>
          <boxGeometry args={[1.4, 0.24, 0.9]} />
        </mesh>
      </group>

      <ParticleField
        count={Math.round(85 * q) + 16}
        area={[3.8, 0.35, 0.6]}
        center={[-4.15, 4.9, -0.3]}
        colorA="#cfc4ad"
        colorB="#5d564d"
        size={2.1}
        life={3.5}
        rise={0.55}
        spread={0.28}
        curl={0.45}
        getIntensity={() => 0.22 * bell(state.current.local)}
      />

      <pointLight position={[-4.5, 6.0, 2.2]} color="#f2d8b0" intensity={18} distance={16} decay={1.8} />
      <pointLight position={[-1.0, 3.2, 1.8]} color="#e8a33d" intensity={8} distance={12} decay={2} />
    </group>
  );
}
