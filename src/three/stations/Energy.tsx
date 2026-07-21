"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATIONS, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { Conveyor } from "../kit/machines";
import { M } from "../kit/industrial";

const I = 13;
const S = STATIONS[I];

const coreMat = new THREE.MeshStandardMaterial({
  color: "#200a02",
  emissive: "#ff6a1f",
  emissiveIntensity: 2,
});

/** S13 — boiler house: the furnace eye breathes, pellets feed the fire,
 *  embers rise, a clean plume leaves the stack. */
export default function Energy({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const fire = useRef<THREE.PointLight>(null);
  const q = quality.particleScale;

  useFrame((stateR) => {
    if (!state.current.active) return;
    const b = bell(state.current.local);
    const e = stateR.clock.elapsedTime;
    const breathe = 0.8 + 0.2 * Math.sin(e * 1.7) + 0.06 * Math.sin(e * 7.3);
    coreMat.emissiveIntensity = (0.6 + 2.6 * b) * breathe;
    if (fire.current) fire.current.intensity = 70 * b * breathe;
  });

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[32, 24]} />
      </mesh>

      {/* boiler mass */}
      <mesh position={[0, 5, -3]} material={M.housing}>
        <boxGeometry args={[10, 10, 7]} />
      </mesh>
      <mesh position={[-2.5, 4, 0.52]} material={M.dark}>
        <boxGeometry args={[4, 6.5, 0.3]} />
      </mesh>
      {/* furnace eye */}
      <mesh position={[2, 3.5, 0.55]} material={M.steel}>
        <cylinderGeometry args={[1.9, 1.9, 0.5, 24]} />
      </mesh>
      <mesh position={[2, 3.5, 0.62]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
        <torusGeometry args={[1.9, 0.22, 10, 30]} />
      </mesh>
      <mesh position={[2, 3.5, 0.75]} rotation={[0, 0, 0]} material={coreMat}>
        <circleGeometry args={[1.7, 24]} />
      </mesh>
      {/* stack */}
      <mesh position={[-3.5, 11, -4]} material={M.steel}>
        <cylinderGeometry args={[0.9, 1.2, 12, 14]} />
      </mesh>
      {/* pipe rack */}
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[5.6, 2.2 + k * 0.8, 1]} rotation={[0, 0, Math.PI / 2]} material={M.dark}>
          <cylinderGeometry args={[0.18, 0.18, 4.2, 8]} />
        </mesh>
      ))}

      {/* pellet feed into the fire */}
      <Conveyor position={[6.2, 1.4, 0.5]} rotation={[0, 0, -0.18]} length={8} getRun={() => bell(state.current.local)} />
      <ParticleField
        count={Math.round(220 * q) + 40}
        area={[0.4, 0.2, 0.3]}
        center={[2.6, 3.6, 0.6]}
        colorA="#c98a45"
        colorB="#7a4a20"
        size={0.9}
        life={0.8}
        dir={[-1.2, -1.6, 0]}
        gravity={-3}
        spread={0.4}
        blending={THREE.NormalBlending}
        getIntensity={() => bell(state.current.local)}
      />
      {/* embers rising past the camera */}
      <ParticleField
        count={Math.round(300 * q) + 50}
        area={[3, 1.5, 2]}
        center={[2, 4.5, 1.5]}
        colorA="#ffb35c"
        colorB="#e8380f"
        size={0.55}
        life={3.4}
        rise={1.3}
        spread={0.5}
        curl={1.1}
        getIntensity={() => 0.85 * bell(state.current.local)}
      />
      {/* clean plume from the stack */}
      <ParticleField
        count={Math.round(200 * q) + 30}
        area={[0.8, 0.4, 0.8]}
        center={[-3.5, 17.2, -4]}
        colorA="#cdc4b5"
        colorB="#3c3a36"
        size={4}
        life={5}
        rise={1.4}
        spread={0.4}
        curl={0.9}
        getIntensity={() => 0.4 * smooth((state.current.local - 0.25) / 0.4)}
      />

      <pointLight ref={fire} position={[2, 3.5, 2.5]} color="#ff6a1f" distance={22} decay={1.8} />
    </group>
  );
}
