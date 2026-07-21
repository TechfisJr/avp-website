"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATIONS, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { createBarkMaterial, createForestFloorMaterial } from "../visual/materials";

const I = 1;
const S = STATIONS[I];

const O = new THREE.Object3D();
const C = new THREE.Color();
const AXIS = new THREE.Vector3();

const trunkMat = createBarkMaterial({ color: "#4a3322", roughness: 0.96, vertexColors: true }, { scale: 2.4 });
const canopyMat = new THREE.MeshStandardMaterial({
  color: "#244a2a",
  roughness: 0.88,
  vertexColors: true,
  emissive: "#0c1a0e",
  emissiveIntensity: 0.28,
});
const branchMat = createBarkMaterial({ color: "#2a1b12", roughness: 0.98, vertexColors: true }, { scale: 5 });
const leafMat = new THREE.MeshStandardMaterial({
  color: "#2e6b35",
  roughness: 0.85,
  vertexColors: true,
  emissive: "#102815",
  emissiveIntensity: 0.32,
  side: THREE.DoubleSide,
});
const groundMat = createForestFloorMaterial({ color: "#122016" });

const RAY_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const RAY_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    float edge = 1.0 - abs(vUv.x - 0.5) * 2.0;
    float side = smoothstep(0.0, 0.55, edge);
    float vert = smoothstep(0.0, 0.12, vUv.y) * (1.0 - smoothstep(0.75, 1.0, vUv.y));
    gl_FragColor = vec4(uColor, side * vert * uOpacity);
  }
