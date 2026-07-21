"use client";

import * as THREE from "three";
import { STATIONS, bell } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { ScreenDeck } from "../kit/machines";
import { PelletBed } from "../kit/biomass";
import { M } from "../kit/industrial";

const I = 9;
const S = STATIONS[I];

/** S09 — grading & QC: pellets over a fine screen, fines dropping away,
 *  cold laboratory rim light. The DOM scan-ring interrogates the hero pellet. */
export default function QualityControl({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[22, 20]} />
      </mesh>

      <ScreenDeck position={[0, 0, -2.5]} w={5} d={2.6} getVibe={() => 0.6 * bell(state.current.local)} />
      <PelletBed
        count={Math.round(quality.pelletCount * 0.4)}
        position={[0, 1.5, -2.5]}
        area={[2.2, 0.12, 1.1]}
        rotation={[0, 0, -0.14]}
      />

      {/* cold rim-light bars */}
      {[-3.4, 3.4].map((x) => (
        <mesh key={x} position={[x, 2.6, -1]} material={M.frostGlow}>
          <boxGeometry args={[0.08, 3.4, 0.08]} />
        </mesh>
      ))}
      <pointLight position={[0, 3.4, 1]} color="#7fb4c7" intensity={22} distance={12} decay={1.8} />

      {/* fines dropping through the screen */}
      <ParticleField
        count={Math.round(180 * quality.particleScale) + 20}
        area={[2, 0.15, 1]}
        center={[0.3, 1.1, -2.5]}
        colorA="#5f4a2e"
        colorB="#332717"
        size={0.5}
        life={1.3}
        gravity={-3}
        spread={0.25}
        blending={THREE.NormalBlending}
        getIntensity={() => 0.7 * bell(state.current.local)}
      />
    </group>
  );
}
