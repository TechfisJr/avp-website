"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { M } from "./industrial";
import { createLogEndMaterial } from "../visual/materials";

type GroupProps = Omit<ThreeElements["group"], "args" | "children" | "count">;

const O = new THREE.Object3D();
const C = new THREE.Color();
const AXIS = new THREE.Vector3();
const CAP_POS = new THREE.Vector3();
const logEndMat = createLogEndMaterial();

/** Log pile — instanced bark cylinders; optional scroll-driven assembly. */
export function Logs({
  count = 26,
  getAssemble,
  ...props
}: { count?: number; getAssemble?: () => number } & GroupProps) {
  const inst = useRef<THREE.InstancedMesh>(null);
  const capA = useRef<THREE.InstancedMesh>(null);
  const capB = useRef<THREE.InstancedMesh>(null);

  const barkGeometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(1, 0.96, 1, 18, 8, true);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const theta = Math.atan2(v.z, v.x);
      const ridges = 1 + 0.04 * Math.sin(theta * 8 + v.y * 9) + 0.025 * Math.sin(theta * 17);
      p.setXYZ(i, v.x * ridges, v.y, v.z * ridges);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  const capGeometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(1, 1, 0.055, 24, 1);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const d = Math.sqrt(v.x * v.x + v.z * v.z);
      if (d > 0.1) {
        const theta = Math.atan2(v.z, v.x);
        const ridges = 1 + 0.04 * Math.sin(theta * 8) + 0.025 * Math.sin(theta * 17);
        p.setXYZ(i, v.x * ridges, v.y, v.z * ridges);
      }
    }
    g.computeVertexNormals();
    return g;
  }, []);

  const slots = useMemo(() => {
    const out: { pos: THREE.Vector3; rot: number; scatter: THREE.Vector3; len: number; r: number }[] = [];
    let n = 0;
    for (let row = 0; row < 5 && n < count; row++) {
      const inRow = 7 - row;
      for (let k = 0; k < inRow && n < count; k++) {
        const r = 0.24 + Math.random() * 0.18;
        out.push({
          pos: new THREE.Vector3((k - inRow / 2) * 0.68 + row * 0.3, 0.3 + row * 0.52, (Math.random() - 0.5) * 0.4),
          rot: (Math.random() - 0.5) * 0.12,
          scatter: new THREE.Vector3((Math.random() - 0.5) * 14, 4 + Math.random() * 6, (Math.random() - 0.5) * 14),
          len: 3.0 + Math.random() * 2.2,
          r,
        });
        n++;
      }
    }
    return out;
  }, [count]);

  useLayoutEffect(() => {
    if (!capA.current || !capB.current) return;
    slots.forEach((_, i) => {
      const l = 0.82 + Math.random() * 0.3;
      C.setRGB(l, l * (0.96 + Math.random() * 0.06), l * (0.88 + Math.random() * 0.08));
      capA.current!.setColorAt(i, C);
      capB.current!.setColorAt(i, C);
    });
    if (capA.current.instanceColor) capA.current.instanceColor.needsUpdate = true;
    if (capB.current.instanceColor) capB.current.instanceColor.needsUpdate = true;
  }, [slots]);

  useFrame(() => {
    const a = getAssemble ? getAssemble() : 1;
    if (!inst.current) return;
    slots.forEach((s, i) => {
      const e = a; // already eased by caller
      O.position.lerpVectors(s.scatter, s.pos, e);
      O.rotation.set(0, s.rot, Math.PI / 2 + (1 - e) * 1.8);
      O.scale.set(s.r, s.len, s.r);
      O.updateMatrix();
      inst.current!.setMatrixAt(i, O.matrix);

      AXIS.set(0, 1, 0).applyEuler(O.rotation).normalize();
      CAP_POS.copy(O.position).addScaledVector(AXIS, s.len * 0.5);
      O.position.copy(CAP_POS);
      O.scale.set(s.r * 0.98, 1, s.r * 0.98);
      O.updateMatrix();
      capA.current?.setMatrixAt(i, O.matrix);

      CAP_POS.copy(O.position).addScaledVector(AXIS, -s.len);
      O.position.copy(CAP_POS);
      O.updateMatrix();
      capB.current?.setMatrixAt(i, O.matrix);
    });
    inst.current.instanceMatrix.needsUpdate = true;
    if (capA.current) capA.current.instanceMatrix.needsUpdate = true;
    if (capB.current) capB.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group {...props}>
      <instancedMesh ref={inst} args={[barkGeometry, undefined, slots.length]} material={M.bark} />
      <instancedMesh ref={capA} args={[capGeometry, undefined, slots.length]} material={logEndMat} />
      <instancedMesh ref={capB} args={[capGeometry, undefined, slots.length]} material={logEndMat} />
    </group>
  );
}

