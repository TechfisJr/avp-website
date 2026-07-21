"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATIONS, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { PelletBed } from "../kit/biomass";
import { Conveyor } from "../kit/machines";
import { useStation } from "../useStation";
import { M } from "../kit/industrial";

const I = 9;
const S = STATIONS[I];
const O = new THREE.Object3D();
const C = new THREE.Color();

const scanMat = new THREE.MeshStandardMaterial({
  color: "#071218",
  emissive: "#7fb4c7",
  emissiveIntensity: 0.9,
  metalness: 0.08,
  roughness: 0.35,
});

const valueMat = new THREE.MeshStandardMaterial({
  color: "#190d05",
  emissive: "#e8a33d",
  emissiveIntensity: 0.85,
  metalness: 0.18,
  roughness: 0.5,
});

const warmPelletMat = new THREE.MeshStandardMaterial({
  color: "#a87436",
  roughness: 0.72,
  metalness: 0.02,
  vertexColors: true,
});

const glassMat = new THREE.MeshPhysicalMaterial({
  color: "#9fd2df",
  transparent: true,
  opacity: 0.15,
  roughness: 0.12,
  metalness: 0,
  transmission: 0.2,
  thickness: 0.3,
  side: THREE.DoubleSide,
});

function UpgradePelletStream({ count = 72 }: { count?: number }) {
  const inst = useRef<THREE.InstancedMesh>(null);
  const slots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const p = i / Math.max(1, count - 1);
        return {
          p,
          x: -4.2 + p * 8.2 + (Math.random() - 0.5) * 0.12,
          y: 0.1 + Math.random() * 0.22,
          z: (Math.random() - 0.5) * 0.5,
          r: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [
            number,
            number,
            number,
          ],
          s: 0.95 + Math.random() * 0.28,
        };
      }),
    [count]
  );

  useLayoutEffect(() => {
    if (!inst.current) return;
    slots.forEach((slot, i) => {
      O.position.set(slot.x, slot.y, slot.z);
      O.rotation.set(slot.r[0], slot.r[1], slot.r[2]);
      O.scale.setScalar(slot.s);
      O.updateMatrix();
      inst.current!.setMatrixAt(i, O.matrix);

      const warmth = smooth((slot.p - 0.38) / 0.5);
      C.set("#9f6c34").lerp(new THREE.Color("#d48a38"), warmth);
      inst.current!.setColorAt(i, C);
    });
    inst.current.instanceMatrix.needsUpdate = true;
    if (inst.current.instanceColor) inst.current.instanceColor.needsUpdate = true;
  }, [slots]);

  return (
    <instancedMesh ref={inst} args={[undefined, undefined, slots.length]} material={warmPelletMat}>
      <capsuleGeometry args={[0.04, 0.12, 3, 8]} />
    </instancedMesh>
  );
}

function ValueArc({ side = 1 }: { side?: 1 | -1 }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.8, 1.85, side * 0.2),
      new THREE.Vector3(-0.8, 2.95, side * 0.45),
      new THREE.Vector3(1.4, 2.85, side * 0.35),
      new THREE.Vector3(3.3, 1.7, side * 0.08),
    ]);
    return new THREE.TubeGeometry(curve, 64, 0.018, 6, false);
  }, [side]);

  return <mesh geometry={geometry} material={side > 0 ? M.frostGlow : M.emberGlow} />;
}

/** S09 migration slot - value upgrading: the finished wood pellet is selected
 * and handed from product proof into a deliberate technology upgrade path. */
