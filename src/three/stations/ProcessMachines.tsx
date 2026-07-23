"use client";

import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";
import { Conveyor, JumboBag } from "../kit/machines";
import { Chips, PelletBed } from "../kit/biomass";
import { M } from "../kit/industrial";

type GroupProps = ThreeElements["group"];

export const creamMat = new THREE.MeshStandardMaterial({
  color: "#d9ceb4",
  roughness: 0.58,
  metalness: 0.08,
});

export const greenMat = new THREE.MeshStandardMaterial({
  color: "#2d7c57",
  roughness: 0.48,
  metalness: 0.28,
});

export const fadedSignMat = new THREE.MeshStandardMaterial({
  color: "#1c86c8",
  emissive: "#0c5c86",
  emissiveIntensity: 0.18,
  roughness: 0.5,
  metalness: 0.05,
});

export function GreenSupportFrame({
  width = 9,
  depth = 3,
  height = 4,
  bays = 3,
  ...props
}: { width?: number; depth?: number; height?: number; bays?: number } & GroupProps) {
  const xs = Array.from({ length: bays + 1 }, (_, i) => -width / 2 + (i * width) / bays);
  return (
    <group {...props}>
      {xs.flatMap((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, height / 2, (z * depth) / 2]} material={greenMat}>
            <boxGeometry args={[0.12, height, 0.12]} />
          </mesh>
        ))
      )}
      {[0.75, height - 0.15].flatMap((y) =>
        [-1, 1].map((z) => (
          <mesh key={`${y}-${z}`} position={[0, y, (z * depth) / 2]} material={greenMat}>
            <boxGeometry args={[width + 0.25, 0.12, 0.12]} />
          </mesh>
        ))
      )}
      {xs.map((x) => (
        <mesh key={`cross-${x}`} position={[x, height * 0.46, 0]} rotation={[0, 0, 0.48]} material={greenMat}>
          <boxGeometry args={[0.1, height * 0.92, 0.1]} />
        </mesh>
      ))}
      <mesh position={[0, height + 0.04, 0]} material={M.housing}>
        <boxGeometry args={[width + 0.7, 0.12, depth + 0.35]} />
      </mesh>
    </group>
  );
}

export function SafetySign({ width = 5.2, ...props }: { width?: number } & GroupProps) {
  return (
    <group {...props}>
      <mesh material={fadedSignMat}>
        <boxGeometry args={[width, 0.08, 0.62]} />
      </mesh>
      <mesh position={[-width * 0.17, 0.05, 0.01]} material={M.panel}>
        <boxGeometry args={[width * 0.48, 0.035, 0.08]} />
      </mesh>
      <mesh position={[width * 0.24, 0.05, 0.01]} material={M.safetyYellow}>
        <boxGeometry args={[width * 0.28, 0.035, 0.08]} />
      </mesh>
    </group>
  );
}

export function SquareHopper({ ...props }: GroupProps) {
  return (
    <group {...props}>
      <mesh position={[0, 0.72, 0]} material={creamMat}>
        <cylinderGeometry args={[0.92, 0.48, 1.35, 4, 1, false]} />
      </mesh>
      <mesh position={[0, 1.48, 0]} material={creamMat}>
        <boxGeometry args={[1.65, 0.18, 1.35]} />
      </mesh>
      <mesh position={[0.01, 0.88, 0.69]} material={M.steel}>
        <boxGeometry args={[0.34, 0.48, 0.035]} />
      </mesh>
    </group>
  );
}

export function CreamHammerMill({
  active = false,
  ...props
}: { active?: boolean } & GroupProps) {
  return (
    <group {...props}>
      <mesh position={[0, 1.05, 0]} material={creamMat}>
        <cylinderGeometry args={[0.72, 0.92, 1.4, 10]} />
      </mesh>
      <mesh position={[0, 1.82, 0]} material={creamMat}>
        <boxGeometry args={[1.32, 0.76, 1.12]} />
      </mesh>
      <mesh position={[0, 1.92, 0.61]} material={creamMat}>
        <boxGeometry args={[1.02, 0.58, 0.18]} />
      </mesh>
      <mesh position={[0, 1.94, 0.73]} rotation={[Math.PI / 2, 0, 0]} material={M.dark}>
        <cylinderGeometry args={[0.28, 0.28, 0.16, 16]} />
      </mesh>
      <mesh position={[0, 0.24, 0]} material={creamMat}>
        <boxGeometry args={[1.1, 0.42, 1.0]} />
      </mesh>
      <mesh position={[1.12, 0.86, 0]} rotation={[0, 0, Math.PI / 2]} material={M.dark}>
        <cylinderGeometry args={[0.46, 0.46, 1.15, 14]} />
      </mesh>
      <mesh position={[0.7, 0.92, 0]} material={M.housing}>
        <boxGeometry args={[0.12, 0.92, 1.18]} />
      </mesh>
      <mesh position={[0, 2.52, 0]} material={greenMat}>
        <boxGeometry args={[1.8, 0.14, 1.3]} />
      </mesh>
      <mesh position={[0, 3.05, 0]}>
        <SquareHopper />
      </mesh>
      <mesh position={[-0.52, 1.58, 0.75]} material={active ? M.emberGlow : M.steel}>
        <boxGeometry args={[0.08, 0.26, 0.06]} />
      </mesh>
    </group>
  );
}

