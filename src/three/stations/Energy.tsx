"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATIONS, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { M } from "../kit/industrial";

const I = 13;
const S = STATIONS[I];
const O = new THREE.Object3D();
const C = new THREE.Color();

const blackPelletMat = new THREE.MeshStandardMaterial({
  color: "#120d09",
  roughness: 0.58,
  metalness: 0.04,
  envMapIntensity: 0.36,
  vertexColors: true,
});

const palePelletMat = new THREE.MeshStandardMaterial({
  color: "#a97638",
  roughness: 0.78,
  metalness: 0.02,
  envMapIntensity: 0.18,
});

const plinthGlowMat = new THREE.MeshStandardMaterial({
  color: "#190b05",
  emissive: "#e85d26",
  emissiveIntensity: 0.45,
  roughness: 0.82,
  metalness: 0.1,
});

const haloMat = new THREE.MeshBasicMaterial({
  color: "#ff8a2f",
  transparent: true,
  opacity: 0.16,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

function BlackPelletCluster({ count = 72 }: { count?: number }) {
  const inst = useRef<THREE.InstancedMesh>(null);
  const slots = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const r = Math.sqrt(Math.random()) * 1.6;
        const a = Math.random() * Math.PI * 2;
        return {
          x: Math.cos(a) * r,
          z: Math.sin(a) * r * 0.72,
          y: 0.12 + Math.random() * 0.38,
          rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [
            number,
            number,
            number,
          ],
          s: 0.86 + Math.random() * 0.32,
        };
      }),
    [count]
  );

  useLayoutEffect(() => {
    if (!inst.current) return;
    slots.forEach((slot, i) => {
      O.position.set(slot.x, slot.y, slot.z);
      O.rotation.set(slot.rot[0], slot.rot[1], slot.rot[2]);
      O.scale.setScalar(slot.s);
      O.updateMatrix();
      inst.current!.setMatrixAt(i, O.matrix);
      const l = 0.045 + Math.random() * 0.06;
      C.setRGB(l * 1.1, l * 0.82, l * 0.58);
      inst.current!.setColorAt(i, C);
    });
    inst.current.instanceMatrix.needsUpdate = true;
    if (inst.current.instanceColor) inst.current.instanceColor.needsUpdate = true;
  }, [slots]);

  return (
    <instancedMesh ref={inst} args={[undefined, undefined, slots.length]} material={blackPelletMat}>
      <cylinderGeometry args={[0.045, 0.045, 0.22, 8, 1, false]} />
    </instancedMesh>
  );
}

/** S13 migration slot — Black Wood Pellet product hero. The upgraded pellet is
 *  presented as a material result of torrefaction, not as fuel entering fire. */
