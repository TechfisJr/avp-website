"use client";

import { useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { BridgePelletCluster, ValueHalo } from "./BridgePrimitives";

export default function ThermalToTorrefaction() {
  const heated = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    if (heated.current) {
      heated.current.rotation.set(progress * 0.45, elapsedTime * 1.0, -0.2);
      heated.current.scale.setScalar(0.76 + progress * 0.16);
    }
    if (light.current) light.current.intensity = 8 + progress * 8;
  };

  return (
    <FlowBridge
      from={10}
      to={11}
      exitOffset={[1.2, 1.45, 1.1]}
      enterOffset={[-0.9, 1.65, 1.35]}
      arcHeight={0.55}
      onFrame={handleFrame}
    >
      <group ref={heated}>
        <BridgePelletCluster count={9} tone="hot" radius={0.24} />
        <ValueHalo radius={0.36} color="#e85d26" />
      </group>
      <pointLight ref={light} color="#e85d26" intensity={10} distance={9} decay={2} />
    </FlowBridge>
  );
}
