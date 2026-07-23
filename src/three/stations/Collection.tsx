"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scroll } from "@/lib/scrollStore";
import { STATIONS, W, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { Logs, Shavings } from "../kit/biomass";
import { Truck } from "../kit/machines";
import { isVisibleInTree } from "../kit/visibility";
import { createConcreteMaterial } from "../visual/materials";

const I = 2;
const S = STATIONS[I];
const truckStart = new THREE.Vector3(5.8, 0, 5.2);
const truckStop = new THREE.Vector3(-1.8, 0, -10.4);
const truckHeadingY = Math.atan2(
  -(truckStop.z - truckStart.z),
  truckStop.x - truckStart.x
);

const groundMat = createConcreteMaterial({ color: "#151109", roughness: 1 });

/** S02 — factory receiving: loaded wood arrives and stages before chipping. */
export default function Collection({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const truck = useRef<THREE.Group>(null);

  useFrame((frame) => {
    const g = truck.current;
    if (!g) return;
    if (!isVisibleInTree(g)) return;

    const preLocal = smooth((scroll.t - (I - 1) * W) / W);
    const local = state.current.local > 0 ? state.current.local : preLocal;
    const arrive = smooth((local - 0.02) / 0.6);
    const settle = smooth((local - 0.66) / 0.16);
    g.position.lerpVectors(truckStart, truckStop, arrive);
    g.position.y += Math.sin(arrive * Math.PI) * 0.035 + Math.sin(frame.clock.elapsedTime * 10) * 0.01 * (1 - settle);
    g.rotation.set(0, truckHeadingY, Math.sin(frame.clock.elapsedTime * 8) * 0.01 * (1 - settle));
  });

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
      <group ref={truck} scale={0.74}>
        <Truck cargoLoad={1} />
        <pointLight position={[3.15, 1.05, 0]} color="#ffd9a0" intensity={6} distance={10} decay={2} />
      </group>

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
        getIntensity={() => 0.32 + 0.5 * bell(state.current.local) + 0.22 * (1 - smooth((state.current.local - 0.3) / 0.18))}
      />
    </group>
  );
}
