"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { createHotPelletMaterial } from "../visual/materials";

const hotPelletMat = createHotPelletMaterial();

export default function PelletizingToCooling() {
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const pellets = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        x: (i - 3.5) * 0.12,
        y: (i % 3) * 0.08,
        z: ((i * 7) % 5 - 2) * 0.09,
        r: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
      })),
    []
  );

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    const heat = 1 - progress;
    hotPelletMat.emissiveIntensity = 0.15 + heat * 1.65;
    hotPelletMat.color.set(heat > 0.45 ? "#b96b24" : "#8a653c");
    hotPelletMat.emissive.set(heat > 0.45 ? "#ff6a22" : "#7fb4c7");
    if (group.current) group.current.rotation.set(progress * 1.3, elapsedTime * 1.4, -progress * 0.9);
    if (light.current) light.current.intensity = 3 + heat * 18;
  };

  return (
    <FlowBridge
      from={7}
      to={8}
      exitOffset={[0.85, 1.15, 1.1]}
      enterOffset={[-0.8, 2.0, 0.25]}
      arcHeight={2.2}
      onFrame={handleFrame}
    >
      <group ref={group}>
        {pellets.map((p, i) => (
          <mesh key={i} position={[p.x, p.y, p.z]} rotation={p.r} material={hotPelletMat}>
            <cylinderGeometry args={[0.052, 0.052, 0.26, 9, 1, false]} />
          </mesh>
        ))}
      </group>
      <pointLight ref={light} color="#ff8a36" intensity={10} distance={8} decay={2} />
    </FlowBridge>
  );
}
