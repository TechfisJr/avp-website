"use client";

import * as THREE from "three";
import { STATIONS, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";

const I = 0;
const S = STATIONS[I];
const heroGlowMat = new THREE.MeshBasicMaterial({
  color: "#e8a33d",
  transparent: true,
  opacity: 0.018,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const heroHaloMat = new THREE.MeshBasicMaterial({
  color: "#f4a11f",
  transparent: true,
  opacity: 0.08,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const heroOrbitMat = new THREE.MeshBasicMaterial({
  color: "#f0a12d",
  transparent: true,
  opacity: 0.2,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});

/** S00 — the void. Dust motes around the floating protagonist; at the exit
 *  the pellet's dissolve is echoed by a burst of wood-grain particles. */
export default function Hero({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const q = quality.particleScale;

  return (
    <group ref={group} position={S.pos}>
      <mesh position={[1.45, 1.95, -2.05]} rotation={[0, 0, -0.08]} scale={[1.55, 0.78, 1]} material={heroGlowMat}>
        <circleGeometry args={[1.45, 64]} />
      </mesh>
      <mesh position={[1.3, 1.92, -2.1]} rotation={[Math.PI / 2.18, 0.18, -0.18]} material={heroOrbitMat}>
        <torusGeometry args={[1.72, 0.007, 6, 132]} />
      </mesh>
      <mesh position={[1.25, 2.08, -2.2]} rotation={[Math.PI / 2.28, -0.12, 0.34]} material={heroHaloMat}>
        <torusGeometry args={[2.32, 0.0045, 6, 132]} />
      </mesh>
      <mesh position={[1.2, 2.22, -2.34]} rotation={[Math.PI / 2.32, 0.42, -0.05]} material={heroHaloMat}>
        <torusGeometry args={[2.72, 0.003, 6, 132]} />
      </mesh>
      <pointLight position={[0.1, 2.3, -1.9]} color="#ffaf36" intensity={18} distance={8} decay={1.7} />
      <pointLight position={[2.8, 2.5, -2.2]} color="#f7d098" intensity={7} distance={6} decay={1.8} />
      <pointLight position={[1.3, 1.3, -0.8]} color="#e85d26" intensity={3.8} distance={8} decay={2} />
      {/* ambient dust motes — full at load, thinning as we leave */}
      <ParticleField
        count={Math.round(190 * q) + 24}
        area={[7.5, 4.2, 5.8]}
        center={[1.1, 2.05, -1.3]}
        colorA="#e8a33d"
        colorB="#8c5a2b"
        size={0.34}
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
        center={[1.25, 2, -1.5]}
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
