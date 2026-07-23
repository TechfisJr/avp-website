"use client";

import { useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { Truck } from "../kit/machines";

export default function ForestToCollection() {
  const truck = useRef<THREE.Group>(null);

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    if (!truck.current) return;
    truck.current.position.y = Math.sin(progress * Math.PI) * 0.08 + Math.sin(elapsedTime * 10) * 0.012;
    truck.current.rotation.set(0, -Math.PI / 2, Math.sin(elapsedTime * 8) * 0.012);
  };

  return (
    <FlowBridge
      from={1}
      to={2}
      exitOffset={[1.45, 0, 1.05]}
      enterOffset={[3.65, 0, 2.55]}
      departAt={0.68}
      arriveUntil={0.24}
      orientAlongPath
      onFrame={handleFrame}
    >
      <group ref={truck} scale={0.82}>
        <Truck cargoLoad={1} cargoType="residue" />
      </group>
      <pointLight color="#ffd9a0" intensity={8} distance={10} decay={2} />
    </FlowBridge>
  );
}
