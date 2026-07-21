"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import FlowBridge, { type FlowBridgeFrame } from "../kit/FlowBridge";
import { createBarkMaterial, createLogEndMaterial } from "../visual/materials";

const logEndMat = createLogEndMaterial();
const bridgeBarkMat = createBarkMaterial({ color: "#6b4423" });

export default function ForestToCollection() {
  const log = useRef<THREE.Group>(null);
  const logGeometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(1, 0.94, 1, 18, 5, true);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const theta = Math.atan2(v.z, v.x);
      const ridge = 1 + 0.035 * Math.sin(theta * 9 + v.y * 6) + 0.018 * Math.sin(theta * 17);
      p.setXYZ(i, v.x * ridge, v.y, v.z * ridge);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  const handleFrame = ({ progress, elapsedTime }: FlowBridgeFrame) => {
    if (!log.current) return;
    log.current.rotation.set(
      Math.PI / 2 + progress * Math.PI * 1.2,
      elapsedTime * 0.7,
      -0.35 + progress * 0.55
    );
    const settle = Math.max(0, (progress - 0.82) / 0.18);
    const scale = 0.82 + settle * 0.2;
    log.current.scale.set(scale, scale, scale);
  };

  return (
    <FlowBridge
      from={1}
      to={2}
      exitOffset={[1.8, 7.2, -3.2]}
      enterOffset={[-2.2, 1.0, 2.4]}
      arcHeight={4.2}
      onFrame={handleFrame}
    >
      <group ref={log}>
        <mesh geometry={logGeometry} material={bridgeBarkMat} scale={[0.18, 2.2, 0.18]} />
        <mesh position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]} material={logEndMat} scale={[0.17, 0.17, 0.04]}>
          <cylinderGeometry args={[1, 1, 1, 18]} />
        </mesh>
        <mesh position={[0, -1.1, 0]} rotation={[Math.PI / 2, 0, 0]} material={logEndMat} scale={[0.17, 0.17, 0.04]}>
          <cylinderGeometry args={[1, 1, 1, 18]} />
        </mesh>
      </group>
      <pointLight color="#f2c98a" intensity={4} distance={7} decay={2} />
    </FlowBridge>
  );
}