export default function Energy({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const heroStage = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const key = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const q = quality.particleScale;

  useFrame((stateR, delta) => {
    if (!state.current.active) return;
    const b = bell(state.current.local);
    const reveal = smooth((state.current.local - 0.12) / 0.5);
    const pulse = 0.8 + Math.sin(stateR.clock.elapsedTime * 1.8) * 0.2;

    if (heroStage.current) {
      heroStage.current.rotation.y += delta * (0.08 + reveal * 0.1);
      heroStage.current.position.y = 0.08 * Math.sin(stateR.clock.elapsedTime * 1.2) * b;
    }
    if (halo.current) {
      halo.current.rotation.z -= delta * 0.12;
      halo.current.scale.setScalar(1 + reveal * 0.1);
    }
    plinthGlowMat.emissiveIntensity = (0.25 + 1.6 * reveal) * pulse;
    haloMat.opacity = 0.08 + 0.22 * reveal * b;
    if (key.current) key.current.intensity = 32 * b * (0.35 + reveal) * pulse;
    if (rim.current) rim.current.intensity = 18 * b * (0.4 + reveal);
  });

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[30, 24]} />
      </mesh>

      {/* product-stage wall and floor: premium lab/product reveal, not boiler house */}
      <mesh position={[0, 4.2, -6.8]} material={M.dark}>
        <boxGeometry args={[15, 8.4, 0.28]} />
      </mesh>
      <mesh position={[0, 0.08, -1.4]} material={M.housing}>
        <boxGeometry args={[13.5, 0.16, 6.4]} />
      </mesh>

      <group ref={heroStage} position={[0.7, 1.55, -1.6]}>
        <mesh material={M.steel}>
          <cylinderGeometry args={[2.15, 2.55, 0.38, 40]} />
        </mesh>
        <mesh position={[0, 0.23, 0]} material={plinthGlowMat}>
          <cylinderGeometry args={[1.95, 2.1, 0.12, 40]} />
        </mesh>
        <mesh ref={halo} position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, 0]} material={haloMat}>
          <torusGeometry args={[2.35, 0.035, 8, 96]} />
        </mesh>
        <group position={[0, 0.45, 0]}>
          <BlackPelletCluster count={Math.round(62 * quality.particleScale) + 28} />
        </group>
      </group>

      {/* before/after samples reinforce that black pellet is upgraded, not burnt. */}
      <group position={[-4.4, 1.1, -1.1]} rotation={[0, 0.24, 0]}>
        <mesh material={M.steel}>
          <cylinderGeometry args={[0.82, 0.92, 0.18, 28]} />
        </mesh>
        <mesh position={[0, 0.48, 0]} rotation={[Math.PI / 2, 0.2, 0.1]} material={palePelletMat}>
          <cylinderGeometry args={[0.16, 0.16, 0.9, 12, 1, false]} />
        </mesh>
      </group>
      <group position={[-2.75, 1.18, -1.1]} rotation={[0, 0.08, 0]}>
        <mesh material={M.steel}>
          <cylinderGeometry args={[0.82, 0.92, 0.18, 28]} />
        </mesh>
        <mesh position={[0, 0.48, 0]} rotation={[Math.PI / 2, -0.2, -0.12]} material={blackPelletMat}>
          <cylinderGeometry args={[0.16, 0.16, 0.9, 12, 1, false]} />
        </mesh>
      </group>

      {/* quiet value arcs: process proof without returning to route/logistics language */}
      {[
        [-3.55, 1.65, -1.1, 0.7],
        [-1.05, 2.1, -1.35, 1.0],
        [2.85, 2.25, -1.5, 1.25],
      ].map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0.18 + i * 0.25]} material={haloMat}>
          <torusGeometry args={[s, 0.018, 6, 64, Math.PI * 1.25]} />
        </mesh>
      ))}

      <ParticleField
        count={Math.round(180 * q) + 30}
        area={[3.8, 0.3, 1.4]}
        center={[0.7, 1.95, -1.6]}
        colorA="#ffb36b"
        colorB="#4a2110"
        size={0.7}
        life={3.8}
        rise={0.18}
        spread={0.16}
        curl={0.55}
        getIntensity={() => 0.35 * bell(state.current.local)}
      />
      <ParticleField
        count={Math.round(120 * q) + 20}
        area={[2.2, 0.18, 1.0]}
        center={[0.9, 1.85, -1.5]}
        colorA="#15100c"
        colorB="#050403"
        size={0.45}
        life={2.8}
        spread={0.12}
        gravity={-0.08}
        shape="speck"
        blending={THREE.NormalBlending}
        getIntensity={() => 0.28 * bell(state.current.local)}
      />

      <pointLight ref={key} position={[0.8, 3.1, 1.2]} color="#ff8a2f" distance={14} decay={1.9} />
      <pointLight ref={rim} position={[-3.2, 3.8, 2.2]} color="#f4d8aa" distance={12} decay={2} />
      <pointLight position={[4.8, 4.4, -1.3]} color="#7fb4c7" intensity={7} distance={14} decay={2} />
    </group>
  );
}

