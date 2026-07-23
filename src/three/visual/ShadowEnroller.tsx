"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

type Enrolled = THREE.Object3D & { __shadowEnrolled?: boolean };

/**
 * Turns shadow casting/receiving on for the whole world.
 *
 * `shadows` on <Canvas> only enables the renderer's shadow pass — it does
 * nothing unless individual lights and meshes opt in, and nothing in this
 * project ever did. The result was a world where no object was connected to
 * the surface it stood on, which is most of why everything read as plastic:
 * contact shadow is the primary cue the eye uses to seat an object in a scene.
 *
 * Enrolling meshes here rather than adding two props to several hundred
 * primitives across fifteen station files keeps the stations declarative, and
 * it automatically covers geometry that mounts later as the camera travels.
 * Each object is visited once (flagged on the object itself), and the sweep is
 * spread across frames, so the steady-state cost is a cheap early-out.
 */
export default function ShadowEnroller({ enabled }: { enabled: boolean }) {
  const scene = useThree((s) => s.scene);
  const tick = useRef(0);

  useFrame(() => {
    if (!enabled) return;
    // Stations mount/unmount as the camera moves, so re-sweep periodically
    // rather than once. Every 15th frame is imperceptible and near-free.
    if (tick.current++ % 15 !== 0) return;

    scene.traverse((object) => {
      const o = object as Enrolled;
      if (o.__shadowEnrolled) return;

      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      o.__shadowEnrolled = true;

      // Opt-out for anything that must never participate: the background dome,
      // volumetric light shafts, glow cards.
      if (o.userData?.noShadow) return;

      const material = mesh.material as THREE.Material | THREE.Material[];
      const first = Array.isArray(material) ? material[0] : material;
      if (!first) return;

      // Raw ShaderMaterials have no depth program for the shadow pass and would
      // render as opaque black blockers. Skip them entirely.
      const isStandard =
        (first as THREE.MeshStandardMaterial).isMeshStandardMaterial === true ||
        (first as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial === true;
      if (!isStandard) return;

      // Transparent surfaces (glass, scrims) receive but must not cast — a
      // cast from a 16%-opacity pane reads as a solid slab.
      const transparent = first.transparent && (first.opacity ?? 1) < 0.9;

      mesh.receiveShadow = true;
      mesh.castShadow = !transparent;
    });
  });

  return null;
}
