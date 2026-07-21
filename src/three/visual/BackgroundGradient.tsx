"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scroll } from "@/lib/scrollStore";
import { STATIONS, N, dwellCoord, smooth } from "@/lib/timeline";
import { presetFor } from "./presets";

const RADIUS = 90;

const VERT = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vPos;
  uniform vec3 uTop, uHorizon, uBottom;
  uniform float uRadius;
  void main() {
    float y = clamp(vPos.y / uRadius, -1.0, 1.0);
    vec3 col = y < 0.0
      ? mix(uHorizon, uBottom, smoothstep(0.0, -1.0, y))
      : mix(uHorizon, uTop, smoothstep(0.0, 1.0, y));
    gl_FragColor = vec4(col, 1.0);
  }
`;

const tmpA = new THREE.Color();
const tmpB = new THREE.Color();

/**
 * Replaces the flat single-color scene background with a controlled
 * environmental gradient (bottom → horizon → top), tinted per active
 * lighting preset and matched at the horizon to the station's own fog
 * color so the dome blends seamlessly into the fog. Follows the camera so
 * it always reads as "background", never as geometry.
 */
export default function BackgroundGradient() {
  const mesh = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color("#141010") },
      uHorizon: { value: new THREE.Color("#0b0a08") },
      uBottom: { value: new THREE.Color("#020202") },
      uRadius: { value: RADIUS },
    }),
    []
  );

  useFrame((state) => {
    const s = dwellCoord(scroll.t);
    const i = Math.min(N - 2, Math.floor(s));
    const f = smooth(s - i);
    const a = STATIONS[i];
    const b = STATIONS[Math.min(N - 1, i + 1)];
    const pa = presetFor(a.preset);
    const pb = presetFor(b.preset);

    // horizon = the station's tuned fog color (unchanged art direction)
    tmpA.set(a.fog);
    tmpB.set(b.fog);
    uniforms.uHorizon.value.copy(tmpA).lerp(tmpB, f);

    // bottom = horizon darkened toward black
    tmpA.set(a.fog).multiplyScalar(0.32);
    tmpB.set(b.fog).multiplyScalar(0.32);
    uniforms.uBottom.value.copy(tmpA).lerp(tmpB, f);

    // top = horizon lifted toward the preset's characteristic ambient tint
    tmpA.set(a.fog).lerp(new THREE.Color(pa.ambientTint), 0.55);
    tmpB.set(b.fog).lerp(new THREE.Color(pb.ambientTint), 0.55);
    uniforms.uTop.value.copy(tmpA).lerp(tmpB, f);

    if (mesh.current) mesh.current.position.copy(state.camera.position);
  });

  return (
    <mesh ref={mesh} renderOrder={-1000} frustumCulled={false}>
      <sphereGeometry args={[RADIUS, 24, 16]} />
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}
