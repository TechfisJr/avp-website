"use client";

import { useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { BridgeLog } from "./BridgePrimitives";

const guideMat = new THREE.MeshStandardMaterial({
  color: "#2a1705",
  emissive: "#f4a21f",
  emissiveIntensity: 1.45,
  roughness: 0.45,
  metalness: 0.08,
});

export default function CollectionToScreening() {
  const log = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    if (!log.current) return;
    const plunge = Math.max(0, (progress - 0.62) / 0.38);
    log.current.position.set(-0.6 + progress * 0.35, 0.72 - plunge * 1.08, 0.38);
    log.current.rotation.set(0.06 + plunge * 1.1, 0.08 + Math.sin(elapsedTime * 1.2) * 0.03, -0.22 - plunge * 0.92);
    log.current.scale.setScalar(1.38 - plunge * 0.1);
    if (ring.current) {
      ring.current.rotation.x = elapsedTime * 2.8;
      ring.current.scale.setScalar(1.05 + plunge * 0.28);
    }
  };

  return (
    <FlowBridge
      from={2}
      to={3}
      exitOffset={[0.95, 2.25, 2.35]}
      enterOffset={[-0.35, 3.05, 1.1]}
      arcHeight={2.35}
      onFrame={handleFrame}
    >
      <group ref={log}>
        <BridgeLog length={4.75} radius={0.38} />
        <mesh ref={ring} position={[1.4, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={guideMat}>
          <torusGeometry args={[0.78, 0.034, 8, 56]} />
        </mesh>
        {[-2.35, -2.9, -3.45].map((x, i) => (
          <mesh key={x} position={[x, 0.04 * i, -0.05 * i]} material={guideMat} scale={1 - i * 0.22}>
            <sphereGeometry args={[0.08, 10, 10]} />
          </mesh>
        ))}
      </group>
      <pointLight color="#f2b45d" intensity={11} distance={10} decay={2} />
    </FlowBridge>
  );
}
