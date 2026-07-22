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
  emissiveIntensity: 0.18,
});
const branchMat = createBarkMaterial({ color: "#2a1b12", roughness: 0.98, vertexColors: true }, { scale: 5 });
const leafMat = new THREE.MeshStandardMaterial({
  color: "#2e6b35",
  roughness: 0.85,
  vertexColors: true,
  emissive: "#102815",
  emissiveIntensity: 0.12,
  transparent: true,
  opacity: 0.34,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const groundMat = createForestFloorMaterial({ color: "#122016" });
const moundMat = createForestFloorMaterial({ color: "#182415", roughness: 0.98 });
const mossMat = new THREE.MeshStandardMaterial({
  color: "#2c3d20",
  roughness: 0.96,
  transparent: true,
  opacity: 0.16,
  depthWrite: false,
  side: THREE.DoubleSide,
});

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
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  void main() {
    float edge = 1.0 - abs(vUv.x - 0.5) * 2.0;
    float side = smoothstep(0.2, 0.92, edge);
    side *= side;
    float vertical = smoothstep(0.04, 0.28, vUv.y) * (1.0 - smoothstep(0.52, 0.98, vUv.y));
    float depthFade = mix(1.0, 0.18, smoothstep(0.15, 1.0, vUv.y));
    float streaks = noise(vec2(vUv.x * 4.0, vUv.y * 18.0));
    streaks = smoothstep(0.24, 0.92, streaks);
    float breakup = mix(0.5, 1.0, streaks) * (0.85 + 0.15 * noise(vUv * vec2(15.0, 7.0)));
    gl_FragColor = vec4(uColor, side * vertical * depthFade * breakup * uOpacity);
  }
`;

// three depth bands so the corridor reads with real parallax instead of one
// uniform random scatter — near trees large/warm, far trees small/cool/hazy.
const BANDS = [
  { zMin: -10, zMax: -19, weight: 0.22, scale: 1.0, tintL: 0.04 },
  { zMin: -19, zMax: -32, weight: 0.42, scale: 0.82, tintL: 0.0 },
  { zMin: -30, zMax: -45, weight: 0.34, scale: 0.58, tintL: -0.08 },
];

/** Builds one of three trunk silhouette variants: straight, left-lean bend,
 *  right-lean bend — baked into the geometry so instancing still varies. */
function buildTrunkGeometry(bend: number, flareBase: number) {
  const geo = new THREE.CylinderGeometry(0.42, flareBase, 1, 14, 14);
  const p = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const t = v.y + 0.5; // 0 at base, 1 at top
    const root = smooth(1.0 - t);
    const taper = THREE.MathUtils.lerp(1.18, 0.72, t);
    const rootFlare = 1.0 + root * root * 0.52;
    const section = 1.0 + Math.sin(t * 24.0) * 0.018;
    const sway = Math.sin(t * Math.PI * 0.45) * bend;
    p.setXYZ(i, v.x * taper * rootFlare * section + sway, v.y, v.z * taper * rootFlare * section + sway * 0.26);
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
  const mounds = useRef<THREE.InstancedMesh>(null);
  const moss = useRef<THREE.InstancedMesh>(null);
  const rayMats = useRef<THREE.ShaderMaterial[]>([]);
  const fillNear = useRef<THREE.PointLight>(null);

  const total = quality.tier === 0 ? 24 : 44;
  const canopyCount = total * (quality.tier === 0 ? 2 : 3);
  const branchCount = quality.tier === 0 ? 44 : 104;
  const leafCount = quality.tier === 0 ? 46 : 116;
  const moundCount = quality.tier === 0 ? 10 : 18;
  const mossCount = quality.tier === 0 ? 16 : 30;
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
    if (meshes.some((m) => !m) || !canopies.current || !branches.current || !leaves.current || !mounds.current || !moss.current) return;

    const treeSlots: { x: number; z: number; h: number; r: number; band: number; hero?: boolean }[] = [];
    const variantCounters = [0, 0, 0];
    let guard = 0;

    const addTree = (x: number, zActual: number, h: number, r: number, bandIndex: number, hero = false) => {
      const variant = variantsUsed === 1 ? 0 : hero ? treeSlots.length % 3 : bandIndex === 0 ? treeSlots.length % 3 : Math.floor(Math.random() * 3);
      const mesh = meshes[variant] as THREE.InstancedMesh;
      if (variantCounters[variant] >= perVariant) return false;
      const slot = variantCounters[variant]++;
      O.position.set(x, h / 2, zActual);
      O.rotation.set(0, Math.random() * Math.PI, 0);
      O.scale.set(r, h, r);
      O.updateMatrix();
      mesh.setMatrixAt(slot, O.matrix);
      C.setHSL(0.075 + Math.random() * 0.035, 0.2 + Math.random() * 0.12, 0.2 + Math.random() * 0.2 + BANDS[bandIndex].tintL);
      mesh.setColorAt(slot, C);
      treeSlots.push({ x, z: zActual, h, r, band: bandIndex, hero });
      return true;
    };

    [
      { x: -10.5, z: -14.5, h: 15.5, r: 0.34, band: 0 },
      { x: 12.8, z: -24.5, h: 12.8, r: 0.25, band: 1 },
      { x: -16.5, z: -31.5, h: 12.4, r: 0.24, band: 2 },
    ].forEach((t) => addTree(t.x, t.z, t.h, t.r, t.band, true));

    while (treeSlots.length < total && guard++ < total * 30) {
      const roll = Math.random();
      const bandIndex = roll < BANDS[0].weight ? 0 : roll < BANDS[0].weight + BANDS[1].weight ? 1 : 2;
      const band = BANDS[bandIndex];
      const side = Math.random() < 0.5 ? -1 : 1;
      const corridor = THREE.MathUtils.lerp(10.5, 25 + bandIndex * 6, Math.random());
      const x = side * corridor + (Math.random() - 0.5) * 3.2;
      const zActual = THREE.MathUtils.lerp(band.zMin, band.zMax, Math.random());
      if (zActual > -20 && x > -7 && x < 9) continue;
      if (zActual > -12 && Math.abs(x) < 12) continue;

      const h = (9 + Math.random() * 7) * band.scale;
      const r = (0.22 + Math.random() * 0.22) * band.scale;
      addTree(x, zActual, h, r, bandIndex);
    }

    trunkRefs.slice(0, variantsUsed).forEach((ref, i) => {
      const mesh = ref.current!;
      mesh.count = variantCounters[i];
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });

    for (let i = 0; i < canopyCount; i++) {
      const t = treeSlots[i % treeSlots.length];
      const cluster = i % (quality.tier === 0 ? 2 : 3);
      const crownY = t.h * (cluster === 0 ? 0.88 : 0.7 + Math.random() * 0.18);
      const foregroundScale = t.z > -14 ? 0.34 : 0.62;
      const anchor = cluster === 0 ? 1.4 : 3.2;
      O.position.set(
        t.x + (Math.random() - 0.5) * t.r * anchor,
        crownY,
        t.z + (Math.random() - 0.5) * t.r * anchor
      );
      O.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      O.scale.set(
        t.r * foregroundScale * (1.8 + Math.random() * 1.5),
        t.r * foregroundScale * (1.0 + Math.random() * 0.9),
        t.r * foregroundScale * (1.8 + Math.random() * 1.4)
      );
      O.updateMatrix();
      canopies.current.setMatrixAt(i, O.matrix);
      C.setHSL(0.29 + Math.random() * 0.08, 0.38 + Math.random() * 0.18, 0.22 + Math.random() * 0.24 + BANDS[t.band].tintL * 0.6);
      canopies.current.setColorAt(i, C);
    }

    for (let i = 0; i < branchCount; i++) {
      const t = treeSlots[i % treeSlots.length];
      const y = t.h * (0.38 + Math.random() * 0.46);
      const a = Math.random() * Math.PI * 2;
      const heroBranch = t.hero && i % 4 === 0;
      const len = heroBranch ? 3.2 + Math.random() * 2.2 : 1.1 + Math.random() * 2.6;
      AXIS.set(Math.cos(a) * len, 0.18 + Math.random() * 1.1, Math.sin(a) * len).normalize();
      O.position.set(t.x + AXIS.x * len * 0.45, y + AXIS.y * len * 0.45, t.z + AXIS.z * len * 0.45);
      O.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), AXIS);
      O.scale.set(0.026 + Math.random() * (heroBranch ? 0.06 : 0.03), len, 0.026 + Math.random() * (heroBranch ? 0.06 : 0.03));
      O.updateMatrix();
      branches.current.setMatrixAt(i, O.matrix);
      C.setHSL(0.08, 0.2, 0.16 + Math.random() * 0.1);
      branches.current.setColorAt(i, C);
    }

    for (let i = 0; i < leafCount; i++) {
      const near = Math.random() < 0.2;
      O.position.set(
        (Math.random() - 0.5) * (near ? 14 : 36),
        0.8 + Math.random() * (near ? 2.2 : 6.2),
        (Math.random() - 0.5) * (near ? 12 : 34) - 4
      );
      O.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const s = near ? 0.04 + Math.random() * 0.08 : 0.035 + Math.random() * 0.085;
      O.scale.set(s * 0.7, s, s);
      O.updateMatrix();
      leaves.current.setMatrixAt(i, O.matrix);
      C.setHSL(0.28 + Math.random() * 0.1, 0.44 + Math.random() * 0.2, 0.26 + Math.random() * 0.28);
      leaves.current.setColorAt(i, C);
    }

    for (let i = 0; i < moundCount; i++) {
      O.position.set((Math.random() - 0.5) * 34, 0.03, -4 - Math.random() * 34);
      O.rotation.set(0, Math.random() * Math.PI, 0);
      O.scale.set(0.7 + Math.random() * 1.8, 0.03 + Math.random() * 0.07, 0.45 + Math.random() * 1.1);
      O.updateMatrix();
      mounds.current.setMatrixAt(i, O.matrix);
    }

    for (let i = 0; i < mossCount; i++) {
      O.position.set((Math.random() - 0.5) * 28, 0.045, -2 - Math.random() * 30);
      O.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI);
      O.scale.set(0.45 + Math.random() * 1.6, 0.3 + Math.random() * 0.9, 1);
      O.updateMatrix();
      moss.current.setMatrixAt(i, O.matrix);
    }

    canopies.current.instanceMatrix.needsUpdate = true;
    if (canopies.current.instanceColor) canopies.current.instanceColor.needsUpdate = true;
    branches.current.instanceMatrix.needsUpdate = true;
    if (branches.current.instanceColor) branches.current.instanceColor.needsUpdate = true;
    leaves.current.instanceMatrix.needsUpdate = true;
    if (leaves.current.instanceColor) leaves.current.instanceColor.needsUpdate = true;
    mounds.current.instanceMatrix.needsUpdate = true;
    moss.current.instanceMatrix.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, canopyCount, branchCount, leafCount, moundCount, mossCount, perVariant, variantsUsed, quality.tier]);

  useFrame(() => {
    if (!state.current.active) return;
    // rays reveal on arrival and settle for the dwell — not static
    const reveal = 0.22 + 0.4 * bell(state.current.local);
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
      <instancedMesh ref={mounds} args={[undefined, undefined, moundCount]} material={moundMat}>
        <sphereGeometry args={[1, 8, 4]} />
      </instancedMesh>
      <instancedMesh ref={moss} args={[undefined, undefined, mossCount]} material={mossMat}>
        <circleGeometry args={[1, 10]} />
      </instancedMesh>

      {/* god-light shafts — radial-falloff shader, revealed on arrival */}
      <group>
        {[[-6, -8, -0.24, 1.35, 0.05], [0, -15, -0.16, 1.75, 0.052], [6, -9, -0.3, 1.45, 0.046], [11, -18, -0.2, 0.78, 0.026]].map(([x, z, tilt, width, opacity], i) => (
          <mesh key={i} position={[x, 7.2, z]} rotation={[0, 0.28 * i, tilt]}>
            <planeGeometry args={[width, 13.5]} />
            <shaderMaterial
              ref={(m) => {
                if (m) rayMats.current[i] = m;
              }}
              vertexShader={RAY_VERT}
              fragmentShader={RAY_FRAG}
              uniforms={{ uColor: { value: new THREE.Color("#c8d9a3") }, uOpacity: { value: opacity } }}
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

      <pointLight position={[-5, 8, 4]} color="#c8d9a3" intensity={8} distance={22} decay={1.7} />
      <pointLight position={[8, 4.5, -8]} color="#8fae67" intensity={4} distance={18} decay={1.8} />
      <pointLight ref={fillNear} position={[3, 3, 8]} color="#c8d9a3" distance={16} decay={2} />

      {/* drifting spores — far layer */}
      <ParticleField
        count={Math.round(210 * quality.particleScale) + 30}
        area={[18, 6, 16]}
        center={[2, 3.8, -2]}
        colorA="#d8e4b8"
        colorB="#8fae67"
        size={0.34}
        life={9}
        rise={0.12}
        spread={0.2}
        curl={0.5}
        getIntensity={() => 0.35 + 0.5 * bell(state.current.local)}
      />
      {/* fine pollen motes — near layer, close to the camera path */}
      <ParticleField
        count={Math.round(80 * quality.particleScale) + 12}
        area={[6, 2.5, 5]}
        center={[3, 2.2, 6]}
        colorA="#e6edd0"
        colorB="#c8d9a3"
        size={0.16}
        life={6}
        rise={0.05}
        spread={0.12}
        curl={0.3}
        getIntensity={() => 0.5 * bell(state.current.local)}
      />
    </group>
  );
}
