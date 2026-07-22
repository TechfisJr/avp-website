"use client";

import { useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { BridgeBiomassRibbon } from "./BridgePrimitives";

export default function DryingToConditioning() {
  const mass = useRef<THREE.Group>(null);

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    if (!mass.current) return;
    mass.current.rotation.set(0.08, elapsedTime * 0.25, -0.12 + progress * 0.35);
    mass.current.scale.set(1.14, 0.92, 1.16 + progress * 0.48);
  };

  return (
    <FlowBridge
      from={5}
      to={6}
      exitOffset={[1.2, 2.05, 1.1]}
      enterOffset={[1.05, 2.35, 0.85]}
      arcHeight={0.95}
      onFrame={handleFrame}
    >
      <group ref={mass}>
        <BridgeBiomassRibbon count={36} scale={1.2} />
      </group>
      <pointLight color="#f1d2a6" intensity={3.8} distance={8} decay={2} />
    </FlowBridge>
  );
}
