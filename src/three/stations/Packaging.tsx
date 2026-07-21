"use client";

import * as THREE from "three";
import { STATIONS, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { JumboBag, Conveyor } from "../kit/machines";
import { M } from "../kit/industrial";

const I = 10;
const S = STATIONS[I];

/** S10 — packaging: a jumbo bag fills under the spout in a pellet waterfall. */
export default function Packaging({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[24, 20]} />
      </mesh>

      {/* filling gantry + spout */}
      <group position={[0, 0, 0]}>
        {[-1.6, 1.6].map((x) => (
          <mesh key={x} position={[x, 2.6, 0]} material={M.housing}>
            <boxGeometry args={[0.24, 5.2, 0.24]} />
          </mesh>
        ))}
        {/* cross-bracing between the gantry posts */}
        {[1.4, 3.4].map((y) => (
          <mesh key={y} position={[0, y, 0]} material={M.dark}>
            <boxGeometry args={[3.35, 0.08, 0.08]} />
          </mesh>
        ))}
        <mesh position={[0, 5.1, 0]} material={M.housing}>
          <boxGeometry args={[3.8, 0.4, 0.8]} />
        </mesh>
        <mesh position={[0, 4.3, 0]} material={M.steel}>
          <cylinderGeometry args={[0.5, 0.24, 1.2, 10]} />
        </mesh>
      </group>

      {/* weigh-scale plinth under the filling bag */}
      <mesh position={[0, 0.05, 0]} material={M.steel}>
        <cylinderGeometry args={[0.85, 0.85, 0.1, 24]} />
      </mesh>

      {/* the bag being filled — belly + loops animate independently, so the
          loops never squash as the bag fills */}
      <group position={[0, 0.1, 0]}>
        <JumboBag getFill={() => 0.35 + 0.65 * smooth((state.current.local - 0.15) / 0.5)} />
      </group>

      {/* pellet waterfall into the bag */}
      <ParticleField
        count={Math.round(360 * quality.particleScale) + 60}
        area={[0.18, 0.25, 0.18]}
        center={[0, 3.7, 0]}
        colorA="#c98a45"
        colorB="#7a4a20"
        size={1.05}
        life={0.9}
        gravity={-7}
        spread={0.35}
        blending={THREE.NormalBlending}
        shape="shard"
        getIntensity={() => bell(state.current.local)}
      />
      {/* dust puff at the bag mouth */}
      <ParticleField
        count={Math.round(90 * quality.particleScale) + 15}
        area={[0.5, 0.2, 0.5]}
        center={[0, 1.6, 0]}
        colorA="#d8c9a8"
        colorB="#6f5636"
        size={1.6}
        life={2}
        rise={0.3}
        spread={0.5}
        curl={0.4}
        getIntensity={() => 0.3 * bell(state.current.local)}
      />

      {/* finished bags rolling off */}
      <Conveyor position={[4.5, 0, 2.5]} rotation={[0, 0.5, 0]} length={7} getRun={() => 0.5 * bell(state.current.local)} />
      {[0, 1, 2].map((k) => (
        <JumboBag key={k} position={[3.2 + k * 2.1, 1.05, 2 + k * 1.1]} rotation={[0, 0.5, 0]} />
      ))}
    </group>
  );
}
