"use client";

import { useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { Truck } from "../kit/machines";

export default function CollectionToScreening() {
  const truck = useRef<THREE.Group>(null);

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    if (!truck.current) return;
    truck.current.position.y = Math.sin(progress * Math.PI) * 0.12 + Math.sin(elapsedTime * 12) * 0.015;
    truck.current.rotation.set(0, -Math.PI / 2, Math.sin(elapsedTime * 8) * 0.018);
  };

  return (
    <FlowBridge
      from={2}
      to={3}
      exitOffset={[3.65, 0, 2.55]}
      enterOffset={[-3.15, 0, 2.65]}
      departAt={0.76}
      arriveUntil={0.2}
      orientAlongPath
      onFrame={handleFrame}
    >
      <group ref={truck} scale={0.74}>
        <Truck cargoLoad={1} />
      </group>
      <pointLight color="#ffd9a0" intensity={9} distance={11} decay={2} />
    </FlowBridge>
  );
}
