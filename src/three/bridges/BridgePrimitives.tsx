"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { M } from "../kit/industrial";
import {
  createBarkMaterial,
  createBlackPelletMaterial,
  createHotPelletMaterial,
  createLogEndMaterial,
  createPelletMaterial,
  createWoodMaterial,
} from "../visual/materials";

type PelletTone = "wood" | "hot" | "black";

const bridgeBarkMat = createBarkMaterial({
  color: "#7f4d27",
  emissive: "#2a1304",
  emissiveIntensity: 0.08,
  envMapIntensity: 0.18,
});
const logEndMat = createLogEndMaterial({ color: "#d4ae78", emissive: "#2b1706", emissiveIntensity: 0.08 });
const fiberMat = createWoodMaterial({ color: "#c59a62", roughness: 0.92 }, { scale: 18, colorVar: 0.14 });
const dryFiberMat = createWoodMaterial({ color: "#d2b078", roughness: 0.88 }, { scale: 22, colorVar: 0.1 });
const conditionedMat = createWoodMaterial({ color: "#a9743e", roughness: 0.82 }, { scale: 16, colorVar: 0.12 });
const bridgeChipMat = createWoodMaterial({ color: "#b98245", roughness: 0.88 }, { scale: 12, colorVar: 0.12 });
const woodPelletMat = createPelletMaterial({ color: "#9c6a33", roughness: 0.74 });
const hotPelletMat = createHotPelletMaterial();
const blackPelletMat = createBlackPelletMaterial();

dryFiberMat.side = THREE.DoubleSide;
conditionedMat.side = THREE.DoubleSide;

function materialForTone(tone: PelletTone) {
  if (tone === "hot") return hotPelletMat;
  if (tone === "black") return blackPelletMat;
  return woodPelletMat;
}

export function BridgeLog({
  length = 1.9,
  radius = 0.16,
}: {
  length?: number;
  radius?: number;
}) {
  const barkGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(1, 0.94, 1, 16, 5, true);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const theta = Math.atan2(v.z, v.x);
      const ridge = 1 + 0.035 * Math.sin(theta * 9 + v.y * 7) + 0.018 * Math.sin(theta * 17);
      p.setXYZ(i, v.x * ridge, v.y, v.z * ridge);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group>
      <mesh geometry={barkGeo} material={bridgeBarkMat} rotation={[0, 0, Math.PI / 2]} scale={[radius, length, radius]} />
      <mesh position={[length / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={logEndMat} scale={[radius * 0.95, radius * 0.95, 0.035]}>
        <cylinderGeometry args={[1, 1, 1, 18]} />
      </mesh>
      <mesh position={[-length / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={logEndMat} scale={[radius * 0.95, radius * 0.95, 0.035]}>
        <cylinderGeometry args={[1, 1, 1, 18]} />
      </mesh>
    </group>
  );
}

export function BridgeChipStream({
  count = 18,
  scale = 1,
  spread = 1,
}: {
  count?: number;
  scale?: number;
  spread?: number;
}) {
  const chips = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const u = count === 1 ? 0 : i / (count - 1);
        return {
          p: [(u - 0.5) * spread, Math.sin(u * Math.PI) * 0.18 + (Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.28] as [
            number,
            number,
            number,
          ],
          r: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [
            number,
            number,
            number,
          ],
          s: 0.095 + Math.random() * 0.09,
        };
      }),
    [count, spread]
  );

  return (
    <group scale={scale}>
      {chips.map((chip, i) => (
        <mesh key={i} position={chip.p} rotation={chip.r} scale={[chip.s * 2.45, chip.s * 0.24, chip.s * 0.95]} material={bridgeChipMat}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      ))}
    </group>
  );
}

export function BridgeFiberCloud({
  count = 30,
  scale = 1,
  dry = false,
}: {
  count?: number;
  scale?: number;
  dry?: boolean;
}) {
  const fibers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = i * 2.399;
        const r = 0.12 + Math.sqrt(i / count) * 0.58;
        return {
          p: [Math.cos(a) * r, (Math.random() - 0.5) * 0.34, Math.sin(a) * r * 0.7] as [
            number,
            number,
            number,
          ],
          r: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [
            number,
            number,
            number,
          ],
          len: 0.32 + Math.random() * 0.42,
          thick: 0.018 + Math.random() * 0.014,
        };
      }),
    [count]
  );

  return (
    <group scale={scale}>
      {fibers.map((fiber, i) => (
        <mesh key={i} position={fiber.p} rotation={fiber.r} material={dry ? dryFiberMat : fiberMat}>
          <boxGeometry args={[fiber.len, fiber.thick, fiber.thick]} />
        </mesh>
      ))}
    </group>
  );
}

export function BridgeBiomassRibbon({
  count = 24,
  scale = 1,
  conditioned = false,
}: {
  count?: number;
  scale?: number;
  conditioned?: boolean;
}) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const u = count === 1 ? 0 : i / (count - 1);
        return {
          p: [(u - 0.5) * 1.85, Math.sin(u * Math.PI * 2) * 0.1 + (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.42] as [
            number,
            number,
            number,
          ],
          r: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [
            number,
            number,
            number,
          ],
          w: 0.09 + Math.random() * 0.08,
          l: 0.28 + Math.random() * 0.32,
        };
      }),
    [count]
  );

  return (
    <group scale={scale}>
      {pieces.map((piece, i) => (
        <mesh key={i} position={piece.p} rotation={piece.r} material={conditioned ? conditionedMat : dryFiberMat}>
          <planeGeometry args={[piece.l, piece.w]} />
        </mesh>
      ))}
    </group>
  );
}

export function BridgePelletCluster({
  count = 10,
  tone = "wood",
  radius = 0.28,
  scale = 1,
}: {
  count?: number;
  tone?: PelletTone;
  radius?: number;
  scale?: number;
}) {
  const pellets = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        const r = radius * (0.45 + (i % 4) * 0.18);
        return {
          p: [Math.cos(a) * r, (i % 4) * 0.045 - 0.08, Math.sin(a) * r * 0.72] as [
            number,
            number,
            number,
          ],
          rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [
            number,
            number,
            number,
          ],
        };
      }),
    [count, radius]
  );

  const material = materialForTone(tone);

  return (
    <group scale={scale}>
      {pellets.map((pellet, i) => (
        <mesh key={i} position={pellet.p} rotation={pellet.rot} material={material}>
          <cylinderGeometry args={[0.045, 0.045, 0.22, 9, 1, false]} />
        </mesh>
      ))}
    </group>
  );
}

export function ValueHalo({
  radius = 0.48,
  color = "#e8a33d",
}: {
  radius?: number;
  color?: string;
}) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#211006",
        emissive: color,
        emissiveIntensity: 0.65,
        roughness: 0.42,
        metalness: 0.08,
      }),
    [color]
  );

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={mat}>
        <torusGeometry args={[radius, 0.012, 6, 56]} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} material={mat}>
        <torusGeometry args={[radius * 0.78, 0.01, 6, 48]} />
      </mesh>
    </group>
  );
}
