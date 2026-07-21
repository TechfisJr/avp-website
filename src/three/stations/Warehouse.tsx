"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATIONS, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import { useStation } from "../useStation";
import { JumboBag } from "../kit/machines";
import { M } from "../kit/industrial";

const I = 11;
const S = STATIONS[I];
const O = new THREE.Object3D();
const C = new THREE.Color();

const stripMat = new THREE.MeshStandardMaterial({
  color: "#0d0e10",
  emissive: "#c9d4dd",
  emissiveIntensity: 0,
});

const STRIP_Z = [6, 0, -6, -12];

/** Cheap instanced FIBC silhouette for the rack rows — a simplified lathe
 *  barrel (rounded base, full belly, slouched top), not a placeholder cube.
 *  Material variation (createFabricMaterial) plus per-instance tint carries
 *  the surface detail at this distance/count. */
function buildRackBagGeometry() {
  const profile = [
    new THREE.Vector2(0.03, 0),
    new THREE.Vector2(0.42, 0.05),
    new THREE.Vector2(0.56, 0.25),
    new THREE.Vector2(0.6, 0.55),
    new THREE.Vector2(0.58, 0.85),
    new THREE.Vector2(0.46, 1.06),
    new THREE.Vector2(0.26, 1.17),
    new THREE.Vector2(0.03, 1.2),
  ];
  return new THREE.LatheGeometry(profile, 12);
}

/** S11 — warehouse: one-point-perspective rack aisle, real bag silhouettes,
 *  sequenced practicals with matching light pools, closed hall volume. */
export default function Warehouse({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const frames = useRef<THREE.InstancedMesh>(null);
  const bags = useRef<THREE.InstancedMesh>(null);
  const beacon = useRef<THREE.PointLight>(null);
  const stripLights = useRef<THREE.PointLight[]>([]);

  const bagGeometry = useMemo(() => buildRackBagGeometry(), []);

  const BAYS = 6;
  const FRAME_COUNT = BAYS * 2 * 2; // per side: 2 uprights per bay
  const BAG_COUNT = BAYS * 2 * 3 * 2; // bays × sides × levels × 2 bags

  useLayoutEffect(() => {
    if (!frames.current || !bags.current) return;
    let fi = 0;
    let bi = 0;
    for (let side = -1; side <= 1; side += 2) {
      for (let bay = 0; bay < BAYS; bay++) {
        const z = 8 - bay * 4.2;
        for (const dz of [-1.9, 1.9]) {
          O.position.set(side * 4.6, 3, z + dz);
          O.rotation.set(0, 0, 0);
          O.scale.set(0.22, 6, 0.22);
          O.updateMatrix();
          frames.current.setMatrixAt(fi++, O.matrix);
        }
        for (let level = 0; level < 3; level++) {
          for (const dz of [-0.95, 0.95]) {
            O.position.set(side * 4.6, 0.4 + level * 1.9, z + dz);
            O.rotation.set(0, Math.random() * Math.PI * 2, 0);
            const s = 0.92 + Math.random() * 0.16;
            O.scale.set(s, s * (0.85 + Math.random() * 0.2), s);
            O.updateMatrix();
            bags.current.setMatrixAt(bi++, O.matrix);
            const l = 0.82 + Math.random() * 0.14;
            C.setRGB(l, l * 0.98, l * 0.94);
            bags.current.setColorAt(bi - 1, C);
          }
        }
      }
    }
    frames.current.instanceMatrix.needsUpdate = true;
    bags.current.instanceMatrix.needsUpdate = true;
    if (bags.current.instanceColor) bags.current.instanceColor.needsUpdate = true;
  }, []);

  useFrame((stateR) => {
    if (!state.current.active) return;
    const b = bell(state.current.local);
    // practicals sequence on with arrival
    const on = smooth((state.current.local - 0.05) / 0.3);
    stripMat.emissiveIntensity = 1.4 * on;
    stripLights.current.forEach((l) => {
      if (l) l.intensity = 9 * on;
    });
    if (beacon.current) {
      const e = stateR.clock.elapsedTime;
      beacon.current.intensity = 14 * b * (0.5 + 0.5 * Math.sin(e * 5));
      beacon.current.position.x = Math.sin(e * 0.7) * 3;
    }
  });

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <planeGeometry args={[26, 44]} />
      </mesh>
      {/* ceiling + far wall close the hall so it reads as an interior */}
      <mesh position={[0, 7.4, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.concrete}>
        <planeGeometry args={[26, 44]} />
      </mesh>
      <mesh position={[0, 3.7, -18]} material={M.housing}>
        <planeGeometry args={[26, 7.4]} />
      </mesh>

      {/* rack shelves */}
      {[-1, 1].flatMap((side) =>
        [0, 1, 2].map((level) => (
          <mesh key={`${side}${level}`} position={[side * 4.6, 0.35 + level * 1.9, -2.5]} material={M.steel}>
            <boxGeometry args={[2.6, 0.1, 25]} />
          </mesh>
        ))
      )}
      <instancedMesh ref={frames} args={[undefined, undefined, FRAME_COUNT]} material={M.housing}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <instancedMesh ref={bags} args={[bagGeometry, undefined, BAG_COUNT]} material={M.cloth} />

      {/* two hero bags close to camera */}
      <JumboBag position={[-1.9, 0, 6.5]} rotation={[0, 0.4, 0]} />
      <JumboBag position={[2.2, 0, 4.8]} rotation={[0, -0.2, 0]} fill={0.92} />

      {/* overhead light strips down the aisle — real housings + matching lights */}
      {STRIP_Z.map((z, i) => (
        <group key={z} position={[0, 6.4, z]}>
          <mesh material={M.dark}>
            <boxGeometry args={[0.36, 0.1, 2.8]} />
          </mesh>
          <mesh position={[0, -0.06, 0]} material={stripMat}>
            <boxGeometry args={[0.3, 0.06, 2.6]} />
          </mesh>
          <pointLight
            ref={(l) => {
              if (l) stripLights.current[i] = l;
            }}
            position={[0, -0.3, 0]}
            color="#c9d4dd"
            distance={9}
            decay={1.9}
          />
        </group>
      ))}
      <pointLight position={[0, 5.5, 0]} color="#c9d4dd" intensity={10} distance={20} decay={1.8} />
      <pointLight ref={beacon} position={[0, 1.2, 9]} color="#ff8c1a" distance={10} decay={2} />
    </group>
  );
}