/** Wood chips — instanced angular shards. */
export function Chips({
  count = 160,
  area = [2.4, 0.5, 1.6] as [number, number, number],
  ...props
}: { count?: number; area?: [number, number, number] } & GroupProps) {
  const instanceCount: number = count ?? 160;
  const inst = useRef<THREE.InstancedMesh>(null);
  const chipGeometry = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 0.16, 0.34, 2, 1, 1);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      p.setXYZ(
        i,
        v.x + (Math.random() - 0.5) * 0.18,
        v.y + (Math.random() - 0.5) * 0.04,
        v.z + (Math.random() - 0.5) * 0.14
      );
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useLayoutEffect(() => {
    if (!inst.current) return;
    for (let i = 0; i < instanceCount; i++) {
      O.position.set(
        (Math.random() - 0.5) * 2 * area[0],
        Math.random() * area[1],
        (Math.random() - 0.5) * 2 * area[2]
      );
      O.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const s = 0.12 + Math.random() * 0.18;
      O.scale.set(s * (0.8 + Math.random() * 1.8), s * 0.5, s * (0.5 + Math.random() * 1.2));
      O.updateMatrix();
      inst.current.setMatrixAt(i, O.matrix);
      C.setHSL(0.075 + Math.random() * 0.025, 0.38 + Math.random() * 0.18, 0.28 + Math.random() * 0.28);
      inst.current.setColorAt(i, C);
    }
    inst.current.instanceMatrix.needsUpdate = true;
    if (inst.current.instanceColor) inst.current.instanceColor.needsUpdate = true;
  }, [instanceCount, area]);
  return (
    <instancedMesh ref={inst} args={[chipGeometry, undefined, instanceCount]} material={M.chip} {...props} />
  );
}

/** Dense pellet bed — the money shot in cooling/QC. */
export function PelletBed({
  count = 1500,
  area = [2.2, 0.35, 2.2] as [number, number, number],
  ...props
}: { count?: number; area?: [number, number, number] } & GroupProps) {
  const instanceCount: number = count ?? 1500;
  const inst = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!inst.current) return;
    for (let i = 0; i < instanceCount; i++) {
      O.position.set(
        (Math.random() - 0.5) * 2 * area[0],
        Math.random() * area[1],
        (Math.random() - 0.5) * 2 * area[2]
      );
      O.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI * 0.3);
      O.scale.setScalar(1);
      O.updateMatrix();
      inst.current.setMatrixAt(i, O.matrix);
      C.setHSL(0.075, 0.5 + Math.random() * 0.1, 0.3 + Math.random() * 0.18);
      inst.current.setColorAt(i, C);
    }
    inst.current.instanceMatrix.needsUpdate = true;
    if (inst.current.instanceColor) inst.current.instanceColor.needsUpdate = true;
  }, [instanceCount, area]);
  return (
    <instancedMesh ref={inst} args={[undefined, undefined, instanceCount]} material={M.pellet} {...props}>
      <cylinderGeometry args={[0.035, 0.035, 0.15, 8, 1, false]} />
    </instancedMesh>
  );
}

/** A few helix wood shavings — garnish near piles. */
export function Shavings({ count = 8, ...props }: { count?: number } & GroupProps) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const a = i * 0.5;
      pts.push(new THREE.Vector3(Math.cos(a) * 0.12, i * 0.012, Math.sin(a) * 0.12));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.015, 5, false);
  }, []);
  const placements = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        p: [(Math.random() - 0.5) * 5, 0.05, (Math.random() - 0.5) * 4] as [number, number, number],
        r: Math.random() * Math.PI,
      })),
    [count]
  );
  return (
    <group {...props}>
      {placements.map((s, i) => (
        <mesh key={i} geometry={geo} material={M.woodEnd} position={s.p} rotation={[Math.PI / 2, 0, s.r]} />
      ))}
    </group>
  );
}