export function MillBank({
  count = 4,
  active = false,
  showSign = true,
  ...props
}: { count?: number; active?: boolean; showSign?: boolean } & GroupProps) {
  const spacing = 2.4;
  const width = Math.max(1, count - 1) * spacing + 2.4;
  return (
    <group {...props}>
      <GreenSupportFrame width={width + 1.4} depth={3.1} height={4.2} bays={count} />
      <mesh position={[0, 3.35, 0.96]} rotation={[Math.PI / 2, 0, Math.PI / 2]} material={creamMat}>
        <cylinderGeometry args={[0.16, 0.16, width + 1, 12]} />
      </mesh>
      {Array.from({ length: count }, (_, i) => {
        const x = (i - (count - 1) / 2) * spacing;
        return (
          <group key={i} position={[x, 0, 0]}>
            <CreamHammerMill active={active && i === Math.floor(count / 2)} />
            <mesh position={[0, 2.95, 0.88]} rotation={[0.8, 0, 0]} material={creamMat}>
              <cylinderGeometry args={[0.14, 0.14, 1.1, 10]} />
            </mesh>
          </group>
        );
      })}
      {showSign && <SafetySign width={width} position={[0, 5.05, 1.62]} />}
    </group>
  );
}

export function LargeBufferSilo({ ...props }: GroupProps) {
  return (
    <group {...props}>
      <GreenSupportFrame width={5.2} depth={4.2} height={5.4} bays={2} />
      <mesh position={[0, 3.5, 0]} material={creamMat}>
        <boxGeometry args={[4.2, 2.5, 3.4]} />
      </mesh>
      <mesh position={[0, 1.84, 0]} material={creamMat}>
        <cylinderGeometry args={[1.25, 2.0, 1.8, 4]} />
      </mesh>
      <mesh position={[0, 0.58, 0]} material={creamMat}>
        <cylinderGeometry args={[0.34, 0.55, 0.92, 4]} />
      </mesh>
      <mesh position={[-2.92, 2.8, 1.92]} rotation={[0, 0, -0.72]} material={greenMat}>
        <boxGeometry args={[0.12, 4.2, 0.1]} />
      </mesh>
      <mesh position={[-2.55, 3.18, 1.92]} material={greenMat}>
        <boxGeometry args={[0.62, 0.1, 0.1]} />
      </mesh>
      <mesh position={[1.2, 4.92, 1.84]} material={M.steel}>
        <boxGeometry args={[1.2, 0.08, 0.08]} />
      </mesh>
    </group>
  );
}

export function CyclonePair({ ...props }: GroupProps) {
  return (
    <group {...props}>
      {[-0.55, 0.55].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 3.2, 0]} material={creamMat}>
            <cylinderGeometry args={[0.48, 0.62, 2.4, 14]} />
          </mesh>
          <mesh position={[0, 1.75, 0]} material={creamMat}>
            <cylinderGeometry args={[0.12, 0.48, 0.9, 14]} />
          </mesh>
          <mesh position={[0, 4.65, 0]} material={creamMat}>
            <cylinderGeometry args={[0.22, 0.22, 0.85, 12]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 3.9, 0]} rotation={[0, 0, Math.PI / 2]} material={creamMat}>
        <cylinderGeometry args={[0.18, 0.18, 1.7, 12]} />
      </mesh>
    </group>
  );
}

export function RecoveryScreenLine({
  bagCount = 4,
  ...props
}: { bagCount?: number } & GroupProps) {
  return (
    <group {...props}>
      <GreenSupportFrame width={10.5} depth={3.2} height={3.35} bays={4} />
      <Conveyor position={[0, 1.3, 0.15]} length={10.6} width={0.8} height={0.25} speed={0.85} />
      {Array.from({ length: bagCount }, (_, i) => {
        const x = -4.0 + i * (8 / Math.max(1, bagCount - 1));
        return (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, 2.65, 0]} material={creamMat}>
              <boxGeometry args={[1.65, 1.45, 1.35]} />
            </mesh>
            <mesh position={[0, 1.85, 0.72]} rotation={[0.35, 0, 0]} material={creamMat}>
              <boxGeometry args={[1.1, 0.16, 0.95]} />
            </mesh>
            <mesh position={[0, 0.02, 0.48]} scale={[1.15, 1.2, 1.15]}>
              <JumboBag fill={0.62 + i * 0.08} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function InclinedFeedBelt({
  length = 8,
  ...props
}: { length?: number } & GroupProps) {
  return (
    <group {...props}>
      <Conveyor length={length} width={0.92} height={0.28} speed={0.9} />
      <mesh position={[0, 0.68, -0.58]} material={M.steel}>
        <boxGeometry args={[length, 0.08, 0.08]} />
      </mesh>
      <mesh position={[0, 0.68, 0.58]} material={M.steel}>
        <boxGeometry args={[length, 0.08, 0.08]} />
      </mesh>
    </group>
  );
}

export function FinishedBagStack({ ...props }: GroupProps) {
  return (
    <group {...props}>
      {Array.from({ length: 10 }, (_, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        return (
          <group key={i} position={[col * 1.05, row * 0.82, (i % 4) * 0.16]}>
            <JumboBag fill={0.92} />
          </group>
        );
      })}
    </group>
  );
}

export function MaterialPile({ kind = "chips", ...props }: { kind?: "chips" | "pellets" } & GroupProps) {
  if (kind === "pellets") {
    return <PelletBed count={260} area={[1.6, 0.3, 1.0]} {...props} />;
  }
  return <Chips count={90} area={[1.4, 0.22, 0.8]} {...props} />;
}
