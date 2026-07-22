"use client";

import { useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { BridgeFiberCloud } from "./BridgePrimitives";

export default function GrindingToDrying() {
  const cloud = useRef<THREE.Group>(null);

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    if (!cloud.current) return;
    const suction = Math.max(0, (progress - 0.42) / 0.58);
    cloud.current.scale.set(1.32 - suction * 0.42, 1.1 - suction * 0.28, 1.28 + suction * 0.72);
    cloud.current.rotation.set(elapsedTime * 0.35, progress * 2.4, elapsedTime * 0.65);
  };

  return (
    <FlowBridge
      from={4}
      to={5}
      exitOffset={[1.15, 2.25, 1.05]}
      enterOffset={[-2.25, 2.55, -0.45]}
      arcHeight={1.35}
      onFrame={handleFrame}
    >
      <group ref={cloud}>
        <BridgeFiberCloud count={46} scale={1.18} />
      </group>
      <pointLight color="#d6c4a2" intensity={3.5} distance={7} decay={2} />
    </FlowBridge>
  );
}
