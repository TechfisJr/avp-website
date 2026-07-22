"use client";

import { useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { BridgePelletCluster, ValueHalo } from "./BridgePrimitives";

export default function ValueCreationToBlackPellet() {
  const product = useRef<THREE.Group>(null);

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    if (!product.current) return;
    product.current.rotation.set(0.18 + progress * 0.25, elapsedTime * 0.55, -0.16);
    product.current.scale.setScalar(0.82 + progress * 0.16);
  };

  return (
    <FlowBridge
      from={12}
      to={13}
      exitOffset={[1.1, 1.55, 1.1]}
      enterOffset={[-0.6, 1.25, 0.95]}
      arcHeight={0.62}
      onFrame={handleFrame}
    >
      <group ref={product}>
        <BridgePelletCluster count={12} tone="black" radius={0.28} />
        <ValueHalo radius={0.48} color="#e8a33d" />
      </group>
      <pointLight color="#e8a33d" intensity={9} distance={10} decay={2} />
    </FlowBridge>
  );
}
