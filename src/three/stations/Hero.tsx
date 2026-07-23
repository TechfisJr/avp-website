"use client";

import * as THREE from "three";
import { STATIONS, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";

const I = 0;
const S = STATIONS[I];
// A flat additive disc of uniform colour draws a hard-edged circle across the
// hero frame — the edge was clearly visible against the dark background. This
// is the same glow with a radial falloff so it reads as light, not geometry.
const heroGlowMat = new THREE.ShaderMaterial({
  uniforms: {
    uColor: { value: new THREE.Color("#e8a33d") },
    uOpacity: { value: 0.22 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;
    varying vec2 vUv;
    uniform vec3 uColor;
    uniform float uOpacity;
    void main() {
      float d = clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0);
      float a = pow(1.0 - d, 3.0);
      gl_FragColor = vec4(uColor, a * uOpacity);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
  fog: false,
});

/** S00 — the void. Dust motes around the floating protagonist; at the exit
 *  the pellet's dissolve is echoed by a burst of wood-grain particles. */
export default function Hero({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const q = quality.particleScale;

  return (
    <group ref={group} position={S.pos}>
      <mesh
        position={[0, 2, -1.7]}
        material={heroGlowMat}
        userData={{ noShadow: true }}
      >
        <circleGeometry args={[5.2, 64]} />
      </mesh>
      <pointLight position={[-2.4, 3.5, 2.8]} color="#e8a33d" intensity={14} distance={10} decay={1.8} />
      <pointLight position={[2.8, 2.4, -1.2]} color="#7fb4c7" intensity={4.5} distance={9} decay={1.8} />
      {/* ambient dust motes — full at load, thinning as we leave */}
      <ParticleField
        count={Math.round(240 * q) + 28}
        area={[5.5, 3.8, 5.5]}
        center={[0, 2, 0]}
        colorA="#e8a33d"
        colorB="#8c5a2b"
        size={0.55}
        life={7}
        rise={0.05}
        spread={0.16}
        curl={0.25}
        getIntensity={() => 0.65 * (1 - smooth((state.current.local - 0.8) / 0.2))}
      />
      {/* dissolve burst — matter streams toward the forest */}
      <ParticleField
        count={Math.round(240 * q) + 30}
        area={[0.8, 0.8, 0.8]}
        center={[0, 2, 0]}
        colorA="#c99e63"
        colorB="#6b4423"
        size={0.9}
        life={2.2}
        spread={1.6}
        curl={0.6}
        dir={[0, 0.4, -2.2]}
        getIntensity={() => smooth((state.current.local - 0.68) / 0.22)}
      />
    </group>
  );
}
