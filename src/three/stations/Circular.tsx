"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATIONS, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { M } from "../kit/industrial";

const I = 14;
const S = STATIONS[I];
const O = new THREE.Object3D();
const C = new THREE.Color();

const blackPelletMat = new THREE.MeshStandardMaterial({
  color: "#16100b",
  emissive: "#e8a33d",
  emissiveIntensity: 0.14,
  roughness: 0.58,
  metalness: 0.05,
  vertexColors: true,
});

const valueRingMat = new THREE.MeshStandardMaterial({
  color: "#231006",
  emissive: "#e8a33d",
  emissiveIntensity: 0.95,
  roughness: 0.42,
  metalness: 0.18,
});

const premiumMat = new THREE.MeshStandardMaterial({
  color: "#d0a448",
  emissive: "#e8a33d",
  emissiveIntensity: 0.55,
  roughness: 0.38,
  metalness: 0.42,
});

const dawnMat = new THREE.MeshBasicMaterial({
  color: "#e8a33d",
  transparent: true,
  opacity: 0.08,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
  depthWrite: false,
});

function BlackPelletCluster({ count = 120 }: { count?: number }) {
  const inst = useRef<THREE.InstancedMesh>(null);
  const slots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const ring = Math.floor(i / 24);
        const angle = (i / 24) * Math.PI * 2 + ring * 0.32;
        const radius = 0.25 + ring * 0.18 + Math.random() * 0.08;
        return {
          x: Math.cos(angle) * radius + (Math.random() - 0.5) * 0.08,
          y: 0.12 + Math.random() * 0.58 + ring * 0.03,
          z: Math.sin(angle) * radius * 0.75 + (Math.random() - 0.5) * 0.08,
          r: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [
            number,
            number,
            number,
          ],
          s: 0.95 + Math.random() * 0.34,
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
      C.setHSL(0.07 + Math.random() * 0.025, 0.36, 0.065 + Math.random() * 0.09);
      inst.current!.setColorAt(i, C);
    });
    inst.current.instanceMatrix.needsUpdate = true;
    if (inst.current.instanceColor) inst.current.instanceColor.needsUpdate = true;
  }, [slots]);

  return (
    <instancedMesh ref={inst} args={[undefined, undefined, slots.length]} material={blackPelletMat}>
      <capsuleGeometry args={[0.045, 0.15, 3, 8]} />
    </instancedMesh>
  );
}

function StoryArc({
  from,
  to,
  height,
  material,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  height: number;
  material: THREE.Material;
}) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      from,
      new THREE.Vector3((from.x + to.x) / 2, height, (from.z + to.z) / 2),
      to,
    ]);
    return new THREE.TubeGeometry(curve, 80, 0.026, 6, false);
  }, [from, height, to]);

  return <mesh geometry={geometry} material={material} />;
}

function Milestone({
  x,
  color,
  height,
}: {
  x: number;
  color: string;
  height: number;
}) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.42,
        roughness: 0.45,
        metalness: 0.18,
      }),
    [color]
  );

  return (
    <group position={[x, 0, 1.2]}>
      <mesh position={[0, height / 2, 0]} material={mat}>
        <boxGeometry args={[0.42, height, 0.42]} />
      </mesh>
      <mesh position={[0, height + 0.18, 0]} material={mat}>
        <sphereGeometry args={[0.18, 16, 12]} />
      </mesh>
    </group>
  );
}

/** S14 migration slot - advanced bioenergy: final premium brand close. The
 * circular loop is replaced by a value ladder resolving Wood -> Pellet ->
 * Higher Value, with Black Wood Pellet as the finished proof point. */
