"use client";

import { useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { SmallChipCart } from "../kit/machines";

export default function ScreeningToGrinding() {
  const cart = useRef<THREE.Group>(null);

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    if (!cart.current) return;
    cart.current.position.y = Math.sin(progress * Math.PI) * 0.08 + Math.sin(elapsedTime * 10) * 0.012;
    cart.current.rotation.set(0, -Math.PI / 2, Math.sin(elapsedTime * 8) * 0.012);
  };

  return (
    <FlowBridge
      from={3}
      to={4}
      exitOffset={[-2.2, 0, 2.4]}
      enterOffset={[-4.8, 0, 2.65]}
      departAt={0.76}
      arriveUntil={0.18}
      orientAlongPath
      onFrame={handleFrame}
    >
      <group ref={cart} scale={0.68}>
        <SmallChipCart chipLoad={1} />
      </group>
      <pointLight color="#f2d5a1" intensity={4.5} distance={8} decay={2} />
    </FlowBridge>
  );
}
