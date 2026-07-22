"use client";

import { useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { BridgeChipStream } from "./BridgePrimitives";

export default function ScreeningToGrinding() {
  const stream = useRef<THREE.Group>(null);

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    if (!stream.current) return;
    const drop = Math.max(0, (progress - 0.54) / 0.46);
    stream.current.rotation.set(0.25 + drop * 1.1, elapsedTime * 1.1, -0.2 + progress * 0.55);
    stream.current.scale.set(1.16, 1.08 - drop * 0.26, 1.18 + drop * 0.38);
  };

  return (
    <FlowBridge
      from={3}
      to={4}
      exitOffset={[0.55, 2.05, -1.65]}
      enterOffset={[1.35, 2.95, 1.1]}
      arcHeight={2.25}
      onFrame={handleFrame}
    >
      <group ref={stream}>
        <BridgeChipStream count={34} scale={1.25} spread={1.75} />
      </group>
      <pointLight color="#f2d5a1" intensity={4.5} distance={8} decay={2} />
    </FlowBridge>
  );
}
