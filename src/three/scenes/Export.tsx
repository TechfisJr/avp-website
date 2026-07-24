"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { SCENE_Z } from "@/lib/scenes";
import { PALETTE } from "@/lib/theme";
import { steelDarkMat, paintMat, bagMat, floorMat } from "../materials/kit";
import { useActiveGroup } from "../useActive";
import { flags } from "@/lib/scrollStore";

const Z = SCENE_Z.export;

const waterMat = new THREE.MeshStandardMaterial({
  color: "#8bb6c4",
  roughness: 0.25,
  metalness: 0.2,
  envMapIntensity: 1.2,
});
const scanMat = new THREE.MeshStandardMaterial({
  color: PALETTE.green,
  emissive: new THREE.Color(PALETTE.greenLight),
  emissiveIntensity: 1.4,
  roughness: 0.4,
});
const containerColors = ["#c96a4b", "#4a8a5a", "#3f6f9c", "#d8a94b"];

/** A jumbo bag of pellets. */
function Bag({ pos, s = 1 }: { pos: [number, number, number]; s?: number }) {
  return (
    <RoundedBox
      args={[2 * s, 2.4 * s, 2 * s]}
      radius={0.28 * s}
      smoothness={2}
      position={pos}
      material={bagMat}
      castShadow
      receiveShadow
    />
  );
}

/** Scene 6 — QC scan gate, export bags, and the ship at port. */
export default function Export() {
  const group = useActiveGroup(0.78, 1.01);
  const scan = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!scan.current || flags.reducedMotion) return;
    // scan ring sweeps through the gate
    scan.current.position.z = Z + 2 - ((state.clock.elapsedTime * 1.4) % 6);
  });

  return (
    <group ref={group}>
      {/* dock apron */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0, Z]} receiveShadow material={floorMat}>
        <planeGeometry args={[46, 60]} />
      </mesh>
      {/* harbour water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[24, -0.4, Z]} receiveShadow material={waterMat}>
        <planeGeometry args={[60, 80]} />
      </mesh>

      {/* QC scan gate */}
      <group position={[-6, 0, Z + 2]}>
        {[-2.2, 2.2].map((x, i) => (
          <mesh key={i} position={[x, 2.4, 0]} material={paintMat} castShadow>
            <boxGeometry args={[0.5, 4.8, 0.5]} />
          </mesh>
        ))}
        <mesh position={[0, 4.9, 0]} material={paintMat} castShadow>
          <boxGeometry args={[5, 0.5, 0.5]} />
        </mesh>
        {/* moving scan ring */}
        <mesh ref={scan} position={[0, 2.3, Z]} rotation={[Math.PI / 2, 0, 0]} material={scanMat}>
          <torusGeometry args={[2.1, 0.08, 8, 32]} />
        </mesh>
      </group>

      {/* export bags on the apron */}
      <Bag pos={[-6, 1.2, Z - 3]} />
      <Bag pos={[-9, 1.2, Z - 2]} />
      <Bag pos={[-6, 1.2, Z - 6]} />
      <Bag pos={[-9, 1.2, Z - 5]} />
      <Bag pos={[-7.5, 3.5, Z - 4]} s={0.95} />

      {/* the cargo ship */}
      <group position={[26, 0, Z]}>
        {/* hull */}
        <mesh position={[0, 0.4, 0]} material={steelDarkMat} castShadow>
          <boxGeometry args={[10, 3, 30]} />
        </mesh>
        <mesh position={[0, -0.6, 0]} material={steelDarkMat}>
          <boxGeometry args={[8.6, 2, 27]} />
        </mesh>
        {/* deck house */}
        <mesh position={[0, 3.4, -11]} material={paintMat} castShadow>
          <boxGeometry args={[7, 4, 5]} />
        </mesh>
        {/* stacked containers */}
        {Array.from({ length: 30 }).map((_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3) % 5;
          const layer = Math.floor(i / 15);
          return (
            <mesh
              key={i}
              position={[-2.6 + col * 2.6, 2.6 + layer * 1.4, 6 - row * 3]}
              castShadow
            >
              <boxGeometry args={[2.4, 1.3, 2.8]} />
              <meshStandardMaterial color={containerColors[(i + layer) % 4]} roughness={0.6} metalness={0.2} />
            </mesh>
          );
        })}
      </group>

      <pointLight position={[-4, 9, Z + 8]} color={PALETTE.sky} intensity={30} distance={50} decay={1.5} />
      <pointLight position={[20, 8, Z + 6]} color={PALETTE.sun} intensity={20} distance={44} decay={1.6} />
    </group>
  );
}
