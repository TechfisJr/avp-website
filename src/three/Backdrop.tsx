"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

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
  uniform vec3 uTop;
  uniform vec3 uBottom;
  uniform vec3 uGlow;
  void main() {
    vec3 d = normalize(vPos);
    float t = d.y * 0.5 + 0.5;                 // 0 floor -> 1 zenith
    vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, t));
    // a soft glow band just above the horizon — gives the void depth + brand hue
    float glow = exp(-pow((t - 0.46) * 3.4, 2.0));
    col += uGlow * glow * 0.6;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * A gradient sky-dome that rides with the camera, so the dark scenes sit in a
 * deep graded void with a faint green horizon glow instead of flat black —
 * reads as an intentional cinematic studio rather than an empty background.
 * Drawn first (renderOrder -1, no depth write) so everything paints over it.
 */
export default function Backdrop() {
  const ref = useRef<THREE.Mesh>(null);
  const camera = useThree((s) => s.camera);

  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color("#141c17") },
      uBottom: { value: new THREE.Color("#050604") },
      uGlow: { value: new THREE.Color("#163326") },
    }),
    []
  );

  useFrame(() => {
    if (ref.current) ref.current.position.copy(camera.position);
  });

  return (
    <mesh ref={ref} scale={90} frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[1, 32, 24]} />
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
