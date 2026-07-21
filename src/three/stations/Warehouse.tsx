"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATIONS, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { Conveyor } from "../kit/machines";
import { useStation } from "../useStation";
import { M } from "../kit/industrial";

const I = 11;
const S = STATIONS[I];
const O = new THREE.Object3D();
const C = new THREE.Color();

const RING_X = [-5, -3, -1, 1, 3, 5];

const chamberGlass = new THREE.MeshPhysicalMaterial({
  color: "#5b3a24",
  transparent: true,
  opacity: 0.22,
  roughness: 0.22,
  metalness: 0,
  transmission: 0.22,
  thickness: 0.45,
  envMapIntensity: 0.45,
  side: THREE.DoubleSide,
});

const heaterMat = new THREE.MeshStandardMaterial({
  color: "#2a1308",
  emissive: "#e85d26",
  emissiveIntensity: 0.25,
  metalness: 0.35,
  roughness: 0.45,
});

const processGlowMat = new THREE.MeshBasicMaterial({
  color: "#ff7a22",
  transparent: true,
  opacity: 0.12,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const palePelletMat = new THREE.MeshStandardMaterial({
  color: "#a97638",
  roughness: 0.78,
  metalness: 0.02,
  vertexColors: true,
});

function TorrefactionPellets({ count = 96 }: { count?: number }) {
  const inst = useRef<THREE.InstancedMesh>(null);
  const slots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const p = i / Math.max(1, count - 1);
        return {
          p,
          x: -5.1 + p * 10.2 + (Math.random() - 0.5) * 0.18,
          y: (Math.random() - 0.5) * 0.54,
          z: (Math.random() - 0.5) * 0.54,
          r: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [
            number,
            number,
            number,
          ],
          s: 0.9 + Math.random() * 0.28,
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

      const char = smooth((slot.p - 0.18) / 0.62);
      const warm = new THREE.Color("#b57a37");
      const dark = new THREE.Color("#17100b");
      C.copy(warm).lerp(dark, char);
      inst.current!.setColorAt(i, C);
    });
    inst.current.instanceMatrix.needsUpdate = true;
    if (inst.current.instanceColor) inst.current.instanceColor.needsUpdate = true;
  }, [slots]);

  return (
    <instancedMesh ref={inst} args={[undefined, undefined, slots.length]} material={palePelletMat}>
      <cylinderGeometry args={[0.045, 0.045, 0.22, 8, 1, false]} />
    </instancedMesh>
  );
}

/** S11 migration slot — torrefaction: a sealed thermal treatment chamber where
 *  conventional pellets visibly shift from pale wood fuel into black biomass. */