export default function Circular({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const halo = useRef<THREE.Group>(null);
  const dawn = useRef<THREE.Mesh>(null);
  const valueCore = useRef<THREE.Group>(null);

  useFrame((stateR, delta) => {
    if (!state.current.active) return;
    const form = smooth((state.current.local - 0.12) / 0.62);
    const pulse = 0.84 + Math.sin(stateR.clock.elapsedTime * 1.9) * 0.16;
    valueRingMat.emissiveIntensity = (0.55 + 1.65 * form) * pulse;
    premiumMat.emissiveIntensity = (0.35 + 0.85 * form) * pulse;
    blackPelletMat.emissiveIntensity = 0.08 + 0.2 * form;

    if (halo.current) {
      halo.current.rotation.y += delta * (0.16 + form * 0.22);
      halo.current.rotation.z += delta * 0.08;
      halo.current.scale.setScalar(0.82 + form * 0.2);
    }
    if (valueCore.current) valueCore.current.rotation.y -= delta * (0.1 + form * 0.2);
    if (dawn.current) {
      (dawn.current.material as THREE.MeshBasicMaterial).opacity = 0.04 + form * 0.16;
    }
  });

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[28, 24]} />
      </mesh>

      <mesh position={[0, 3.8, -6.2]} material={M.dark}>
        <boxGeometry args={[13.5, 7.4, 0.24]} />
      </mesh>
      <mesh ref={dawn} position={[0.5, 3.5, -4.4]} rotation={[0.25, 0, 0]} material={dawnMat}>
        <circleGeometry args={[16, 48]} />
      </mesh>

      <group position={[-2.35, -0.6, -0.55]} scale={0.82}>
        <mesh position={[0, 0.1, 0]} material={M.housing}>
          <boxGeometry args={[10.5, 0.2, 5.0]} />
        </mesh>

        <Milestone x={-3.7} color="#8a5a2d" height={0.8} />
        <Milestone x={-1.8} color="#d2a96d" height={1.25} />
        <Milestone x={0.1} color="#e85d26" height={1.85} />
        <Milestone x={2.0} color="#e8a33d" height={2.45} />

        <StoryArc
          from={new THREE.Vector3(-3.7, 1.15, 1.2)}
          to={new THREE.Vector3(-1.8, 1.6, 1.2)}
          height={2.15}
          material={M.frostGlow}
        />
        <StoryArc
          from={new THREE.Vector3(-1.8, 1.65, 1.2)}
          to={new THREE.Vector3(0.1, 2.25, 1.2)}
          height={2.75}
          material={M.emberGlow}
        />
        <StoryArc
          from={new THREE.Vector3(0.1, 2.35, 1.2)}
          to={new THREE.Vector3(2.0, 2.95, 1.2)}
          height={3.45}
          material={valueRingMat}
        />

        <group ref={valueCore} position={[2.9, 1.25, -0.65]}>
          <mesh position={[0, 0.18, 0]} material={M.dark}>
            <cylinderGeometry args={[1.6, 1.85, 0.34, 40]} />
          </mesh>
          <mesh position={[0, 0.4, 0]} material={premiumMat}>
            <cylinderGeometry args={[1.24, 1.24, 0.1, 40]} />
          </mesh>
          <group position={[0, 0.45, 0]}>
            <BlackPelletCluster count={Math.round(96 * quality.particleScale) + 54} />
          </group>
        </group>

        <group ref={halo} position={[2.9, 2.25, -0.65]} rotation={[Math.PI / 2, 0, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]} material={i === 0 ? premiumMat : valueRingMat}>
              <torusGeometry args={[1.55 + i * 0.38, 0.026, 8, 80]} />
            </mesh>
          ))}
        </group>

        <ParticleField
          count={Math.round(150 * quality.particleScale) + 28}
          area={[2.4, 0.95, 1.35]}
          center={[1.95, 1.65, -0.45]}
          colorA="#e8a33d"
          colorB="#231006"
          size={0.68}
          life={4.6}
          rise={0.08}
          spread={0.36}
          curl={1.3}
          getIntensity={() => 0.28 + 0.45 * bell(state.current.local)}
        />
      </group>

      <pointLight position={[2.4, 4.0, 1.7]} color="#e8a33d" intensity={24} distance={16} decay={1.8} />
      <pointLight position={[-4.8, 3.4, 1.8]} color="#d7c0a0" intensity={9} distance={15} decay={2} />
      <pointLight position={[0, 5.2, -2.2]} color="#e85d26" intensity={10} distance={18} decay={2} />
    </group>
  );
}
