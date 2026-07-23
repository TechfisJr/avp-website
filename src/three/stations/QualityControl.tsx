"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";
import { STATIONS, bell } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { PelletBed } from "../kit/biomass";
import { Conveyor } from "../kit/machines";
import { useStation } from "../useStation";
import { M } from "../kit/industrial";
import { CreamHammerMill, GreenSupportFrame, SafetySign, creamMat } from "./ProcessMachines";

const I = 9;
const S = STATIONS[I];
const O = new THREE.Object3D();

function PelletStream({ count = 54 }: { count?: number }) {
  const inst = useRef<THREE.InstancedMesh>(null);
  const slots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: -2.4 + (i / Math.max(1, count - 1)) * 4.8 + (Math.random() - 0.5) * 0.08,
        y: 0.08 + Math.random() * 0.14,
        z: (Math.random() - 0.5) * 0.38,
        r: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [
          number,
          number,
          number,
        ],
      })),
    [count]
  );

  useLayoutEffect(() => {
    if (!inst.current) return;
    slots.forEach((slot, i) => {
      O.position.set(slot.x, slot.y, slot.z);
      O.rotation.set(slot.r[0], slot.r[1], slot.r[2]);
      O.scale.setScalar(0.9);
      O.updateMatrix();
      inst.current!.setMatrixAt(i, O.matrix);
    });
    inst.current.instanceMatrix.needsUpdate = true;
  }, [slots]);

  return (
    <instancedMesh ref={inst} args={[undefined, undefined, slots.length]} material={M.pellet}>
      <cylinderGeometry args={[0.045, 0.045, 0.2, 8, 1, false]} />
    </instancedMesh>
  );
}

function PelletPress({ ...props }: ThreeElements["group"]) {
  return (
    <group {...props}>
      <CreamHammerMill active />
      <mesh position={[0, 1.95, 0.82]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
        <torusGeometry args={[0.44, 0.06, 8, 18]} />
      </mesh>
      <mesh position={[0, 1.95, 0.88]} rotation={[Math.PI / 2, 0, 0]} material={M.emberGlow}>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 14]} />
      </mesh>
    </group>
  );
}

/** S09 - Pelletizer unit.
 * Replaces the former value/QC gate with a compact production-line pelletizer:
 * green frame, cream press bodies, feed hoppers and pellet discharge conveyor. */
export default function QualityControl({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const q = quality.particleScale;

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[23, 18]} />
      </mesh>

      <GreenSupportFrame width={7.6} depth={3.1} height={4.25} bays={3} position={[0, 0, -0.8]} />
      <SafetySign width={5.8} position={[0, 4.95, 0.8]} />
      {[-2.45, 0, 2.45].map((x) => (
        <PelletPress key={x} position={[x, 0, -0.82]} />
      ))}

      <mesh position={[0, 3.42, 0.18]} rotation={[Math.PI / 2, 0, Math.PI / 2]} material={creamMat}>
        <cylinderGeometry args={[0.14, 0.14, 7.0, 12]} />
      </mesh>
      <Conveyor position={[0.7, 0.08, 1.28]} length={6.6} width={0.78} height={0.62} speed={0.95} getRun={() => bell(state.current.local)} />
      <group position={[1.0, 0.78, 1.28]}>
        <PelletStream count={quality.tier === 0 ? 34 : 60} />
      </group>
      <PelletBed count={quality.tier === 0 ? 120 : 260} area={[1.2, 0.18, 0.56]} position={[4.45, 0.84, 1.28]} />

      <ParticleField
        count={Math.round(45 * q) + 8}
        area={[1.2, 0.2, 0.28]}
        center={[3.8, 1.0, 1.28]}
        colorA="#d29a50"
        colorB="#8a5b2f"
        size={0.42}
        life={1.5}
        gravity={-1.0}
        spread={0.12}
        shape="speck"
        getIntensity={() => 0.28 * bell(state.current.local)}
      />

      <pointLight position={[0, 5.6, 2.0]} color="#f1d6ad" intensity={11} distance={14} decay={1.8} />
      <pointLight position={[2.8, 2.6, 1.8]} color="#e8a33d" intensity={7} distance={9} decay={2} />
    </group>
  );
}
