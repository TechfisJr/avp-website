"use client";

import { useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { BridgePelletCluster, ValueHalo } from "./BridgePrimitives";

export default function ValueUpgradingToThermal() {
  const batch = useRef<THREE.Group>(null);

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    if (!batch.current) return;
    const approvedLane = Math.max(0, (progress - 0.18) / 0.82);
    batch.current.rotation.set(progress * 0.2, elapsedTime * 0.65, -approvedLane * 0.55);
    batch.current.scale.setScalar(0.78 + approvedLane * 0.16);
  };

  return (
    <FlowBridge
      from={9}
      to={10}
      exitOffset={[1.0, 1.7, 1.1]}
      enterOffset={[-1.35, 1.45, 1.25]}
      arcHeight={0.85}
      onFrame={handleFrame}
    >
      <group ref={batch}>
        <BridgePelletCluster count={9} tone="wood" radius={0.24} />
        <ValueHalo radius={0.42} color="#e8a33d" />
      </group>
      <pointLight color="#e8a33d" intensity={7} distance={9} decay={2} />
    </FlowBridge>
  );
}
