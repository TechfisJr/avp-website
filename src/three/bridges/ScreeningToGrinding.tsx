"use client";

import { useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { BridgeChipStream } from "./BridgePrimitives";
import { M } from "../kit/industrial";

export default function ScreeningToGrinding() {
  const stream = useRef<THREE.Group>(null);

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    if (!stream.current) return;
    stream.current.position.y = Math.sin(progress * Math.PI) * 0.22 + Math.sin(elapsedTime * 12) * 0.018;
    stream.current.rotation.set(0.08, -Math.PI / 2, Math.sin(elapsedTime * 6) * 0.035);
  };

  return (
    <FlowBridge
      from={3}
      to={4}
      exitOffset={[-12.6, 0.45, 0.45]}
      enterOffset={[0, 5.35, 0]}
      departAt={0.76}
      arriveUntil={0.18}
      orientAlongPath
      onFrame={handleFrame}
    >
      <group ref={stream} scale={1.05}>
        <BridgeChipStream count={34} scale={1.15} spread={1.8} />
        <mesh position={[0, -0.18, 0]} material={M.chip}>
          <boxGeometry args={[1.7, 0.06, 0.62]} />
        </mesh>
      </group>
      <pointLight color="#f2d5a1" intensity={4.2} distance={8} decay={2} />
    </FlowBridge>
  );
}
