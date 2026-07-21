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

const I = 10;
const S = STATIONS[I];
const O = new THREE.Object3D();
const C = new THREE.Color();

const heaterMat = new THREE.MeshStandardMaterial({
  color: "#271209",
  emissive: "#e85d26",
  emissiveIntensity: 0.18,
  roughness: 0.48,
  metalness: 0.28,
});

const chamberMat = new THREE.MeshPhysicalMaterial({
  color: "#3c2719",
  transparent: true,
  opacity: 0.28,
  roughness: 0.18,
  metalness: 0.02,
  transmission: 0.16,
  thickness: 0.36,
  side: THREE.DoubleSide,
});

const glowMat = new THREE.MeshBasicMaterial({
  color: "#ff7a22",
  transparent: true,
  opacity: 0.1,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const feedPelletMat = new THREE.MeshStandardMaterial({
  color: "#a97638",
  roughness: 0.74,
  metalness: 0.02,
  vertexColors: true,
});

function ThermalFeedPellets({ count = 84 }: { count?: number }) {
  const inst = useRef<THREE.InstancedMesh>(null);
  const slots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const p = i / Math.max(1, count - 1);
        return {
          p,
          x: -5.2 + p * 7.5 + (Math.random() - 0.5) * 0.15,
          y: 0.08 + Math.random() * 0.22,
          z: (Math.random() - 0.5) * 0.46,
          r: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [
            number,
            number,
            number,
          ],
          s: 0.9 + Math.random() * 0.24,
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

      const heatTint = smooth((slot.p - 0.42) / 0.42);
      const raw = new THREE.Color("#b57a37");
      const warm = new THREE.Color("#d7863a");
      C.copy(raw).lerp(warm, heatTint);
      inst.current!.setColorAt(i, C);
    });
    inst.current.instanceMatrix.needsUpdate = true;
    if (inst.current.instanceColor) inst.current.instanceColor.needsUpdate = true;
  }, [slots]);

  return (
    <instancedMesh ref={inst} args={[undefined, undefined, slots.length]} material={feedPelletMat}>
      <cylinderGeometry args={[0.045, 0.045, 0.22, 8, 1, false]} />
    </instancedMesh>
  );
}

/** S10 migration slot - thermal upgrading: conventional wood pellets enter a
 * controlled heated environment before the torrefaction transformation. */
export default function Packaging({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const entryDoor = useRef<THREE.Group>(null);
  const heatLight = useRef<THREE.PointLight>(null);
  const ringLights = useRef<THREE.PointLight[]>([]);
  const q = quality.particleScale;

  useFrame((stateR, delta) => {
    if (!state.current.active) return;
    const b = bell(state.current.local);
    const heat = smooth((state.current.local - 0.14) / 0.52);
    const pulse = 0.84 + Math.sin(stateR.clock.elapsedTime * 1.9) * 0.16;

    heaterMat.emissiveIntensity = (0.22 + 1.75 * heat) * pulse;
    glowMat.opacity = 0.08 + 0.22 * heat * b;
    if (entryDoor.current) entryDoor.current.rotation.z += delta * (0.08 + heat * 0.18);
    if (heatLight.current) heatLight.current.intensity = 30 * b * (0.28 + heat) * pulse;
    ringLights.current.forEach((l, i) => {
      if (l) l.intensity = (4.5 + i * 1.4) * b * (0.25 + heat);
    });
  });

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[26, 22]} />
      </mesh>

      <mesh position={[0, 3.8, -6.2]} material={M.dark}>
        <boxGeometry args={[13.6, 7.6, 0.28]} />
      </mesh>

      <group position={[-2.1, -0.12, 0]}>
        <mesh position={[0, 0.08, -1.1]} material={M.housing}>
          <boxGeometry args={[13.2, 0.16, 5.6]} />
        </mesh>

        {/* controlled entry conveyor */}
        <Conveyor
          position={[-3.5, 0.18, -1.1]}
          rotation={[0, 0, 0.03]}
          length={7.4}
          width={0.88}
          height={0.9}
          speed={1.05}
          getRun={() => bell(state.current.local)}
        />

        <group position={[0.9, 2.25, -1.1]}>
          {/* preheat tunnel */}
          <group rotation={[0, 0, Math.PI / 2]}>
            <mesh material={chamberMat}>
              <cylinderGeometry args={[0.95, 0.95, 6.4, 30, 1, true]} />
            </mesh>
            <mesh material={glowMat}>
              <cylinderGeometry args={[0.64, 0.64, 5.4, 24, 1, true]} />
            </mesh>
          </group>

          {[-2.55, -1.2, 0.15, 1.5, 2.85].map((x, i) => (
            <group key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <mesh material={heaterMat}>
                <torusGeometry args={[1.04, 0.05, 8, 32]} />
              </mesh>
              <pointLight
                ref={(l) => {
                  if (l) ringLights.current[i] = l;
                }}
                position={[0, 0.15, 0.72]}
                color="#e85d26"
                distance={5.2}
                decay={1.9}
              />
            </group>
          ))}

          <group ref={entryDoor} position={[-3.38, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <mesh material={M.steel}>
              <torusGeometry args={[1.08, 0.11, 10, 36]} />
            </mesh>
            <mesh material={M.dark}>
              <boxGeometry args={[0.08, 1.86, 0.18]} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} material={M.dark}>
              <boxGeometry args={[0.08, 1.86, 0.18]} />
            </mesh>
          </group>

          <group position={[0, -0.84, 0]}>
            <ThermalFeedPellets count={Math.round(68 * quality.particleScale) + 32} />
          </group>
        </group>

        {/* instrumentation panel keeps the heat read as controlled process. */}
        <group position={[-4.7, 1.25, 1.05]} rotation={[0, 0.18, 0]} scale={0.72}>
          <mesh material={M.panel}>
            <boxGeometry args={[1.4, 1.9, 0.18]} />
          </mesh>
          {[0.55, 0.12, -0.32].map((y, i) => (
            <mesh key={y} position={[-0.38 + i * 0.36, y, 0.12]} material={i === 0 ? M.emberGlow : M.frostGlow}>
              <circleGeometry args={[0.1, 16]} />
            </mesh>
          ))}
          <mesh position={[0, -0.76, 0.12]} material={M.dark}>
            <boxGeometry args={[0.95, 0.1, 0.05]} />
          </mesh>
        </group>

        <ParticleField
          count={Math.round(180 * q) + 30}
          area={[2.8, 0.35, 0.45]}
          center={[1.15, 2.28, -1.1]}
          colorA="#ffb56a"
          colorB="#5a2a12"
          size={1.4}
          life={3.4}
          rise={0.08}
          spread={0.2}
          curl={0.75}
          getIntensity={() => 0.38 * bell(state.current.local)}
        />
        <ParticleField
          count={Math.round(75 * q) + 15}
          area={[2.2, 0.16, 0.32]}
          center={[1.2, 2.08, -1.1]}
          colorA="#4a2412"
          colorB="#140b06"
          size={0.45}
          life={2.4}
          spread={0.14}
          shape="speck"
          blending={THREE.NormalBlending}
          getIntensity={() => 0.22 * smooth((state.current.local - 0.28) / 0.5)}
        />

        <pointLight ref={heatLight} position={[1.2, 2.6, 1.3]} color="#ff7a22" distance={14} decay={1.9} />
        <pointLight position={[-4, 3.6, 1.7]} color="#f1d2a6" intensity={7} distance={13} decay={2} />
      </group>
    </group>
  );
}
