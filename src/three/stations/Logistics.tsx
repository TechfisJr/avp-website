"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATIONS, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { M } from "../kit/industrial";

const I = 12;
const S = STATIONS[I];
const O = new THREE.Object3D();
const C = new THREE.Color();

const whitePelletMat = new THREE.MeshStandardMaterial({
  color: "#d2a96d",
  emissive: "#c99e63",
  emissiveIntensity: 0.34,
  roughness: 0.68,
  metalness: 0.02,
  vertexColors: true,
});

const blackPelletMat = new THREE.MeshStandardMaterial({
  color: "#17110c",
  roughness: 0.62,
  metalness: 0.04,
  vertexColors: true,
});

const coreMat = new THREE.MeshStandardMaterial({
  color: "#1a0b04",
  emissive: "#e85d26",
  emissiveIntensity: 0.9,
  metalness: 0.2,
  roughness: 0.42,
});

const valueMat = new THREE.MeshStandardMaterial({
  color: "#201006",
  emissive: "#e8a33d",
  emissiveIntensity: 0.85,
  metalness: 0.18,
  roughness: 0.48,
});

const blackGlowMat = new THREE.MeshStandardMaterial({
  color: "#050403",
  emissive: "#e8a33d",
  emissiveIntensity: 0.18,
  metalness: 0.22,
  roughness: 0.42,
});

function PelletCluster({
  count,
  dark = false,
}: {
  count: number;
  dark?: boolean;
}) {
  const inst = useRef<THREE.InstancedMesh>(null);
  const slots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const layer = Math.floor(i / 18);
        const col = i % 18;
        return {
          x: (col - 8.5) * 0.18 + (Math.random() - 0.5) * 0.08,
          y: 0.1 + layer * 0.12 + Math.random() * 0.12,
          z: (Math.random() - 0.5) * 0.95,
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
      if (dark) {
        C.setHSL(0.07 + Math.random() * 0.03, 0.38, 0.08 + Math.random() * 0.08);
      } else {
        C.setHSL(0.075, 0.42 + Math.random() * 0.1, 0.62 + Math.random() * 0.12);
      }
      inst.current!.setColorAt(i, C);
    });
    inst.current.instanceMatrix.needsUpdate = true;
    if (inst.current.instanceColor) inst.current.instanceColor.needsUpdate = true;
  }, [dark, slots]);

  return (
    <instancedMesh ref={inst} args={[undefined, undefined, slots.length]} material={dark ? blackPelletMat : whitePelletMat}>
      <cylinderGeometry args={[0.04, 0.04, 0.2, 8, 1, false]} />
    </instancedMesh>
  );
}

function ValueFlowArc({
  from,
  to,
  height,
  warm = false,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  height: number;
  warm?: boolean;
}) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      from,
      new THREE.Vector3((from.x + to.x) / 2, height, (from.z + to.z) / 2),
      to,
    ]);
    return new THREE.TubeGeometry(curve, 72, 0.026, 6, false);
  }, [from, height, to]);

  return <mesh geometry={geometry} material={warm ? valueMat : M.frostGlow} />;
}

function ValueStep({
  x,
  dark = false,
  children,
}: {
  x: number;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <group position={[x, 0, -1.3]}>
      <mesh position={[0, 0.18, 0]} material={dark ? M.dark : M.panel}>
        <cylinderGeometry args={[1.55, 1.7, 0.28, 36]} />
      </mesh>
      <mesh position={[0, 0.37, 0]} material={dark ? blackGlowMat : M.steel}>
        <cylinderGeometry args={[1.26, 1.26, 0.08, 36]} />
      </mesh>
      <group position={[0, 0.42, 0]}>{children}</group>
    </group>
  );
}

/** S12 migration slot - value creation: replaces logistics with a process
 * bridge showing why torrefaction creates a higher-value black pellet. */
