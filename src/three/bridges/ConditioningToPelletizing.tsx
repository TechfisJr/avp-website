"use client";

import { useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { BridgeBiomassRibbon } from "./BridgePrimitives";

export default function ConditioningToPelletizing() {
  const feed = useRef<THREE.Group>(null);

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    if (!feed.current) return;
    const squeeze = Math.max(0, (progress - 0.35) / 0.65);
    feed.current.scale.set(1.2 - squeeze * 0.56, 1.0 - squeeze * 0.46, 1.2 + squeeze * 0.86);
    feed.current.rotation.set(progress * 0.2, elapsedTime * 0.8, progress * 0.45);
  };

  return (
    <FlowBridge
      from={6}
      to={7}
      exitOffset={[-1.15, 2.05, 1.05]}
      enterOffset={[-0.55, 1.95, 0.7]}
      arcHeight={0.65}
      onFrame={handleFrame}
    >
      <group ref={feed}>
        <BridgeBiomassRibbon count={38} scale={1.12} conditioned />
      </group>
      <pointLight color="#e8a33d" intensity={5} distance={8} decay={2} />
    </FlowBridge>
  );
}