`;

// three depth bands so the corridor reads with real parallax instead of one
// uniform random scatter — near trees large/warm, far trees small/cool/hazy.
const BANDS = [
  { zMin: -3, zMax: -13, weight: 0.32, scale: 1.15, tintL: 0.06 },
  { zMin: -13, zMax: -26, weight: 0.4, scale: 0.85, tintL: 0.0 },
  { zMin: -26, zMax: -41, weight: 0.28, scale: 0.6, tintL: -0.08 },
];

/** Builds one of three trunk silhouette variants: straight, left-lean bend,
 *  right-lean bend — baked into the geometry so instancing still varies. */
function buildTrunkGeometry(bend: number, flareBase: number) {
  const geo = new THREE.CylinderGeometry(0.55, flareBase, 1, 12, 10);
  const p = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const t = v.y + 0.5; // 0 at base, 1 at top
    const sway = Math.sin(t * Math.PI * 0.5) * bend;
    p.setXYZ(i, v.x + sway, v.y, v.z + sway * 0.4);
  }
  geo.computeVertexNormals();
  return geo;
}

/** S01 — moonlit pine stand: three depth bands of instanced trunks/canopies,
 *  bent trunk silhouette variants, radial-falloff god-rays, layered particles. */
export default function Forest({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const trunkRefs = [useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null)];
  const canopies = useRef<THREE.InstancedMesh>(null);
  const branches = useRef<THREE.InstancedMesh>(null);
  const leaves = useRef<THREE.InstancedMesh>(null);
  const rayMats = useRef<THREE.ShaderMaterial[]>([]);
  const fillNear = useRef<THREE.PointLight>(null);

  const total = quality.tier === 0 ? 34 : 62;
  const canopyCount = total * (quality.tier === 0 ? 2 : 3);
  const branchCount = quality.tier === 0 ? 54 : 128;
  const leafCount = quality.tier === 0 ? 90 : 230;
  // tier 0: one trunk silhouette (one draw call) — silhouette variety costs
  // 3x the draw calls, only worth it once there's headroom (tier 1+).
  const variantsUsed = quality.tier === 0 ? 1 : 3;
  const perVariant = Math.ceil(total / variantsUsed);

  const trunkGeometries = useMemo(
    () => [buildTrunkGeometry(0, 1), buildTrunkGeometry(0.09, 1.15), buildTrunkGeometry(-0.07, 1.08)],
    []
  );

  useLayoutEffect(() => {
    const meshes = trunkRefs.slice(0, variantsUsed).map((r) => r.current);
    if (meshes.some((m) => !m) || !canopies.current || !branches.current || !leaves.current) return;

    const treeSlots: { x: number; z: number; h: number; r: number; band: number }[] = [];
    const variantCounters = [0, 0, 0];
    let guard = 0;

    while (treeSlots.length < total && guard++ < total * 30) {
      const roll = Math.random();
      const bandIndex = roll < BANDS[0].weight ? 0 : roll < BANDS[0].weight + BANDS[1].weight ? 1 : 2;
      const band = BANDS[bandIndex];
      const x = (Math.random() - 0.5) * (42 + bandIndex * 10);
      const zActual = THREE.MathUtils.lerp(band.zMin, band.zMax, Math.random());
      if (Math.abs(x - 4) < 4 && zActual > -6) continue;

      const variant = variantsUsed === 1 ? 0 : bandIndex === 0 ? treeSlots.length % 3 : Math.floor(Math.random() * 3);
      const mesh = meshes[variant] as THREE.InstancedMesh;
      if (variantCounters[variant] >= perVariant) continue;
      const slot = variantCounters[variant]++;

      const h = (9 + Math.random() * 7) * band.scale;
      const r = (0.22 + Math.random() * 0.22) * band.scale;
      O.position.set(x, h / 2, zActual);
      O.rotation.set(0, Math.random() * Math.PI, 0);
      O.scale.set(r, h, r);
      O.updateMatrix();
      mesh.setMatrixAt(slot, O.matrix);
      C.setHSL(0.075 + Math.random() * 0.035, 0.2 + Math.random() * 0.12, 0.2 + Math.random() * 0.2 + band.tintL);
      mesh.setColorAt(slot, C);

      treeSlots.push({ x, z: zActual, h, r, band: bandIndex });
    }

    trunkRefs.slice(0, variantsUsed).forEach((ref, i) => {
      const mesh = ref.current!;
      mesh.count = variantCounters[i];
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });

    for (let i = 0; i < canopyCount; i++) {
      const t = treeSlots[i % treeSlots.length];
      const crownY = t.h * (0.55 + Math.random() * 0.38);
      const foregroundScale = t.z > -12 ? 0.42 : 0.75;
      O.position.set(
        t.x + (Math.random() - 0.5) * t.r * 7,
        crownY,
        t.z + (Math.random() - 0.5) * t.r * 6
      );
      O.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      O.scale.set(
        t.r * foregroundScale * (2.2 + Math.random() * 2.5),
        t.r * foregroundScale * (1.2 + Math.random() * 1.6),
        t.r * foregroundScale * (2 + Math.random() * 2.3)
      );
      O.updateMatrix();
      canopies.current.setMatrixAt(i, O.matrix);
      C.setHSL(0.29 + Math.random() * 0.08, 0.38 + Math.random() * 0.18, 0.22 + Math.random() * 0.24 + BANDS[t.band].tintL * 0.6);
      canopies.current.setColorAt(i, C);
    }

    for (let i = 0; i < branchCount; i++) {
      const t = treeSlots[i % treeSlots.length];
      const y = t.h * (0.28 + Math.random() * 0.54);
      const a = Math.random() * Math.PI * 2;
      const len = 1.4 + Math.random() * 3.4;
      AXIS.set(Math.cos(a) * len, 0.3 + Math.random() * 1.5, Math.sin(a) * len).normalize();
      O.position.set(t.x + AXIS.x * len * 0.45, y + AXIS.y * len * 0.45, t.z + AXIS.z * len * 0.45);
      O.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), AXIS);
      O.scale.set(0.025 + Math.random() * 0.03, len, 0.025 + Math.random() * 0.03);
      O.updateMatrix();
      branches.current.setMatrixAt(i, O.matrix);
      C.setHSL(0.08, 0.2, 0.16 + Math.random() * 0.1);
      branches.current.setColorAt(i, C);
    }

    for (let i = 0; i < leafCount; i++) {
      const near = Math.random() < 0.45;
      O.position.set(
        (Math.random() - 0.5) * (near ? 24 : 44),
        0.5 + Math.random() * (near ? 3.2 : 7),
        (Math.random() - 0.5) * (near ? 18 : 40)
      );
      O.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const s = near ? 0.08 + Math.random() * 0.18 : 0.05 + Math.random() * 0.12;
      O.scale.set(s * 0.7, s, s);
      O.updateMatrix();
      leaves.current.setMatrixAt(i, O.matrix);
      C.setHSL(0.28 + Math.random() * 0.1, 0.44 + Math.random() * 0.2, 0.26 + Math.random() * 0.28);
      leaves.current.setColorAt(i, C);
    }

    canopies.current.instanceMatrix.needsUpdate = true;
    if (canopies.current.instanceColor) canopies.current.instanceColor.needsUpdate = true;
    branches.current.instanceMatrix.needsUpdate = true;
    if (branches.current.instanceColor) branches.current.instanceColor.needsUpdate = true;
    leaves.current.instanceMatrix.needsUpdate = true;
    if (leaves.current.instanceColor) leaves.current.instanceColor.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, canopyCount, branchCount, leafCount, perVariant, variantsUsed]);

  useFrame(() => {
    if (!state.current.active) return;
    // rays reveal on arrival and settle for the dwell — not static
    const reveal = 0.5 + 0.5 * bell(state.current.local);
    rayMats.current.forEach((m) => {
      if (m) m.uniforms.uOpacity.value = reveal;
    });
    // guarantees nearby trunks along the travel corridor are never left
    // silhouetted to near-black regardless of viewport crop / aspect ratio
    if (fillNear.current) {
      fillNear.current.intensity = 6 + 3 * smooth(state.current.local);
    }
  });

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={groundMat}>
        <circleGeometry args={[38, 32]} />
      </mesh>

      {trunkGeometries.slice(0, variantsUsed).map((geo, i) => (
        <instancedMesh key={i} ref={trunkRefs[i]} args={[geo, trunkMat, perVariant]} />
      ))}
      <instancedMesh ref={canopies} args={[undefined, undefined, canopyCount]} material={canopyMat}>
        <sphereGeometry args={[1, 10, 7]} />
      </instancedMesh>
      <instancedMesh ref={branches} args={[undefined, undefined, branchCount]} material={branchMat}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
      </instancedMesh>
      <instancedMesh ref={leaves} args={[undefined, undefined, leafCount]} material={leafMat}>
        <circleGeometry args={[1, 7]} />
      </instancedMesh>

      {/* god-light shafts — radial-falloff shader, revealed on arrival */}
      <group>
        {[[-7, -5, -0.32], [-1, -11, -0.2], [7, -2, -0.42], [13, -8, -0.28]].map(([x, z, tilt], i) => (
          <mesh key={i} position={[x, 7, z]} rotation={[0, 0.4 * i, tilt]}>
            <planeGeometry args={[2.6 + i * 0.8, 17]} />
            <shaderMaterial
              ref={(m) => {
                if (m) rayMats.current[i] = m;
              }}
              vertexShader={RAY_VERT}
              fragmentShader={RAY_FRAG}
              uniforms={{ uColor: { value: new THREE.Color("#d8efb7") }, uOpacity: { value: 0.14 } }}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* rear haze wall — reinforces depth without extra particle cost */}
      <mesh position={[0, 9, -40]} rotation={[0, 0, 0]}>
        <planeGeometry args={[90, 26]} />
        <meshBasicMaterial color="#0d1610" transparent opacity={0.55} depthWrite={false} />
      </mesh>

      <pointLight position={[-5, 8, 4]} color="#d8efb7" intensity={12} distance={22} decay={1.7} />
      <pointLight position={[8, 4.5, -8]} color="#7ba05b" intensity={5} distance={18} decay={1.8} />
      <pointLight ref={fillNear} position={[3, 3, 8]} color="#bcd79a" distance={16} decay={2} />

      {/* drifting spores — far layer */}
      <ParticleField
        count={Math.round(300 * quality.particleScale) + 40}
        area={[18, 6, 16]}
        center={[2, 3.8, -2]}
        colorA="#cfe3ac"
        colorB="#7ba05b"
        size={0.5}
        life={9}
        rise={0.12}
        spread={0.2}
        curl={0.5}
        getIntensity={() => 0.35 + 0.5 * bell(state.current.local)}
      />
      {/* fine pollen motes — near layer, close to the camera path */}
      <ParticleField
        count={Math.round(140 * quality.particleScale) + 20}
        area={[6, 2.5, 5]}
        center={[3, 2.2, 6]}
        colorA="#eef7d6"
        colorB="#cfe3ac"
        size={0.24}
        life={6}
        rise={0.05}
        spread={0.12}
        curl={0.3}
        getIntensity={() => 0.5 * bell(state.current.local)}
      />
    </group>
  );
}
