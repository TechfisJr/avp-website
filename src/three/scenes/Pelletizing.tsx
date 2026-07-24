"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SCENE_Z } from "@/lib/scenes";
import { PALETTE } from "@/lib/theme";
import { metalMat, steelDarkMat, paintMat, accentMat, floorMat } from "../materials/kit";
import { useActiveGroup } from "../useActive";
import { flags, scroll } from "@/lib/scrollStore";

const Z = SCENE_Z.pelletizing;
const O = new THREE.Object3D();

const STREAM = 220;
const pelletGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 8);
const freshPelletMat = new THREE.MeshStandardMaterial({
  color: PALETTE.pelletLight,
  roughness: 0.5,
  metalness: 0,
  emissive: new THREE.Color(PALETTE.pellet),
  emissiveIntensity: 0.25,
});

/** Scene 5 — the high-pressure pellet mill, extruding a live stream. */
export default function Pelletizing() {
  const group = useActiveGroup(0.67, 0.81);
  const stream = useRef<THREE.InstancedMesh>(null);
  const die = useRef<THREE.Mesh>(null);

  // each stream pellet: an x/z jitter column + a phase so they fall staggered
  const drops = useMemo(
    () =>
      Array.from({ length: STREAM }, () => ({
        x: (Math.random() - 0.5) * 1.6,
        z: (Math.random() - 0.5) * 1.2,
        phase: Math.random(),
        speed: 0.5 + Math.random() * 0.4,
        rx: Math.random() * Math.PI,
        rz: Math.random() * Math.PI,
        s: 0.09 + Math.random() * 0.05,
      })),
    []
  );

  useLayoutEffect(() => {
    // give instance colours a warm spread once
    const m = stream.current;
    if (!m) return;
    const c = new THREE.Color();
    for (let i = 0; i < STREAM; i++) {
      c.setHSL(0.09, 0.5, 0.5 + Math.random() * 0.12);
      m.setColorAt(i, c);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    if (die.current && !flags.reducedMotion) die.current.rotation.z += delta * 1.2;
    const m = stream.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    // freeze the fall in reduced motion but still place pellets
    const flow = flags.reducedMotion ? 0.3 : (t * 0.25) % 1;
    for (let i = 0; i < STREAM; i++) {
      const d = drops[i];
      const p = (d.phase + flow * d.speed) % 1; // 0 at die -> 1 at bin
      const y = 3.4 - p * 3.2; // fall from die to bin
      O.position.set(2.6 + d.x + p * 0.4, y, Z + d.z);
      O.rotation.set(d.rx + p * 6, 0, d.rz + p * 4);
      O.scale.setScalar(d.s);
      O.updateMatrix();
      m.setMatrixAt(i, O.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    // keep the emissive alive only while the scene is active
    freshPelletMat.emissiveIntensity = scroll.offset > 0.67 && scroll.offset < 0.81 ? 0.25 : 0;
  });

  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, Z]} receiveShadow material={floorMat}>
        <planeGeometry args={[60, 55]} />
      </mesh>

      {/* mill housing */}
      <mesh position={[-1, 2.4, Z]} material={paintMat} castShadow receiveShadow>
        <boxGeometry args={[5, 4.4, 3.4]} />
      </mesh>
      {/* accent frame band */}
      <mesh position={[-1, 0.5, Z]} material={accentMat} castShadow>
        <boxGeometry args={[5.2, 0.6, 3.6]} />
      </mesh>

      {/* the die face + extrusion head, pellets emerge here */}
      <group position={[1.9, 2.9, Z]}>
        <mesh ref={die} rotation={[0, 0, 0]} material={metalMat} castShadow>
          <cylinderGeometry args={[1.5, 1.5, 0.7, 20]} />
        </mesh>
        <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={steelDarkMat}>
          <cylinderGeometry args={[1.1, 1.1, 0.9, 20]} />
        </mesh>
      </group>

      {/* motor */}
      <mesh position={[-4, 2, Z]} rotation={[0, 0, Math.PI / 2]} material={steelDarkMat} castShadow>
        <cylinderGeometry args={[1.1, 1.1, 2.4, 16]} />
      </mesh>

      {/* falling pellet stream */}
      <instancedMesh ref={stream} args={[pelletGeo, freshPelletMat, STREAM]} castShadow frustumCulled={false} />

      {/* collection bin */}
      <mesh position={[3, 0.7, Z]} material={steelDarkMat} castShadow receiveShadow>
        <boxGeometry args={[3, 1.4, 3]} />
      </mesh>

      <pointLight position={[3, 4, Z + 5]} color={PALETTE.sun} intensity={22} distance={26} decay={1.7} />
      <pointLight position={[-2, 7, Z + 6]} color={PALETTE.sky} intensity={20} distance={34} decay={1.6} />
    </group>
  );
}
