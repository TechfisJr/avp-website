"use client";

import * as THREE from "three";
import { STATIONS, bell } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { M } from "../kit/industrial";
import { InclinedFeedBelt, MaterialPile, MillBank } from "./ProcessMachines";

const I = 8;
const S = STATIONS[I];

/** S08 - Dried grinding unit.
 * A second, dry grinding bank. It intentionally resembles S04 but is more
 * enclosed/cleaner, making the second grinding step readable without inventing
 * a new fantasy machine. */
export default function Cooling({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const q = quality.particleScale;

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[22, 18]} />
      </mesh>

      <group position={[0, 0, -0.72]} scale={[0.92, 0.92, 0.92]}>
        <MillBank count={3} active showSign={false} />
      </group>

      <group position={[-4.8, 1.0, 1.25]} rotation={[0, 0, 0.25]}>
        <InclinedFeedBelt length={5.3} />
      </group>
      <MaterialPile kind="chips" position={[4.2, 0.34, 0.28]} />

      <ParticleField
        count={Math.round(55 * q) + 10}
        area={[0.65, 0.18, 0.22]}
        center={[3.9, 1.05, 0.25]}
        colorA="#dcc69a"
        colorB="#9c7950"
        size={0.38}
        life={1.8}
        dir={[0.8, 0.15, 0]}
        gravity={-1.1}
        spread={0.2}
        shape="speck"
        getIntensity={() => 0.35 * bell(state.current.local)}
      />

      <pointLight position={[-2.4, 5.2, 2.0]} color="#f2d6ac" intensity={9} distance={13} decay={1.8} />
      <pointLight position={[3.4, 3.0, 2.2]} color="#7fb4c7" intensity={4} distance={9} decay={2} />
    </group>
  );
}
