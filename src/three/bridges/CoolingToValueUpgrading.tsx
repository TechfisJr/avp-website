"use client";

import { useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { BridgePelletCluster } from "./BridgePrimitives";

export default function CoolingToValueUpgrading() {
  const sample = useRef<THREE.Group>(null);

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    if (!sample.current) return;
    const roll = progress * Math.PI * 2.2;
    sample.current.rotation.set(0.25 + roll, elapsedTime * 0.35, progress * 0.4);
    sample.current.scale.setScalar(0.72 + progress * 0.12);
  };

  return (
    <FlowBridge
      from={8}
      to={9}
      exitOffset={[0.95, 2.0, 0.4]}
      enterOffset={[-0.85, 1.65, 0.95]}
      arcHeight={0.55}
      onFrame={handleFrame}
    >
      <group ref={sample}>
        <BridgePelletCluster count={8} tone="wood" radius={0.22} />
      </group>
      <pointLight color="#7fb4c7" intensity={4.5} distance={8} decay={2} />
    </FlowBridge>
  );
}
