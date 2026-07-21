"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATIONS, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { ScreenDeck, Hopper } from "../kit/machines";
import { Chips } from "../kit/biomass";
import { M } from "../kit/industrial";

const I = 3;
const S = STATIONS[I];
const O = new THREE.Object3D();

const stoneMat = new THREE.MeshStandardMaterial({ color: "#3a3a3a", roughness: 0.9, metalness: 0.05 });

const STONE_COUNT = 9;
const stoneSeeds = Array.from({ length: STONE_COUNT }, () => ({
  x0: (Math.random() - 0.5) * 1.5,
  z: (Math.random() - 0.5) * 0.8,
  delay: Math.random() * 0.6,
  s: 0.06 + Math.random() * 0.05,
}));

/** S03 — vibrating screen: feed chute, clean chip rain falling through the
 *  deck, rejected contaminants sliding off the high end — the separation
 *  made visually legible instead of one undifferentiated particle curtain. */
export default function Screening({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const q = quality.particleScale;
  const stones = useRef<THREE.InstancedMesh>(null);
  const fixtures = useRef<THREE.MeshStandardMaterial[]>([]);

  useLayoutEffect(() => {
    if (!stones.current) return;
    for (let i = 0; i < STONE_COUNT; i++) {
      O.position.set(0, 1.7, 0);
      O.scale.setScalar(stoneSeeds[i].s);
      O.updateMatrix();
      stones.current.setMatrixAt(i, O.matrix);
    }
    stones.current.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((stateR) => {
    if (!state.current.active) return;
    const b = bell(state.current.local);

    // reject cycle: stones ride the vibrating deck, then slide off the high
    // (camera-left) edge and drop — repeats every ~3.4s while the scene holds
    const cycle = 3.4;
    if (stones.current) {
      const shake = 0.02 * b;
      for (let i = 0; i < STONE_COUNT; i++) {
        const seed = stoneSeeds[i];
        const t = ((stateR.clock.elapsedTime + seed.delay) % cycle) / cycle;
        const slide = smooth(Math.max(0, (t - 0.35) / 0.4));
        const fall = smooth(Math.max(0, (t - 0.75) / 0.25));
        O.position.set(
          seed.x0 - slide * 2.6,
          1.68 + Math.sin(stateR.clock.elapsedTime * 30 + i) * shake - fall * fall * 5,
          seed.z + slide * 0.4
        );
        O.rotation.set(t * 6 + i, t * 4, 0);
        O.scale.setScalar(seed.s * (1 - fall));
        O.updateMatrix();
        stones.current.setMatrixAt(i, O.matrix);
      }
      stones.current.instanceMatrix.needsUpdate = true;
    }

    // overhead fixtures sequence on with arrival, like the warehouse strips
    const on = 1.2 * smooth((state.current.local - 0.05) / 0.3);
    fixtures.current.forEach((m) => {
      if (m) m.emissiveIntensity = on;
    });
  });

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[26, 20]} />
      </mesh>

      {/* back wall closes the hall so it reads as an interior, not a void */}
      <mesh position={[0, 5, -9]} material={M.housing}>
        <boxGeometry args={[24, 10, 0.4]} />
      </mesh>

      {/* hall columns */}
      {[-7, 7].flatMap((x) =>
        [-6, 4].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 4, z]} material={M.housing}>
            <boxGeometry args={[0.4, 8, 0.4]} />
          </mesh>
        ))
      )}

      {/* overhead light fixtures — real practicals, not just ambient */}
      {[-4, 0, 4].map((x, i) => (
        <group key={x} position={[x, 7.6, -2]}>
          <mesh material={M.dark}>
            <boxGeometry args={[1.6, 0.14, 0.5]} />
          </mesh>
          <mesh position={[0, -0.09, 0]}>
            <boxGeometry args={[1.4, 0.04, 0.4]} />
            <meshStandardMaterial
              ref={(m: THREE.MeshStandardMaterial | null) => {
                if (m) fixtures.current[i] = m;
              }}
              color="#0d0e10"
              emissive="#e4d6b4"
              emissiveIntensity={0}
            />
          </mesh>
          <pointLight position={[0, -0.3, 0]} color="#e4d6b4" intensity={10} distance={11} decay={1.9} />
        </group>
      ))}

      {/* feed chute — gives the chip rain a visible source */}
      <Hopper position={[-1.2, 6.3, 0]} scale={0.55} />

      <ScreenDeck position={[0, 0, 0]} getVibe={() => bell(state.current.local)} />
      <Chips count={quality.tier === 0 ? 70 : 150} position={[0, 1.45, 0]} area={[1.7, 0.15, 1]} rotation={[0, 0, -0.14]} />

      {/* rejected contaminants: dark, angular, slide off the high edge */}
      <instancedMesh ref={stones} args={[undefined, undefined, STONE_COUNT]} material={stoneMat}>
        <dodecahedronGeometry args={[1, 0]} />
      </instancedMesh>

      {/* contrast/readability key light aimed down at the separation zone */}
      <pointLight position={[0, 4.5, 2.5]} color="#f2e4bf" intensity={22} distance={12} decay={1.8} />

      {/* chip rain onto the deck, sourced from the chute */}
      <ParticleField
        count={Math.round(260 * q) + 40}
        area={[1.1, 0.3, 0.8]}
        center={[-1.2, 5.6, 0]}
        colorA="#c99e63"
        colorB="#8c5a2b"
        size={1.5}
        life={1.5}
        gravity={-5}
        spread={0.4}
        blending={THREE.NormalBlending}
        shape="shard"
        getIntensity={() => bell(state.current.local)}
      />
      {/* clean fines falling through the mesh */}
      <ParticleField
        count={Math.round(200 * q) + 30}
        area={[1.8, 0.2, 1]}
        center={[0.4, 1.1, 0]}
        colorA="#6f5636"
        colorB="#3d2f1c"
        size={0.55}
        life={1.4}
        gravity={-3.2}
        spread={0.3}
        blending={THREE.NormalBlending}
        shape="speck"
        getIntensity={() => 0.8 * bell(state.current.local)}
      />
      {/* fine dust kicked up by the vibration — backlit for a readable curtain */}
      <ParticleField
        count={Math.round(90 * q) + 15}
        area={[2.2, 0.3, 1.3]}
        center={[0, 1.9, 0]}
        colorA="#e8d9b0"
        colorB="#7a6440"
        size={0.9}
        life={2.4}
        rise={0.25}
        spread={0.3}
        curl={0.5}
        getIntensity={() => 0.35 * bell(state.current.local)}
      />
    </group>
  );
}
