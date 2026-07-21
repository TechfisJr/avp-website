"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATIONS, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { Conveyor } from "../kit/machines";
import { M } from "../kit/industrial";
import { createMetalMaterial } from "../visual/materials";

const I = 7;
const S = STATIONS[I];
const O = new THREE.Object3D();

const BORE_COUNT = 30;
const BORE_RADIUS = 1.98;
const DIE_OUTER = 2.4;
const DIE_INNER = 1.55;
const DIE_DEPTH = 0.5;

const dieFaceMat = createMetalMaterial({ color: "#7a8088", metalness: 0.9, roughness: 0.28, envMapIntensity: 0.7 }, { scale: 14, roughVar: 0.08 });

/** S07 — the centerpiece: a true annular ring die (flat face, real bore
 *  holes) with rollers pressed against it, strands extruding from the
 *  actual bores, and the hero pellet staged small — this is where the
 *  protagonist is born, not where it blocks the machine that makes it. */
export default function Pelletizing({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const die = useRef<THREE.Group>(null);
  const rig = useRef<THREE.Group>(null);
  const strands = useRef<THREE.InstancedMesh>(null);
  const q = quality.particleScale;
  const STRANDS = BORE_COUNT;

  const dieGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, DIE_OUTER, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, DIE_INNER, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: DIE_DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
      curveSegments: 64,
    });
    geo.center();
    return geo;
  }, []);

  useLayoutEffect(() => {
    if (!strands.current) return;
    strands.current.count = STRANDS;
  }, []);

  useFrame((stateR, delta) => {
    if (!state.current.active) return;
    const b = bell(state.current.local);
    if (die.current) die.current.rotation.z += delta * (0.3 + 1.4 * b);
    // subtle macro push — the die drifts toward camera and settles as the
    // scene holds, standing in for a dedicated camera dolly on this station
    if (rig.current) {
      const push = smooth(Math.min(1, state.current.local / 0.5));
      rig.current.position.z = 1.5 - push * 1.5;
      rig.current.scale.setScalar(0.92 + push * 0.14);
    }
    // strands pulse outward from the die bores
    if (strands.current) {
      const e = stateR.clock.elapsedTime;
      const grow = smooth((state.current.local - 0.15) / 0.3);
      for (let i = 0; i < STRANDS; i++) {
        const a = (i / STRANDS) * Math.PI * 2 + (die.current?.rotation.z ?? 0);
        const len = grow * (0.3 + 0.22 * Math.sin(e * 3 + i * 1.7));
        O.position.set(Math.cos(a) * (BORE_RADIUS + len / 2), Math.sin(a) * (BORE_RADIUS + len / 2), DIE_DEPTH * 0.65);
        O.rotation.set(0, 0, a + Math.PI / 2);
        O.scale.set(1, Math.max(0.001, len), 1);
        O.updateMatrix();
        strands.current.setMatrixAt(i, O.matrix);
      }
      strands.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[26, 20]} />
      </mesh>

      {/* ring die assembly — macro rig group carries the push-in drift */}
      <group ref={rig} position={[0, 2.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <group ref={die}>
          <mesh geometry={dieGeometry} material={dieFaceMat} />
          {/* real inset bore holes through the die face */}
          {Array.from({ length: BORE_COUNT }, (_, i) => {
            const a = (i / BORE_COUNT) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * BORE_RADIUS, Math.sin(a) * BORE_RADIUS, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                material={M.emberGlow}
              >
                <cylinderGeometry args={[0.085, 0.085, DIE_DEPTH + 0.1, 10]} />
              </mesh>
            );
          })}
        </group>
        {/* rollers pressed against the face, clearly visible */}
        {[-0.95, 0.95].map((x) => (
          <group key={x} position={[x, 0, DIE_DEPTH / 2 + 0.42]}>
            <mesh material={M.housing}>
              <cylinderGeometry args={[0.72, 0.72, 0.7, 20]} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.36]} material={M.dark}>
              <cylinderGeometry args={[0.14, 0.14, 0.5, 10]} />
            </mesh>
          </group>
        ))}
        {/* extruding strands (radial, scale-animated) — same rotated frame as the die/bores */}
        <instancedMesh ref={strands} args={[undefined, undefined, STRANDS]} material={M.pellet} frustumCulled={false}>
          <cylinderGeometry args={[0.07, 0.07, 1, 8]} />
        </instancedMesh>
        {/* ember glow from within the bores */}
        <pointLight position={[0, 0, 0.4]} color="#e85d26" intensity={26} distance={9} decay={2} />
      </group>
      <pointLight position={[0, 2.6, 3.2]} color="#e85d26" intensity={30} distance={13} decay={1.8} />
      <pointLight position={[-3.5, 3.5, 1]} color="#f2c98a" intensity={10} distance={11} decay={1.9} />

      {/* born pellets raining to the conveyor */}
      <ParticleField
        count={Math.round(500 * q) + 80}
        area={[2.3, 0.3, 2.3]}
        center={[0, 2.3, 0]}
        colorA="#c98a45"
        colorB="#7a4a20"
        size={1.15}
        life={1.5}
        gravity={-4.5}
        spread={0.45}
        blending={THREE.NormalBlending}
        shape="shard"
        getIntensity={() => smooth((state.current.local - 0.2) / 0.25) * bell(state.current.local + 0.08)}
      />
      {/* heat haze glow motes around the die */}
      <ParticleField
        count={Math.round(120 * q) + 20}
        area={[2.6, 1.4, 2.6]}
        center={[0, 2.8, 0]}
        colorA="#ff9c50"
        colorB="#e85d26"
        size={1.6}
        life={2.4}
        rise={0.5}
        spread={0.3}
        curl={0.7}
        getIntensity={() => 0.4 * bell(state.current.local)}
      />

      <Conveyor position={[1.5, 0, 0]} rotation={[0, 0, 0]} length={9} getRun={() => bell(state.current.local)} />
    </group>
  );
}
