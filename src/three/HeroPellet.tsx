"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { scroll } from "@/lib/scrollStore";
import { STATIONS, N, stationIndex, stationLocal, smooth, lerp, clamp01 } from "@/lib/timeline";
import { PELLET_VERT, PELLET_FRAG } from "./fx/shaders";

const off = new THREE.Vector3();
const MODEL_URL = "/images/wood_pallet.glb";
const TARGET_LENGTH = 1.9;
const INTRO_START_OFF: [number, number, number] = [0.18, -0.03, -3.42];

type PreparedPellet = {
  geometry: THREE.BufferGeometry;
  material: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
};

function preparePelletGeometry(source: THREE.BufferGeometry) {
  const geometry = source.clone();

  // The supplied GLB is authored along X; the hero shader/timeline expect the
  // pellet extrusion along Y for cap detection, fiber direction, and staging.
  geometry.rotateZ(Math.PI / 2);
  geometry.center();
  geometry.computeBoundingBox();

  const size = new THREE.Vector3();
  geometry.boundingBox?.getSize(size);
  const length = Math.max(size.y, 0.001);
  geometry.scale(TARGET_LENGTH / length, TARGET_LENGTH / length, TARGET_LENGTH / length);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();

  if (!geometry.getAttribute("color")) {
    const position = geometry.getAttribute("position");
    const colors = new Float32Array(position.count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < position.count; i++) {
      const y = position.getY(i);
      const x = position.getX(i);
      const z = position.getZ(i);
      const fiber = 0.5 + 0.5 * Math.sin(y * 28 + Math.atan2(z, x) * 7);
      const cap = Math.abs(y) > TARGET_LENGTH * 0.43 ? 0.08 : 0;
      color.setHSL(0.085, 0.34 + fiber * 0.08, 0.32 + fiber * 0.14 + cap);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }

  return geometry;
}

function preparePelletMaterial(source: THREE.Material | THREE.Material[] | undefined) {
  const base = Array.isArray(source) ? source[0] : source;
  const material =
    base instanceof THREE.MeshStandardMaterial || base instanceof THREE.MeshPhysicalMaterial
      ? base.clone()
      : new THREE.MeshStandardMaterial();

  material.name = "Wood pallet GLB hero material";
  material.color.multiplyScalar(0.82);
  material.metalness = 0.02;
  material.roughness = Math.max(material.roughness, 0.82);
  material.transparent = true;
  material.depthWrite = true;
  material.side = THREE.DoubleSide;
  material.needsUpdate = true;

  return material;
}

/**
 * The protagonist. Anchored in camera space so it stays perfectly framed;
 * staging (offset/scale/heat/green/char) interpolates between per-station
 * configs from timeline.ts. Dissolves into particles at the hero exit.
 */
export default function HeroPellet() {
  const group = useRef<THREE.Group>(null);
  const texturedMesh = useRef<THREE.Mesh>(null);
  const shaderMesh = useRef<THREE.Mesh>(null);
  const gltf = useGLTF(MODEL_URL);
  const prepared = useMemo<PreparedPellet | null>(() => {
    let found: PreparedPellet | null = null;
    gltf.scene.traverse((child) => {
      if (!found && (child as THREE.Mesh).isMesh) {
        const sourceMesh = child as THREE.Mesh;
        found = {
          geometry: preparePelletGeometry(sourceMesh.geometry),
          material: preparePelletMaterial(sourceMesh.material),
        };
      }
    });
    return found;
  }, [gltf.scene]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHeat: { value: 0 },
      uGreen: { value: 0 },
      uChar: { value: 0 },
      uDissolve: { value: 0 },
      uLightDir: { value: new THREE.Vector3(0.5, 0.8, 0.6) },
    }),
    []
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = scroll.t;
    const i = stationIndex(t);
    const local = stationLocal(t, i);

    // blend hero staging between this station and the next during travel
    const f = smooth(clamp01((local - 0.46) / 0.54));
    const a = STATIONS[i].hero;
    const b = STATIONS[Math.min(N - 1, i + 1)].hero;

    let scale = lerp(a.scale, b.scale, f);
    if (i > 0 && i < 7) scale = 0;
    if (i === 7) scale *= smooth(local / 0.22);
    uniforms.uHeat.value = lerp(a.heat, b.heat, f);
    uniforms.uGreen.value = lerp(a.green, b.green, f);
    uniforms.uChar.value = lerp(a.char, b.char, f);
    uniforms.uTime.value = state.clock.elapsedTime;

    // dissolve on hero exit (S00). Later target-product chapters keep the
    // pellet readable instead of burning it away.
    let dissolve = 0;
    if (i === 0) dissolve = smooth((local - 0.68) / 0.28) * 0.98;
    uniforms.uDissolve.value = dissolve;

    const visible = scale > 0.02;
    group.current.visible = visible;
    if (!visible) return;

    const useTexturedIntro = i === 0;
    if (texturedMesh.current) {
      texturedMesh.current.visible = useTexturedIntro;
      const material = texturedMesh.current.material;
      if (material instanceof THREE.Material) {
        material.opacity = 1 - dissolve;
      }
    }
    if (shaderMesh.current) {
      shaderMesh.current.visible = !useTexturedIntro;
    }

    // camera-space anchoring
    off.set(
      lerp(a.off[0], b.off[0], f),
      lerp(a.off[1], b.off[1], f),
      lerp(a.off[2], b.off[2], f)
    );
    if (i === 0 && local < 0.58) {
      const introSlide = smooth((local - 0.02) / 0.34);
      off.set(
        lerp(INTRO_START_OFF[0], off.x, introSlide),
        lerp(INTRO_START_OFF[1], off.y, introSlide),
        lerp(INTRO_START_OFF[2], off.z, introSlide)
      );
    }
    off.applyQuaternion(state.camera.quaternion);
    group.current.position.copy(state.camera.position).add(off);
    group.current.scale.setScalar(scale);

    // slow protagonist spin, gently coupled to scroll velocity
    const e = state.clock.elapsedTime;
    group.current.rotation.set(
      e * 0.14 + t * 6,
      e * 0.2,
      0.6 + Math.sin(e * 0.23) * 0.12
    );
  });

  if (!prepared) return null;

  return (
    <group ref={group}>
      <mesh
        ref={texturedMesh}
        geometry={prepared.geometry}
        material={prepared.material}
        frustumCulled={false}
        renderOrder={5}
      />
      <mesh ref={shaderMesh} geometry={prepared.geometry} frustumCulled={false} renderOrder={5} visible={false}>
        <shaderMaterial
          vertexShader={PELLET_VERT}
          fragmentShader={PELLET_FRAG}
          uniforms={uniforms}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
