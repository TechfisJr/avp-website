"use client";

import { useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { BridgePelletCluster, ValueHalo } from "./BridgePrimitives";

export default function BlackPelletToAdvancedBioenergy() {
  const proof = useRef<THREE.Group>(null);

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    if (!proof.current) return;
    const lift = 0.82 + Math.sin(progress * Math.PI) * 0.18;
    proof.current.scale.setScalar(lift);
    proof.current.rotation.set(progress * 0.35, elapsedTime * 0.55, progress * 0.45);
  };

  return (
    <FlowBridge
      from={13}
      to={14}
      exitOffset={[1.0, 1.35, 1.0]}
      enterOffset={[0.9, 1.65, 0.95]}
      arcHeight={1.15}
      onFrame={handleFrame}
    >
      <group ref={proof}>
        <BridgePelletCluster count={8} tone="black" radius={0.24} />
        <ValueHalo radius={0.5} color="#e8a33d" />
      </group>
      <pointLight color="#e8a33d" intensity={10} distance={11} decay={2} />
    </FlowBridge>
  );
}
