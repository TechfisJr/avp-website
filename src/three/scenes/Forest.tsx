"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { scroll, flags } from "@/lib/scrollStore";
import { PALETTE } from "@/lib/theme";
import Puffs from "../fx/Puffs";

const O = new THREE.Object3D();
const C = new THREE.Color();

const TRUNKS = 30;
const Z_NEAR = -6;
const Z_FAR = -70;

const RAY_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const RAY_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    float edge = 1.0 - abs(vUv.x - 0.5) * 2.0;
    float side = smoothstep(0.0, 0.6, edge);
    float vert = smoothstep(0.0, 0.15, vUv.y) * (1.0 - smoothstep(0.6, 1.0, vUv.y));
    gl_FragColor = vec4(uColor, side * side * vert * uOpacity);
  }
`;

/**
 * Scene 2 — a walk through a REAL forest. The forest itself is a photographed
 * HDRI sky (see Studio); this scene only adds the tangible near-field: a
 * textured forest floor underfoot and tall bark-textured trunks that slide past
 * on either side of the path to give real parallax as the camera walks forward.
 * Sun shafts + drifting dust tie the geometry into the HDRI light. Deliberately
 * few objects — the realism is in the photo, so this stays cheap.
 */
export default function Forest() {
  const group = useRef<THREE.Group>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  const rayMats = useRef<THREE.ShaderMaterial[]>([]);

  const [barkD, barkN, barkR, groundD, groundN, groundR] = useTexture([
    "/textures/bark/bark_brown_02_diff_1k.jpg",
    "/textures/bark/bark_brown_02_nor_gl_1k.jpg",
    "/textures/bark/bark_brown_02_rough_1k.jpg",
    "/textures/forest_ground_04/forest_ground_04_diff_1k.jpg",
    "/textures/forest_ground_04/forest_ground_04_nor_gl_1k.jpg",
    "/textures/forest_ground_04/forest_ground_04_rough_1k.jpg",
  ]);

  const { trunkMat, groundMat } = useMemo(() => {
    barkD.colorSpace = THREE.SRGBColorSpace;
    groundD.colorSpace = THREE.SRGBColorSpace;
    [barkD, barkN, barkR].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1, 5);
    });
    [groundD, groundN, groundR].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(16, 16);
      t.anisotropy = 8;
    });
    return {
      trunkMat: new THREE.MeshStandardMaterial({
        map: barkD,
        normalMap: barkN,
        roughnessMap: barkR,
        roughness: 0.95,
        metalness: 0,
      }),
      groundMat: new THREE.MeshStandardMaterial({
        map: groundD,
        normalMap: groundN,
        roughnessMap: groundR,
        roughness: 1,
        metalness: 0,
      }),
    };
  }, [barkD, barkN, barkR, groundD, groundN, groundR]);

  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.16, 0.34, 1, 10, 1), []);

  // trunks live on either side of the walking corridor (canopy is off-frame up
  // top, so we never show a bare pole — the HDRI supplies the leaves)
  const placements = useMemo(() => {
    const arr: { x: number; z: number; h: number; r: number }[] = [];
    for (let i = 0; i < TRUNKS; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const x = side * (4.5 + Math.random() * 12);
      const z = THREE.MathUtils.lerp(Z_NEAR, Z_FAR, Math.random());
      arr.push({ x, z, h: 14 + Math.random() * 8, r: 0.8 + Math.random() * 0.7 });
    }
    return arr;
  }, []);

  useLayoutEffect(() => {
    const tm = trunks.current;
    if (!tm) return;
    placements.forEach((t, i) => {
      O.position.set(t.x, t.h / 2 - 1, t.z);
      O.rotation.set((Math.random() - 0.5) * 0.05, Math.random() * Math.PI, (Math.random() - 0.5) * 0.05);
      O.scale.set(t.r, t.h, t.r);
      O.updateMatrix();
      tm.setMatrixAt(i, O.matrix);
      C.setHSL(0.08, 0.25, 0.32 + Math.random() * 0.1);
      tm.setColorAt(i, C);
    });
    tm.instanceMatrix.needsUpdate = true;
    if (tm.instanceColor) tm.instanceColor.needsUpdate = true;
  }, [placements]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const active = scroll.offset > 0.12 && scroll.offset < 0.48;
    if (g.visible !== active) g.visible = active;
    if (!active || flags.reducedMotion) return;
    const t = state.clock.elapsedTime;
    rayMats.current.forEach((m, i) => {
      if (m) m.uniforms.uOpacity.value = 0.12 + Math.sin(t * 0.4 + i) * 0.04;
    });
  });

  const shafts: [number, number, number][] = [
    [-6, -20, 0.16],
    [5, -34, 0.2],
    [-4, -48, 0.14],
    [3, -60, 0.2],
  ];

  return (
    <group ref={group}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1, (Z_NEAR + Z_FAR) / 2]}
        receiveShadow
        material={groundMat}
      >
        <planeGeometry args={[120, 100]} />
      </mesh>

      <instancedMesh ref={trunks} args={[trunkGeo, trunkMat, TRUNKS]} castShadow receiveShadow frustumCulled={false} />

      {shafts.map(([x, z, tilt], i) => (
        <mesh key={i} position={[x, 9, z]} rotation={[0, 0.3 * (i % 2 ? 1 : -1), tilt]}>
          <planeGeometry args={[4 + (i % 3), 22]} />
          <shaderMaterial
            ref={(m) => {
              if (m) rayMats.current[i] = m;
            }}
            vertexShader={RAY_VERT}
            fragmentShader={RAY_FRAG}
            uniforms={{ uColor: { value: new THREE.Color(PALETTE.sun) }, uOpacity: { value: 0.12 } }}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* soft warm sun rake for extra dapple on the trunks (HDRI does the rest) */}
      <directionalLight position={[-10, 14, -26]} intensity={0.8} color={PALETTE.sun} />

      <Puffs count={110} center={[0, 4, -36]} area={[22, 6, 28]} color={PALETTE.sun} rise={0.5} size={0.14} opacity={0.5} blending={THREE.AdditiveBlending} />
    </group>
  );
}