export default function Warehouse({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const drum = useRef<THREE.Group>(null);
  const coreLight = useRef<THREE.PointLight>(null);
  const ringLights = useRef<THREE.PointLight[]>([]);
  const q = quality.particleScale;

  useFrame((stateR, delta) => {
    if (!state.current.active) return;
    const b = bell(state.current.local);
    const heat = smooth((state.current.local - 0.16) / 0.56);
    const pulse = 0.82 + Math.sin(stateR.clock.elapsedTime * 2.1) * 0.18;

    if (drum.current) drum.current.rotation.x += delta * (0.08 + heat * 0.18);
    heaterMat.emissiveIntensity = (0.35 + 2.1 * heat) * pulse;
    processGlowMat.opacity = 0.08 + 0.24 * heat * b;

    if (coreLight.current) coreLight.current.intensity = 36 * b * (0.35 + heat) * pulse;
    ringLights.current.forEach((l, i) => {
      if (l) l.intensity = (4 + i * 1.2) * b * (0.35 + heat);
    });
  });

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[28, 24]} />
      </mesh>

      {/* dark treatment bay backdrop */}
      <mesh position={[0, 4.1, -7.2]} material={M.dark}>
        <boxGeometry args={[15.5, 8.2, 0.35]} />
      </mesh>
      <mesh position={[0, 0.08, -1]} material={M.housing}>
        <boxGeometry args={[14, 0.16, 6.2]} />
      </mesh>

      {/* feed and discharge conveyors make the process direction legible. */}
      <Conveyor
        position={[-6.7, 0.25, -1.1]}
        rotation={[0, 0, 0.04]}
        length={5.2}
        width={0.9}
        height={0.92}
        speed={1.1}
        getRun={() => bell(state.current.local)}
      />
      <Conveyor
        position={[6.7, 0.25, -1.1]}
        rotation={[0, 0, -0.04]}
        length={5.2}
        width={0.9}
        height={0.92}
        speed={0.9}
        getRun={() => bell(state.current.local)}
      />

      <group position={[0, 2.55, -1.1]}>
        <group ref={drum} rotation={[0, 0, Math.PI / 2]}>
          <mesh material={chamberGlass}>
            <cylinderGeometry args={[1.2, 1.2, 11.6, 32, 1, true]} />
          </mesh>
          <mesh material={processGlowMat}>
            <cylinderGeometry args={[0.78, 0.78, 10.4, 24, 1, true]} />
          </mesh>
        </group>

        {/* sealed end collars */}
        {[-5.95, 5.95].map((x) => (
          <group key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <mesh material={M.steel}>
              <torusGeometry args={[1.24, 0.13, 10, 32]} />
            </mesh>
            <mesh position={[0, 0, x < 0 ? -0.08 : 0.08]} material={M.dark}>
              <cylinderGeometry args={[1.03, 1.03, 0.16, 28]} />
            </mesh>
          </group>
        ))}

        {/* heater bands and inspection ports */}
        {RING_X.map((x, i) => (
          <group key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <mesh material={heaterMat}>
              <torusGeometry args={[1.34, 0.055, 8, 34]} />
            </mesh>
            <pointLight
              ref={(l) => {
                if (l) ringLights.current[i] = l;
              }}
              position={[0, 0.15, 0.8]}
              color="#e85d26"
              distance={5.5}
              decay={1.9}
            />
          </group>
        ))}

        <TorrefactionPellets count={Math.round(78 * quality.particleScale) + 36} />
      </group>

      {/* control spine: this should read as measured treatment, not burning. */}
      <group position={[-6.4, 2.1, 1.9]} rotation={[0, 0.22, 0]}>
        <mesh material={M.panel}>
          <boxGeometry args={[1.5, 2.2, 0.18]} />
        </mesh>
        {[0.55, 0, -0.55].map((y, i) => (
          <mesh key={y} position={[-0.36 + i * 0.36, y, 0.12]} material={i === 1 ? M.emberGlow : M.frostGlow}>
            <circleGeometry args={[0.11, 16]} />
          </mesh>
        ))}
        <mesh position={[0, -0.9, 0.12]} material={M.dark}>
          <boxGeometry args={[1, 0.12, 0.05]} />
        </mesh>
      </group>

      {/* warm gas inside the sealed chamber */}
      <ParticleField
        count={Math.round(210 * q) + 40}
        area={[4.7, 0.45, 0.45]}
        center={[0, 2.55, -1.1]}
        colorA="#ffb15a"
        colorB="#4d2310"
        size={1.65}
        life={3.2}
        rise={0.05}
        spread={0.22}
        curl={0.85}
        getIntensity={() => 0.45 * bell(state.current.local)}
      />
      <ParticleField
        count={Math.round(130 * q) + 20}
        area={[2.8, 0.22, 0.22]}
        center={[1.9, 2.35, -0.95]}
        colorA="#1b120c"
        colorB="#0a0705"
        size={0.8}
        life={2.6}
        spread={0.18}
        gravity={-0.05}
        shape="speck"
        blending={THREE.NormalBlending}
        getIntensity={() => 0.35 * smooth((state.current.local - 0.35) / 0.45)}
      />

      <pointLight ref={coreLight} position={[0, 2.7, 1.2]} color="#ff7a22" distance={16} decay={1.8} />
      <pointLight position={[0, 5.8, -0.5]} color="#f1b06b" intensity={9} distance={18} decay={2} />
    </group>
  );
}

