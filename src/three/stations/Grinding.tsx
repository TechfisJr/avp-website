"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATIONS, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { Hopper, SmallChipCart } from "../kit/machines";
import { Chips } from "../kit/biomass";
import { M } from "../kit/industrial";

const I = 4;
const S = STATIONS[I];

/** S04 — hammer mill: drum spins up with scroll, sawdust burst, sparks. */
export default function Grinding({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const drum = useRef<THREE.Group>(null);
  const chipCart = useRef<THREE.Group>(null);
  const q = quality.particleScale;

  useFrame((_, delta) => {
    if (!state.current.active) return;
    if (drum.current) {
      drum.current.rotation.x += delta * 14 * bell(state.current.local);
    }
    if (chipCart.current) {
      const arrive = smooth(state.current.local / 0.32);
      chipCart.current.position.set(-5.2 + arrive * 2.2, 0, 2.9 - arrive * 0.45);
      chipCart.current.rotation.set(0, 0.28, 0);
    }
  });

  return (
    <group ref={group} position={S.pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[24, 20]} />
      </mesh>

      {/* mill housing with open inspection side */}
      <mesh position={[0, 1.6, 0]} material={M.housing}>
        <boxGeometry args={[3.4, 3, 2.6]} />
      </mesh>
      <group ref={chipCart}>
        <SmallChipCart scale={0.72} rotation={[0, 0.28, 0]} chipLoad={1} getDump={() => smooth((state.current.local - 0.48) / 0.24)} />
      </group>
      
      {/* Hydraulic Pipes & Conduits */}
      {[
        { p: [-1.72, 1.8, -0.6], r: [0, 0, 0], args: [0.04, 0.04, 1.6] },
        { p: [-1.72, 1.0, -0.6], r: [Math.PI / 2, 0, 0], args: [0.04, 0.04, 0.8] },
        { p: [1.72, 2.2, 0.4], r: [0, 0, 0], args: [0.03, 0.03, 1.2] },
      ].map((pipe, idx) => (
        <mesh key={`pipe-${idx}`} position={pipe.p as [number, number, number]} rotation={pipe.r as [number, number, number]} material={M.steel}>
          <cylinderGeometry args={pipe.args as [number, number, number, number?]} />
        </mesh>
      ))}

      {/* Side Mounted Control Panel */}
      <group position={[-1.73, 2.0, 0.5]}>
        <mesh material={M.housing}>
          <boxGeometry args={[0.08, 0.7, 0.5]} />
        </mesh>
        {/* Screen */}
        <mesh position={[-0.042, 0.12, 0]} material={M.dark}>
          <boxGeometry args={[0.01, 0.22, 0.38]} />
        </mesh>
        {/* Glowing Indicator Buttons */}
        {[-0.12, 0, 0.12].map((z, idx) => (
          <mesh key={idx} position={[-0.042, -0.12, z]}>
            <boxGeometry args={[0.015, 0.06, 0.06]} />
            <meshStandardMaterial emissive={idx === 0 ? "#7ba05b" : idx === 1 ? "#e85d26" : "#e8a33d"} emissiveIntensity={3} />
          </mesh>
        ))}
      </group>

      {/* Diagnostic Pressure Dial */}
      <group position={[1.35, 2.45, 1.32]} rotation={[0, 0.3, 0]}>
        <mesh material={M.steel} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.05, 12]} />
        </mesh>
        <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]} material={M.dark}>
          <cylinderGeometry args={[0.13, 0.13, 0.01, 12]} />
          {/* Yellow gauge indicator needle */}
          <mesh position={[0, 0.05, 0]} material={M.safetyYellow}>
            <boxGeometry args={[0.015, 0.1, 0.01]} />
          </mesh>
        </mesh>
      </group>

      {/* Structural support skid braces */}
      {[-1, 1].map((s) => (
        <mesh key={`support-skid-${s}`} position={[s * 1.8, 0.55, -0.9]} rotation={[0, 0, s * 0.3]} material={M.dark}>
          <boxGeometry args={[0.12, 0.8, 0.12]} />
        </mesh>
      ))}

      {/* Back Ventilation Cooling Slats */}
      {Array.from({ length: 5 }, (_, idx) => (
        <mesh key={`vent-slat-${idx}`} position={[0, 2.3 - idx * 0.14, -1.31]} material={M.dark}>
          <boxGeometry args={[1.5, 0.04, 0.02]} />
        </mesh>
      ))}

      <mesh position={[0, 1.65, 1.35]} material={M.panel}>
        <boxGeometry args={[3.05, 2.45, 0.08]} />
      </mesh>
      <mesh position={[0, 1.72, 1.42]} material={M.dark}>
        <boxGeometry args={[1.9, 1.35, 0.1]} />
      </mesh>
      {/* painted structural frame around the inspection opening */}
      {[
        [0, 2.92, 1.49, 3.25, 0.16, 0.16],
        [0, 0.42, 1.49, 3.25, 0.16, 0.16],
        [-1.62, 1.65, 1.49, 0.16, 2.65, 0.16],
        [1.62, 1.65, 1.49, 0.16, 2.65, 0.16],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x, y, z]} material={M.accentBlue}>
          <boxGeometry args={[w, h, d]} />
        </mesh>
      ))}
      {/* bolts give scale and machine credibility */}
      {[-1.32, -0.66, 0, 0.66, 1.32].map((x) =>
        [0.58, 2.78].map((y) => (
          <mesh key={`${x}${y}`} position={[x, y, 1.58]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
            <cylinderGeometry args={[0.055, 0.055, 0.035, 10]} />
          </mesh>
        ))
      )}
      {/* rotating hammer drum, exposed through the open face */}
      <group ref={drum} position={[0, 1.7, 1.4]}>
        <mesh rotation={[0, 0, Math.PI / 2]} material={M.steel}>
          <cylinderGeometry args={[0.9, 0.9, 0.62, 24]} />
        </mesh>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <mesh key={i} position={[0, Math.cos(a) * 1.02, Math.sin(a) * 1.02]} rotation={[a, 0, 0]} material={M.dark}>
              <boxGeometry args={[0.46, 0.28, 0.08]} />
            </mesh>
          );
        })}
      </group>
      <Hopper position={[0, 3.85, 0]} />
      <mesh position={[0, 4.75, 0]} material={M.safetyYellow}>
        <boxGeometry args={[2.15, 0.12, 2.15]} />
      </mesh>
      {/* external motor and belt guard */}
      <mesh position={[-2.45, 1.35, -0.65]} rotation={[0, 0, Math.PI / 2]} material={M.accentBlue}>
        <cylinderGeometry args={[0.48, 0.48, 1.1, 22]} />
      </mesh>
      <mesh position={[-2.45, 1.35, 0.05]} rotation={[0, 0, Math.PI / 2]} material={M.rubber}>
        <torusGeometry args={[0.58, 0.07, 8, 24]} />
      </mesh>
      <mesh position={[-2.0, 1.35, 0.58]} rotation={[0, 0, Math.PI / 2]} material={M.rubber}>
        <torusGeometry args={[0.38, 0.06, 8, 24]} />
      </mesh>
      <mesh position={[-2.25, 1.35, 0.28]} material={M.housing}>
        <boxGeometry args={[0.12, 1.55, 0.95]} />
      </mesh>
      {/* discharge duct */}
      <mesh position={[2.1, 0.9, 0]} rotation={[0, 0, -0.7]} material={M.steel}>
        <cylinderGeometry args={[0.45, 0.45, 2.4, 16]} />
      </mesh>
      <mesh position={[2.85, 0.34, 0]} rotation={[0, 0, -0.7]} material={M.accentBlue}>
        <torusGeometry args={[0.46, 0.045, 8, 20]} />
      </mesh>
      {/* base skid and safety rail */}
      <mesh position={[0, 0.18, 0]} material={M.steel}>
        <boxGeometry args={[5.4, 0.18, 5.6]} />
      </mesh>
      {[-1, 1].map((z) => (
        <mesh key={z} position={[0, 1.1, z * 2.7]} material={M.safetyYellow}>
          <boxGeometry args={[5.2, 0.08, 0.08]} />
        </mesh>
      ))}
      {[-1, 1].flatMap((z) =>
        [-2.55, 0, 2.55].map((x) => (
          <mesh key={`${x}${z}`} position={[x, 0.63, z * 2.7]} material={M.dark}>
            <cylinderGeometry args={[0.04, 0.04, 1, 8]} />
          </mesh>
        ))
      )}
      <pointLight position={[0.4, 3.5, 3.8]} color="#f2d3a1" intensity={18} distance={12} decay={1.8} />
      <pointLight position={[-3.4, 2.6, 1.4]} color="#7fb4c7" intensity={10} distance={10} decay={1.8} />

      {/* ground-fiber pile accumulating at the discharge — the visible end
          of the material flow this scene tells the story of */}
      <Chips count={quality.tier === 0 ? 26 : 46} position={[3.5, 0.2, 0]} area={[0.55, 0.14, 0.5]} />

      {/* chips feeding in from above */}
      <ParticleField
        count={Math.round(160 * q) + 20}
        area={[0.7, 0.3, 0.7]}
        center={[0, 5.4, 0]}
        colorA="#c99e63"
        colorB="#8c5a2b"
        size={1.3}
        life={1.1}
        gravity={-6}
        spread={0.4}
        blending={THREE.NormalBlending}
        shape="shard"
        getIntensity={() => bell(state.current.local)}
      />
      {/* violent sawdust burst from the discharge */}
      <ParticleField
        count={Math.round(420 * q) + 60}
        area={[0.4, 0.4, 0.4]}
        center={[3.1, 0.2, 0]}
        colorA="#e8c48a"
        colorB="#a06a32"
        size={0.75}
        life={1.8}
        dir={[2.6, 1.4, 0]}
        gravity={-1.6}
        spread={1.3}
        shape="shard"
        curl={0.5}
        getIntensity={() => bell(state.current.local)}
      />
      {/* sparks off the housing */}
      <ParticleField
        count={Math.round(60 * q) + 10}
        area={[0.3, 0.3, 0.3]}
        center={[-1.4, 2.4, 0.8]}
        colorA="#ffd9a0"
        colorB="#e85d26"
        size={0.4}
        life={0.9}
        dir={[-0.8, 1.2, 0.6]}
        gravity={-4}
        spread={1.6}
        getIntensity={() => 0.85 * bell(state.current.local)}
      />
    </group>
  );
}
