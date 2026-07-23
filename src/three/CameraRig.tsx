"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scroll, flags } from "@/lib/scrollStore";
import { STATIONS, N, dwellCoord, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";

const target = new THREE.Vector3();
const rawTarget = new THREE.Vector3();
const focusA = new THREE.Vector3();
const focusB = new THREE.Vector3();

export default function CameraRig({ quality }: { quality: Quality }) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        STATIONS.map((s) => new THREE.Vector3(...s.cam)),
        false,
        "catmullrom",
        0.35
      ),
    []
  );
  const pos = useRef(new THREE.Vector3());
  const dampedPos = useRef(new THREE.Vector3(0, 2.2, 5));
  const dampedTarget = useRef(new THREE.Vector3(0, 2, 0));

  useFrame((state, delta) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    const s = dwellCoord(scroll.t);
    const i = Math.min(N - 2, Math.floor(s));
    const f = s - i;

    // position along the spline
    curve.getPointAt(THREE.MathUtils.clamp(s / (N - 1), 0, 1), pos.current);

    // handheld micro-drift (desktop/tablet only, suppressed in reduced motion)
    if (quality.drift && !flags.reducedMotion) {
      const e = state.clock.elapsedTime;
      pos.current.x += Math.sin(e * 0.31) * 0.05 + Math.sin(e * 0.83) * 0.02;
      pos.current.y += Math.sin(e * 0.47 + 1.3) * 0.04;
    }
    dampedPos.current.lerp(pos.current, 1 - Math.exp(-delta * 12));
    cam.position.copy(dampedPos.current);

    // gaze leads the move slightly
    focusA.set(...STATIONS[i].focus);
    focusB.set(...STATIONS[Math.min(N - 1, i + 1)].focus);
    rawTarget.lerpVectors(focusA, focusB, smooth(Math.min(1, f * 1.15)));
    dampedTarget.current.lerp(rawTarget, 1 - Math.exp(-delta * 10));
    target.copy(dampedTarget.current);
    cam.lookAt(target);

    // fov breathes during travel — a soft dolly-zoom feel
    const travel = Math.sin(Math.min(1, f) * Math.PI);
    const fov = 42 + travel * 4;
    if (Math.abs(cam.fov - fov) > 0.06) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}