export default function QualityControl({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const gate = useRef<THREE.Group>(null);
  const scanRing = useRef<THREE.Mesh>(null);
  const valueCore = useRef<THREE.Mesh>(null);
  const q = quality.particleScale;

  useFrame((stateR, delta) => {
    if (!state.current.active) return;
    const b = bell(state.current.local);
    const handoff = smooth((state.current.local - 0.34) / 0.42);
    const pulse = 0.85 + Math.sin(stateR.clock.elapsedTime * 2.4) * 0.15;

    scanMat.emissiveIntensity = (0.65 + 1.45 * b) * pulse;
    valueMat.emissiveIntensity = 0.55 + 1.6 * handoff * pulse;
    if (gate.current) gate.current.rotation.y += delta * (0.16 + handoff * 0.18);
    if (scanRing.current) scanRing.current.scale.setScalar(1 + Math.sin(stateR.clock.elapsedTime * 3.5) * 0.035 * b);
    if (valueCore.current) valueCore.current.rotation.z -= delta * (0.22 + handoff * 0.2);
  });

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[23, 20]} />
      </mesh>

      <mesh position={[0, 3.7, -5.7]} material={M.dark}>
        <boxGeometry args={[12.8, 7.4, 0.22]} />
      </mesh>
      <mesh position={[0, 0.06, -1.15]} material={M.housing}>
        <boxGeometry args={[11.8, 0.12, 4.5]} />
      </mesh>

      <group position={[-1.2, 0, -1.15]}>
        <Conveyor
          position={[0, 0.1, 0]}
          length={8.8}
          width={0.92}
          height={0.86}
          speed={0.92}
          getRun={() => 0.75 * bell(state.current.local)}
        />
        <group position={[0, 0.96, 0]}>
          <UpgradePelletStream count={Math.round(64 * q) + 28} />
        </group>
      </group>

      {/* Completed product mass: a small finished bed before the upgrade gate. */}
      <group position={[-4.1, 1.02, -2.55]} rotation={[0, 0.1, -0.08]}>
        <mesh material={M.panel}>
          <boxGeometry args={[2.4, 0.12, 1.3]} />
        </mesh>
        <PelletBed count={Math.round(quality.pelletCount * 0.18)} area={[0.95, 0.12, 0.45]} position={[0, 0.12, 0]} />
      </group>

      {/* Selection gate: QC remains as proof, but no longer owns the chapter. */}
      <group ref={gate} position={[-0.45, 2.1, -1.15]} rotation={[0, Math.PI / 2, 0]}>
        <mesh ref={scanRing} material={scanMat}>
          <torusGeometry args={[1.25, 0.035, 8, 48]} />
        </mesh>
        <mesh material={glassMat}>
          <cylinderGeometry args={[1.06, 1.06, 0.08, 36, 1, true]} />
        </mesh>
        {[-1, 1].map((x) => (
          <mesh key={x} position={[x * 0.72, 0, 0]} material={M.frostGlow}>
            <boxGeometry args={[0.035, 1.85, 0.035]} />
          </mesh>
        ))}
      </group>

      {/* Technology/value handoff portal: the warm tone points into S10. */}
      <group position={[3.0, 1.9, -1.15]}>
        <mesh ref={valueCore} material={valueMat} rotation={[0, Math.PI / 2, 0]}>
          <torusKnotGeometry args={[0.48, 0.035, 80, 8]} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-0.78 + i * 0.78, -1.15 + i * 0.06, 0]} material={i === 2 ? M.emberGlow : M.frostGlow}>
            <boxGeometry args={[0.48, 0.05, 0.8]} />
          </mesh>
        ))}
        <pointLight position={[0, 0.15, 0.25]} color="#e8a33d" intensity={14} distance={9} decay={1.8} />
      </group>

      <ValueArc side={1} />
      <ValueArc side={-1} />

      <ParticleField
        count={Math.round(110 * q) + 20}
        area={[2.4, 0.24, 0.42]}
        center={[1.5, 1.6, -1.15]}
        colorA="#f0c46c"
        colorB="#7fb4c7"
        size={0.95}
        life={2.6}
        rise={0.12}
        spread={0.2}
        curl={0.55}
        getIntensity={() => 0.42 * smooth((state.current.local - 0.24) / 0.54)}
      />
      <ParticleField
        count={Math.round(70 * q) + 12}
        area={[1.1, 0.2, 0.3]}
        center={[-0.45, 2.1, -1.15]}
        colorA="#9fd2df"
        colorB="#d9f3ff"
        size={0.62}
        life={1.6}
        spread={0.12}
        shape="speck"
        blending={THREE.AdditiveBlending}
        getIntensity={() => 0.3 * bell(state.current.local)}
      />

      <pointLight position={[-1.5, 3.1, 1.1]} color="#7fb4c7" intensity={16} distance={12} decay={1.8} />
      <pointLight position={[3.4, 2.5, 1.1]} color="#e8a33d" intensity={18} distance={12} decay={1.9} />
    </group>
  );
}
