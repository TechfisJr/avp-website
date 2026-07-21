"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { createBlackPelletMaterial } from "../visual/materials";

const blackPelletMat = createBlackPelletMaterial();
const valueMat = new THREE.MeshStandardMaterial({
  color: "#1f1710",
  emissive: "#e8a33d",
  emissiveIntensity: 0.4,
  roughness: 0.62,
  metalness: 0.04,
});

export default function TorrefactionToValueCreation() {
  const cluster = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const pellets = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const radius = 0.16 + (i % 3) * 0.07;
        return {
          p: [Math.cos(a) * radius, (i % 4) * 0.065 - 0.09, Math.sin(a) * radius] as [number, number, number],
          r: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
        };
      }),
    []
  );

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    blackPelletMat.emissiveIntensity = 0.08 + progress * 0.32;
    valueMat.emissiveIntensity = 0.28 + Math.sin(elapsedTime * 3.2) * 0.08 + progress * 0.9;
    if (cluster.current) {
      const scale = 0.76 + progress * 0.28;
      cluster.current.scale.setScalar(scale);
      cluster.current.rotation.set(0.35 + progress * 0.6, elapsedTime * 0.9, -0.2);
    }
    if (ring.current) {
      ring.current.scale.setScalar(0.8 + progress * 0.8);
      ring.current.rotation.z = elapsedTime * 0.7;
    }
    if (light.current) light.current.intensity = 6 + progress * 14;
  };

  return (
    <FlowBridge
      from={11}
      to={12}
      exitOffset={[1.0, 1.7, 1.4]}
      enterOffset={[-1.1, 1.5, 1.0]}
      arcHeight={1.35}
      onFrame={handleFrame}
    >
      <group ref={cluster}>
        {pellets.map((p, i) => (
          <mesh key={i} position={p.p} rotation={p.r} material={blackPelletMat}>
            <cylinderGeometry args={[0.045, 0.045, 0.22, 9, 1, false]} />
          </mesh>
        ))}
      </group>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]} material={valueMat}>
        <torusGeometry args={[0.42, 0.012, 6, 64]} />
      </mesh>
      <pointLight ref={light} color="#e8a33d" intensity={10} distance={9} decay={2} />
    </FlowBridge>
  );
}