export default function Logistics({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const core = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Mesh[]>([]);
  const q = quality.particleScale;

  useFrame((stateR, delta) => {
    if (!state.current.active) return;
    const b = bell(state.current.local);
    const reveal = smooth((state.current.local - 0.18) / 0.58);
    const pulse = 0.82 + Math.sin(stateR.clock.elapsedTime * 2.1) * 0.18;

    coreMat.emissiveIntensity = (0.55 + 1.65 * reveal) * pulse;
    valueMat.emissiveIntensity = (0.42 + 1.4 * b) * pulse;
    blackGlowMat.emissiveIntensity = 0.1 + 0.35 * reveal * pulse;
    if (core.current) core.current.rotation.y += delta * (0.2 + reveal * 0.38);
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      ring.rotation.z += delta * (0.16 + i * 0.06);
      ring.scale.setScalar(1 + Math.sin(stateR.clock.elapsedTime * 1.8 + i) * 0.025 * b);
    });
  });

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[25, 22]} />
      </mesh>

      <mesh position={[0, 3.9, -6.1]} material={M.dark}>
        <boxGeometry args={[14, 7.6, 0.26]} />
      </mesh>
      <group position={[-1.8, -0.12, 0]} scale={0.86}>
        <mesh position={[0, 0.08, -1.3]} material={M.housing}>
          <boxGeometry args={[12.5, 0.16, 4.8]} />
        </mesh>

        <ValueStep x={-4.2}>
          <PelletCluster count={Math.round(quality.pelletCount * 0.1)} />
        </ValueStep>

        <group ref={core} position={[0, 1.72, -1.3]}>
          <mesh material={coreMat}>
            <icosahedronGeometry args={[1.05, 2]} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              ref={(m) => {
                if (m) rings.current[i] = m;
              }}
              rotation={[Math.PI / 2, (i * Math.PI) / 3, 0]}
              material={i === 0 ? M.emberGlow : valueMat}
            >
              <torusGeometry args={[1.45 + i * 0.18, 0.035, 8, 48]} />
            </mesh>
          ))}
          <pointLight position={[0, 0.4, 0.6]} color="#e85d26" intensity={22} distance={11} decay={1.85} />
        </group>

        <ValueStep x={4.2} dark>
          <PelletCluster count={Math.round(quality.pelletCount * 0.1)} dark />
        </ValueStep>

        <ValueFlowArc from={new THREE.Vector3(-3.1, 1.3, -1.3)} to={new THREE.Vector3(-1.0, 1.72, -1.3)} height={2.85} />
        <ValueFlowArc from={new THREE.Vector3(1.0, 1.72, -1.3)} to={new THREE.Vector3(3.15, 1.32, -1.3)} height={2.85} warm />
        <ValueFlowArc from={new THREE.Vector3(-3.6, 0.78, -0.45)} to={new THREE.Vector3(3.6, 0.86, -0.45)} height={2.35} warm />

        {/* Small score bars under the comparison: same product category, higher value layer. */}
        {[
          [-4.2, 0.9, M.frostGlow],
          [0, 1.5, M.emberGlow],
          [4.2, 2.2, valueMat],
        ].map(([x, width, mat], i) => (
          <mesh key={i} position={[x as number, 0.55, 1.05]} material={mat as THREE.Material}>
            <boxGeometry args={[width as number, 0.08, 0.12]} />
          </mesh>
        ))}

        <ParticleField
          count={Math.round(150 * q) + 25}
          area={[2.6, 0.32, 0.52]}
          center={[0.25, 1.85, -1.3]}
          colorA="#e8a33d"
          colorB="#211008"
          size={1.2}
          life={3.1}
          rise={0.1}
          spread={0.22}
          curl={0.72}
          getIntensity={() => 0.5 * smooth((state.current.local - 0.2) / 0.55)}
        />
        <ParticleField
          count={Math.round(70 * q) + 12}
          area={[1.6, 0.22, 0.42]}
          center={[3.4, 1.38, -1.3]}
          colorA="#1b1510"
          colorB="#e8a33d"
          size={0.7}
          life={2.4}
          shape="speck"
          spread={0.18}
          blending={THREE.NormalBlending}
          getIntensity={() => 0.28 * bell(state.current.local)}
        />

        <pointLight position={[-4.6, 3.0, 1.25]} color="#f2c98a" intensity={18} distance={13} decay={1.9} />
        <pointLight position={[4.4, 3.2, 1.4]} color="#e8a33d" intensity={18} distance={13} decay={1.9} />
      </group>
      <pointLight position={[0, 4.4, 2.2]} color="#d6c4a2" intensity={10} distance={18} decay={2} />
    </group>
  );
}
