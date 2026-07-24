"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SCENE_Z } from "@/lib/scenes";
import { PALETTE } from "@/lib/theme";
import { metalMat, steelDarkMat, paintMat, accentMat, floorMat } from "../materials/kit";
import { useActiveGroup } from "../useActive";
import { flags } from "@/lib/scrollStore";
import Puffs from "../fx/Puffs";

const Z = SCENE_Z.drying;

/** Scene 4 — the rotary drum dryer + cleaning line. */
export default function Drying() {
  const group = useActiveGroup(0.56, 0.70);
  const drum = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!flags.reducedMotion && drum.current) drum.current.rotation.x += delta * 0.6;
  });

  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, Z]} receiveShadow material={floorMat}>
        <planeGeometry args={[70, 60]} />
      </mesh>

      {/* the inclined rotary drum */}
      <group position={[0, 3.6, Z]} rotation={[0, 0, 0.05]}>
        <mesh ref={drum} rotation={[0, 0, Math.PI / 2]} material={metalMat} castShadow receiveShadow>
          <cylinderGeometry args={[2.2, 2.2, 15, 24, 1, true]} />
        </mesh>
        {/* drive bands */}
        {[-5, 0, 5].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={accentMat} castShadow>
            <cylinderGeometry args={[2.32, 2.32, 0.5, 24]} />
          </mesh>
        ))}
        {/* end caps */}
        <mesh position={[7.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={steelDarkMat}>
          <cylinderGeometry args={[2.25, 1.6, 1.2, 24]} />
        </mesh>
        <mesh position={[-7.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={steelDarkMat}>
          <cylinderGeometry args={[1.6, 2.25, 1.2, 24]} />
        </mesh>
      </group>

      {/* support cradles */}
      {[-5, 5].map((x, i) => (
        <group key={i} position={[x, 0, Z]}>
          <mesh position={[0, 1, 1.9]} rotation={[0, 0, 0.35]} material={steelDarkMat} castShadow>
            <boxGeometry args={[0.4, 3, 0.4]} />
          </mesh>
          <mesh position={[0, 1, -1.9]} rotation={[0, 0, -0.35]} material={steelDarkMat} castShadow>
            <boxGeometry args={[0.4, 3, 0.4]} />
          </mesh>
        </group>
      ))}

      {/* intake hopper (high end) */}
      <mesh position={[-8, 6, Z]} material={paintMat} castShadow>
        <cylinderGeometry args={[2.2, 0.8, 3, 4]} />
      </mesh>

      {/* output chute (low end) */}
      <mesh position={[8.4, 2.4, Z]} rotation={[0, 0, -0.7]} material={paintMat} castShadow>
        <boxGeometry args={[3, 1.6, 2.4]} />
      </mesh>

      {/* rising steam from the drum + output — fine, wispy, not cloud-blobs */}
      <Puffs count={110} center={[0, 5.4, Z]} area={[7, 5, 1.6]} color="#eef1ef" rise={1.6} size={1.2} opacity={0.16} />
      <Puffs count={50} center={[8.4, 3.6, Z]} area={[1.4, 4, 1.2]} color="#f2f4f0" rise={1.9} size={1.0} opacity={0.2} />

      <pointLight position={[0, 9, Z + 8]} color={PALETTE.sky} intensity={26} distance={40} decay={1.6} />
      <pointLight position={[8, 4, Z + 4]} color={PALETTE.sun} intensity={16} distance={24} decay={1.8} />
    </group>
  );
}
